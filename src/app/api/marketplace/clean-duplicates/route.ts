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

        const deletedInfo: any[] = [];
        let deletedCount = 0;

        for (const [key, candles] of Array.from(valueMap.entries())) {
            const fields = new Set(candles.map((c: any) => c.field));
            if (fields.size > 1) {
                // We have a cross-field duplicate!
                // Sort by confidence DESC, then by occurrenceCount DESC
                candles.sort((a, b) => {
                    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
                    return b.occurrenceCount - a.occurrenceCount;
                });

                // The first element is the winner. The rest are losers.
                const winner = candles[0];
                const losers = candles.slice(1);

                for (const loser of losers) {
                    await (prismadb as any).fieldValueReliability.delete({
                        where: { id: loser.id }
                    });
                    deletedInfo.push({
                        value: loser.value,
                        deletedField: loser.field,
                        winnerField: winner.field
                    });
                    deletedCount++;
                }
            }
        }

        // Clear the cache to make sure the app picks up the clean DB
        try {
            const { dbCache } = await import("@/lib/db-cache");
            dbCache.clear(`ai_reliable_vals_LAPTOPS`);
            dbCache.clear(`ai_reliable_vals_SMARTPHONES`);
        } catch(e) {}

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${deletedCount} duplicate rows.`,
            details: deletedInfo
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
