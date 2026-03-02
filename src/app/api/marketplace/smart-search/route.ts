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
            
            // Extract AI detected filters
            if (analysis.price) aiFilters.maxPrice = analysis.price;
            if (analysis.category && analysis.category !== "כללי") aiFilters.aiCategory = analysis.category;
            if (analysis.subCategory) aiFilters.subCategory = analysis.subCategory;

            // Extract keywords (filter out generic/empty)
            searchKeywords = query.split(' ').filter((t: string) => t.trim().length > 2);
            
            // If the user typed a brand/model that AI detected, ensure we add it to search
            if (analysis.make) searchKeywords.push(analysis.make);
            if (analysis.model) searchKeywords.push(analysis.model);
        }

        // 2. Build Bounding Box for fast SQL distance indexing (Prisma Native)
        let latLngFilter = {};
        if (typeof lat === "number" && typeof lng === "number" && typeof radiusKm === "number" && radiusKm > 0) {
            const latDelta = radiusKm / 111.0;
            // 111km per degree of latitude. Longitude shrinks by cos(lat)
            const lngDelta = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180)));
            
            latLngFilter = {
                latitude: { gte: lat - latDelta, lte: lat + latDelta },
                longitude: { gte: lng - lngDelta, lte: lng + lngDelta }
            };
        }

        // 3. Construct Where Clause
        const whereClause: any = {
            status: "ACTIVE",
            ...latLngFilter
        };

        // Apply Category Filter (explicit category overrides AI)
        const finalCategory = category && category !== "all" ? category : aiFilters.aiCategory;
        if (finalCategory) {
            whereClause.category = finalCategory;
        }

        // Apply Price Filter if AI detected "under X"
        if (aiFilters.maxPrice) {
            whereClause.price = { lte: aiFilters.maxPrice };
        }

        // Apply Keyword Filter
        if (searchKeywords.length > 0) {
            whereClause.AND = searchKeywords.map(term => ({
                OR: [
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { extraData: { contains: term, mode: "insensitive" as const } },
                ]
            }));
        }

        // 4. Execute Query
        const listings = await prismadb.marketplaceListing.findMany({
            where: whereClause,
            include: {
                seller: {
                    select: {
                        firstName: true,
                        lastName: true,
                        imageUrl: true,
                        roles: true
                    }
                }
            },
            take: 100, // Limit results for performance
            orderBy: { createdAt: "desc" }
        });

        // 5. Precise Distance Calculation & Sorting (for items within the bounding box)
        let finalResults = listings;
        
        if (typeof lat === "number" && typeof lng === "number" && typeof radiusKm === "number" && radiusKm > 0) {
            // Haversine formula
            const toRad = (value: number) => value * Math.PI / 180;
            const R = 6371; // Earth's radius in km
            
            const resultsWithDistance = listings.map(l => {
                let distance = null;
                if (l.latitude && l.longitude) {
                    const dLat = toRad(l.latitude - lat);
                    const dLon = toRad(l.longitude - lng);
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                              Math.cos(toRad(lat)) * Math.cos(toRad(l.latitude)) *
                              Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    distance = R * c;
                }
                return { ...l, distanceKm: distance };
            });

            // Filter out exact radius (since bounding box is a square) and sort by closest
            finalResults = resultsWithDistance
                .filter(l => l.distanceKm === null || l.distanceKm <= radiusKm)
                .sort((a, b) => {
                    if (a.distanceKm === null) return 1;
                    if (b.distanceKm === null) return -1;
                    return a.distanceKm - b.distanceKm;
                });
        }

        return NextResponse.json({ 
            success: true, 
            results: finalResults,
            aiFilters: aiFilters // Send back what AI thought for UX debugging
        });

    } catch (error) {
        console.error("[SMART_SEARCH_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
