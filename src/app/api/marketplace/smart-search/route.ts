import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { analyzeListingText } from "@/lib/listing-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, lat, lng, radiusKm, category } = body;

        let aiFilters: any = {};
        let searchKeywords: string[] = [];

        // 1. Smart "AI" Query Parsing
        if (query && query.trim().length > 0) {
            const analysis = analyzeListingText(query);
            
            if (analysis.price) aiFilters.maxPrice = analysis.price;
            if (analysis.category && analysis.category !== "כללי") aiFilters.aiCategory = analysis.category;
            if (analysis.subCategory) aiFilters.subCategory = analysis.subCategory;

            searchKeywords = query.split(' ').filter((t: string) => t.trim().length >= 2);
            
            if (analysis.make && !searchKeywords.includes(analysis.make)) searchKeywords.push(analysis.make);
            if (analysis.model && !searchKeywords.includes(analysis.model)) searchKeywords.push(analysis.model);

            // Brand Mapping (Hebrew to English)
            const brandMappings: Record<string, string[]> = {
                "אפל": ["Apple", "iPhone"], "דל": ["Dell"], "לנובו": ["Lenovo"], "אסוס": ["Asus"], 
                "אייפון": ["iPhone"], "גלקסי": ["Galaxy"], "סמסונג": ["Samsung"],
                "טויוטה": ["Toyota"], "יונדאי": ["Hyundai"], "קיה": ["Kia"], "מאזדה": ["Mazda"],
                "הונדה": ["Honda"], "מרצדס": ["Mercedes"], "טסלה": ["Tesla"]
            };

            const expandedKeywords: string[] = [...searchKeywords];
            searchKeywords.forEach(k => {
                if (brandMappings[k]) {
                    brandMappings[k].forEach(mapped => {
                        if (!expandedKeywords.includes(mapped)) expandedKeywords.push(mapped);
                    });
                }
            });
            searchKeywords = expandedKeywords;
        }

        // 2. Build Bounding Box for geo-distance filtering
        let latLngFilter = {};
        if (typeof lat === "number" && typeof lng === "number" && typeof radiusKm === "number" && radiusKm > 0) {
            const latDelta = radiusKm / 111.0;
            const lngDelta = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180)));
            latLngFilter = {
                latitude: { gte: lat - latDelta, lte: lat + latDelta },
                longitude: { gte: lng - lngDelta, lte: lng + lngDelta }
            };
        }

        // 3. Construct Where Clause - ONLY published MarketplaceListings
        const whereClause: any = {
            status: "ACTIVE",
            ...latLngFilter
        };

        const finalCategory = category && category !== "all" ? category : aiFilters.aiCategory;
        if (finalCategory) whereClause.category = finalCategory;
        if (aiFilters.maxPrice) whereClause.price = { lte: aiFilters.maxPrice };

        // Keyword Filter - AND logic first
        if (searchKeywords.length > 0) {
            whereClause.AND = searchKeywords.map(term => ({
                OR: [
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { extraData: { contains: term, mode: "insensitive" as const } },
                ]
            }));
        }

        // 4. Query ONLY MarketplaceListing (published user ads)
        let listings = await prismadb.marketplaceListing.findMany({
            where: whereClause,
            include: {
                seller: {
                    select: { firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
                }
            },
            take: 60,
            orderBy: { createdAt: "desc" }
        });

        // 4b. Fallback: loose OR if AND returned nothing
        if (listings.length === 0 && searchKeywords.length > 1) {
            delete whereClause.AND;
            whereClause.OR = searchKeywords.map(term => ({
                OR: [
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { extraData: { contains: term, mode: "insensitive" as const } },
                ]
            }));

            listings = await prismadb.marketplaceListing.findMany({
                where: whereClause,
                include: {
                    seller: {
                        select: { firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
                    }
                },
                take: 60,
                orderBy: { createdAt: "desc" }
            });
        }

        // 5. Precise Distance Calculation & Sorting
        let finalResults: any[] = listings;
        
        if (typeof lat === "number" && typeof lng === "number" && typeof radiusKm === "number" && radiusKm > 0) {
            const toRad = (v: number) => v * Math.PI / 180;
            const R = 6371;
            
            const withDistance = listings.map((l: any) => {
                let distance: number | null = null;
                if (l.latitude && l.longitude) {
                    const dLat = toRad(l.latitude - lat);
                    const dLon = toRad(l.longitude - lng);
                    const a = Math.sin(dLat / 2) ** 2 +
                              Math.cos(toRad(lat)) * Math.cos(toRad(l.latitude)) *
                              Math.sin(dLon / 2) ** 2;
                    distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                }
                return { ...l, distanceKm: distance };
            });

            finalResults = withDistance
                .filter((l: any) => l.distanceKm === null || l.distanceKm <= radiusKm)
                .sort((a: any, b: any) => {
                    if (a.distanceKm === null) return 1;
                    if (b.distanceKm === null) return -1;
                    return a.distanceKm - b.distanceKm;
                });
        }

        return NextResponse.json({ 
            success: true, 
            results: finalResults,
            total: finalResults.length,
            aiFilters
        });

    } catch (error) {
        console.error("[SMART_SEARCH_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
