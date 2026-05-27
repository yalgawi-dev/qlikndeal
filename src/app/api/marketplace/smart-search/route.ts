// @ts-nocheck
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { analyzeListingText } from "@/lib/listing-ai";

export const dynamic = "force-dynamic";

const brandGroups: Record<string, { hebrewVariants: string[]; englishVariants: string[]; models: string[] }> = {
    APPLE:    { hebrewVariants: ["אפל"],           englishVariants: ["apple", "Apple"],          models: ["macbook", "MacBook", "מקבוק", "iphone", "iPhone", "ipad", "iPad", "mac", "air", "pro", "m1", "m2", "m3", "m4", "macos", "ios"] },
    DELL:     { hebrewVariants: ["דל"],            englishVariants: ["dell", "Dell"],            models: ["inspiron", "xps", "latitude", "vostro", "alienware", "precision", "g15", "g16"] },
    LENOVO:   { hebrewVariants: ["לנובו"],         englishVariants: ["lenovo", "Lenovo"],        models: ["thinkpad", "ideapad", "legion", "yoga", "xiaoxin"] },
    ASUS:     { hebrewVariants: ["אסוס"],          englishVariants: ["asus", "Asus"],            models: ["rog", "tuf", "vivobook", "zenbook", "proart", "strix"] },
    HP:       { hebrewVariants: ["אייצ פי", "hp"],  englishVariants: ["hp", "HP"],               models: ["pavilion", "spectre", "envy", "omen", "probook", "elitebook", "victus"] },
    ACER:     { hebrewVariants: ["אייסר", "איסר"], englishVariants: ["acer", "Acer"],            models: ["predator", "aspire", "swift", "nitro", "helios", "extensa"] },
    MSI:      { hebrewVariants: ["מסאי", "msi"],   englishVariants: ["msi", "MSI"],              models: ["raider", "stealth", "katana", "vector", "crosshair", "titan"] },
    SAMSUNG:  { hebrewVariants: ["סמסונג"],        englishVariants: ["samsung", "Samsung"],      models: ["galaxy", "Galaxy", "גלקסי", "s22", "s23", "s24", "a55", "a35", "note", "galaxy book"] },
    XIAOMI:   { hebrewVariants: ["שיאומי", "שיומי"], englishVariants: ["xiaomi", "Xiaomi"],     models: ["redmi", "poco", "mi", "note", "lite"] },
    SONY:     { hebrewVariants: ["סוני"],          englishVariants: ["sony", "Sony"],            models: ["xperia", "wh", "wf", "ps5", "ps4", "playstation"] },
    LG:       { hebrewVariants: ["לג", "אל גי"],   englishVariants: ["lg", "LG"],               models: ["oled", "qled", "gram", "velvet", "wing"] },
    HUAWEI:   { hebrewVariants: ["וואווי", "הואווי"], englishVariants: ["huawei", "Huawei"],   models: ["mate", "nova", "p30", "p40", "p50", "watch"] },
    TOYOTA:   { hebrewVariants: ["טויוטה"],        englishVariants: ["toyota", "Toyota"],       models: ["corolla", "קורולה", "yaris", "יאריס", "c-hr", "rav4"] },
    HYUNDAI:  { hebrewVariants: ["יונדאי"],        englishVariants: ["hyundai", "Hyundai"],     models: ["ioniq", "איוניק", "tucson", "טוסון", "i20", "i30"] },
    KIA:      { hebrewVariants: ["קיה"],           englishVariants: ["kia", "Kia"],             models: ["sportage", "ספורטאז", "picanto", "פיקנטו", "niro", "sorento"] },
    BMW:      { hebrewVariants: ["במוו", "ב.מ.וו"], englishVariants: ["bmw", "BMW"],            models: ["series 3", "series 5", "x3", "x5", "m3", "m5"] },
    MERCEDES: { hebrewVariants: ["מרצדס"],         englishVariants: ["mercedes", "Mercedes"],   models: ["c-class", "e-class", "a-class", "glc", "gle", "amg"] },
};

const GLOBAL_CPU_TIERS = [
    ["i9", "ultra 9", "ryzen 9", "m3 max", "m4 max"],
    ["i7", "ultra 7", "ryzen 7", "m3 pro", "m2 max", "m4 pro"],
    ["i5", "ultra 5", "ryzen 5", "m3", "m2 pro", "m2"],
    ["i3", "ryzen 3", "m1 pro", "m1", "celeron", "pentium"],
];

function getCpuTierIndex(text: string): number {
    const cleanText = text.toLowerCase();
    for (let i = 0; i < GLOBAL_CPU_TIERS.length; i++) {
        if (GLOBAL_CPU_TIERS[i].some(cpu => cleanText.includes(cpu))) {
            return i;
        }
    }
    return -1;
}

