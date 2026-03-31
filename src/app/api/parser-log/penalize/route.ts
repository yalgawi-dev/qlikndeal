import { masterPenalize } from "@/lib/learning";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/parser-log/penalize
 * נקרא כשמשתמש לוחץ X על הצעת SUGGEST
 * → מוריד משקל לאותו שדה+ערך בכל טבלאות הלמידה
 */
export async function POST(req: NextRequest) {
    try {
        const { field, wrongValue, category } = await req.json();
        
        if (!field || !wrongValue || !category) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const result = await masterPenalize(field, String(wrongValue), String(category));
        
        console.log(`[penalty] ${category}.${field}="${wrongValue}" → penalized ${result.penalized} records`);
        
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        console.error("[penalty] Error:", err);
        return NextResponse.json({ error: "Penalty failed" }, { status: 500 });
    }
}
