import { NextResponse } from "next/server";
import { masterPenalize } from "@/lib/learning";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { field, value, category } = body;

        if (!field || !value || !category) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        console.log(`[KILL-SWITCH] Executing immediate penalty for field [${field}] value [${value}] in ${category}`);
        
        await masterPenalize(field, String(value), category);

        return NextResponse.json({ success: true, message: "Penalized successfully" });
    } catch (error: any) {
        console.error("[KILL-SWITCH] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
