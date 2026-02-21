// =====================================================
// MARKETPLACE DATA — Central Product Knowledge Base
// All categories in one place for AI auto-complete,
// smart correction, and category detection.
// =====================================================

export interface MarketplaceProduct {
    brand: string;
    category: string;
    subCategory?: string;
    model: string;
    hebrewAliases?: string[];      // How it's said in spoken Hebrew
    validStorages?: number[];       // GB
    validSizes?: number[];          // Inches / Liters / KG (context-dependent)
    releaseYear?: number;
    specs?: Record<string, string[]>; // e.g. { "רוחב": ["43","55"], "BTU": ["9000"] }
}

// =====================================================
// GAMING CONSOLES
// =====================================================
export const GAMING_CONSOLES: MarketplaceProduct[] = [
    // Sony PlayStation
    {
        brand: "Sony", category: "גיימינג", subCategory: "קונסולה",
        model: "PlayStation 5 Digital Edition",
        hebrewAliases: ["פלייסטיישן 5 דיגיטל", "PS5 דיגיטל", "פס5 דיגיטל"],
        validStorages: [825], releaseYear: 2020
    },
    {
        brand: "Sony", category: "גיימינג", subCategory: "קונסולה",
        model: "PlayStation 5",
        hebrewAliases: ["פלייסטיישן 5", "PS5", "פס5", "פלייסטיישן חמש"],
        validStorages: [825, 1000], releaseYear: 2020
    },
    {
        brand: "Sony", category: "גיימינג", subCategory: "קונסולה",
        model: "PlayStation 4 Pro",
        hebrewAliases: ["פלייסטיישן 4 פרו", "PS4 Pro", "פס4 פרו"],
        validStorages: [1000, 2000], releaseYear: 2016
    },
    {
        brand: "Sony", category: "גיימינג", subCategory: "קונסולה",
        model: "PlayStation 4",
        hebrewAliases: ["פלייסטיישן 4", "PS4", "פס4", "פלייסטיישן ארבע"],
        validStorages: [500, 1000], releaseYear: 2013
    },
    // Microsoft Xbox
    {
        brand: "Microsoft", category: "גיימינג", subCategory: "קונסולה",
        model: "Xbox Series X",
        hebrewAliases: ["אקסבוקס סיריז X", "Xbox X", "אקסבוקס X"],
        validStorages: [1000], releaseYear: 2020
    },
    {
        brand: "Microsoft", category: "גיימינג", subCategory: "קונסולה",
        model: "Xbox Series S",
        hebrewAliases: ["אקסבוקס סיריז S", "Xbox S", "אקסבוקס S"],
        validStorages: [512], releaseYear: 2020
    },
    {
        brand: "Microsoft", category: "גיימינג", subCategory: "קונסולה",
        model: "Xbox One X",
        hebrewAliases: ["אקסבוקס וואן X"],
        validStorages: [1000], releaseYear: 2017
    },
    // Nintendo
    {
        brand: "Nintendo", category: "גיימינג", subCategory: "קונסולה",
        model: "Nintendo Switch OLED",
        hebrewAliases: ["נינטנדו סוויץ' OLED", "סוויץ אולד"],
        releaseYear: 2021
    },
    {
        brand: "Nintendo", category: "גיימינג", subCategory: "קונסולה",
        model: "Nintendo Switch",
        hebrewAliases: ["נינטנדו סוויץ'", "סוויץ'", "נינטנדו"],
        releaseYear: 2017
    },
    {
        brand: "Nintendo", category: "גיימינג", subCategory: "קונסולה",
        model: "Nintendo Switch Lite",
        hebrewAliases: ["סוויץ' לייט", "נינטנדו לייט"],
        releaseYear: 2019
    },
    // VR
    {
        brand: "Meta", category: "גיימינג", subCategory: "VR",
        model: "Meta Quest 3",
        hebrewAliases: ["מטא קווסט 3", "אוקיולוס קווסט 3"],
        validStorages: [128, 512], releaseYear: 2023
    },
    {
        brand: "Meta", category: "גיימינג", subCategory: "VR",
        model: "Meta Quest 2",
        hebrewAliases: ["מטא קווסט 2", "אוקיולוס קווסט 2"],
        validStorages: [128, 256], releaseYear: 2020
    },
    {
        brand: "Sony", category: "גיימינג", subCategory: "VR",
        model: "PlayStation VR2",
        hebrewAliases: ["PSVR2", "פי אס VR 2"],
        releaseYear: 2023
    },
];

