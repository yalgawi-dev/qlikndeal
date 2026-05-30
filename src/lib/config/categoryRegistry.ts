import prismadb from "@/lib/prismadb";

export interface CategoryRegistryEntry {
  code: string;
  nameHebrew?: string;
  prismaModel: string;
  nlpKeywords: string[];
  regex: RegExp;
  learnFields: string[];
  uniqueKeys: string[];
  translationMap?: Record<string, string[]>;
}

export const BaseCategoryRegistry: Record<string, CategoryRegistryEntry> = {
  LAPTOPS: {
    code: "LAPTOPS",
    prismaModel: "laptopCatalog",
    nlpKeywords: [
      "laptop", "laptops", "מחשב נייד", "נייד", "macbook", "thinkpad", "workstation", "notebook", 
      "ultrabook", "chromebook", "zbook", "zenbook", "vivobook", "ideapad", 
      "spectre", "probook", "elitebook", "swift", "משטח מגע", "touchpad"
    ],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:מחשב נייד|לפטופ|נייד|macbook|workstation|notebook|zbook|zenbook|vivobook|ideapad|spectre|probook|elitebook|swift|משטח מגע|touchpad)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "series", "cpu", "gpu", "ram", "storage", "os", "screenSize"],
    uniqueKeys: ["sku", "brand", "modelName", "cpu", "ram", "storage"],
    translationMap: {
      "Lenovo": ["לנובו"], "Dell": ["דל"], "Apple": ["אפל", "אייפון", "iPhone", "MacBook", "מקבוק"], "Asus": ["אסוס"], "HP": ["אייצ' פי", "אייץ פי", "HP"]
    }
  },
  SMARTPHONES: {
    code: "SMARTPHONES",
    prismaModel: "mobileCatalog",
    nlpKeywords: ["mobile phone", "phone", "smartphone", "טלפון", "סלולר", "סמארטפון", "iphone", "galaxy"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:טלפון|סלולרי|אייפון|גלקסי|iphone|galaxy|smartphone)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "series", "cpu", "os", "battery", "rearCamera", "frontCamera", "ramG", "storages"],
    uniqueKeys: ["brand", "modelName"],
    translationMap: {
      "Samsung": ["סמסונג", "גלקסי", "Galaxy"], "Xiaomi": ["שיאומי"], "Google": ["גוגל"], "OnePlus": ["וואן פלוס", "ואן פלוס"], "Apple": ["אפל", "אייפון", "iPhone"]
    }
  },
  VEHICLES: {
    code: "VEHICLES",
    prismaModel: "vehicleCatalog",
    nlpKeywords: ["car", "vehicle", "רכב", "מכונית", "jeep", "sedan"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:רכב|מכונית|רכבים|אוטו)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["make", "model", "type", "fuelType", "transmission", "engineSize"],
    uniqueKeys: ["make", "model", "year"],
  },
  APPLIANCES: {
    code: "APPLIANCES",
    prismaModel: "applianceCatalog",
    nlpKeywords: ["appliance", "fridge", "washing machine", "מקרר", "מכונת כביסה", "מזגן", "ac"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:מקרר|מזגן|כביסה|תנור)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "category", "capacity", "energyRating"],
    uniqueKeys: ["brand", "modelName", "category"],
  },
  ELECTRONICS: {
    code: "ELECTRONICS",
    prismaModel: "electronicsCatalog",
    nlpKeywords: ["tv", "smartwatch", "headphones", "טלויזיה", "אוזניות", "שעון חכם"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:מסך|אוזניות|טלוויזיה|שעון)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "category"],
    uniqueKeys: ["brand", "modelName", "category"],
  },
  DESKTOPS: {
    code: "DESKTOPS",
    prismaModel: "brandDesktopCatalog",
    nlpKeywords: ["desktop", "pc", "מחשב נייח", "מחשב"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:מחשב נייח|פיסי|pc)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "series", "cpu", "gpu", "ram", "storage", "os"],
    uniqueKeys: ["sku", "brand", "modelName", "cpu"],
  },
  AIO: {
    code: "AIO",
    prismaModel: "aioCatalog",
    nlpKeywords: ["aio", "all in one", "all in 1", "imac", "איימק", "הכל באחד", "all-in-one"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:aio|אול אין וואן|imac|איימק|הכל באחד|all-in-one)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "series", "screenSize", "cpu", "gpu", "ram", "storage", "os"],
    uniqueKeys: ["sku", "brand", "modelName", "screenSize"],
  },
  CUSTOM_COMPUTERS: {
    code: "CUSTOM_COMPUTERS",
    prismaModel: "customBuildCatalog",
    nlpKeywords: ["מחשב בהרכבה", "custom pc", "pc build"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:הרכבה|custom pc)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["category", "subCategory", "typicalCpu", "typicalGpu", "motherboard", "powerSupply", "caseType"],
    uniqueKeys: ["category", "subCategory"],
  },
  MOTHERBOARDS: {
    code: "MOTHERBOARDS",
    prismaModel: "motherboardCatalog",
    nlpKeywords: ["motherboard", "לוח אם"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:לוח אם|motherboard)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "chipset", "socket", "formFactor", "ramType", "maxRam", "pcie", "m2", "lan", "wifi"],
    uniqueKeys: ["brand", "model"],
  },
  GPUS: {
    code: "GPUS",
    prismaModel: "gpuCatalog",
    nlpKeywords: ["gpu", "graphics card", "video card", "כרטיס מסך"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:כרטיס מסך|gpu|graphics card|video card)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "model", "chipsetBrand", "vramSize", "vramType", "interface", "powerConnectors", "recommendedPsu", "length"],
    uniqueKeys: ["brand", "model"],
  },
  SCREENS: {
    code: "SCREENS",
    prismaModel: "screenCatalog",
    nlpKeywords: ["screen", "monitor", "display", "מסך", "מוניטור"],
    regex: /(?:^|[^a-zA-Z0-9א-ת])[הבלמכוש]?(?:מסך|מוניטור|screen|monitor|display)(?![a-zA-Z0-9א-ת])/i,
    learnFields: ["brand", "model", "size", "resolution", "refreshRate", "panelType", "aspectRatio", "curved", "ports"],
    uniqueKeys: ["brand", "model"],
  }
};

