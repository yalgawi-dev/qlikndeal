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
        // When no exact match is found, find similar items ONLY within the exact same product segment.
        // e.g. "laptop I9" → only show I7/I5 laptops. NEVER desktops, phones, or other categories.
        if (listings.length === 0 && searchKeywords.length > 0) {
            delete whereClause.AND;
            delete whereClause.OR;

            // --- Category Signals ---
            // Each segment defines:
            //   keywords: signals that indicate this category
            //   dbCategories: allowed DB category values (exact)
            //   requiredTerms: at least ONE must appear somewhere in the listing (title/desc/extraData)
            //   forbiddenTerms: if ANY appear anywhere in the listing → reject entirely
            type CategorySignal = {
                label: string;
                keywords: string[];
                dbCategories: string[];
                requiredTerms: string[];          // at least one must exist in listing
                forbiddenTerms: string[];         // any match → discard listing
                specGroups?: {                    // for similarity scoring - groups of related terms
                    cpuTiers?: string[][];        // e.g. i9 > i7 > i5 > i3 — sorted best→worst
                    gpuTiers?: string[][];
                    ramTiers?: number[];          // in GB sorted high→low
                    categoryType?: string;        // for sub-type validation
                };
            };

                // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                // CATEGORY SIGNALS — One definition per product family
                // Pattern for every segment:
                //   dbCategories  = BROAD — catch ALL possible DB category name variations
                //   requiredTerms = JS-side — at least ONE must exist in full listing text
                //   forbiddenTerms= JS-side — ANY match → discard (wrong product type)
                //   specGroups    = similarity scoring config (tier = index 0 is best)
                // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                const categorySignals: CategorySignal[] = [

                    // ── LAPTOPS ─────────────────────────────────────────────────────────
                    {
                        label: "מחשבים ניידים",
                        keywords: ["לפטופ", "מחשב נייד", "laptop", "נייד", "notebook", "i3", "i5", "i7", "i9", "ryzen", "macbook", "מקבוק", "thinkpad", "ideapad", "vivobook", "zenbook", "inspiron", "xps", "pavilion", "spectre"],
                        dbCategories: ["מחשבים", "מחשב נייד", "computers", "laptop", "notebooks", "ניידים", "computer", "אלקטרוניקה", "electronics"],
                        requiredTerms: ["נייד", "laptop", "לפטופ", "notebook", "macbook", "מקבוק", "thinkpad", "ideapad", "vivobook", "zenbook", "inspiron", "xps", "pavilion", "spectre", "rog", "tuf", "omen", "predator", "legion", "envy", "asus", "lenovo", "dell", "hp", "acer"],
                        forbiddenTerms: ["נייח", "שולחני", "desktop", "מארז", "tower", "all-in-one", "aio", "mac mini", "mac pro", "mac studio", "imac"],
                        specGroups: {
                            cpuTiers: [
                                ["i9", "ultra 9", "ryzen 9", "m3 max", "m4 max"],
                                ["i7", "ultra 7", "ryzen 7", "m3 pro", "m2 max", "m4 pro"],
                                ["i5", "ultra 5", "ryzen 5", "m3", "m2 pro", "m2"],
                                ["i3", "ryzen 3", "m1 pro", "m1", "celeron", "pentium"],
                            ],
                            gpuTiers: [
                                ["rtx 4090", "rtx 4080", "rtx 4070"],
                                ["rtx 4060", "rtx 3080", "rtx 3070", "rx 7900"],
                                ["rtx 4050", "rtx 3060", "rx 7700"],
                                ["rtx 3050", "mx550", "gtx 1650", "iris xe", "radeon"],
                            ],
                            ramTiers: [64, 32, 16, 12, 8, 4],
                        }
                    },

                    // ── DESKTOP PCs ──────────────────────────────────────────────────────
                    {
                        label: "מחשבים שולחניים",
                        keywords: ["מחשב שניח", "מחשב נייח", "שולחני", "desktop", "מגדל", "pc", "מחשב שולחני", "all-in-one", "aio", "מיני pc"],
                        dbCategories: ["מחשבים", "מחשב נייח", "computers", "desktop", "מחשבים שולחניים", "computer", "אלקטרוניקה"],
                        requiredTerms: ["נייח", "שולחני", "desktop", "מגדל", "tower", "all-in-one", "aio", "מיני pc", "mini pc", "imac", "mac mini", "mac studio"],
                        forbiddenTerms: ["נייד", "לפטופ", "laptop", "notebook", "macbook", "מקבוק"],
                        specGroups: {
                            cpuTiers: [
                                ["i9", "ryzen 9", "threadripper", "xeon"],
                                ["i7", "ryzen 7"],
                                ["i5", "ryzen 5"],
                                ["i3", "ryzen 3", "celeron", "pentium"],
                            ],
                            gpuTiers: [
                                ["rtx 4090", "rtx 4080"],
                                ["rtx 4070", "rtx 3080", "rx 7900 xt"],
                                ["rtx 4060", "rtx 3070", "rx 7800", "rx 6800"],
                                ["rtx 3060", "rx 7700", "rtx 3050", "rx 6600"],
                            ],
                            ramTiers: [128, 64, 32, 16, 8],
                        }
                    },

                    // ── SMARTPHONES ──────────────────────────────────────────────────────
                    {
                        label: "טלפונים סלולריים",
                        keywords: ["אייפון", "iphone", "סמסונג", "samsung", "galaxy", "גלקסי", "שיאומי", "xiaomi", "טלפון", "סלולרי", "סמארטפון", "smartphone", "redmi", "poco", "pixel", "oneplus"],
                        dbCategories: ["סלולרי", "פלאפלים", "טלפונים", "phones", "mobile", "smartphone", "אלקטרוניקה", "electronics"],
                        requiredTerms: ["אייפון", "iphone", "galaxy", "גלקסי", "סמסונג", "samsung", "xiaomi", "שיאומי", "pixel", "redmi", "poco", "oneplus", "סלולרי", "טלפון", "smartphone"],
                        forbiddenTerms: ["tablet", "טאבלט", "ipad", "laptop", "מחשב", "smartwatch", "שעון חכם"],
                        specGroups: {
                            // Phone model series — higher series = better (index 0 = best)
                            cpuTiers: [
                                ["iphone 16 pro max", "iphone 15 pro max", "galaxy s24 ultra", "galaxy s23 ultra"],
                                ["iphone 16 pro", "iphone 15 pro", "galaxy s24+", "galaxy s23+", "pixel 9 pro"],
                                ["iphone 16", "iphone 15", "galaxy s24", "galaxy s23", "pixel 9"],
                                ["iphone 14", "galaxy s22", "galaxy a55", "redmi note 13", "poco x6"],
                                ["iphone 13", "iphone 12", "galaxy a35", "redmi 13c"],
                            ],
                            ramTiers: [16, 12, 8, 6, 4],
                        }
                    },

                    // ── HEADPHONES & AUDIO ───────────────────────────────────────────────
                    {
                        label: "אוזניות ושמע",
                        keywords: ["אוזניות", "headphones", "airpods", "בוזה", "bose", "jbl", "sony wh", "sony wf", "headset", "שמע", "earbuds", "ג'יביאל"],
                        dbCategories: ["אוזניות", "audio", "headphones", "שמע", "אלקטרוניקה", "electronics"],
                        requiredTerms: ["אוזניות", "headphones", "headset", "earbuds", "airpods", "buds", "wh-", "wf-", "bose", "jbl", "sennheiser", "jabra"],
                        forbiddenTerms: ["טלוויזיה", "tv", "soundbar", "סאונדבר", "רמקול", "speaker"],
                        specGroups: {
                            // Audio tier: flagship > mid > budget
                            cpuTiers: [
                                ["airpods pro", "bose qc45", "bose qc35", "sony wh-1000xm5", "sony wh-1000xm4", "wh-1000xm5"],
                                ["airpods 3", "galaxy buds pro", "jbl tour one", "jabra evolve2"],
                                ["airpods 2", "galaxy buds2", "jbl tune", "sony wf-c700"],
                                ["airpods 1", "galaxy buds", "jbl go", "basic earbuds"],
                            ],
                        }
                    },

                    // ── TVs & SCREENS ────────────────────────────────────────────────────
                    {
                        label: "טלוויזיות ומסכים",
                        keywords: ["טלוויזיה", "טלויזיה", "tv", "מסך", "oled", "qled", "4k", "8k", "65 אינץ", "55 אינץ", "75 אינץ"],
                        dbCategories: ["טלוויזיות", "tv", "television", "מסכים", "אלקטרוניקה", "electronics"],
                        requiredTerms: ["טלוויזיה", "tv", "oled", "qled", "4k", "8k", "smart tv", "אינץ", "inch", "\"", "samsung tv", "lg tv", "sony tv", "philips"],
                        forbiddenTerms: ["מחשב", "laptop", "סלולרי", "tablet", "טאבלט"],
                        specGroups: {
                            // TV size tiers (index 0 = largest/best)
                            cpuTiers: [
                                ["85\"", "85 אינץ", "85inch"],
                                ["75\"", "75 אינץ", "75inch"],
                                ["65\"", "65 אינץ", "65inch"],
                                ["55\"", "55 אינץ", "55inch"],
                                ["50\"", "50 אינץ", "43\"", "43 אינץ"],
                            ],
                            // Resolution tiers
                            gpuTiers: [
                                ["8k", "8K"],
                                ["4k", "4K", "uhd", "UHD"],
                                ["qhd", "2k", "fhd", "full hd"],
                                ["hd", "HD ready"],
                            ],
                        }
                    },

                    // ── CARS ─────────────────────────────────────────────────────────────
                    {
                        label: "רכבים",
                        keywords: ["רכב", "מכונית", "אוטו", "car", "טויוטה", "toyota", "יונדאי", "hyundai", "קיה", "kia", "מאזדה", "mazda", "הונדה", "honda", "מרצדס", "mercedes", "bmw", "אאודי", "audi", "טסלה", "tesla", "איוניק", "ספורטאז", "קורולה", "vw", "פולקסווגן"],
                        dbCategories: ["רכבים", "cars", "רכב", "vehicles", "אוטו"],
                        requiredTerms: ["רכב", "car", "טויוטה", "toyota", "יונדאי", "hyundai", "קיה", "kia", "מאזדה", "mazda", "הונדה", "honda", "מרצדס", "mercedes", "bmw", "אאודי", "audi", "טסלה", "tesla", "vw", "פולקסווגן", "ק\"מ", "קמ", "קילומטר", "km"],
                        forbiddenTerms: ["אופנוע", "קטנוע", "קורקינט", "scooter", "bike"],
                        specGroups: {
                            // Car year tiers (newer = better, index 0 = newest)
                            cpuTiers: [
                                ["2024", "2025"],
                                ["2022", "2023"],
                                ["2020", "2021"],
                                ["2018", "2019"],
                                ["2015", "2016", "2017"],
                                ["2010", "2011", "2012", "2013", "2014"],
                            ],
                        }
                    },

                    // ── MOTORCYCLES & SCOOTERS ───────────────────────────────────────────
                    {
                        label: "אופנועים וקטנועים",
                        keywords: ["אופנוע", "קטנוע", "סקוטר", "מוטו", "bike", "motorcycle"],
                        dbCategories: ["אופנועים", "רכבים", "vehicles", "cars", "קטנועים"],
                        requiredTerms: ["אופנוע", "קטנוע", "מוטו", "סקוטר", "motorcycle", "scooter", "bike", "kawasaki", "yamaha", "honda cb", "ducati", "harley"],
                        forbiddenTerms: ["מכונית", "car ", "רכב פרטי"],
                    },

                    // ── FURNITURE & HOME ─────────────────────────────────────────────────
                    {
                        label: "ריהוט וצרכי בית",
                        keywords: ["ספה", "כיסא", "שולחן", "מיטה", "ארון", "איקאה", "ikea", "ריהוט", "מזרון", "ספריה", "מדף", "כורסה"],
                        dbCategories: ["ריהוט", "בית", "furniture", "home", "רהיטים"],
                        requiredTerms: ["ספה", "כיסא", "שולחן", "מיטה", "ארון", "ריהוט", "מזרון", "furniture", "כורסה", "מדף", "ספריה"],
                        forbiddenTerms: ["מחשב", "טלפון", "רכב", "מקרר", "מכונת כביסה"],
                    },

                    // ── HOME APPLIANCES ──────────────────────────────────────────────────
                    {
                        label: "מוצרי חשמל ביתיים",
                        keywords: ["מכונת כביסה", "מקרר", "מדיח", "מיקרוגל", "תנור", "בוילר", "מזגן", "בוש", "bosch", "מילה", "miele", "סימנס", "siemens", "אלקטרולוקס", "electrolux", "דייסון", "dyson"],
                        dbCategories: ["מוצרי חשמל", "מוצרי חשמל ביתיים", "appliances", "חשמל", "אלקטרוניקה", "electronics"],
                        requiredTerms: ["מכונת כביסה", "מקרר", "מדיח", "מיקרוגל", "תנור", "מזגן", "bosch", "miele", "siemens", "electrolux", "dyson", "washing", "fridge", "dishwasher", "dryer", "oven", "ac unit"],
                        forbiddenTerms: ["מחשב", "טלפון", "טלוויזיה", "laptop"],
                        specGroups: {
                            // Capacity tiers (higher = better, index 0 = largest)
                            ramTiers: [800, 600, 500, 400, 300, 200, 100], // liters/watts for appliances
                        }
                    },

                    // ── GAMING CONSOLES ──────────────────────────────────────────────────
                    {
                        label: "קונסולות ומשחקים",
                        keywords: ["פלייסטיישן", "playstation", "ps4", "ps5", "xbox", "אקסבוקס", "נינטנדו", "nintendo", "switch", "סוויץ", "gaming", "גיימינג", "קונסולה"],
                        dbCategories: ["גיימינג", "gaming", "קונסולות", "console", "אלקטרוניקה", "electronics"],
                        requiredTerms: ["פלייסטיישן", "playstation", "ps4", "ps5", "ps3", "xbox", "series x", "series s", "נינטנדו", "nintendo", "switch", "קונסולה", "console"],
                        forbiddenTerms: ["מחשב נייד", "laptop", "סלולרי"],
                        specGroups: {
                            // Console generation tiers (index 0 = latest/best)
                            cpuTiers: [
                                ["ps5", "xbox series x", "xbox series s"],
                                ["ps4 pro", "xbox one x"],
                                ["ps4", "xbox one"],
                                ["ps3", "xbox 360", "nintendo switch", "switch oled"],
                            ],
                        }
                    },

                    // ── TABLETS ──────────────────────────────────────────────────────────
                    {
                        label: "טאבלטים",
                        keywords: ["טאבלט", "ipad", "tablet", "galaxy tab", "galaxy tab", "surface"],
                        dbCategories: ["טאבלטים", "tablets", "אלקטרוניקה", "electronics", "ipad"],
                        requiredTerms: ["טאבלט", "ipad", "tablet", "galaxy tab", "surface", "lenovo tab", "samsung tab"],
                        forbiddenTerms: ["laptop", "מחשב נייד", "סלולרי", "טלפון"],
                        specGroups: {
                            cpuTiers: [
                                ["ipad pro m4", "ipad pro m2", "surface pro 9"],
                                ["ipad air m2", "ipad air m1", "samsung galaxy tab s9"],
                                ["ipad 10", "ipad mini 6", "galaxy tab s8"],
                                ["ipad 9", "ipad mini 5", "galaxy tab a8"],
                            ],
                            ramTiers: [16, 12, 8, 6, 4],
                        }
                    },

                    // ── CAMERAS ──────────────────────────────────────────────────────────
                    {
                        label: "מצלמות",
                        keywords: ["מצלמה", "camera", "dslr", "mirrorless", "קאנון", "canon", "ניקון", "nikon", "sony a", "פוג'יפילם", "fujifilm", "gopro"],
                        dbCategories: ["מצלמות", "cameras", "אלקטרוניקה", "electronics"],
                        requiredTerms: ["מצלמה", "camera", "dslr", "mirrorless", "canon", "nikon", "fujifilm", "sony a7", "sony a6", "gopro", "lens", "עדשה"],
                        forbiddenTerms: ["טלפון", "laptop", "רכב"],
                        specGroups: {
                            cpuTiers: [
                                ["sony a7r v", "nikon z9", "canon r3", "sony a1"],
                                ["sony a7 iv", "nikon z6 iii", "canon r5 ii", "fujifilm x-t5"],
                                ["sony a7c ii", "nikon z5 ii", "canon r8", "fujifilm x-s20"],
                                ["sony a6700", "nikon z30", "canon m50", "gopro hero 12"],
                            ],
                        }
                    },

                    // ── REAL ESTATE ──────────────────────────────────────────────────────
                    {
                        label: "נדל\"ן",
                        keywords: ["דירה", "בית", "חדרים", "ווילה", "פנטהאוז", "נכס", "להשכרה", "למכירה", "קוטג"],
                        dbCategories: ["נדלן", "דירות", "real estate", "נדל\"ן", "נכסים"],
                        requiredTerms: ["דירה", "בית", "חדרים", "חד'", "נכס", "להשכרה", "למכירה", "מ\"ר", "קוטג", "פנטהאוז", "דופלקס"],
                        forbiddenTerms: ["מחשב", "טלפון", "רכב", "ריהוט"],
                    },

                    // ── CLOTHING & FASHION ───────────────────────────────────────────────
                    {
                        label: "ביגוד ואופנה",
                        keywords: ["נעליים", "בגדים", "חולצה", "מכנסיים", "נייקי", "nike", "אדידס", "adidas", "ג'ינס", "jeans", "שמלה", "עדיים", "תכשיטים"],
                        dbCategories: ["ביגוד", "אופנה", "fashion", "clothing", "נעליים", "shoes"],
                        requiredTerms: ["נעליים", "בגדים", "חולצה", "מכנסיים", "nike", "adidas", "ג'ינס", "jeans", "שמלה", "shoes", "sneakers", "סניקרס"],
                        forbiddenTerms: ["מחשב", "רכב", "טלפון"],
                    },
                ];

            // Detect the category segment that best matches the query
            const queryLower = (query || "").toLowerCase();
            const allKeywordsLower = searchKeywords.map(k => k.toLowerCase());

            let detectedSegment: CategorySignal | null = null;
            let bestScore = 0;

            for (const signal of categorySignals) {
                let matchScore = 0;
                for (const kw of signal.keywords) {
                    const kwLower = kw.toLowerCase();
                    // Direct query match (most important - higher weight)
                    if (queryLower.includes(kwLower)) matchScore += 4;
                    // Keyword expansion match
                    if (allKeywordsLower.some(k => k.includes(kwLower) || kwLower.includes(k))) matchScore += 1;
                }
                if (matchScore > bestScore) {
                    bestScore = matchScore;
                    detectedSegment = signal;
                }
            }

            // Also use aiFilters.aiCategory as fallback
            const aiDetectedCategory = aiFilters.aiCategory as string | undefined;

            if (detectedSegment || aiDetectedCategory) {
                // Build WHERE clause — BROAD DB query, will filter strictly in JS
                const similarWhere: any = { status: "ACTIVE", ...latLngFilter };

                if (detectedSegment) {
                    // Broad category query — catches all variations of category names used in DB
                    // e.g. Computers / מחשבים / computer — all map to the same segment
                    // Strict product-type filtering (laptop vs desktop) happens in JS after fetch
                    similarWhere.OR = detectedSegment.dbCategories.map(cat => ({
                        category: { contains: cat, mode: "insensitive" as const }
                    }));
                } else if (aiDetectedCategory) {
                    similarWhere.category = { contains: aiDetectedCategory, mode: "insensitive" as const };
                }

                let fallbackListings = await prismadb.marketplaceListing.findMany({
                    where: similarWhere,
                    include: {
                        seller: {
                            select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
                        }
                    },
                    take: 200, // Fetch more so JS filter has enough to work with
                    orderBy: { createdAt: "desc" }
                });

                if (fallbackListings.length > 0) {
                    const categoryKeywords = detectedSegment ? detectedSegment.keywords : [];
                    const requiredTerms = detectedSegment ? detectedSegment.requiredTerms : [];
                    const forbiddenTerms = detectedSegment ? detectedSegment.forbiddenTerms : [];
                    const specGroups = detectedSegment?.specGroups;

                    // Helper: get the CPU tier index of a listing (lower = more powerful)
                    const getCpuTierIndex = (text: string): number => {
                        if (!specGroups?.cpuTiers) return -1;
                        for (let i = 0; i < specGroups.cpuTiers.length; i++) {
                            if (specGroups.cpuTiers[i].some(cpu => text.includes(cpu.toLowerCase()))) return i;
                        }
                        return -1;
                    };
                    const getGpuTierIndex = (text: string): number => {
                        if (!specGroups?.gpuTiers) return -1;
                        for (let i = 0; i < specGroups.gpuTiers.length; i++) {
                            if (specGroups.gpuTiers[i].some(gpu => text.includes(gpu.toLowerCase()))) return i;
                        }
                        return -1;
                    };
                    const getRamFromText = (text: string): number => {
                        const m = text.match(/(\d+)\s*(gb|giga|ram)/i);
                        return m ? parseInt(m[1]) : 0;
                    };

                    // Extract the "spec level" of the SEARCHED query for comparison
                    const queryCpuTier = getCpuTierIndex(queryLower);
                    const queryGpuTier = getGpuTierIndex(queryLower);
                    const queryRam = getRamFromText(queryLower);
                    
                    // Extract non-spec keywords from query (brand, product type, etc.)
                    const specPatterns = /\b(i\d|ultra\s?\d|rtx\s?\d+|gtx\s?\d+|rx\s?\d+|\d+gb|\d+tb|mhz|ghz|ryzen\s?\d)\b/gi;
                    const queryWithoutSpecs = queryLower.replace(specPatterns, "").trim();
                    const queryBrandTerms = queryWithoutSpecs.split(/\s+/).filter((t: string) => t.length > 2);

                    const scored = fallbackListings.map(listing => {
                        const combinedText = `${listing.title} ${listing.description || ""} ${listing.extraData || ""} ${listing.category || ""}`.toLowerCase();
                        let score = 0;
                        let disqualified = false;

                        // ── HARD DISQUALIFICATION ─────────────────────────────
                        // If any forbidden term appears anywhere in the listing → skip entirely
                        if (forbiddenTerms.some(term => combinedText.includes(term.toLowerCase()))) {
                            disqualified = true;
                        }

                        // If requiredTerms defined: at least one must appear somewhere
                        // This ensures "מחשב נייד" results don't sneak in items without any laptop keyword
                        if (requiredTerms.length > 0) {
                            const hasRequired = requiredTerms.some(term => combinedText.includes(term.toLowerCase()));
                            if (!hasRequired) disqualified = true;
                        }

                        if (disqualified) return null;

                        // ── POSITIVE SCORING ──────────────────────────────────

                        // 1. Brand / product-type keyword match (e.g. "dell", "macbook", "hp")
                        queryBrandTerms.forEach((term: string) => {
                            if (combinedText.includes(term)) score += 5;
                        });

                        // 2. Category signal keyword match
                        categoryKeywords.forEach(term => {
                            if (combinedText.includes(term.toLowerCase())) score += 1;
                        });

                        // 3. CPU tier similarity — same tier or adjacent tier scores highly
                        if (queryCpuTier >= 0) {
                            const listingCpuTier = getCpuTierIndex(combinedText);
                            if (listingCpuTier >= 0) {
                                const tierDiff = Math.abs(listingCpuTier - queryCpuTier);
                                if (tierDiff === 0) score += 6;       // Same CPU tier (e.g. i9 = i9)
                                else if (tierDiff === 1) score += 4;  // Adjacent (e.g. i7 when searched i9)
                                else if (tierDiff === 2) score += 2;  // 2 tiers apart (e.g. i5 for i9 search)
                                else score += 0;                       // Too far (i3 for i9 search)
                            }
                        }

                        // 4. GPU tier similarity
                        if (queryGpuTier >= 0) {
                            const listingGpuTier = getGpuTierIndex(combinedText);
                            if (listingGpuTier >= 0) {
                                const tierDiff = Math.abs(listingGpuTier - queryGpuTier);
                                if (tierDiff === 0) score += 5;
                                else if (tierDiff === 1) score += 3;
                                else if (tierDiff === 2) score += 1;
                            }
                        }

                        // 5. RAM tier proximity
                        if (queryRam > 0 && specGroups?.ramTiers) {
                            const listingRam = getRamFromText(combinedText);
                            if (listingRam > 0) {
                                const ratioDiff = Math.abs(listingRam - queryRam) / queryRam;
                                if (ratioDiff === 0) score += 5;         // exact RAM match
                                else if (ratioDiff <= 0.3) score += 3;  // within 30%
                                else if (ratioDiff <= 0.6) score += 1;  // within 60%
                            }
                        }

                        // 6. Price proximity bonus
                        if (aiFilters.maxPrice && listing.price) {
                            const priceDelta = Math.abs(listing.price - aiFilters.maxPrice) / aiFilters.maxPrice;
                            if (priceDelta < 0.2) score += 4;
                            else if (priceDelta < 0.4) score += 2;
                            else if (priceDelta < 0.6) score += 1;
                        }

                        return { ...listing, matchScore: score, isSuggestion: true };
                    })
                    // Keep all listings that passed the disqualification check (score >= 0)
                    // requiredTerms/forbiddenTerms already filtered out wrong product types
                    // Score just determines ORDER — even score=0 is a valid same-category suggestion
                    .filter((l): l is NonNullable<typeof l> => l !== null)
                    .sort((a, b) => b.matchScore - a.matchScore)
                    .slice(0, 60);

                    if (scored.length > 0) {
                        listings = scored;
                        isFallback = true;
                        if (detectedSegment) {
                            aiInsight = `לא מצאנו "${query}" מדויק, אבל הנה ${detectedSegment.label} דומים מאותה קטגוריה שאולי יתאימו לך. רוצה שנעדכן אותך כשהמוצר המדויק מפורסם?`;
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
