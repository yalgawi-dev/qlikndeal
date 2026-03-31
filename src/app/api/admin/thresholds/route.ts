import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        const whereClause = category && category !== "All" ? { category } : {};

        // 1. Get explicit thresholds
        const explicitThresholds = await (prismadb as any).categoryFieldThreshold.findMany({
            where: whereClause,
        });

        // 2. Schema groupBy FieldValueReliability exactly as instructed (with category too for differentiation)
        const learnedFields = await (prismadb as any).fieldValueReliability.groupBy({
            by: ['category', 'field'],
            where: whereClause,
            _count: { _all: true }
        });

        // 3. Left join - Combine learned fields with explicit thresholds
        const mergedMap = new Map();

        // Populate with learned fields first (since we want all of them to show)
        learnedFields.forEach((lf: any) => {
            const key = `${lf.category}_${lf.field}`;
            mergedMap.set(key, {
                id: null,
                category: lf.category,
                field: lf.field,
                threshold: 0.8, // Default
                suggestionMargin: 0.4, // Default
                occurrenceCount: lf._count._all
            });
        });

        // Merge existing explicit thresholds over the defaults
        explicitThresholds.forEach((t: any) => {
            const key = `${t.category}_${t.field}`;
            if (mergedMap.has(key)) {
                const existing = mergedMap.get(key);
                existing.id = t.id;
                existing.threshold = t.threshold;
                existing.suggestionMargin = t.suggestionMargin;
            } else {
                // If there's an explicit threshold but no learned data yet, add it anyway.
                mergedMap.set(key, {
                    id: t.id,
                    category: t.category,
                    field: t.field,
                    threshold: t.threshold,
                    suggestionMargin: t.suggestionMargin,
                    occurrenceCount: 0 
                });
            }
        });

        const sortedResults = Array.from(mergedMap.values()).sort((a, b) => {
            if (b.occurrenceCount !== a.occurrenceCount) {
                return b.occurrenceCount - a.occurrenceCount;
            }
            return a.field.localeCompare(b.field);
        });

        return NextResponse.json(sortedResults);
    } catch (error) {
        console.error("[THRESHOLDS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { category, field, threshold, suggestionMargin } = body;

        if (!category || !field) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const updatedThreshold = await (prismadb as any).categoryFieldThreshold.upsert({
            where: {
                category_field: {
                    category,
                    field
                }
            },
            update: {
                threshold: Number(threshold),
                suggestionMargin: Number(suggestionMargin)
            },
            create: {
                category,
                field,
                threshold: Number(threshold),
                suggestionMargin: Number(suggestionMargin)
            }
        });

        return NextResponse.json(updatedThreshold);
    } catch (error) {
        console.error("[THRESHOLDS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse("ID required", { status: 400 });
        }

        await (prismadb as any).categoryFieldThreshold.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[THRESHOLDS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
