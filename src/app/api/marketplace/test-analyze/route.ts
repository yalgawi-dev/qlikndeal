import { NextResponse } from "next/server";
import { masterAnalyze } from "@/lib/analyze";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const text = url.searchParams.get("text") || "למכירה: מחשב נייד עוצמתי למפתחים – מודל 2024! מפרט טכני: מעבד 14 ליבות, זיכרון 32GB RAM, כונן 1TB SSD מהיר, מסך 15.6 אינץ'. שנת ייצור: 2024";
    const category = url.searchParams.get("category") || "LAPTOPS";

    try {
        const results = await masterAnalyze(text, category);
        return NextResponse.json({ success: true, results });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
