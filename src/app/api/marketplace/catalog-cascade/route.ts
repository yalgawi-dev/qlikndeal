import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = 'force-dynamic';

// GET /api/marketplace/catalog-cascade?category=LAPTOPS&brand=Asus&series=ROG&model=X
// Bidirectional cascade: any field can filter all others
// Returns filtered brands, series, models + autoFill specs
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const series = searchParams.get("series") || "";
    const model = searchParams.get("model") || "";

    try {
        const dedup = (arr: string[]) => {
            const seen = new Set<string>();
            return arr.filter(v => {
                if (!v) return false;
                const l = v.toLowerCase();
                if (seen.has(l)) return false;
                seen.add(l);
                return true;
            }).sort((a, b) => a.localeCompare(b));
        };

        let result: {
            brands: string[];
            series: string[];
            models: string[];
            autoFill?: Record<string, string>;
        } = { brands: [], series: [], models: [] };

        if (category === "LAPTOPS" || category === "DESKTOPS" || category === "AIO") {
            const table: any = category === "LAPTOPS" ? prismadb.laptopCatalog
                             : category === "DESKTOPS" ? prismadb.brandDesktopCatalog
                             : prismadb.aioCatalog;

            // Build where clause from whatever filter is provided (bidirectional!)
            const where: any = {};
            if (brand)  where.brand     = { equals: brand,  mode: "insensitive" };
            if (series) where.series    = { equals: series, mode: "insensitive" };
            if (model)  where.modelName = { contains: model, mode: "insensitive" };

            const items = await table.findMany({ where, select: { brand: true, series: true, modelName: true } });

            result.brands = dedup(items.map((i: any) => i.brand));
            result.series = dedup(items.map((i: any) => i.series));
            result.models = dedup(items.map((i: any) => i.modelName));

            // If no filters, return all brands (for initial load)
            if (!brand && !series && !model) {
                const all = await table.findMany({ select: { brand: true } });
                result.brands = dedup(all.map((i: any) => i.brand));
            }

            // Auto-fill: if model pinpoints a single item
            if (model) {
                const exact = await table.findFirst({ where });
                if (exact) {
                    result.autoFill = {
                        brand:       exact.brand || "",
                        family:      exact.series || "",
                        subModel:    exact.modelName || "",
                        cpu:         Array.isArray(exact.cpu) ? exact.cpu[0] : (exact.cpu || ""),
                        gpu:         Array.isArray(exact.gpu) ? exact.gpu[0] : (exact.gpu || ""),
                        ram:         Array.isArray(exact.ram) ? exact.ram[0] : (exact.ram || ""),
                        storage:     Array.isArray(exact.storage) ? exact.storage[0] : (exact.storage || ""),
                        screen:      Array.isArray(exact.screenSize) ? exact.screenSize[0] + '"' : (exact.screenSize ? exact.screenSize + '"' : ""),
                        os:          Array.isArray(exact.os) ? exact.os[0] : (exact.os || ""),
                        releaseYear: exact.releaseYear?.toString() || "",  // ← canonical camelCase
                    };
                }
            }

        } else if (category === "PHONES" || category === "SMARTPHONES" || category === "MOBILES") {
            const where: any = {};
            if (brand)  where.brand     = { equals: brand,  mode: "insensitive" };
            if (series) where.series    = { equals: series, mode: "insensitive" };
            if (model)  where.modelName = { contains: model, mode: "insensitive" };

            const items = await prismadb.mobileCatalog.findMany({ where, select: { brand: true, series: true, modelName: true } });

            result.brands = dedup(items.map((i: any) => i.brand));
            result.series = dedup(items.map((i: any) => i.series));
            result.models = dedup(items.map((i: any) => i.modelName));

            if (!brand && !series && !model) {
                const all = await prismadb.mobileCatalog.findMany({ select: { brand: true } });
                result.brands = dedup(all.map((i: any) => i.brand));
            }

            if (model) {
                const exact = await prismadb.mobileCatalog.findFirst({ where });
                if (exact) {
                    result.autoFill = {
                        brand:       exact.brand || "",
                        family:      exact.series || "",
                        subModel:    exact.modelName || "",   // ← canonical (was "model")
                        cpu:         exact.cpu || "",
                        ram:         exact.ramG ? `${exact.ramG}GB` : "",
                        storage:     Array.isArray((exact as any).storages) ? (exact as any).storages.join(" / ") : ((exact as any).storage || ""),
                        screen:      exact.screenSize ? `${exact.screenSize}"` : "",
                        os:          exact.os || "",
                        releaseYear: exact.releaseYear?.toString() || "",  // ← canonical (was "release_year")
                        cameraMain:  exact.rearCamera || "",               // ← canonical (was "rear_camera")
                    };
                }
            }

        } else if (category === "VEHICLES") {
            const where: any = {};
            if (brand) where.make  = { equals: brand, mode: "insensitive" };
            if (model) where.model = { contains: model, mode: "insensitive" };

            const items = await prismadb.vehicleCatalog.findMany({ where, select: { make: true, model: true } });
            result.brands = dedup(items.map((i: any) => i.make));
            result.models = dedup(items.map((i: any) => i.model));

            if (!brand && !model) {
                const all = await prismadb.vehicleCatalog.findMany({ select: { make: true } });
                result.brands = dedup(all.map((i: any) => i.make));
            }
        }

        return NextResponse.json(result);
    } catch (e: any) {
        console.error("[catalog-cascade]", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
