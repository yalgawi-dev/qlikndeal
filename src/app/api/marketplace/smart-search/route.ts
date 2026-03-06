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

        // 4b. Smart Category-Aware Similar Suggestions
        // When no exact match is found, find similar items ONLY within the same category/segment.
        // e.g. "laptop I9" with no results → suggest other laptops (I7, I5, Ryzen), NOT phones or cars.
        if (listings.length === 0 && searchKeywords.length > 0) {
            delete whereClause.AND;
            delete whereClause.OR;

            // --- Detect the category/segment of the query ---
            // Map of category signals → DB category values to search within
            const categorySignals: Array<{ keywords: string[]; dbCategories: string[]; label: string; forbiddenWords?: string[] }> = [
                {
                    label: "מחשבים ניידים",
                    keywords: ["לפטופ", "מחשב נייד", "laptop", "נייד", "notebook", "i3", "i5", "i7", "i9", "ryzen", "macbook", "מקבוק", "thinkpad", "ideapad", "vivobook", "zenbook", "inspiron", "xps", "pavilion", "spectre"],
                    dbCategories: ["מחשבים", "מחשב נייד", "computers", "laptop"],
                    forbiddenWords: ["נייח", "שולחני", "desktop", "מארז", "פיסי"] // Explicitly ban desktop terms
                },
                {
                    label: "מחשבים שולחניים",
                    keywords: ["מחשב שניח", "מחשב נייח", "שולחני", "desktop", "pc", "מחשב שולחני"],
                    dbCategories: ["מחשבים", "מחשב נייח", "computers", "desktop"],
                    forbiddenWords: ["נייד", "לפטופ", "laptop", "notebook"] // Explicitly ban laptop terms
                },
                {
                    label: "טלפונים סלולריים",
                    keywords: ["אייפון", "iphone", "סמסונג", "samsung", "galaxy", "גלקסי", "שיאומי", "xiaomi", "טלפון", "סלולרי", "סמארטפון", "smartphone", "redmi", "poco", "pixel"],
                    dbCategories: ["סלולרי", "פלאפלים", "טלפונים", "phones", "mobile"]
                },
                {
                    label: "אוזניות ושמע",
                    keywords: ["אוזניות", "headphones", "airpods", "בוז", "bose", "jbl", "sony wh", "sony wf", "headset", "ג'יביאל", "שמע"],
                    dbCategories: ["אלקטרוניקה", "אוזניות", "electronics", "audio"]
                },
                {
                    label: "טלוויזיות ומסכים",
                    keywords: ["טלוויזיה", "טלויזיה", "tv", "מסך", "oled", "qled", "4k", "8k", "samsungtv", "65 אינץ", "55 אינץ"],
                    dbCategories: ["אלקטרוניקה", "טלוויזיות", "electronics", "tv"]
                },
                {
                    label: "רכבים",
                    keywords: ["רכב", "מכונית", "אוטו", "car", "טויוטה", "toyota", "יונדאי", "hyundai", "קיה", "kia", "מאזדה", "mazda", "הונדה", "honda", "מרצדס", "mercedes", "bmw", "אאודי", "audi", "טסלה", "tesla", "איוניק", "ספורטאז", "קורולה"],
                    dbCategories: ["רכבים", "cars", "רכב"]
                },
                {
                    label: "ריהוט וצרכי בית",
                    keywords: ["ספה", "כיסא", "שולחן", "מיטה", "ארון", "איקאה", "ikea", "ריהוט", "מזרון", "ספריה"],
                    dbCategories: ["ריהוט", "בית", "furniture", "home"]
                },
                {
                    label: "מוצרי חשמל ביתיים",
                    keywords: ["מכונת כביסה", "מקרר", "מדיח", "מיקרוגל", "תנור", "בוילר", "מזגן", "בוש", "bosch", "מילה", "miele", "סימנס", "siemens", "אלקטרולוקס"],
                    dbCategories: ["מוצרי חשמל", "מוצרי חשמל ביתיים", "appliances", "חשמל"]
                },
                {
                    label: "קונסולות ומשחקים",
                    keywords: ["פלייסטיישן", "playstation", "ps4", "ps5", "xbox", "אקסבוקס", "נינטנדו", "nintendo", "switch", "סוויץ", "gaming", "גיימינג"],
                    dbCategories: ["אלקטרוניקה", "גיימינג", "gaming", "electronics"]
                },
                {
                    label: "נדלן",
                    keywords: ["דירה", "בית", "חדרים", "ווילה", "פנטהאוז", "נכס", "להשכרה", "למכירה", "קוטג"],
                    dbCategories: ["נדלן", "דירות", "real estate"]
                },
            ];

            // Find which category segment best matches the query
            const queryLower = (query || "").toLowerCase();
            const allKeywordsLower = searchKeywords.map(k => k.toLowerCase());
            
            let detectedSegment: typeof categorySignals[0] | null = null;
            let bestScore = 0;

            for (const signal of categorySignals) {
                let matchScore = 0;
                for (const kw of signal.keywords) {
                    const kwLower = kw.toLowerCase();
                    if (queryLower.includes(kwLower)) matchScore += 3;
                    if (allKeywordsLower.some(k => k.includes(kwLower) || kwLower.includes(k))) matchScore += 1;
                }
                if (matchScore > bestScore) {
                    bestScore = matchScore;
                    detectedSegment = signal;
                }
            }

            // Also use aiFilters.aiCategory if analyzeListingText detected a category
            const aiDetectedCategory = aiFilters.aiCategory as string | undefined;

            // Build the similar suggestions query — ONLY within the detected category
            const similarWhere: any = { status: "ACTIVE", ...latLngFilter };

            if (detectedSegment) {
                // Filter strictly to the detected segment's DB categories
                similarWhere.OR = detectedSegment.dbCategories.map(cat => ({
                    category: { contains: cat, mode: "insensitive" as const }
                }));

                // Apply strict exclusions so segments don't cross-pollinate (e.g., Laptops vs Desktops)
                if (detectedSegment.forbiddenWords && detectedSegment.forbiddenWords.length > 0) {
                    similarWhere.AND = [
                        ...(similarWhere.AND || []),
                        ...detectedSegment.forbiddenWords.map(word => ({
                            title: { not: { contains: word, mode: "insensitive" as const } }
                        }))
                    ];
                }
            } else if (aiDetectedCategory) {
                // Fallback: use AI-detected category
                similarWhere.category = { contains: aiDetectedCategory, mode: "insensitive" as const };
            }
            // If no category detected at all — do NOT run fallback (avoid unrelated results)

            if (detectedSegment || aiDetectedCategory) {
                let fallbackListings = await prismadb.marketplaceListing.findMany({
                    where: similarWhere,
                    include: {
                        seller: {
                            select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
                        }
                    },
                    take: 100,
                    orderBy: { createdAt: "desc" }
                });

                // Score each result by relevance within the same category
                if (fallbackListings.length > 0) {
                    // Extract "core" keywords only — strip the specific model/spec the user searched for
                    // e.g. from "מחשב נייד I9" → keep ["מחשב נייד", "laptop", "lenovo"] but the I9 can be relaxed
                    const categoryKeywords = detectedSegment ? detectedSegment.keywords : [];

                    fallbackListings = fallbackListings.map(listing => {
                        let score = 0;
                        const combinedText = `${listing.title} ${listing.description} ${listing.extraData} ${listing.category}`.toLowerCase();
                        
                        // Score for matching any category signal keyword
                        categoryKeywords.forEach(term => {
                            if (combinedText.includes(term.toLowerCase())) score += 1;
                        });
                        
                        // Bonus: score for matching non-spec keywords from original query
                        // (brand names, general product type - not the specific specs like I9/RTX4090)
                        const specPatterns = /\b(i\d|i\d\d|rtx\s?\d+|gtx\s?\d+|rx\s?\d+|gb|tb|mhz|ghz|\d+gb|\d+tb)\b/gi;
                        const queryWithoutSpecs = queryLower.replace(specPatterns, "");
                        const queryTerms = queryWithoutSpecs.split(/\s+/).filter((t: string) => t.length > 1);
                        queryTerms.forEach((term: string) => {
                            if (combinedText.includes(term)) score += 2;
                        });

                        // Price proximity bonus: if user specified price, boost similar-priced items
                        if (aiFilters.maxPrice && listing.price) {
                            const priceDelta = Math.abs(listing.price - aiFilters.maxPrice) / aiFilters.maxPrice;
                            if (priceDelta < 0.3) score += 3;  // within 30% of requested price → big bonus
                            else if (priceDelta < 0.6) score += 1;
                        }

                        return { ...listing, matchScore: score, isSuggestion: true };
                    })
                    .filter(l => l.matchScore >= 0) // Allow all same-category items even with score 0
                    .sort((a, b) => b.matchScore - a.matchScore)
                    .slice(0, 60);

                    if (fallbackListings.length > 0) {
                        listings = fallbackListings;
                        isFallback = true;
                        // Update aiInsight to describe what we're showing
                        if (detectedSegment) {
                            aiInsight = `לא מצאנו ${query} מדויק, אבל הנה ${detectedSegment.label} דומים שאולי יתאימו לך. אם אתה מחפש משהו ספציפי – פרסם מודעת "דרוש מוצר" וקבל התראה.`;
                        }
                    }
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