// =====================================================
// ELECTRIC SCOOTERS (קורקינטים חשמליים)
// =====================================================
export const ELECTRIC_SCOOTERS: MarketplaceProduct[] = [
    // Xiaomi — most popular in Israel
    {
        brand: "Xiaomi", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Xiaomi Scooter 4 Ultra",
        hebrewAliases: ["שיאומי 4 אולטרה", "קורקינט שיאומי 4 אולטרה"],
        specs: { "מהירות": ["25"], "טווח": ["70"], "הספק": ["700W"] }, releaseYear: 2023
    },
    {
        brand: "Xiaomi", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Xiaomi Scooter 4 Pro+",
        hebrewAliases: ["שיאומי 4 פרו פלוס"],
        specs: { "מהירות": ["25"], "טווח": ["55"], "הספק": ["600W"] }, releaseYear: 2023
    },
    {
        brand: "Xiaomi", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Xiaomi Scooter 4 Pro",
        hebrewAliases: ["שיאומי 4 פרו", "מי4 פרו"],
        specs: { "מהירות": ["25"], "טווח": ["45"] }, releaseYear: 2022
    },
    {
        brand: "Xiaomi", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Xiaomi Mi Scooter Pro 2",
        hebrewAliases: ["שיאומי מי פרו 2", "מי פרו 2"],
        specs: { "מהירות": ["25"], "טווח": ["45"] }, releaseYear: 2021
    },
    {
        brand: "Xiaomi", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Xiaomi Mi Scooter 3",
        hebrewAliases: ["שיאומי מי 3"],
        specs: { "מהירות": ["25"], "טווח": ["30"] }, releaseYear: 2021
    },
    // Segway / Ninebot
    {
        brand: "Segway", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Segway Ninebot Max G2",
        hebrewAliases: ["נינבוט מקס G2", "סגוביי מקס", "נינבוט G2"],
        specs: { "מהירות": ["25"], "טווח": ["70"] }, releaseYear: 2023
    },
    {
        brand: "Segway", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Segway Ninebot Max G30",
        hebrewAliases: ["נינבוט מקס", "נינבוט G30", "סגוביי G30"],
        specs: { "מהירות": ["25"], "טווח": ["65"] }, releaseYear: 2019
    },
    {
        brand: "Segway", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Segway Ninebot E2",
        hebrewAliases: ["נינבוט E2"],
        specs: { "מהירות": ["20"], "טווח": ["25"] }, releaseYear: 2022
    },
    // Kaabo
    {
        brand: "Kaabo", category: "קורקינט חשמלי", subCategory: "קורקינט",
        model: "Kaabo Mantis 10",
        hebrewAliases: ["קאבו מנטיס", "קאבו"],
        specs: { "מהירות": ["40"], "הספק": ["2x500W"] }, releaseYear: 2022
    },
    // Electric Bikes (אופניים חשמליים)
    {
        brand: "Bafang", category: "אופניים חשמליים", subCategory: "אופניים",
        model: "אופניים חשמליים 250W",
        hebrewAliases: ["אופניים חשמליים", "אופניים eBike"],
        specs: { "הספק": ["250W", "350W", "500W"] }
    },
    {
        brand: "Specialized", category: "אופניים חשמליים", subCategory: "אופניים",
        model: "Specialized Turbo Como",
        hebrewAliases: ["ספיישלייזד טורבו"],
        specs: { "הספק": ["250W"] }
    },
];