function getRamFromText(text: string): number {
    const m = text.toLowerCase().match(/(\d+)\s*(gb|giga|ram)/i);
    return m ? parseInt(m[1], 10) : 0;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, lat, lng, radiusKm, category, listingType = "SELL", isAutocomplete = false, consultantFilter } = body;

        let currentClerkId: string | null = null;
        try {
            const { userId } = await auth();
            currentClerkId = userId;
        } catch {}

        let aiFilters: any = {};
        let searchKeywords: string[] = [];
        let keywordGroups: string[][] = [];
        let aiInsight = "";
        let capabilityMatch: any = null;

        // DB-Driven Smart Semantic Filtering (The Lean Brain)
        const searchConfigs = await prismadb.searchFilterConfig.findMany({ where: { isActive: true } });
        const stopWords = searchConfigs.filter(c => c.filterType === "STOP_WORD").map(c => c.value.toLowerCase());
        const unitPatterns = searchConfigs.filter(c => c.filterType === "UNIT_PATTERN");

        let processedQuery = query || "";
        stopWords.forEach(sw => { processedQuery = processedQuery.replace(new RegExp(`\\b${sw}\\b`, "gi"), ""); });
        unitPatterns.forEach(up => { processedQuery = processedQuery.replace(new RegExp(up.value, "gi"), up.replacement || ""); });

        // Unrecognized Keywords Tracking Array
        let detectedKeywords: string[] = [];

        // 1. Smart "AI" Query Parsing
        if (processedQuery.trim().length > 0) {
            const analysis = analyzeListingText(processedQuery);
            
            if (analysis.price) aiFilters.maxPrice = analysis.price;
            if (analysis.category && analysis.category !== "כללי") aiFilters.aiCategory = analysis.category;
            if (analysis.subCategory) aiFilters.subCategory = analysis.subCategory;

            searchKeywords = query.split(' ').filter((t: string) => t.trim().length >= 2);
            
            // Smart Learning Dictionary - Maps typos and Hebrew aliases to English brands
            // Smart Learning Dictionary - Massive mapping for ALL marketplace categories
            const brandMappings: Record<string, string[]> = {
                // ── Apple / אפל — ALL product lines ───────────────────────────
                // CRITICAL: "מחשב אפל", "לפטופ אפל", "אפל" must all find MacBooks
                "אפל": ["Apple", "apple", "macbook", "MacBook", "מקבוק", "iphone", "iPhone", "ipad", "iPad", "mac", "macos", "ios", "air", "pro"],
                "apple": ["Apple", "apple", "macbook", "MacBook", "מקבוק", "iphone", "iPhone", "ipad", "iPad", "mac", "macos", "ios"],
                "מקבוק": ["MacBook", "macbook", "mac", "אפל", "Apple", "apple", "air", "pro", "m1", "m2", "m3", "m4"],
                "macbook": ["MacBook", "macbook", "mac", "מקבוק", "אפל", "Apple", "apple", "air", "pro"],

                // ── Other Brands ──────────────────────────────────────────────
                "דל": ["Dell", "del"],
                "לנובו": ["Lenovo", "lanovo", "linovo"],
                "אסוס": ["Asus", "assus"],
                "אייסר": ["Acer", "acer", "איסר"],
                "hp": ["HP", "hp", "אייצ' פי", "אייצ פי", "h.p"],
                "סמסונג": ["Samsung", "samsong"],
                "שיאומי": ["Xiaomi", "שיומי", "xiaomi"],

                // ── Laptop Models ─────────────────────────────────────────────
                "inspiron": ["inspiron"],
                "latitude": ["latitude"],
                "xps": ["xps"],
                "thinkpad": ["thinkpad"],
                "ideapad": ["ideapad"],
                "rog": ["rog"],
                "vivobook": ["vivobook"],
                "zenbook": ["zenbook"],
                "טוף": ["tuf", "TUF"],
                "predator": ["predator"],
                "pavilion": ["pavilion"],
                "spectre": ["spectre"],

                // ── Phones ────────────────────────────────────────────────────
                "אייפון": ["iPhone", "iphone", "איפון", "אפון", "aifon"],
                "גלקסי": ["Galaxy", "galaxy", "גלאקסי", "גלכסי"],
                "redmi": ["redmi", "רדמי"],
                "poco": ["poco", "פוקו"],
                "אייפד": ["iPad", "ipad"],

                // ── Electronics & Audio ───────────────────────────────────────
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

                // ── Home Appliances ───────────────────────────────────────────
                "בוש": ["Bosch", "bosch", "בוס", "מכונת כביסה בוש"],
                "מילה": ["Miele", "miele"],
                "דייסון": ["Dyson", "dyson", "שואב דייסון"],
                "נינג'ה": ["Ninja", "ninja", "נינגה", "בלנדר"],
                "אלקטרולוקס": ["Electrolux", "electrolux", "אלקטרולוקס"],
                "סימנס": ["Siemens", "siemens", "סימנס"],

                // ── Cars ──────────────────────────────────────────────────────
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

                // ── Furniture & Home ──────────────────────────────────────────
                "איקאה": ["IKEA", "ikea", "אקאה"],
                "עמינח": ["Aminach", "עמינח"],

                // ── Fashion ───────────────────────────────────────────────────
                "נייק": ["Nike", "nike", "נייקי"],
                "אדידס": ["Adidas", "adidas", "אדידאס"],
                "זארה": ["Zara", "zara", "זרה"],

                // ── General Marketplace Aliases ───────────────────────────────
                "דירה": ["דירה", "בית", "נכס", "וילה", "פנטהאוז"],
                "השכרה": ["להשכרה", "שכירות"],
                "מכירה": ["למכירה", "למכור"],
                "אופניים חשמליות": ["אופניים חשמליים", "חשמליות", "E-bike"],
                "קורקינט": ["קורקינט חשמלי", "scooter"],

                // ── Super Category Synonyms ───────────────────────────────────
                // "מחשב" alone = could be laptop OR desktop — keep broad
                "לפטופ": ["מחשב נייד", "לפטופ", "laptop", "נייד", "macbook", "מקבוק"],
                "נייד": ["מחשב נייד", "לפטופ", "laptop", "נייד", "macbook", "מקבוק"],
                "מחשב נייד": ["מחשב נייד", "לפטופ", "laptop", "נייד", "macbook", "מקבוק"],
                "מחשב שניח": ["מחשב נייח", "מחשב שולחני", "PC", "נייח", "שולחני", "desktop"],
                "טלוויזיה": ["טלוויזיה", "טלויזיה", "מסך", "tv"],
                "אוזניות": ["אוזניות", "headset", "headphones"],
                "טלפון": ["טלפון", "סלולרי", "סמארטפון", "smartphone", "פלאפון"],
                "סלולרי": ["טלפון", "סלולרי", "סמארטפון", "smartphone", "פלאפון"],
                "רכב": ["רכב", "מכונית", "אוטו", "car"]
            };

            // ── Compound Phrase Pre-Expansion (Full Matrix Engine) ────────────
            // Auto-generates all [category × brand] patterns.
            // Handles both orders: "מחשב דל" and "דל מחשב"
            // User can type in Hebrew or English — all combos are resolved.
            
            // Category groups: words the user might say for a product TYPE
            const categoryGroups: Record<string, string[]> = {
                LAPTOP:   ["מחשב", "לפטופ", "נייד", "laptop", "notebook"],
                DESKTOP:  ["מחשב", "נייח", "שולחני", "desktop", "pc"],
                PHONE:    ["טלפון", "סלולרי", "פלאפון", "smartphone", "mobile"],
                TABLET:   ["טאבלט", "tablet", "אייפד", "ipad"],
                HEADPHONE:["אוזניות", "headphones", "headset", "earbuds"],
                TV:       ["טלוויזיה", "טלויזיה", "tv", "מסך", "screen"],
                CAR:      ["רכב", "מכונית", "אוטו", "car"],
                WATCH:    ["שעון", "watch", "smartwatch"],
                CAMERA:   ["מצלמה", "camera"],
                CONSOLE:  ["קונסולה", "console", "גיימינג", "gaming"],
            };

            // Brand groups: [hebrewVariants..., englishVariants..., models...] (Defined at module scope)

            // Build compound search terms for LAPTOP + any brand
            const laptopBrands = ["APPLE", "DELL", "LENOVO", "ASUS", "HP", "ACER", "MSI", "SAMSUNG"];
            // Build compound search terms for PHONE + any brand
            const phoneBrands  = ["APPLE", "SAMSUNG", "XIAOMI", "SONY", "HUAWEI", "LG"];
            // Build compound search terms for CAR + any brand
            const carBrands    = ["TOYOTA", "HYUNDAI", "KIA", "BMW", "MERCEDES"];
            // Build compound search terms for TV + any brand
            const tvBrands     = ["SAMSUNG", "LG", "SONY", "HUAWEI"];
            // Build compound search terms for HEADPHONE + any brand
            const headphoneBrands = ["SONY", "SAMSUNG", "LG", "APPLE"];

            // ── Build dynamic patterns from the matrix ────────────────────────
            type CompoundPattern = { pattern: RegExp; terms: string[] };
            const compoundBrandPatterns: CompoundPattern[] = [];

            const buildPattern = (catWords: string[], brandKey: string, extra?: string[]) => {
                const brand = brandGroups[brandKey];
                if (!brand) return;
                const allBrandWords = [...brand.hebrewVariants, ...brand.englishVariants];
                const allTerms = [...brand.hebrewVariants, ...brand.englishVariants, ...brand.models, ...(extra || [])];
                const catRegex = catWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
                const brandRegex = allBrandWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
                // Both orders: "מחשב דל" and "דל מחשב"
                compoundBrandPatterns.push({
                    pattern: new RegExp(`(?:${catRegex})\\s+(?:${brandRegex})`, "i"),
                    terms: allTerms
                });
                compoundBrandPatterns.push({
                    pattern: new RegExp(`(?:${brandRegex})\\s+(?:${catRegex})`, "i"),
                    terms: allTerms
                });
            };

            // LAPTOPS
            laptopBrands.forEach(b => buildPattern(categoryGroups.LAPTOP, b));
            // PHONES
            phoneBrands.forEach(b => buildPattern(categoryGroups.PHONE, b));
            // CARS
            carBrands.forEach(b => buildPattern(categoryGroups.CAR, b));
            // TVs
            tvBrands.forEach(b => buildPattern(categoryGroups.TV, b));
            // HEADPHONES
            headphoneBrands.forEach(b => buildPattern(categoryGroups.HEADPHONE, b));

            // ── Apply compound match ──────────────────────────────────────────
            let compoundMatchApplied = false;
            for (const cp of compoundBrandPatterns) {
                if (cp.pattern.test(query || "")) {
                    // Replace all individual keyword groups with ONE merged OR group
                    keywordGroups = [cp.terms];
                    searchKeywords = cp.terms;
                    compoundMatchApplied = true;
                    break;
                }
            }

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

        // ─────────────────────────────────────────────────────────────
        // KNOWLEDGE BASE (LEARNING AGENT) - CAPABILITY MAPPING + ADVICE CARD
        // ─────────────────────────────────────────────────────────────
        let capabilityApplied = false;
        let adviceCard: any = null;

        if (processedQuery.trim().length > 0) {
            const capabilities = await prismadb.capabilityMapping.findMany();
            const queryLowerStr = processedQuery.toLowerCase();
            
            for (const cap of capabilities) {
                if (queryLowerStr.includes(cap.keyword.toLowerCase()) || 
                   (cap.keywordId && queryLowerStr.includes(cap.keywordId.toLowerCase()))) {
                    capabilityMatch = cap;
                    break;
                }
            }

            if (false && capabilityMatch) { // Temporarily disabled the Thinking Brain per user request
                capabilityApplied = true;
                const cpuTierMap: Record<number, string> = { 1: "i3 / Ryzen 3", 2: "i5 / Ryzen 5", 3: "i7 / Ryzen 7", 4: "i9 / Ryzen 9" };
                const gpuTierMap: Record<number, string> = { 1: "GTX 1050", 2: "GTX 1660 / RTX 3050", 3: "RTX 3060 / RX 6700", 4: "RTX 3080+" };

                // Use recommended specs for advice, minimums for filtering
                const displayRam = (capabilityMatch as any).recRam || capabilityMatch.minRam || 8;
                const displayCpu = (capabilityMatch as any).recCpuTier || capabilityMatch.minCpuTier || 2;
                const displayGpu = (capabilityMatch as any).recGpuTier || capabilityMatch.minGpuTier || 0;
                
                const cpuLabel = cpuTierMap[displayCpu] || "i5";
                const gpuLabel = gpuTierMap[displayGpu];

                aiInsight = `המלצת מומחה: עבור **${capabilityMatch.keyword}**, מומלץ לחפש מכשיר עם לפחות ${displayRam}GB RAM ומעבד ${cpuLabel}${gpuLabel ? ` + כרטיס מסך ${gpuLabel}` : ''}.`;

                // Build the Advice Card for the Advice Modal
                adviceCard = {
                    keyword: capabilityMatch.keyword,
                    minRam: capabilityMatch.minRam,
                    recRam: displayRam,
                    minCpuTier: capabilityMatch.minCpuTier,
                    recCpuTier: displayCpu,
                    cpuLabel,
                    minGpuTier: capabilityMatch.minGpuTier,
                    recGpuTier: displayGpu,
                    gpuLabel: gpuLabel || null,
                    consensusScore: (capabilityMatch as any).consensusScore || 0,
                    verificationStatus: capabilityMatch.verificationStatus,
                    adviceText: `עבור ${capabilityMatch.keyword} ממליצים: ${displayRam}GB RAM, מעבד ${cpuLabel}${gpuLabel ? `, כרטיס מסך ${gpuLabel}` : ''}`
                };

                if (capabilityMatch.minRam) aiFilters.minRam = capabilityMatch.minRam;
                if (capabilityMatch.minCpuTier) aiFilters.minCpuTier = capabilityMatch.minCpuTier;
                if (capabilityMatch.minGpuTier) aiFilters.minGpuTier = capabilityMatch.minGpuTier;
            } else if (processedQuery.trim().length > 2 && !isAutocomplete) {
                await prismadb.unrecognizedKeyword.upsert({
                    where: { keyword: processedQuery.trim().toLowerCase() },
                    update: { occurrences: { increment: 1 }, lastSeen: new Date() },
                    create: { keyword: processedQuery.trim().toLowerCase() }
                }).catch(() => {});
                
                await prismadb.searchLog.create({
                    data: { query: processedQuery.trim() }
                }).catch(() => {});
            }
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
        if (listingType === "BUY") {
            const buyerWhereClause: any = {
                status: "ACTIVE"
            };

            if (currentClerkId && consultantFilter) {
                buyerWhereClause.user = {
                    clerkId: {
                        not: currentClerkId
                    }
                };
            }

            // Keyword Filter - AND logic first
            if (keywordGroups.length > 0) {
                buyerWhereClause.AND = keywordGroups.map(group => ({
                    OR: group.flatMap(term => [
                        { query: { contains: term, mode: "insensitive" as const } },
                        { extraData: { contains: term, mode: "insensitive" as const } },
                    ])
                }));
            } else if (searchKeywords.length > 0) {
                buyerWhereClause.AND = searchKeywords.map(term => ({
                    OR: [
                        { query: { contains: term, mode: "insensitive" as const } },
                        { extraData: { contains: term, mode: "insensitive" as const } }
                    ]
                }));
            }

            const buyerRequests = await prismadb.buyerRequest.findMany({
                where: buyerWhereClause,
                include: {
                    user: {
                        select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
                    }
                },
                take: 150,
                orderBy: { createdAt: "desc" }
            });

            let mappedListings = buyerRequests.map((req: any) => {
                let parsedExtra: any = {};
                try {
                    if (req.extraData) {
                        parsedExtra = JSON.parse(req.extraData);
                    }
                } catch (e) {
                    console.error("Error parsing extraData for buyerRequest", req.id, e);
                }

                const budget = parsedExtra.budgetRange && Array.isArray(parsedExtra.budgetRange) && parsedExtra.budgetRange[1]
                    ? parsedExtra.budgetRange[1]
                    : (parsedExtra.budget || 0);

                const latVal = typeof parsedExtra.lat === "number" ? parsedExtra.lat : null;
                const lngVal = typeof parsedExtra.lng === "number" ? parsedExtra.lng : null;

                return {
                    id: req.id,
                    sellerId: req.userId || "",
                    seller: req.user ? {
                        clerkId: req.user.clerkId,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName,
                        imageUrl: req.user.imageUrl,
                        city: req.user.city,
                        roles: req.user.roles
                    } : {
                        clerkId: "system",
                        firstName: "משתמש",
                        lastName: "שומר סוד",
                        imageUrl: null,
                        city: parsedExtra.city || null,
                        roles: ["BUYER"]
                    },
                    title: req.query,
                    description: parsedExtra.details || req.query,
                    price: budget,
                    condition: "דרוש לקנייה 🏷️",
                    images: "[]",
                    videos: null,
                    category: parsedExtra.category || "כללי",
                    extraData: req.extraData,
                    latitude: latVal,
                    longitude: lngVal,
                    locationName: parsedExtra.city || null,
                    status: "ACTIVE",
                    listingType: "BUY",
                    createdAt: req.createdAt,
                    updatedAt: req.updatedAt
                };
            });

            // Filter by Category
            if (category && category !== "all") {
                mappedListings = mappedListings.filter((l: any) => {
                    const lCat = l.category ? l.category.toLowerCase().trim() : "";
                    const targetCat = category.toLowerCase().trim();
                    return lCat.includes(targetCat) || targetCat.includes(lCat);
                });
            }

            // Filter by distance if lat, lng and radius are supplied
            if (typeof lat === "number" && typeof lng === "number" && typeof radiusKm === "number" && radiusKm > 0) {
                const toRad = (v: number) => v * Math.PI / 180;
                const R = 6371;
                mappedListings = mappedListings.map((l: any) => {
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
                }).filter((l: any) => l.distanceKm === null || l.distanceKm <= radiusKm);

                // Sort by distance (nulls at the end)
                mappedListings.sort((a: any, b: any) => {
                    if (a.distanceKm === null && b.distanceKm === null) return 0;
                    if (a.distanceKm === null) return 1;
                    if (b.distanceKm === null) return -1;
                    return a.distanceKm - b.distanceKm;
                });
            }

            return NextResponse.json({
                success: true,
                results: mappedListings,
                total: mappedListings.length,
                aiFilters,
                isFallback: false,
                aiInsight: aiInsight || null,
                capabilityMatch: null,
                adviceCard: null,
                smartFallbackMessage: null
            });
        }

        const whereClause: any = {
            status: "ACTIVE",
            listingType: listingType,
            ...latLngFilter
        };

        if (currentClerkId && consultantFilter) {
            whereClause.seller = {
                clerkId: {
                    not: currentClerkId
                }
            };
        }

        if (consultantFilter) {
            // Include ALL Hebrew and English category name variants stored in the DB
            if (consultantFilter.preferredFormFactor === "laptop") {
                whereClause.category = { in: ["מחשבים ניידים", "מחשב נייד", "לפטופ", "LAPTOPS", "Laptops", "laptops", "notebook", "notebooks"] };
            } else if (consultantFilter.preferredFormFactor === "desktop") {
                whereClause.category = { in: ["מחשבים שולחניים", "מחשב שולחני", "שולחני", "DESKTOPS", "Desktops", "desktops", "desktop", "pc"] };
            } else {
                whereClause.category = { in: ["מחשבים ניידים", "מחשב נייד", "לפטופ", "LAPTOPS", "Laptops", "laptops", "מחשבים שולחניים", "מחשב שולחני", "שולחני", "DESKTOPS", "Desktops", "desktops"] };
            }
            if (consultantFilter.userBudget && consultantFilter.userBudget > 0) {
                whereClause.price = { lte: consultantFilter.userBudget };
            }
        } else if (category && category !== "all") {
            whereClause.category = category;
        }

        if (aiFilters.maxPrice) {
            if (whereClause.price) {
                whereClause.price.lte = Math.min(whereClause.price.lte, aiFilters.maxPrice);
            } else {
                whereClause.price = { lte: aiFilters.maxPrice };
            }
        }

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
            take: consultantFilter ? 200 : 60,
            orderBy: { createdAt: "desc" }
        });

        // Apply dynamic consultant filtering rules if present
        if (consultantFilter) {
            const { minRamGb, minStorageGb, minCpuTier, recommendedGpu, userBudget, preferredFormFactor } = consultantFilter;

            listings = listings.filter((l: any) => {
                let extra: any = {};
                try {
                    if (l.extraData) {
                        extra = JSON.parse(l.extraData);
                    }
                } catch (e) {
                    console.error("Error parsing extraData for listing", l.id, e);
                }

                // 1. Budget Filter
                if (userBudget && userBudget > 0) {
                    if (l.price > userBudget) return false;
                }

                // 2. Form Factor Heuristics (Laptop vs Desktop)
                const combinedText = `${l.title} ${l.description || ""} ${l.category || ""} ${l.extraData || ""}`.toLowerCase();
                if (preferredFormFactor) {
                    if (preferredFormFactor === "laptop") {
                        const hasForbidden = ["נייח", "שולחני", "desktop", "מארז", "tower", "all-in-one", "aio", "mac mini", "mac pro", "mac studio", "imac"].some(term => combinedText.includes(term));
                        if (hasForbidden) return false;
                    } else if (preferredFormFactor === "desktop") {
                        const hasForbidden = ["נייד", "לפטופ", "laptop", "notebook", "macbook", "מקבוק"].some(term => combinedText.includes(term));
                        if (hasForbidden) return false;
                    }
                }

                // 3. RAM Filter
                // Canonical fieldId stored by DynamicListingForm is always lowercase 'ram'
                if (minRamGb && minRamGb > 0) {
                    const ramStr = extra["ram"] || "";
                    let listingRam = 0;
                    if (ramStr) {
                        const m = String(ramStr).match(/(\d+)/);
                        if (m) listingRam = parseInt(m[1], 10);
                    }
                    // Fallback: try to extract from combined text (title + description)
                    if (listingRam === 0) {
                        listingRam = getRamFromText(combinedText);
                    }
                    // Strict: RAM must be specified and meet the requirement
                    if (listingRam < minRamGb) return false;
                }

                // 4. Storage Filter
                // Canonical fieldId stored by DynamicListingForm is 'storage' (aliases: 'נפח אחסון', 'אחסון' → 'storage')
                if (minStorageGb && minStorageGb > 0) {
                    const storageStr = (
                        extra["storage"] ||  // ← canonical key (DynamicListingForm fieldId)
                        extra["נפח אחסון"] || 
                        extra["אחסון"] ||
                        extra["נפח"] ||
                        extra["SSD"] || 
                        extra["HDD"] ||
                        extra["Storage"] ||
                        ""
                    ).toLowerCase();
                    let listingStorage = 0;
                    if (storageStr) {
                        const m = storageStr.match(/(\d+)/);
                        if (m) {
                            listingStorage = parseInt(m[1], 10);
                            if (storageStr.includes("tb") || storageStr.includes("טרב")) {
                                listingStorage *= 1024;
                            }
                        }
                    }
                    if (listingStorage === 0) {
                        const m = combinedText.match(/(\d+)\s*(gb|tb|ssd|hdd|אחסון|גיגה)/i);
                        if (m) {
                            listingStorage = parseInt(m[1], 10);
                            if (m[0].toLowerCase().includes("tb")) {
                                listingStorage *= 1024;
                            }
                        }
                    }
                    // Strict: Storage must be specified and meet the requirement
                    if (listingStorage < minStorageGb) return false;
                }

                // 5. CPU Tier Filter
                // Canonical fieldId stored by DynamicListingForm is 'cpu' (aliases: 'מעבד' → 'cpu')
                if (minCpuTier) {
                    const requiredCpuIndex = getCpuTierIndex(minCpuTier);
                    if (requiredCpuIndex >= 0) {
                        const cpuStr = extra["cpu"] || extra["מעבד"] || "";
                        let listingCpuIndex = getCpuTierIndex(cpuStr);
                        if (listingCpuIndex < 0) {
                            // Fallback: search combined text for CPU mentions
                            listingCpuIndex = getCpuTierIndex(combinedText);
                        }
                        // Strict: CPU must be specified and meet the requirement
                        if (listingCpuIndex < 0 || listingCpuIndex > requiredCpuIndex) return false;
                    }
                }

                // 6. GPU Filter
                // Canonical fieldId stored by DynamicListingForm is 'gpu' (aliases: 'כרטיס מסך' → 'gpu')
                if (recommendedGpu && recommendedGpu !== "Integrated" && recommendedGpu !== "מובנה") {
                    const gpuStr = (extra["gpu"] || extra["כרטיס מסך"] || "").toLowerCase();
                    const hasDedicatedInText = ["rtx", "gtx", "geforce", "radeon rx", "nvidia"].some(term => 
                        combinedText.includes(term)
                    );
                    const isDedicated = ["rtx", "gtx", "geforce", "radeon rx", "nvidia", "dedicated"].some(term => 
                        gpuStr.includes(term)
                    ) || hasDedicatedInText;
                    
                    // Strict: Dedicated GPU must be present
                    if (!isDedicated) return false;
                }

                return true;
            });


            // ── Relevance Scoring: rank by data completeness ─────────────────────────
            // Listings that passed the soft-gate but have NO hardware data should appear
            // AFTER listings that have confirmed matching specs. Score 0–8 per filled field.
            const scoreConsultantListing = (l: any): number => {
                let score = 0;
                let extra: any = {};
                try { if (l.extraData) extra = JSON.parse(l.extraData); } catch {}
                const txt = `${l.title} ${l.description || ""} ${l.extraData || ""}`.toLowerCase();

                // RAM: present and meets requirement
                const ramStr = extra["ram"] || "";
                let ram = 0;
                if (ramStr) { const m = String(ramStr).match(/(\d+)/); if (m) ram = parseInt(m[1], 10); }
                if (ram === 0) ram = getRamFromText(txt);
                if (ram >= (consultantFilter!.minRamGb || 0) && ram > 0) score += 2;
                else if (ram > 0) score -= 1;

                // Storage: present and meets requirement
                const storStr = (extra["storage"] || extra["נפח אחסון"] || extra["SSD"] || "").toLowerCase();
                let stor = 0;
                if (storStr) {
                    const m2 = storStr.match(/(\d+)/);
                    if (m2) { stor = parseInt(m2[1], 10); if (storStr.includes("tb")) stor *= 1024; }
                }
                if (stor === 0) {
                    const m3 = txt.match(/(\d+)\s*(gb|tb|ssd|hdd)/i);
                    if (m3) { stor = parseInt(m3[1], 10); if (m3[0].toLowerCase().includes("tb")) stor *= 1024; }
                }
                if (stor >= (consultantFilter!.minStorageGb || 0) && stor > 0) score += 2;
                else if (stor > 0) score -= 1;

                // CPU: present and meets required tier
                const cpuStr = extra["cpu"] || extra["מעבד"] || "";
                const reqIdx = getCpuTierIndex(consultantFilter!.minCpuTier || "");
                let cpuIdx = getCpuTierIndex(cpuStr);
                if (cpuIdx < 0) cpuIdx = getCpuTierIndex(txt);
                if (cpuIdx >= 0 && reqIdx >= 0 && cpuIdx <= reqIdx) score += 2;
                else if (cpuIdx >= 0) score -= 1;

                // GPU: present and dedicated (if required)
                const { recommendedGpu } = consultantFilter!;
                if (recommendedGpu && recommendedGpu !== "Integrated" && recommendedGpu !== "מובנה") {
                    const gpuStr = (extra["gpu"] || extra["כרטיס מסך"] || "").toLowerCase();
                    const hasDedicated = ["rtx", "gtx", "geforce", "radeon rx", "nvidia"].some((t: string) =>
                        gpuStr.includes(t) || txt.includes(t)
                    );
                    if (hasDedicated) score += 2;
                }

                return score;
            };

            listings = [...listings].sort((a: any, b: any) => {
                const diff = scoreConsultantListing(b) - scoreConsultantListing(a);
                if (diff !== 0) return diff;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }


        // 4b. Smart Category-Aware Similar Suggestions
        // When no exact match is found, find similar items ONLY within the exact same product segment.
        // e.g. "laptop I9" → only show I7/I5 laptops. NEVER desktops, phones, or other categories.
        // Skip fallback if isAutocomplete is true so the dropdown only shows exact matches!
        if (listings.length === 0 && searchKeywords.length > 0 && !isAutocomplete) {

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
                const similarWhere: any = { status: "ACTIVE", listingType, ...latLngFilter };

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

                        const listingCpuTier = getCpuTierIndex(combinedText);
                        const listingRam = getRamFromText(combinedText);

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

                        // Strict Price / Budget constraint
                        if (aiFilters.maxPrice && listing.price && listing.price > aiFilters.maxPrice) {
                            disqualified = true;
                        }

                        // Anti-Spam: Obvious fake price check (e.g., <= 5 ILS listing) when there is a real budget
                        if (aiFilters.maxPrice && aiFilters.maxPrice > 100 && listing.price <= 5) {
                            disqualified = true;
                        }

                        // Strict RAM constraint (no downgrades)
                        if (queryRam > 0 && listingRam > 0 && listingRam < queryRam) {
                            disqualified = true;
                        }

                        // Strict CPU constraint (no downgrades)
                        if (queryCpuTier >= 0 && listingCpuTier >= 0 && listingCpuTier > queryCpuTier) {
                            disqualified = true;
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

        // 4.5 Apply Capability Filters & Traffic-Light Matching
        if (capabilityApplied) {
            listings = listings.map((l: any) => {
                const combinedText = `${l.title} ${l.description || ""} ${l.extraData || ""}`.toLowerCase();
                
                const m = combinedText.match(/(\d+)\s*(gb|giga|ram)/i);
                const lRam = m ? parseInt(m[1]) : 0;
                
                const getCpuTierIndex = (text: string): number => {
                    const cpuTiers = [
                        ["i9", "ultra 9", "ryzen 9", "m3 max", "m4 max"],
                        ["i7", "ultra 7", "ryzen 7", "m3 pro", "m2 max", "m4 pro"],
                        ["i5", "ultra 5", "ryzen 5", "m3", "m2 pro", "m2"],
                        ["i3", "ryzen 3", "m1 pro", "m1", "celeron", "pentium"],
                    ];
                    for (let i = 0; i < cpuTiers.length; i++) {
                        if (cpuTiers[i].some(cpu => text.includes(cpu))) return 4 - i;
                    }
                    return 0;
                };
                const lCpuTier = getCpuTierIndex(combinedText);
                
                // Traffic-Light matching
                let matchScore = 0;
                let maxRequirements = 0;
                let isGamingReady = false;

                if (aiFilters.minRam) { 
                    maxRequirements++; 
                    if (lRam >= aiFilters.minRam) matchScore++; 
                }
                if (aiFilters.minCpuTier) { 
                    maxRequirements++; 
                    if (lCpuTier >= aiFilters.minCpuTier) matchScore++; 
                }
                if (lRam >= 16 && lCpuTier >= 3) {
                    isGamingReady = true;
                }

                let matchLevel = "green"; // perfect
                if (maxRequirements > 0) {
                    if (matchScore === maxRequirements) matchLevel = "green";
                    else if (matchScore > 0 || (lRam === 0 && lCpuTier === 0)) matchLevel = "yellow"; // Partial match or unknown specs
                    else matchLevel = "red"; // Low match
                }
                
                return { ...l, matchLevel, isGamingReady };
            }).sort((a, b) => {
                const val = { green: 3, yellow: 2, red: 1 };
                return (val[b.matchLevel as keyof typeof val] || 0) - (val[a.matchLevel as keyof typeof val] || 0);
            });
        }

        // Brand constraint verification to prevent cross-brand matching in results
        if (query && listingType === "SELL") {
            const queryLowerStr = query.toLowerCase();
            const mentionedBrands: string[] = [];

            for (const [brandKey, brandInfo] of Object.entries(brandGroups)) {
                const variants = [...brandInfo.hebrewVariants, ...brandInfo.englishVariants, ...brandInfo.models];
                const matches = variants.some(variant => {
                    const v = variant.toLowerCase();
                    const regex = new RegExp(`(?:^|\\s|\\b)${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s|\\b)`, 'i');
                    return regex.test(queryLowerStr);
                });
                if (matches) {
                    mentionedBrands.push(brandKey);
                }
            }

            if (mentionedBrands.length > 0) {
                listings = listings.filter((l: any) => {
                    const combinedText = `${l.title} ${l.description || ""} ${l.category || ""} ${l.extraData || ""}`.toLowerCase();
                    
                    // 1. Check if the listing matches the brand(s) that WERE mentioned in the query
                    const matchesMentioned = mentionedBrands.some(brandKey => {
                        const brandInfo = brandGroups[brandKey];
                        const variants = [...brandInfo.hebrewVariants, ...brandInfo.englishVariants, ...brandInfo.models];
                        return variants.some(v => combinedText.includes(v.toLowerCase()));
                    });

                    if (matchesMentioned) return true;

                    // 2. If it doesn't match the mentioned brand, check if it matches a different brand in our list
                    const matchesOtherBrand = Object.keys(brandGroups).some(brandKey => {
                        if (mentionedBrands.includes(brandKey)) return false;
                        const brandInfo = brandGroups[brandKey];
                        const variants = [...brandInfo.hebrewVariants, ...brandInfo.englishVariants, ...brandInfo.models];
                        return variants.some(v => combinedText.includes(v.toLowerCase()));
                    });

                    if (matchesOtherBrand) {
                        return false;
                    }

                    return false; // If a brand was requested, do not show unbranded generic listings either
                });
            }
        }

        // Strict specification and price verification for all final results (preventing downgrades and spam)
        if (query && listingType === "SELL") {
            const queryLowerStr = query.toLowerCase();
            const queryRam = getRamFromText(queryLowerStr);
            const queryCpuTier = getCpuTierIndex(queryLowerStr);

            listings = listings.filter((l: any) => {
                const combinedText = `${l.title} ${l.description || ""} ${l.category || ""} ${l.extraData || ""}`.toLowerCase();
                
                // 1. Strict Price / Budget check
                if (aiFilters.maxPrice && l.price && l.price > aiFilters.maxPrice) {
                    return false;
                }

                // 2. Anti-Spam check: filter out listings with price <= 5 if query implies a high-value category or has a budget > 100
                const isHighValueCategory = ["מחשבים", "טלפונים", "רכב", "נדלן", "מוצרי חשמל לבית", "laptops", "computers", "smartphones", "desktops"].some(cat => 
                    (l.category || "").toLowerCase().includes(cat)
                );
                const hasSignificantBudget = aiFilters.maxPrice && aiFilters.maxPrice > 100;
                const isSpamPrice = l.price <= 5;
                if (isSpamPrice && (hasSignificantBudget || isHighValueCategory)) {
                    return false;
                }

                // 3. Strict RAM check (no downgrades)
                if (queryRam > 0) {
                    const listingRam = getRamFromText(combinedText);
                    if (listingRam > 0 && listingRam < queryRam) {
                        return false;
                    }
                }

                // 4. Strict CPU check (no downgrades)
                if (queryCpuTier >= 0) {
                    const listingCpuTier = getCpuTierIndex(combinedText);
                    if (listingCpuTier >= 0 && listingCpuTier > queryCpuTier) {
                        return false;
                    }
                }

                return true;
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

        // ─────────────────────────────────────────────────────────────
        // STEP 6 — Catalog Search (MobileCatalog + LaptopCatalog + ElectronicsCatalog)
        // Fires when the user typed a query. Searches the product catalogs for matching
        // models. Returns "catalogSuggestions" — products that exist but have no listing yet.
        // ─────────────────────────────────────────────────────────────
        let catalogSuggestions: any[] = [];

        if (processedQuery.trim().length > 0 && !isAutocomplete && listingType === "SELL") {
            // Build a broad OR across all search terms for catalog search
            const flatTerms = searchKeywords.length > 0 ? searchKeywords : [processedQuery.trim()];
            // Only use meaningful terms (length > 1, skip single digits/letters)
            const catalogTerms = flatTerms.filter((t: string) => t.length > 1 && !/^\d$/.test(t));

            if (catalogTerms.length > 0) {
                // ── Helper: build OR conditions for a String[] (hebrewAliases) ──
                // NeonDB (Postgres array) — use hasSome for String[] fields
                const buildCatalogWhere = (extraConditions: any[] = []) => ({
                    OR: [
                        ...catalogTerms.flatMap((term: string) => [
                            { brand:     { contains: term, mode: "insensitive" as const } },
                            { series:    { contains: term, mode: "insensitive" as const } },
                            { modelName: { contains: term, mode: "insensitive" as const } },
                        ]),
                        ...extraConditions
                    ]
                });

                // ── 6a. MobileCatalog ────────────────────────────────────────────
                try {
                    const mobileResults = await prismadb.mobileCatalog.findMany({
                        where: {
                            OR: [
                                ...catalogTerms.flatMap((term: string) => [
                                    { brand:     { contains: term, mode: "insensitive" as const } },
                                    { series:    { contains: term, mode: "insensitive" as const } },
                                    { modelName: { contains: term, mode: "insensitive" as const } },
                                ]),
                                // hebrewAliases is String[] — use hasSome (matches any element)
                                { hebrewAliases: { hasSome: catalogTerms } },
                            ]
                        },
                        take: 6
                    });

                    // Also search inside the alias text (contains, since hasSome is exact-match only)
                    const mobileByAlias = await prismadb.mobileCatalog.findMany({
                        where: {
                            OR: catalogTerms.flatMap((term: string) =>
                                // Prisma doesn't support contains on String[] directly — we use raw contains on JSON representation
                                // Workaround: search via json string match on extraData — not available.
                                // Instead, rely on brand/series/modelName + hasSome above.
                                // Additional fallback: search by cpu field
                                [{ cpu: { contains: term, mode: "insensitive" as const } }]
                            )
                        },
                        take: 3
                    });

                    const allMobile = [...mobileResults, ...mobileByAlias];
                    const seenMobile = new Set<string>();
                    allMobile.forEach(item => {
                        if (seenMobile.has(item.id)) return;
                        seenMobile.add(item.id);
                        // Display name: use first hebrewAlias or brand+series
                        const displayName = item.hebrewAliases?.[0] || `${item.brand} ${item.series}`.trim();
                        const specsArr: string[] = [];
                        if (item.cpu)      specsArr.push(item.cpu);
                        if (item.ramG)     specsArr.push(`${item.ramG}GB RAM`);
                        if (item.battery)  specsArr.push(item.battery);
                        if (item.screenSize) specsArr.push(`${item.screenSize}"`);

                        catalogSuggestions.push({
                            isCatalogResult: true,
                            catalogType: "MOBILE",
                            id: `catalog-mobile-${item.id}`,
                            title: displayName,
                            brand: item.brand,
                            series: item.series,
                            modelName: item.modelName,
                            specs: specsArr.join(" | "),
                            category: "סלולרי",
                            releaseYear: item.releaseYear,
                            hebrewAliases: item.hebrewAliases,
                            storages: item.storages,
                            // Placeholder for listing fields expected by UI
                            price: null,
                            condition: null,
                            images: "[]",
                            status: "CATALOG",
                            listingType: "SELL",
                            description: specsArr.join(", "),
                            seller: null,
                        });
                    });
                } catch (e) { /* catalog search is non-critical */ }

                // ── 6b. LaptopCatalog ────────────────────────────────────────────
                try {
                    const laptopResults = await prismadb.laptopCatalog.findMany({
                        where: buildCatalogWhere(),
                        take: 6
                    });

                    laptopResults.forEach(item => {
                        const displayName = `${item.brand} ${item.series} ${item.modelName}`.trim();
                        const specsArr: string[] = [];
                        if (item.cpu?.[0])     specsArr.push(item.cpu[0]);
                        if (item.ram?.[0])     specsArr.push(`${item.ram[0]} RAM`);
                        if (item.storage?.[0]) specsArr.push(item.storage[0]);
                        if (item.screenSize?.[0]) specsArr.push(`${item.screenSize[0]}"`);

                        catalogSuggestions.push({
                            isCatalogResult: true,
                            catalogType: "LAPTOP",
                            id: `catalog-laptop-${item.id}`,
                            title: displayName,
                            brand: item.brand,
                            series: item.series,
                            modelName: item.modelName,
                            specs: specsArr.join(" | "),
                            category: "LAPTOPS",
                            releaseYear: item.releaseYear ? parseInt(item.releaseYear) : null,
                            price: null,
                            condition: null,
                            images: "[]",
                            status: "CATALOG",
                            listingType: "SELL",
                            description: specsArr.join(", "),
                            seller: null,
                        });
                    });
                } catch (e) { /* non-critical */ }

                // ── 6c. ElectronicsCatalog ───────────────────────────────────────
                try {
                    const electronicsResults = await prismadb.electronicsCatalog.findMany({
                        where: {
                            OR: [
                                ...catalogTerms.flatMap((term: string) => [
                                    { brand:     { contains: term, mode: "insensitive" as const } },
                                    { modelName: { contains: term, mode: "insensitive" as const } },
                                    { category:  { contains: term, mode: "insensitive" as const } },
                                ]),
                                { hebrewAliases: { hasSome: catalogTerms } },
                            ]
                        },
                        take: 4
                    });

                    electronicsResults.forEach(item => {
                        const displayName = item.hebrewAliases?.[0] || `${item.brand} ${item.modelName}`.trim();
                        catalogSuggestions.push({
                            isCatalogResult: true,
                            catalogType: "ELECTRONICS",
                            id: `catalog-elec-${item.id}`,
                            title: displayName,
                            brand: item.brand,
                            modelName: item.modelName,
                            specs: item.specs || "",
                            category: item.category,
                            releaseYear: item.releaseYear,
                            price: null,
                            condition: null,
                            images: "[]",
                            status: "CATALOG",
                            listingType: "SELL",
                            description: item.specs || "",
                            seller: null,
                        });
                    });
                } catch (e) { /* non-critical */ }

                // De-duplicate catalog results (same brand+series combo)
                const seen = new Set<string>();
                catalogSuggestions = catalogSuggestions.filter(s => {
                    const key = `${s.brand}-${s.series || s.modelName}`.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

                // Limit to 8 catalog suggestions max
                catalogSuggestions = catalogSuggestions.slice(0, 8);
            }
        }

        // Smart Fallback: If capabilityApplied but no results — show smart message
        let smartFallbackMessage: string | null = null;
        if (capabilityApplied && capabilityMatch && finalResults.length === 0) {
            smartFallbackMessage = `לא מצאתי מחשב בשם "${capabilityMatch.keyword}", אבל מצאתי מחשבים שיריצו אותו מצוין — מסנן תוצאות רלוונטיות עבורך.`;
            isFallback = true;
        }

        return NextResponse.json({ 
            success: true, 
            results: finalResults,
            total: finalResults.length,
            aiFilters,
            isFallback,
            aiInsight: aiInsight || null,
            capabilityMatch,
            adviceCard,
            smartFallbackMessage,
            // ── NEW: Catalog suggestions (products with no listings yet) ──────
            catalogSuggestions,
            hasCatalogSuggestions: catalogSuggestions.length > 0,
        });

    } catch (error) {
        console.error("[SMART_SEARCH_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
