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
            // Relaxed length to 2 (e.g. "S", "i7" etc might be important but usually 2+ is safer for Hebrew)
            // Actually, even 2 is fine. "PC" is 2.
            searchKeywords = query.split(' ').filter((t: string) => t.trim().length >= 2);
            
            // If the user typed a brand/model that AI detected, ensure we add it to search
            if (analysis.make && !searchKeywords.includes(analysis.make)) searchKeywords.push(analysis.make);
            if (analysis.model && !searchKeywords.includes(analysis.model)) searchKeywords.push(analysis.model);

            // 1b. Brand Mapping (Hebrew to English for Catalog Search)
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

        // Apply Keyword Filter - Intelligent AND/OR logic
        if (searchKeywords.length > 0) {
            // First attempt: Try to match ALL keywords (AND)
            whereClause.AND = searchKeywords.map(term => ({
                OR: [
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { extraData: { contains: term, mode: "insensitive" as const } },
                ]
            }));
        }

        // 4. Execute Primary Query (Listings)
        let listings = await prismadb.marketplaceListing.findMany({
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
            take: 60,
            orderBy: { createdAt: "desc" }
        });

        // 4b. Fallback: If no listings found with strict AND, try loose OR
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
                        select: { firstName: true, lastName: true, imageUrl: true, roles: true }
                    }
                },
                take: 60,
                orderBy: { createdAt: "desc" }
            });
        }

        // 4c. Catalog Search (Parallel)
        let catalogItems: any[] = [];
        if (searchKeywords.length > 0) {
            const catalogQueries = [
                prismadb.laptopCatalog.findMany({
                    where: {
                        OR: searchKeywords.map(k => ({
                            OR: [
                                { brand: { contains: k, mode: "insensitive" as const } },
                                { series: { contains: k, mode: "insensitive" as const } },
                                { modelName: { contains: k, mode: "insensitive" as const } }
                            ]
                        }))
                    },
                    take: 5
                }),
                prismadb.mobileCatalog.findMany({
                    where: {
                        OR: searchKeywords.map(k => ({
                            OR: [
                                { brand: { contains: k, mode: "insensitive" as const } },
                                { series: { contains: k, mode: "insensitive" as const } },
                                { modelName: { contains: k, mode: "insensitive" as const } },
                                { hebrewAliases: { has: k } }
                            ]
                        }))
                    },
                    take: 5
                }),
                prismadb.electronicsCatalog.findMany({
                    where: {
                        OR: searchKeywords.map(k => ({
                            OR: [
                                { brand: { contains: k, mode: "insensitive" as const } },
                                { category: { contains: k, mode: "insensitive" as const } },
                                { modelName: { contains: k, mode: "insensitive" as const } },
                                { hebrewAliases: { has: k } }
                            ]
                        }))
                    },
                    take: 5
                }),
                prismadb.vehicleCatalog.findMany({
                    where: {
                        OR: searchKeywords.map(k => ({
                            OR: [
                                { make: { contains: k, mode: "insensitive" as const } },
                                { model: { contains: k, mode: "insensitive" as const } }
                            ]
                        }))
                    },
                    take: 5
                })
            ];

            const [laptops, mobiles, electronics, vehicles] = await Promise.all(catalogQueries) as [any[], any[], any[], any[]];
            
            // Map Catalog items to look like listings
            const laptopListings = laptops.map(item => ({
                id: `catalog-laptop-${item.id}`,
                title: `${item.brand} ${item.series} ${item.modelName}`,
                description: `מפרט קטלוגי: ${Array.isArray(item.cpu) ? item.cpu[0] : ''}, ${Array.isArray(item.ram) ? item.ram[0] : ''}, ${Array.isArray(item.storage) ? item.storage[0] : ''}. ${item.notes || ''}`,
                price: 0,
                images: "[]",
                category: "מחשבים",
                condition: "קטלוג",
                type: "catalog",
                seller: { firstName: "QlikNDeal", lastName: "Catalog" }
            }));

            const mobileListings = mobiles.map(item => ({
                id: `catalog-mobile-${item.id}`,
                title: `${item.brand} ${item.modelName}`,
                description: `מפרט קטלוגי: ${item.cpu || ''} ${item.ramG ? item.ramG + 'GB' : ''} ${item.battery || ''}`,
                price: 0,
                images: "[]",
                category: "טלפונים",
                condition: "קטלוג",
                type: "catalog",
                seller: { firstName: "QlikNDeal", lastName: "Catalog" }
            }));

            const electronicListings = electronics.map(item => ({
                id: `catalog-elec-${item.id}`,
                title: `${item.brand} ${item.modelName}`,
                description: `מפרט קטלוגי: ${item.category}. ${item.specs || ''}`,
                price: 0,
                images: "[]",
                category: "אלקטרוניקה",
                condition: "קטלוג",
                type: "catalog",
                seller: { firstName: "QlikNDeal", lastName: "Catalog" }
            }));

            const vehicleListings = vehicles.map(item => ({
                id: `catalog-vehicle-${item.id}`,
                title: `${item.make} ${item.model} ${item.year || ''}`,
                description: `מפרט קטלוגי: ${item.type || ''}, ${item.fuelType || ''}, ${item.transmission || ''}`,
                price: 0,
                images: "[]",
                category: "רכב",
                condition: "קטלוג",
                type: "catalog",
                seller: { firstName: "QlikNDeal", lastName: "Catalog" }
            }));

            catalogItems = [...laptopListings, ...mobileListings, ...electronicListings, ...vehicleListings];
        }

        // 4d. External Leads & Shipments Search (Comprehensive)
        let additionalResults: any[] = [];
        if (searchKeywords.length > 0) {
            const [leads, internalShipments] = await Promise.all([
                prismadb.shadowLead.findMany({
                    where: {
                        OR: searchKeywords.map(k => ({ postText: { contains: k, mode: "insensitive" } }))
                    },
                    take: 20,
                    orderBy: { createdAt: "desc" }
                }),
                prismadb.shipment.findMany({
                    where: {
                        OR: searchKeywords.map(k => ({
                            details: {
                                is: {
                                    itemName: { contains: k, mode: "insensitive" }
                                }
                            }
                        })),
                        status: { not: "DELIVERED" }
                    },
                    include: { details: true, seller: true },
                    take: 10,
                    orderBy: { createdAt: "desc" }
                })
            ]);

            // Map Leads
            const mappedLeads = leads.map(lead => ({
                id: `lead-${lead.id}`,
                title: (lead.postText || "").split('\n')[0].substring(0, 60),
                description: lead.postText || "",
                price: 0, 
                images: lead.images || '[]',
                category: "חיצוני",
                condition: "יד שניה",
                type: "external",
                seller: { firstName: lead.sellerName || "מוכר", lastName: "פייסבוק" },
                sourceUrl: lead.sourceUrl
            }));

            // Map Shipments
            const mappedShipments = internalShipments.map(ship => ({
                id: `shipment-${ship.id}`,
                title: ship.details?.itemName || "פריט ללא שם",
                description: ship.details?.sellerNotes || "",
                price: ship.details?.value || 0,
                images: ship.details?.images || "[]",
                category: "פנימי",
                condition: ship.details?.itemCondition || "משומש",
                type: "internal",
                seller: { firstName: ship.seller?.firstName || "מוכר", lastName: ship.seller?.lastName || "" }
            }));

            additionalResults = [...mappedLeads, ...mappedShipments];
        }

        // 5. Precise Distance Calculation & Sorting (for items within the bounding box)
        let finalResults: any[] = listings;
        
        if (typeof lat === "number" && typeof lng === "number" && typeof radiusKm === "number" && radiusKm > 0) {
            // Haversine formula
            const toRad = (value: number) => value * Math.PI / 180;
            const R = 6371; // Earth's radius in km
            
            const resultsWithDistance = listings.map((l: any) => {
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
                .filter((l: any) => l.distanceKm === null || l.distanceKm <= radiusKm)
                .sort((a: any, b: any) => {
                    if (a.distanceKm === null) return 1;
                    if (b.distanceKm === null) return -1;
                    return a.distanceKm - b.distanceKm;
                });
        }

        return NextResponse.json({ 
            success: true, 
            results: [...finalResults, ...catalogItems, ...additionalResults],
            aiFilters: aiFilters // Send back what AI thought for UX debugging
        });

    } catch (error) {
        console.error("[SMART_SEARCH_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