// =====================================================
// CAMERAS (מצלמות)
// =====================================================
export const CAMERAS: MarketplaceProduct[] = [
    // Sony Alpha (Mirrorless)
    {
        brand: "Sony", category: "מצלמה", subCategory: "מירורלס",
        model: "Sony Alpha A7 IV",
        hebrewAliases: ["סוני אלפא A7 4", "סוני A7 IV"],
        specs: { "מגה פיקסל": ["33"], "סוג": ["full frame"] }, releaseYear: 2021
    },
    {
        brand: "Sony", category: "מצלמה", subCategory: "מירורלס",
        model: "Sony Alpha A7C",
        hebrewAliases: ["סוני A7C"],
        specs: { "מגה פיקסל": ["24"] }, releaseYear: 2020
    },
    {
        brand: "Sony", category: "מצלמה", subCategory: "מירורלס",
        model: "Sony Alpha A6700",
        hebrewAliases: ["סוני A6700"],
        specs: { "מגה פיקסל": ["26"], "סוג": ["APS-C"] }, releaseYear: 2023
    },
    {
        brand: "Sony", category: "מצלמה", subCategory: "מירורלס",
        model: "Sony ZV-E10",
        hebrewAliases: ["סוני ZV E10", "סוני ZV"],
        specs: { "מגה פיקסל": ["24"] }, releaseYear: 2021
    },
    // Canon
    {
        brand: "Canon", category: "מצלמה", subCategory: "מירורלס",
        model: "Canon EOS R6 Mark II",
        hebrewAliases: ["קנון R6", "קנון EOS R6"],
        specs: { "מגה פיקסל": ["40"] }, releaseYear: 2022
    },
    {
        brand: "Canon", category: "מצלמה", subCategory: "מירורלס",
        model: "Canon EOS R50",
        hebrewAliases: ["קנון R50"],
        specs: { "מגה פיקסל": ["24"] }, releaseYear: 2023
    },
    {
        brand: "Canon", category: "מצלמה", subCategory: "DSLR",
        model: "Canon EOS 90D",
        hebrewAliases: ["קנון 90D"],
        specs: { "מגה פיקסל": ["32"] }, releaseYear: 2019
    },
    {
        brand: "Canon", category: "מצלמה", subCategory: "DSLR",
        model: "Canon EOS 250D",
        hebrewAliases: ["קנון 250D", "קנון 200D"],
        specs: { "מגה פיקסל": ["24"] }, releaseYear: 2019
    },
    // Nikon
    {
        brand: "Nikon", category: "מצלמה", subCategory: "מירורלס",
        model: "Nikon Z6 II",
        hebrewAliases: ["ניקון Z6 2", "ניקון Z6"],
        specs: { "מגה פיקסל": ["24"] }, releaseYear: 2020
    },
    {
        brand: "Nikon", category: "מצלמה", subCategory: "מירורלס",
        model: "Nikon Z50",
        hebrewAliases: ["ניקון Z50"],
        specs: { "מגה פיקסל": ["20"] }, releaseYear: 2019
    },
    {
        brand: "Nikon", category: "מצלמה", subCategory: "DSLR",
        model: "Nikon D7500",
        hebrewAliases: ["ניקון D7500"],
        specs: { "מגה פיקסל": ["20"] }, releaseYear: 2017
    },
    // GoPro / Action Cameras
    {
        brand: "GoPro", category: "מצלמה", subCategory: "אקשן",
        model: "GoPro Hero 12 Black",
        hebrewAliases: ["גו פרו 12", "גופרו 12"],
        releaseYear: 2023
    },
    {
        brand: "GoPro", category: "מצלמה", subCategory: "אקשן",
        model: "GoPro Hero 11 Black",
        hebrewAliases: ["גו פרו 11", "גופרו 11"],
        releaseYear: 2022
    },
    // DJI Drones
    {
        brand: "DJI", category: "מצלמה", subCategory: "רחפן",
        model: "DJI Mini 4 Pro",
        hebrewAliases: ["DJI מיני 4 פרו", "דיג'יי מיני 4"],
        releaseYear: 2023
    },
    {
        brand: "DJI", category: "מצלמה", subCategory: "רחפן",
        model: "DJI Air 3",
        hebrewAliases: ["DJI אייר 3"],
        releaseYear: 2023
    },
];

