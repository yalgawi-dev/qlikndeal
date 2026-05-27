import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-feedback
 *
 * מנגנון למידה עצמית — שומר ערכים חדשים שה-AI חילץ לטבלת FieldValueReliability.
 * בפעם הבאה שמשתמש יפתח טופס, הערכים האלה יופיעו בתפריטי ה-dropdown.
 *
 * כולל:
 * - בדיקת כפילויות (upsert לפי compound unique key: value+field+category)
 * - ספירת הופעות (occurrenceCount++)
 * - חישוב confidence אסימפטוטי (עולה עם כל אישור, לעולם לא חורג מ-0.99)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { attributes, category, source = "ai_extract" } = body;

        // attributes: [{ key: string, value: string, confidence?: number }]
        if (!attributes || !Array.isArray(attributes) || !category) {
            return NextResponse.json({ error: "Missing attributes or category" }, { status: 400 });
        }

        const results: { field: string; value: string; action: "created" | "updated" | "skipped" }[] = [];

        for (const attr of attributes) {
            const field = String(attr.key || "").trim();
            const value = String(attr.value || "").trim().toLowerCase();
            const startConfidence = typeof attr.confidence === "number" ? attr.confidence : 0.6;

            // Skip empty, numeric-only, or very short values (likely garbage)
            if (!field || !value || value.length < 2 || /^\d+$/.test(value)) {
                results.push({ field, value, action: "skipped" });
                continue;
            }

            // Skip generic non-informative values
            const SKIP_VALUES = ["לא ידוע", "unknown", "n/a", "none", "null", "undefined", "-", "—"];
            if (SKIP_VALUES.includes(value.toLowerCase())) {
                results.push({ field, value, action: "skipped" });
                continue;
            }

            try {
                // Upsert: אם קיים — עדכן count ו-confidence. אם לא — צור חדש.
                const existing = await (prismadb as any).fieldValueReliability.findFirst({
                    where: {
                        value: { equals: value, mode: "insensitive" },
                        field,
                        category: category.toUpperCase()
                    }
                });

                if (existing) {
                    // confidence עולה אסימפטוטית: newConf = old + (1-old)*0.05 → מתכנס ל-0.99
                    const oldConf = Number(existing.confidence) || 0.6;
                    const newConfidence = Math.min(0.99, oldConf + (1 - oldConf) * 0.05);
                    await (prismadb as any).fieldValueReliability.update({
                        where: { id: existing.id },
                        data: {
                            occurrenceCount: { increment: 1 },
                            confidence: newConfidence,
                        }
                    });
                    results.push({ field, value, action: "updated" });
                } else {
                    // ערך חדש לחלוטין — יצירה עם confidence התחלתי
                    await (prismadb as any).fieldValueReliability.upsert({
                        where: {
                            value_field_category: {
                                value,
                                field,
                                category: category.toUpperCase()
                            }
                        },
                        update: {
                            occurrenceCount: { increment: 1 }
                        },
                        create: {
                            value,
                            field,
                            category: category.toUpperCase(),
                            confidence: startConfidence,
                            occurrenceCount: 1,
                            isIgnored: false
                        }
                    });
                    results.push({ field, value, action: "created" });
                }
            } catch (dbErr: any) {
                // אל תשבור את כל ה-request בגלל שורה אחת
                console.error(`[AI-FEEDBACK] DB error for field=${field} value=${value}:`, dbErr?.message);
                results.push({ field, value, action: "skipped" });
            }
        }

        const created = results.filter(r => r.action === "created").length;
        const updated = results.filter(r => r.action === "updated").length;

        console.log(`[AI-FEEDBACK] category=${category} | created=${created} updated=${updated} skipped=${results.filter(r => r.action === "skipped").length}`);

        return NextResponse.json({
            success: true,
            created,
            updated,
            total: results.length
        });

    } catch (error: any) {
        console.error("[AI-FEEDBACK] Error:", error);
        return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
    }
}
