import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// GET /api/marketplace/catalog-search?q=asus&cat=Computers&sub=laptop
export async function GET(req: Request) {
    const url = new URL(req.url);
    const q   = url.searchParams.get("q")?.trim() || "";
    const cat = url.searchParams.get("cat") || "";
    const sub = url.searchParams.get("sub") || "";

    if (!q || q.length < 1) return NextResponse.json([]);

    try {
        let results: { label: string; details: any }[] = [];

        const terms = q.split(/\s+/).filter(Boolean);
        const buildWhere = (fields: string[]) => ({
            AND: terms.map(term => ({
                OR: fields.map(field => ({
                    [field]: { contains: term, mode: "insensitive" as const }
                }))
            }))
        });

        if (cat === "Computers") {
            const whereClause = buildWhere(["brand", "modelName", "series", "sku"]);

            if (!sub || sub === "laptop") {
                const rows = await prismadb.laptopCatalog.findMany({ where: whereClause, take: 15 });
                results.push(...rows.map(r => ({
                    label: r.modelName.toLowerCase().includes(r.brand.toLowerCase()) ? r.modelName : `${r.brand} ${r.modelName}`,
                    details: { ...r, dbType: "laptop" }
                })));
            }
            if (!sub || sub === "desktop") {
                const rows = await prismadb.brandDesktopCatalog.findMany({ where: whereClause, take: 10 });
                results.push(...rows.map(r => ({
                    label: r.modelName.toLowerCase().includes(r.brand.toLowerCase()) ? r.modelName : `${r.brand} ${r.modelName}`,
                    details: { ...r, dbType: "desktop" }
                })));
            }
            if (!sub || sub === "aio") {
                const rows = await prismadb.aioCatalog.findMany({ where: whereClause, take: 10 });
                results.push(...rows.map(r => ({
                    label: r.modelName.toLowerCase().includes(r.brand.toLowerCase()) ? r.modelName : `${r.brand} ${r.modelName}`,
                    details: { ...r, dbType: "aio" }
                })));
            }
        } else if (cat === "Phones") {
            const rows = await prismadb.mobileCatalog.findMany({
                where: buildWhere(["brand", "modelName"]),
                take: 15
            });
            results = rows.map(r => ({
                label: r.modelName.toLowerCase().includes(r.brand.toLowerCase()) ? r.modelName : `${r.brand} ${r.modelName}`,
                details: { ...r, dbType: "mobile" }
            }));
        } else if (cat === "Vehicles") {
            const rows = await prismadb.vehicleCatalog.findMany({
                where: buildWhere(["make", "model"]),
                take: 15
            });
            results = rows.map(r => ({
                label: `${r.make} ${r.model}`,
                details: { ...r, dbType: "vehicle" }
            }));
        } else if (cat === "Electronics") {
            const rows = await prismadb.electronicsCatalog.findMany({
                where: buildWhere(["brand", "modelName"]),
                take: 15
            });
            results = rows.map(r => ({
                label: r.modelName.toLowerCase().includes(r.brand.toLowerCase()) ? r.modelName : `${r.brand} ${r.modelName}`,
                details: { ...r, dbType: "electronics" }
            }));
        } else if (cat === "Appliances") {
            const rows = await prismadb.applianceCatalog.findMany({
                where: buildWhere(["brand", "modelName"]),
                take: 15
            });
            results = rows.map(r => ({
                label: r.modelName.toLowerCase().includes(r.brand.toLowerCase()) ? r.modelName : `${r.brand} ${r.modelName}`,
                details: { ...r, dbType: "appliance" }
            }));
        }

        // deduplicate + sort
        const uniqueMap = new Map<string, { label: string; details: any }>();
        results.forEach(r => { if (!uniqueMap.has(r.label)) uniqueMap.set(r.label, r); });
        const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
            const qL = q.toLowerCase();
            const aS = a.label.toLowerCase().startsWith(qL);
            const bS = b.label.toLowerCase().startsWith(qL);
            if (aS && !bS) return -1;
            if (!aS && bS) return 1;
            return a.label.localeCompare(b.label, "en", { numeric: true, sensitivity: "base" });
        });

        return NextResponse.json(sorted.slice(0, 15));
    } catch (e: any) {
        console.error("[catalog-search]", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
