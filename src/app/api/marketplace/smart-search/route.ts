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
        let keywordGroups: string[][] = [];
        let aiInsight = "";

        // 1. Smart "AI" Query Parsing
        if (query && query.trim().length > 0) {
            const analysis = analyzeListingText(query);
            
            if (analysis.price) aiFilters.maxPrice = analysis.price;
            if (analysis.category && analysis.category !== "כללי") aiFilters.aiCategory = analysis.category;
            if (analysis.subCategory) aiFilters.subCategory = analysis.subCategory;

            searchKeywords = query.split(' ').filter((t: string) => t.trim().length >= 2);
            
            if (analysis.make && !searchKeywords.includes(analysis.make)) searchKeywords.push(analysis.make);
            if (analysis.model && !searchKeywords.includes(analysis.model)) searchKeywords.push(analysis.model);

            // Smart Learning Dictionary - Maps typos and Hebrew aliases to English brands
            // Smart Learning Dictionary - Massive mapping for ALL marketplace categories
            const brandMappings: Record<string, string[]> = {
                // Computers & Phones
                "אפל": ["Apple", "iPhone", "MacBook", "iPad", "mac", "אייפד", "מקבוק", "אייפון"], 
                "דל": ["Dell", "del", "inspiron", "latitude", "xps"], 
                "לנובו": ["Lenovo", "lanovo", "linovo", "thinkpad", "ideapad"], 
                "אסוס": ["Asus", "assus", "rog", "vivobook", "zenbook", "טוף", "tuf"], 
                "אייסר": ["Acer", "acer", "איסר", "predator"],
                "acer": ["Acer", "אייסר", "איסר"],
                "hp": ["HP", "hp", "אייצ' פי", "אייצ פי", "h.p", "pavilion", "spectre"],
                "אייפון": ["iPhone", "apple", "איפון", "אפון", "aifon"], 
                "גלקסי": ["Galaxy", "Samsung", "גלאקסי", "גלכסי"], 
                "סמסונג": ["Samsung", "Galaxy", "samsong"],
                "שיאומי": ["Xiaomi", "שיומי", "xiaomi", "redmi", "poco", "פוקו"],
                "שיומי": ["Xiaomi", "שיאומי", "xiaomi"],
                
                // Electronics & Audio
                "סוני": ["Sony", "sony", "ps4", "ps5", "פלייסטיישן", "playstation"],
                "פלייסטיישן": ["Playstation", "ps4", "ps5", "sony", "סוני"],
                "אקסבוקס": ["Xbox", "xbox", "אקס בוקס", "מיקרוסופט", "microsoft"],
                "נינטנדו": ["Nintendo", "nintendo", "switch", "סוויץ", "סוויטש"],
                "בוז": ["Bose", "bose", "בוס"],
                "ג'יביאל": ["JBL", "jbl", "ג'יי בי אל", "גיי בי אל"],
                "פיליפס": ["Philips", "philips", "פליפס"],
                "לג": ["LG", "lg", "אל גי", "אל ג'י", "אל גי'"],
                "אל ג'י": ["LG", "lg", "אל גי", "אל גי'"],
                "פנסוניק": ["Panasonic", "panasonic", "פנסוניק"],

                // Home Appliances
                "בוש": ["Bosch", "bosch", "בוס", "מכונת כביסה בוש"],
                "מילה": ["Miele", "miele"],
                "דייסון": ["Dyson", "dyson", "שואב דייסון"],
                "נינג'ה": ["Ninja", "ninja", "נינגה", "בלנדר"],
                "אלקטרולוקס": ["Electrolux", "electrolux", "אלקטרולוקס"],
                "סימנס": ["Siemens", "siemens", "סימנס"],

                // Cars
                "טויוטה": ["Toyota", "toyota", "טיוטה", "קורולה", "יאריס"], 
                "יונדאי": ["Hyundai", "hyundai", "hundai", "יונדאי", "איוניק", "טוסון"], 
                "קיה": ["Kia", "kia", "פיקנטו", "ספורטאז"], 
                "מאזדה": ["Mazda", "mazda", "מזדה"],
                "מזדה": ["Mazda", "מאזדה"],
                "הונדה": ["Honda", "honda", "hunda", "סיוויק"], 
                "מרצדס": ["Mercedes", "mercedes", "mercedes-benz"], 
                "טסלה": ["Tesla", "tesla", "tsla"],
                "במוו": ["BMW", "bmw", "ב.מ.וו", "בי אמוו"],
                "אאודי": ["Audi", "audi", "אודי"],
                
                // Furniture & Home
                "איקאה": ["IKEA", "ikea", "אקאה"],
                "עמינח": ["Aminach", "עמינח"],

                // Fashion
                "נייק": ["Nike", "nike", "נייקי"],
                "אדידס": ["Adidas", "adidas", "אדידאס"],
                "זארה": ["Zara", "zara", "זרה"],

                // General Marketplace Aliases
                "דירה": ["דירה", "בית", "נכס", "וילה", "פנטהאוז"],
                "השכרה": ["להשכרה", "שכירות"],
                "מכירה": ["למכירה", "למכור"],
                "אופניים חשמליות": ["אופניים חשמליים", "חשמליות", "E-bike"],
                "קורקינט": ["קורקינט חשמלי", "scooter"],
                
                // Super Category Synonyms
                "לפטופ": ["מחשב נייד", "לפטופ", "laptop", "נייד"],
                "נייד": ["מחשב נייד", "לפטופ", "laptop", "נייד"],
                "מחשב שניח": ["מחשב נייח", "מחשב שולחני", "PC", "נייח", "שולחני", "desktop"],
                "טלוויזיה": ["טלוויזיה", "טלויזיה", "מסך", "tv"],
                "אוזניות": ["אוזניות", "headset", "headphones"],
                "טלפון": ["טלפון", "סלולרי", "סמארטפון", "smartphone", "נייד"],
                "רכב": ["רכב", "מכונית", "אוטו", "car"]
            };

            // Smart Interactive Insight (AI Questioning)
            const genericQueries: Record<string, string> = {
                "לפטופ": "ראיתי שאתה מחפש מחשב נייד. יש חברה מועדפת (למשל Dell או Mac), או שחשוב לך ייעוד (גיימינג/סטודנט)?",
                "טלפון": "מחפש סלולרי חדש? איזה כיוון - אייפון, סמסונג או אולי משהו של שיאומי?",
                "רכב": "חיפוש רכבים! אתה בוחר כיוון של משפחתית (כמו איוניק/ספורטאז') או רכב קטן וחסכוני?",
                "טלוויזיה": "מעולה. בוא נשים פוקוס - מה גודל המסך שאתה מחפש, או אולי אתה רוצה לכוון ל-OLED/QLED?",
                "דירה": "מחפש נכס? כדאי לציין איזור מועדף ואת מספר החדרים כדי שהתוצאות יהיו מדויקות."
            };
            
            // If the user's primary word matches a highly generic one, add an AI tip
            for (const word of searchKeywords) {
                for (const [generic, tip] of Object.entries(genericQueries)) {
                    if (word === generic || word === genericQueries[generic]) {
                        aiInsight = tip;
                        break;
                    }
                }
                if (aiInsight) break;
            }

            // Enhance search by grouping synonyms
            const expandedKeywords: string[] = [];
            searchKeywords.forEach(k => {
                const lowerK = k.toLowerCase();
                const group = new Set<string>();
                group.add(k);

                // Find any mapping that matches the keyword (exact or case-insensitive)
                for (const [key, aliases] of Object.entries(brandMappings)) {
                    if (lowerK === key.toLowerCase() || aliases.some(a => lowerK === a.toLowerCase())) {
                        group.add(key);
                        aliases.forEach(mapped => group.add(mapped));
                    }
                }
                
                const groupArr = Array.from(group);
                keywordGroups.push(groupArr);
                groupArr.forEach(mapped => expandedKeywords.push(mapped));
            });
            searchKeywords = Array.from(new Set(expandedKeywords)); // keep flat list for fallback scoring

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

        if (category && category !== "all") {
            whereClause.category = category;
        }

        if (aiFilters.maxPrice) whereClause.price = { lte: aiFilters.maxPrice };

        // Keyword Filter - AND logic first
        if (keywordGroups.length > 0) {
            whereClause.AND = keywordGroups.map(group => ({
                OR: group.flatMap(term => [
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { extraData: { contains: term, mode: "insensitive" as const } },
                ])
            }));
        } else if (searchKeywords.length > 0) {
            whereClause.AND = searchKeywords.map(term => ({
                OR: [
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { extraData: { contains: term, mode: "insensitive" as const } }
                ]
            }));
        }

        let isFallback = false;

        // 4. Query ONLY MarketplaceListing (published user ads)
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

        // 4b. Smart Relaxed Search (Fuzzy): If strict logic found nothing, try ultra-loose substring matching.
        // This is the "AI brain" fallback to guarantee the buyer finds relevant listings even with completely broken queries.
        if (listings.length === 0 && searchKeywords.length > 0) {
            delete whereClause.AND;
            delete whereClause.OR;

            // Generate character-level splits and very loose ORs.
            const megaLooseOrs = searchKeywords.map(term => ({
                OR: [
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { extraData: { contains: term, mode: "insensitive" as const } },
                    { category: { contains: term, mode: "insensitive" as const } }
                ]
            }));

            // Step 1: At least ONE keyword MUST match anywhere in the document
            whereClause.OR = megaLooseOrs;

            let fallbackListings = await prismadb.marketplaceListing.findMany({
                where: whereClause,
                include: {
                    seller: {
                        select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
                    }
                },
                take: 100, // pull more to rank them below
                orderBy: { createdAt: "desc" }
            });

            // Step 2: Rank the fallback listings by how many keywords they matched
            if (fallbackListings.length > 0) {
                fallbackListings = fallbackListings.map(listing => {
                    let score = 0;
                    const combinedText = `${listing.title} ${listing.description} ${listing.extraData} ${listing.category}`.toLowerCase();
                    searchKeywords.forEach(term => {
                        const termLower = term.toLowerCase();
                        if (combinedText.includes(termLower)) score += 2;
                        
                        // Ultra-fuzzy: partial character matches for very bad typos (e.g. "כביسה")
                        if (termLower.length > 3) {
                            const sub = termLower.substring(0, termLower.length - 1);
                            if (combinedText.includes(sub)) score += 1;
                        }
                    });
                    return { ...listing, matchScore: score, isSuggestion: true };
                })
                .filter(l => l.matchScore > 0) // Ensure at least partial relevance
                .sort((a, b) => b.matchScore - a.matchScore) // Highest score first
                .slice(0, 60); // Cap at 60 results
                
                if (fallbackListings.length > 0) {
                    listings = fallbackListings;
                    isFallback = true;
                }
            }
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
            aiFilters,
            isFallback,
            aiInsight: aiInsight || null
        });

    } catch (error) {
        console.error("[SMART_SEARCH_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