let cachedRegistry: Record<string, CategoryRegistryEntry> | null = null;
let lastCacheTime = 0;

export async function getCategoryRegistry(forceRefresh = false): Promise<Record<string, CategoryRegistryEntry>> {
    const now = Date.now();
    
    // Cache for 60 seconds (prevents DB hammering on active systems)
    if (!forceRefresh && cachedRegistry && (now - lastCacheTime < 60000)) {
        return cachedRegistry;
    }

    try {
        const dynamicCategories = await prismadb.dynamicCategory.findMany({
            where: { isActive: true }
        });

        const newRegistry = { ...BaseCategoryRegistry };

        for (const gc of dynamicCategories) {
            newRegistry[gc.code] = {
                code: gc.code,
                nameHebrew: gc.nameHebrew,
                prismaModel: gc.prismaModel || "electronicsCatalog", 
                nlpKeywords: gc.nlpKeywords || [],
                regex: new RegExp(gc.regex || gc.code, "i"),
                learnFields: gc.learnFields || [],
                uniqueKeys: gc.uniqueKeys || [],
                translationMap: gc.translationMap ? (gc.translationMap as any) : {}
            };
        }

        cachedRegistry = newRegistry;
        lastCacheTime = now;
        return newRegistry;
    } catch (e) {
        console.error("[CategoryRegistry] Failed to load dynamic categories from DB", e);
        return BaseCategoryRegistry; // Graceful fallback
    }
}
