const { PrismaClient } = require('@prisma/client');
const prismadb = new PrismaClient();

async function runSearch(body) {
    const { query, lat, lng, radiusKm, category, listingType = "SELL", isAutocomplete = false } = body;
    console.log("Input:", body);

    let aiFilters = {};
    let searchKeywords = [];
    let keywordGroups = [];
    let aiInsight = "";
    let capabilityMatch = null;

    console.log("1. Reading searchFilterConfig...");
    const searchConfigs = await prismadb.searchFilterConfig.findMany({ where: { isActive: true } });
    console.log(`Read ${searchConfigs.length} configs`);

    const stopWords = searchConfigs.filter(c => c.filterType === "STOP_WORD").map(c => c.value.toLowerCase());
    const unitPatterns = searchConfigs.filter(c => c.filterType === "UNIT_PATTERN");

    let processedQuery = query || "";
    stopWords.forEach(sw => { processedQuery = processedQuery.replace(new RegExp(`\\b${sw}\\b`, "gi"), ""); });
    unitPatterns.forEach(up => { processedQuery = processedQuery.replace(new RegExp(up.value, "gi"), up.replacement || ""); });

    if (processedQuery.trim().length > 0) {
        console.log("2. Analyzing query text...");
        // Simulating the analyzeListingText or importing it if needed
        searchKeywords = query.split(' ').filter(t => t.trim().length >= 2);
    }

    let latLngFilter = {};
    if (typeof lat === "number" && typeof lng === "number" && typeof radiusKm === "number" && radiusKm > 0) {
        const latDelta = radiusKm / 111.0;
        const lngDelta = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180)));
        latLngFilter = {
            latitude: { gte: lat - latDelta, lte: lat + latDelta },
            longitude: { gte: lng - lngDelta, lte: lng + lngDelta }
        };
    }

    const whereClause = {
        status: "ACTIVE",
        listingType: listingType,
        ...latLngFilter
    };

    if (category && category !== "all") {
        whereClause.category = category;
    }

    if (aiFilters.maxPrice) whereClause.price = { lte: aiFilters.maxPrice };

    if (keywordGroups.length > 0) {
        whereClause.AND = keywordGroups.map(group => ({
            OR: group.flatMap(term => [
                { title: { contains: term, mode: "insensitive" } },
                { description: { contains: term, mode: "insensitive" } },
                { extraData: { contains: term, mode: "insensitive" } },
            ])
        }));
    } else if (searchKeywords.length > 0) {
        whereClause.AND = searchKeywords.map(term => ({
            OR: [
                { title: { contains: term, mode: "insensitive" } },
                { description: { contains: term, mode: "insensitive" } },
                { extraData: { contains: term, mode: "insensitive" } }
            ]
        }));
    }

    console.log("3. Querying MarketplaceListing...");
    console.log("Where clause:", JSON.stringify(whereClause, null, 2));
    let listings = await prismadb.marketplaceListing.findMany({
        where: whereClause,
        include: {
            seller: {
                select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
            }
        },
        take: 60,
        orderBy: { createdAt: "desc" }
    });

    console.log(`Fetched ${listings.length} listings`);
}

async function main() {
    try {
        await runSearch({ query: "", lat: null, lng: null, category: null, listingType: "SELL" });
        console.log("SUCCESS!");
    } catch(e) {
        console.error("FAILED with error:", e);
    } finally {
        await prismadb.$disconnect();
    }
}

main();