// =====================================================
// BABY & TODDLER EQUIPMENT (ציוד תינוקות)
// =====================================================
export const BABY_EQUIPMENT: MarketplaceProduct[] = [
    // Strollers (עגלות)
    {
        brand: "Bugaboo", category: "ציוד תינוקות", subCategory: "עגלה",
        model: "Bugaboo Fox 5",
        hebrewAliases: ["באגאבו פוקס 5", "באגאבו פוקס"],
        releaseYear: 2023
    },
    {
        brand: "UPPAbaby", category: "ציוד תינוקות", subCategory: "עגלה",
        model: "UPPAbaby Vista V2",
        hebrewAliases: ["אפאביי ויסטה", "אפאביי"],
        releaseYear: 2020
    },
    {
        brand: "Cybex", category: "ציוד תינוקות", subCategory: "עגלה",
        model: "Cybex Gazelle S",
        hebrewAliases: ["סייבקס גאזל", "סייבקס"],
    },
    {
        brand: "Maxi-Cosi", category: "ציוד תינוקות", subCategory: "עגלה",
        model: "Maxi-Cosi Zelia",
        hebrewAliases: ["מקסי קוזי", "מקסי-קוזי"],
    },
    {
        brand: "Yoyo", category: "ציוד תינוקות", subCategory: "עגלה",
        model: "Babyzen Yoyo 6+",
        hebrewAliases: ["יויו", "יויו 6 פלוס", "ביביזן יויו"],
    },
    // Car Seats (כסאות בטיחות)
    {
        brand: "Cybex", category: "ציוד תינוקות", subCategory: "כסא בטיחות",
        model: "Cybex Sirona",
        hebrewAliases: ["סייבקס סירונה"],
    },
    {
        brand: "Britax", category: "ציוד תינוקות", subCategory: "כסא בטיחות",
        model: "Britax Dualfix",
        hebrewAliases: ["בריטקס דואלפיקס", "בריטקס"],
    },
    {
        brand: "Joie", category: "ציוד תינוקות", subCategory: "כסא בטיחות",
        model: "Joie i-Spin 360",
        hebrewAliases: ["ג'ואי ספין", "ג'ואי"],
    },
    // Cots / Cribs (עריסות ומיטות)
    {
        brand: "Stokke", category: "ציוד תינוקות", subCategory: "עריסה",
        model: "Stokke Sleepi",
        hebrewAliases: ["סטוקה סליפי", "סטוקה"],
    },
];

// =====================================================
// COFFEE MACHINES (מכונות קפה)
// =====================================================
export const COFFEE_MACHINES: MarketplaceProduct[] = [
    // Nespresso
    {
        brand: "Nespresso", category: "מכונת קפה", subCategory: "קפסולות",
        model: "Nespresso Vertuo Next",
        hebrewAliases: ["נספרסו ורטו נקסט", "ורטו"],
        specs: { "לחץ": ["19 בר"], "סוג": ["Nespresso Vertuo"] }, releaseYear: 2020
    },
    {
        brand: "Nespresso", category: "מכונת קפה", subCategory: "קפסולות",
        model: "Nespresso Essenza Mini",
        hebrewAliases: ["נספרסו אסנזה מיני", "אסנזה"],
        specs: { "לחץ": ["19 בר"] }
    },
    {
        brand: "Nespresso", category: "מכונת קפה", subCategory: "קפסולות",
        model: "Nespresso Lattissima One",
        hebrewAliases: ["נספרסו לטיסימה"],
        specs: { "לחץ": ["19 בר"] }
    },
    // De'Longhi
    {
        brand: "De'Longhi", category: "מכונת קפה", subCategory: "אוטומטית",
        model: "De'Longhi Magnifica Evo",
        hebrewAliases: ["דה לונגי מגניפיקה", "מגניפיקה"],
        specs: { "לחץ": ["15 בר"], "סוג": ["אוטומטית פולי קפה"] }
    },
    {
        brand: "De'Longhi", category: "מכונת קפה", subCategory: "אוטומטית",
        model: "De'Longhi Dinamica Plus",
        hebrewAliases: ["דה לונגי דינמיקה", "דינמיקה"],
        specs: { "לחץ": ["15 בר"] }
    },
    {
        brand: "De'Longhi", category: "מכונת קפה", subCategory: "ידנית",
        model: "De'Longhi Dedica",
        hebrewAliases: ["דה לונגי דדיקה", "דדיקה"],
        specs: { "לחץ": ["15 בר"], "סוג": ["מוט"] }
    },
    // Philips
    {
        brand: "Philips", category: "מכונת קפה", subCategory: "אוטומטית",
        model: "Philips EP3241",
        hebrewAliases: ["פיליפס 3241", "פיליפס קפה"],
        specs: { "סוג": ["אוטומטית פולי קפה"] }
    },
    // Dolce Gusto
    {
        brand: "Krups", category: "מכונת קפה", subCategory: "קפסולות",
        model: "Dolce Gusto Infinissima",
        hebrewAliases: ["דולצ'ה גוסטו", "דולצ'ה"],
        specs: { "סוג": ["Dolce Gusto"] }
    },
];

