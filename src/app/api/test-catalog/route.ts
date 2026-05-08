import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// בדיקה פשוטה: GET /api/test-catalog?q=asus
export async function GET(req: Request) {
    const url  = new URL(req.url);
    const q    = url.searchParams.get("q") || "asus";
    const cat  = url.searchParams.get("cat") || "laptop";

    try {
        let results: any[] = [];

        if (cat === "laptop") {
            results = await prismadb.laptopCatalog.findMany({
                where: {
                    OR: [
                        { brand: { contains: q, mode: "insensitive" } },
                        { modelName: { contains: q, mode: "insensitive" } },
                        { series: { contains: q, mode: "insensitive" } },
                    ]
                },
                take: 5,
                select: { brand: true, modelName: true, series: true, sku: true }
            });
        }

        return NextResponse.json({
            query: q,
            category: cat,
            count: results.length,
            results
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
