import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
    try {
        const allCandles = await (prismadb as any).fieldValueReliability.findMany({
            where: { isIgnored: false },
            select: { id: true, value: true, field: true, category: true, confidence: true, occurrenceCount: true }
        });

        const valueMap = new Map<string, any[]>();

        allCandles.forEach((candle: any) => {
            const key = `${candle.category}_${candle.value.toLowerCase().trim()}`;
            if (!valueMap.has(key)) {
                valueMap.set(key, []);
            }
            valueMap.get(key)!.push(candle);
        });

        const duplicates: any[] = [];

        valueMap.forEach((candles, key) => {
            const fields = new Set(candles.map((c: any) => c.field));
            // Only count if it belongs to MULTIPLE different fields
            if (fields.size > 1) {
                duplicates.push({
                    value: candles[0].value,
                    category: candles[0].category,
                    fields: candles.map((c: any) => ({
                        field: c.field,
                        confidence: c.confidence,
                        occurrences: c.occurrenceCount,
                        id: c.id
                    }))
                });
            }
        });

        return NextResponse.json({
            success: true,
            totalDuplicatesFound: duplicates.length,
            duplicates: duplicates
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
