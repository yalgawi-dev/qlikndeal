import { masterLearn, masterPenalize } from "@/lib/learning";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            originalText,
            aiParsed,
            userFinal,
            testerNote,
            testerName,
            testerImage, // נוסף: תמיכה בתמונה
            category,
            inputMode,
            sessionId,
        } = body;

        if (!originalText || !aiParsed) {
            return NextResponse.json({ error: "originalText and aiParsed are required" }, { status: 400 });
        }

        // חישוב תיקונים (Corrections) לצורך למידה עתידית
        let corrections: any = null;
        if (userFinal && aiParsed) {
            try {
                const ai = typeof aiParsed === "string" ? JSON.parse(aiParsed) : aiParsed;
                const user = typeof userFinal === "string" ? JSON.parse(userFinal) : userFinal;
                corrections = {};
                for (const key of new Set([...Object.keys(ai), ...Object.keys(user)])) {
                    if (JSON.stringify(ai[key]) !== JSON.stringify(user[key])) {
                        corrections[key] = { ai: ai[key], user: user[key] };
                    }
                }
                if (Object.keys(corrections).length === 0) corrections = null;
            } catch { corrections = null; }
        }

        const log = await prisma.parserLog.create({
            data: {
                originalText,
                aiParsed: typeof aiParsed === "string" ? aiParsed : JSON.stringify(aiParsed),
                userFinal: userFinal ? (typeof userFinal === "string" ? userFinal : JSON.stringify(userFinal)) : null,
                corrections: corrections ? JSON.stringify(corrections) : null,
                testerNote: testerNote || null,
                testerName: testerName || null,
                testerImage: testerImage || null, // שמירת התמונה
                category: category || null,
                inputMode: inputMode || "text",
                sessionId: sessionId || null,
            },
        });

        return NextResponse.json({ success: true, id: log.id });
    } catch (err) {
        console.error("[parser-log] POST Error:", err);
        return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, quality, reviewed, testerNote, testerImage, archived, userFinal, computedCorrections } = body;
        
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        let dataToUpdate: any = {
            ...(quality !== undefined ? { quality } : {}),
            ...(reviewed !== undefined ? { reviewed } : {}),
            ...(testerNote !== undefined ? { testerNote } : {}),
            ...(testerImage !== undefined ? { testerImage } : {}), // תמיכה בעדכון תמונה
            ...(archived !== undefined ? { archived, archivedAt: archived ? new Date() : null } : {}),
        };

        if (userFinal !== undefined) {
            dataToUpdate.userFinal = typeof userFinal === "string" ? userFinal : JSON.stringify(userFinal);
            
            // שחזור לוגיקת התיקונים המקורית למען הלמידה
            if (computedCorrections !== undefined) {
                dataToUpdate.corrections = typeof computedCorrections === "string" ? computedCorrections : JSON.stringify(computedCorrections);
            } else {
                const existing = await prisma.parserLog.findUnique({ where: { id } });
                if (existing && existing.aiParsed) {
                    try {
                        const ai = JSON.parse(existing.aiParsed);
                        const user = typeof userFinal === "string" ? JSON.parse(userFinal) : userFinal;
                        let corr: any = {};
                        for (const key in user) {
                            if (JSON.stringify(ai[key]) !== JSON.stringify(user[key])) {
                                corr[key] = { ai: ai[key], user: user[key] };
                            }
                        }
                        dataToUpdate.corrections = JSON.stringify(corr);
                    } catch (e) { console.error("Diff failed", e); }
                }
            }
        }

        const updated = await prisma.parserLog.update({
            where: { id },
            data: dataToUpdate,
        });

        // --- לוגיקת הלמידה החיונית (masterLearn) ---
        if (updated.userFinal && updated.category && updated.originalText) {
            try {
                // אנו רוצים ללמוד לא רק "תיקונים" (corrections) אלא את כל השדות שהמשתמש אישר!
                const finalData = typeof updated.userFinal === "string" ? JSON.parse(updated.userFinal) : updated.userFinal;
                // סנן שדות זבל לפני למידה (מנע זיהום בעתיד)
                const GARBAGE_FIELDS = ['numeric', 'general', 'value', 'number', 'isCatalogMatch', 'sourceTable', 'batteryPercent', 'modelName', 'originalField'];
                
                const learnPromises: Promise<any>[] = [];
                for (const field in finalData) {
                    if (GARBAGE_FIELDS.includes(field.toLowerCase())) continue; // דלג שד זבל!
                    const userValue = String(finalData[field]);
                    if (userValue && userValue !== "null" && userValue !== "undefined" && userValue.length > 1) {
                        learnPromises.push(
                            masterLearn(updated.originalText, field, userValue, updated.category)
                                .catch(e => { /* ignore single learn errors */ })
                        );
                    }
                }

                // --- ענישה (Penalty) ---
                const penaltyPromises: Promise<any>[] = [];
                if (updated.corrections && updated.corrections !== '{}') {
                    try {
                        const corrections = typeof updated.corrections === "string" 
                            ? JSON.parse(updated.corrections) 
                            : updated.corrections;
                        for (const field in corrections) {
                            const corr = corrections[field];
                            if (corr.ai && corr.ai !== corr.user) {
                                penaltyPromises.push(
                                    masterPenalize(field, String(corr.ai), updated.category)
                                        .catch(e => {})
                                );
                            }
                        }
                    } catch(pe) { /* non-critical */ }
                }

                // Execute all learning and penalizing concurrently!
                await Promise.all([...learnPromises, ...penaltyPromises]);

            } catch (learnErr) {
                console.error("[parser-log] masterLearn failed:", learnErr);
            }
        }

        return NextResponse.json({ success: true, log: updated });
    } catch (err) {
        console.error("[parser-log] PATCH Global Error:", err);
        return NextResponse.json({ error: "Failed to update log" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        const showArchived = searchParams.get("archived") === "true";

        const logs = await prisma.parserLog.findMany({
            where: { archived: showArchived },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json({ success: true, logs, total: logs.length });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
        await prisma.parserLog.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}