// =====================================================
// SPORTS & FITNESS EQUIPMENT (ציוד ספורט וכושר)
// =====================================================
export const SPORTS_EQUIPMENT: MarketplaceProduct[] = [
    // Treadmills (הליכונים)
    {
        brand: "NordicTrack", category: "ציוד כושר", subCategory: "הליכון",
        model: "NordicTrack Commercial 1750",
        hebrewAliases: ["נורדיק טראק", "הליכון נורדיק"],
        specs: { "הספק": ["3.5 HP"], "מהירות": ["22 קמ/ש"] }
    },
    {
        brand: "Domyos", category: "ציוד כושר", subCategory: "הליכון",
        model: "Domyos T520B",
        hebrewAliases: ["דומיוס הליכון", "דקטלון הליכון"],
        specs: { "הספק": ["2 HP"] }
    },
    // Stationary Bikes (אופניים נייחות)
    {
        brand: "Peloton", category: "ציוד כושר", subCategory: "אופניים נייחות",
        model: "Peloton Bike+",
        hebrewAliases: ["פלוטון", "פלוטון בייק"],
        releaseYear: 2020
    },
    // Gym Equipment (ציוד כושר כללי)
    {
        brand: "PowerBlock", category: "ציוד כושר", subCategory: "משקולות",
        model: "PowerBlock Elite Dumbbell",
        hebrewAliases: ["פאורבלוק", "משקולות מתכווננות"],
    },
];

// =====================================================
// MUSICAL INSTRUMENTS (כלי נגינה)
// =====================================================
export const MUSICAL_INSTRUMENTS: MarketplaceProduct[] = [
    // Guitars
    {
        brand: "Fender", category: "כלי נגינה", subCategory: "גיטרה",
        model: "Fender Stratocaster",
        hebrewAliases: ["פנדר סטראטוקסטר", "סטראט"],
        specs: { "סוג": ["חשמלית"] }
    },
    {
        brand: "Gibson", category: "כלי נגינה", subCategory: "גיטרה",
        model: "Gibson Les Paul Standard",
        hebrewAliases: ["גיבסון לס פול", "לס פול"],
        specs: { "סוג": ["חשמלית"] }
    },
    {
        brand: "Yamaha", category: "כלי נגינה", subCategory: "גיטרה",
        model: "Yamaha F310",
        hebrewAliases: ["יאמהה F310", "יאמהה אקוסטיק"],
        specs: { "סוג": ["אקוסטית"] }
    },
    // Keyboards / Pianos
    {
        brand: "Roland", category: "כלי נגינה", subCategory: "קלידים",
        model: "Roland FP-30X",
        hebrewAliases: ["רולנד FP30", "פסנתר רולנד"],
        specs: { "מקשים": ["88"] }
    },
    {
        brand: "Yamaha", category: "כלי נגינה", subCategory: "קלידים",
        model: "Yamaha P-145",
        hebrewAliases: ["יאמהה P145", "פסנתר יאמהה"],
        specs: { "מקשים": ["88"] }
    },
];

// =====================================================
// POWER TOOLS (כלי עבודה)
// =====================================================
export const POWER_TOOLS: MarketplaceProduct[] = [
    {
        brand: "Bosch", category: "כלי עבודה", subCategory: "מקדחה",
        model: "Bosch GSB 18V",
        hebrewAliases: ["בוש GSB", "מקדחת בוש 18V"],
        specs: { "וולט": ["18V"] }
    },
    {
        brand: "Makita", category: "כלי עבודה", subCategory: "מקדחה",
        model: "Makita DHP486",
        hebrewAliases: ["מקיטה 18V", "מקיטה מקדחה"],
        specs: { "וולט": ["18V"] }
    },
    {
        brand: "DeWalt", category: "כלי עבודה", subCategory: "מקדחה",
        model: "DeWalt DCD791",
        hebrewAliases: ["דיוולט", "דיווולט"],
        specs: { "וולט": ["18V"] }
    },
    {
        brand: "Bosch", category: "כלי עבודה", subCategory: "מסור",
        model: "Bosch GKS 18V",
        hebrewAliases: ["בוש מסור"],
        specs: { "וולט": ["18V"] }
    },
];

// =====================================================
// ALL PRODUCTS — UNIFIED
// =====================================================
export const ALL_MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
    ...GAMING_CONSOLES,
    ...ELECTRIC_SCOOTERS,
    ...CAMERAS,
    ...BABY_EQUIPMENT,
    ...COFFEE_MACHINES,
    ...SPORTS_EQUIPMENT,
    ...MUSICAL_INSTRUMENTS,
    ...POWER_TOOLS,
];

// =====================================================
// SMART LOOKUP — finds best match across ALL categories
// =====================================================

/**
 * Find a product from the marketplace knowledge base.
 * Returns best match + confidence score.
 */
export function findMarketplaceProduct(text: string): {
    product: MarketplaceProduct | null;
    confidence: number;
} {
    const t = text.toLowerCase();
    let best: MarketplaceProduct | null = null;
    let bestScore = 0;

    for (const item of ALL_MARKETPLACE_PRODUCTS) {
        let score = 0;

        // Model name match (longer = more specific = higher score)
        if (t.includes(item.model.toLowerCase())) {
            score = item.model.length * 2;
        }

        // Hebrew alias match
        if (item.hebrewAliases) {
            for (const alias of item.hebrewAliases) {
                if (t.includes(alias.toLowerCase())) {
                    score = Math.max(score, alias.length * 2);
                }
            }
        }

        // Brand-only match (weaker signal)
        if (score === 0 && t.includes(item.brand.toLowerCase())) {
            score = item.brand.length;
        }

        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    }

    return {
        product: best,
        confidence: bestScore > 0 ? Math.min(1, bestScore / 40) : 0
    };
}

/**
 * Return all category names in the knowledge base
 */
export function getAllCategories(): string[] {
    return Array.from(new Set(ALL_MARKETPLACE_PRODUCTS.map(p => p.category)));
}

/**
 * Return all brand names for a given category
 */
export function getBrandsForCategory(category: string): string[] {
    return Array.from(new Set(
        ALL_MARKETPLACE_PRODUCTS
            .filter(p => p.category === category)
            .map(p => p.brand)
    ));
}

/**
 * Known valid storage sizes for gaming consoles (GB)
 */
export const KNOWN_CONSOLE_STORAGES = [8, 32, 64, 128, 256, 500, 512, 825, 1000, 2000];

/**
 * Correct console storage: "82" → "825", "1" → "1000"
 */
export function correctConsoleStorage(n: number): number {
    if (KNOWN_CONSOLE_STORAGES.includes(n)) return n;
    // Suffix match
    for (const size of [...KNOWN_CONSOLE_STORAGES].sort((a, b) => b - a)) {
        if (String(size).startsWith(String(n)) || String(size).endsWith(String(n))) return size;
    }
    return n;
}
