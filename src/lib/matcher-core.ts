import prismadb from "@/lib/prismadb";
import Fuse from "fuse.js";
// @ts-ignore
import { getEnhancedNlp } from "./nlp-dictionary";
import { normalizeHebrewLight } from "./hebrew-normalizer";

// Configuration for Efficiency (Vercel Latency Prevention)
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export type CategoryKey = 
  | "LAPTOPS"
  | "MOBILES"
  | "VEHICLES"
  | "APPLIANCES"
  | "ELECTRONICS"
  | "DESKTOPS"
  | "MOTHERBOARDS"
  | "UNKNOWN";

interface CacheEntry {
  data: any[];
  timestamp: number;
}

// In-Memory Cache (Fast Responses in Vercel Edge / Serverless)
const catalogCache: Map<CategoryKey, CacheEntry> = new Map();

/**
 * Detects the category of a query using compromise NLP and heuristic fallbacks.
 */
export async function detectCategory(query: string): Promise<CategoryKey> {
  const nlp = await getEnhancedNlp();
  // Hebrew normalization runs first to fix prefix/morphology issues for compromise NLP
  const normalizedQuery = normalizeHebrewLight(query);
  const doc = nlp(normalizedQuery);
  const text = normalizedQuery;

  // Basic Heuristics + NLP using compromise
  if (doc.has('(laptop|laptops|מחשב נייד|נייד|macbook|thinkpad)')) return "LAPTOPS";
  if (doc.has('(mobile|phone|smartphone|טלפון|סלולר|סמארטפון|iphone|galaxy)')) return "MOBILES";
  if (doc.has('(car|vehicle|רכב|מכונית|jeep|sedan)')) return "VEHICLES";
  if (doc.has('(appliance|fridge|washing machine|מקרר|מכונת כביסה|מזגן|ac)')) return "APPLIANCES";
  if (doc.has('(tv|smartwatch|headphones|טלויזיה|אוזניות|שעון חכם)')) return "ELECTRONICS";
  if (doc.has('(desktop|pc|מחשב נייח|מחשב|aio)')) return "DESKTOPS";

  // Fallback Regex for Hebrew terminology (NLP sometimes misses right-to-left complexity)
  if (/מחשב נייד|לפטופ|נייד|macbook/i.test(text)) return "LAPTOPS";
  if (/טלפון|סלולרי|אייפון|גלקסי|iphone|galaxy|smartphone/i.test(text)) return "MOBILES";
  if (/רכב|מכונית|רכבים|אוטו/i.test(text)) return "VEHICLES";
  if (/מקרר|מזגן|כביסה|תנור/i.test(text)) return "APPLIANCES";
  if (/מסך|אוזניות|טלוויזיה|שעון/i.test(text)) return "ELECTRONICS";
  if (/מחשב נייח|פיסי|pc/i.test(text)) return "DESKTOPS";

  // As a generic fallback, default to unknown instead of fetching 10,000s of rows
  return "UNKNOWN";
}

/**
 * Loads data dynamically from Prisma DB based on the category using TTL strategy.
 */
async function loadCategoryData(category: CategoryKey): Promise<any[]> {
  const now = Date.now();
  const cached = catalogCache.get(category);

  // Return cached result to prevent Prisma latency on repeated requests
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  let data: any[] = [];
  try {
    switch (category) {
      case "LAPTOPS":
        data = await prismadb.laptopCatalog.findMany();
        break;
      case "MOBILES":
        data = await prismadb.mobileCatalog.findMany();
        break;
      case "VEHICLES":
        data = await prismadb.vehicleCatalog.findMany();
        break;
      case "APPLIANCES":
        data = await prismadb.applianceCatalog.findMany();
        break;
      case "ELECTRONICS":
        data = await prismadb.electronicsCatalog.findMany();
        break;
      case "DESKTOPS":
        const [brandDesktops, aioDesktops] = await Promise.all([
          prismadb.brandDesktopCatalog.findMany(),
          prismadb.aioCatalog.findMany()
        ]);
        data = [...brandDesktops, ...aioDesktops];
        break;
      case "MOTHERBOARDS":
        data = await prismadb.motherboardCatalog.findMany();
        break;
      case "UNKNOWN":
      default:
        return [];
    }
  } catch (error) {
    console.error(`[SmartMatcher] Architecture Issue: Failed to load ${category}`, error);
    return cached ? cached.data : []; // Stale fallback pattern
  }

  // Pre-process data for fuse to allow translation search (e.g. לנובו matches Lenovo)
  const translationMap: Record<string, string[]> = {
    // Laptops
    "Lenovo": ["לנובו"],
    "Dell": ["דל"],
    "Apple": ["אפל", "אייפון", "iPhone", "MacBook", "מקבוק"],
    "Asus": ["אסוס"],
    "HP": ["אייצ' פי", "אייץ פי", "HP"],
    // Mobiles
    "Samsung": ["סמסונג", "גלקסי", "Galaxy"],
    "Xiaomi": ["שיאומי"],
    "Google": ["גוגל"],
    "OnePlus": ["וואן פלוס", "ואן פלוס"]
  };

  const enhancedData = data.map((item) => {
    let hebrewAliases = item.hebrewAliases || [];
    if (item.brand && translationMap[item.brand]) {
        hebrewAliases = [...hebrewAliases, ...translationMap[item.brand]];
    }
    return { ...item, hebrewAliases };
  });

  // Overwrite cache (Real-Time freshness bounding limit hit)
  catalogCache.set(category, { data: enhancedData, timestamp: now });
  return enhancedData;
}

/**
 * Loads DB data dynamically WITH pre-filtering to prevent Vercel OOM & Latency on huge catalogs.
 * Used when the AI has already extracted hard specs (Brand, Model, etc).
 */
async function loadFilteredCategoryData(category: CategoryKey, dbWhere: any): Promise<any[]> {
  let data: any[] = [];
  try {
    switch (category) {
      case "LAPTOPS":
        data = await prismadb.laptopCatalog.findMany({ where: dbWhere });
        break;
      case "MOBILES":
        data = await prismadb.mobileCatalog.findMany({ where: dbWhere });
        break;
      case "VEHICLES":
        data = await prismadb.vehicleCatalog.findMany({ where: dbWhere });
        break;
      case "APPLIANCES":
        data = await prismadb.applianceCatalog.findMany({ where: dbWhere });
        break;
      case "ELECTRONICS":
        data = await prismadb.electronicsCatalog.findMany({ where: dbWhere });
        break;
      case "DESKTOPS":
        const [brandDesktops, aioDesktops] = await Promise.all([
          prismadb.brandDesktopCatalog.findMany({ where: dbWhere }),
          prismadb.aioCatalog.findMany({ where: dbWhere })
        ]);
        data = [...brandDesktops, ...aioDesktops];
        break;
      case "MOTHERBOARDS":
        data = await prismadb.motherboardCatalog.findMany({ where: dbWhere });
        break;
      case "UNKNOWN":
      default:
        return [];
    }
  } catch (error) {
    console.error(`[SmartMatcher] Architecture Issue: Failed to load filtered ${category}`, error);
    return []; 
  }

  // Pre-process data for fuse to allow translation search (e.g. לנובו matches Lenovo)
  const translationMap: Record<string, string[]> = {
    "Lenovo": ["לנובו"], "Dell": ["דל"], "Apple": ["אפל", "אייפון", "iPhone", "MacBook", "מקבוק"],
    "Asus": ["אסוס"], "HP": ["אייצ' פי", "אייץ פי", "HP"],
    "Samsung": ["סמסונג", "גלקסי", "Galaxy"], "Xiaomi": ["שיאומי"],
    "Google": ["גוגל"], "OnePlus": ["וואן פלוס", "ואן פלוס"]
  };

  const enhancedData = data.map((item) => {
    let hebrewAliases = item.hebrewAliases || [];
    if (item.brand && translationMap[item.brand]) {
        hebrewAliases = [...hebrewAliases, ...translationMap[item.brand]];
    }
    return { ...item, hebrewAliases };
  });

  return enhancedData;
}

export interface MatchResult {
  score: number;
  item: any;
  matchedCategory: CategoryKey;
  extractedSpecs: any;
}

/**
 * Main Generic Matcher Method utilizing the complete protocol chain:
 * Pipeline A (Global): UserCorrection -> NLP Routing -> Table Isolation -> Prefix Search -> Extraction
 * Pipeline B (Targeted): Table Isolation -> Prefix Search -> Extraction
 */
export async function smartMatch(
  query: string, 
  limit: number = 5, 
  targetCategory?: CategoryKey,
  pipelineContext: 'EXTRACTION' | 'RANKING' = 'RANKING'
): Promise<MatchResult[]> {
  if (!query) return [];

  const now = Date.now();
  let activeQuery = query;

  // 1. Learning (UserCorrection) - Check historically cached corrections
  try {
    const correctionsContext = await prismadb.userCorrection.findMany({
      where: { originalText: { contains: query, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      take: 1
    });

    if (correctionsContext.length > 0) {
      const correction = correctionsContext[0];
      const correctedData: any = correction.correctedData;
      // If user indicated a different query or specific category, adapt
      if (correctedData?.searchQuery) {
        activeQuery = correctedData.searchQuery;
      }
    }
  } catch (error) {
    console.error("[SmartMatcher] Failed to fetch UserCorrection", error);
  }

  // 2 & 3. Routing (Natural/Compromise NLP) & Table Isolation
  let category: CategoryKey = targetCategory || "UNKNOWN";
  
  if (!targetCategory) {
      console.log("[SmartMatcher] Pipeline A (Global): Running NLP Classification...");
      category = await detectCategory(activeQuery);
  } else {
      console.log(`[SmartMatcher] Pipeline B (Targeted): Skipping NLP, locked to ${targetCategory}`);
  }

  // 4. Data Extraction using the Dynamic NLP Dictionary (Runs FIRST for Pre-Filtering)
  const nlp = await getEnhancedNlp();
  const normalizedQuery = normalizeHebrewLight(activeQuery);
  const doc = nlp(normalizedQuery.replace(/[,."]/g, ""));
  const extractedSpecs: Record<string, any> = {};
  
  const tagsArray = doc.out('tags');
  if (tagsArray && tagsArray.length > 0 && tagsArray[0]) {
      Object.keys(tagsArray[0]).forEach(word => {
          const wordTags: string[] = tagsArray[0][word];
          const valueTag = wordTags.find(t => t.endsWith('Value') && t !== 'Value');
          if (valueTag) {
              const fieldName = valueTag.replace('Value', '');
              if (!isNaN(Number(word))) {
                  extractedSpecs[fieldName] = Number(word);
              } else {
                  if (!extractedSpecs[fieldName]) {
                      extractedSpecs[fieldName] = word;
                  } else {
                      extractedSpecs[fieldName] += ` ${word}`;
                  }
              }
          }
      });
  }
  console.log(`[SmartMatcher] Extracted Specs FIRST:`, extractedSpecs);

  // 5. Build Pre-Filter Clause for Database (Performance Optimization)
  const dbWhere: any = {};
  const brandVal = extractedSpecs.brand || extractedSpecs.manufacturer || extractedSpecs.company;
  if (brandVal) {
      // Create an OR logic in case DB has English and query has Hebrew alias
      const hebrewAliasesMap: Record<string, string[]> = {
         "אסוס": ["Asus", "אסוס"], "לנובו": ["Lenovo", "לנובו"], "דל": ["Dell", "דל"], 
         "אפל": ["Apple", "אפל", "MacBook"], "אייפון": ["Apple", "iPhone", "אייפון"],
         "סמסונג": ["Samsung", "סמסונג", "Galaxy"]
      };
      
      const aliases = hebrewAliasesMap[brandVal] || [brandVal];
      if (aliases.length > 1) {
         dbWhere.brand = { in: aliases, mode: 'insensitive' };
      } else {
         dbWhere.brand = { contains: String(brandVal), mode: 'insensitive' };
      }
  }

  const isPreFiltered = Object.keys(dbWhere).length > 0;

  // 6. Data Fetching Strategy (Filtered DB vs Full Cache)
  let datasets: any[] = [];
  if (category !== "UNKNOWN") {
      if (isPreFiltered) {
          console.log(`[SmartMatcher] 🚀 PRE-FILTER ACTIVE DB QUERY. Bypassing Cache for speed:`, dbWhere);
          datasets = await loadFilteredCategoryData(category, dbWhere);
          // Fallback to cache if 0 results despite filters
          if (datasets.length === 0) {
              console.log(`[SmartMatcher] ⚠️ Pre-Filter yielded 0 results, falling back to full cached load.`);
              datasets = await loadCategoryData(category);
          }
      } else {
          console.log(`[SmartMatcher] 🐢 FULL LOAD (Cached) for ${category}. No strict filters found.`);
          datasets = await loadCategoryData(category);
      }
  } else {
      datasets = await loadCategoryData("MOBILES");
  }

  console.log(`[SmartMatcher] Loaded ${datasets.length} items for category ${category}`);

  // 7. Prefix/ABC Search (fuse.js) on the reduced dataset
  const config = require("../config/matcher-config.json");
  const fuseWeights = pipelineContext === 'EXTRACTION' ? config.extractionWeights : config.rankingWeights;
  
  const keysToSearch = Object.keys(fuseWeights).map(key => ({
    name: key,
    weight: fuseWeights[key]
  }));

  const fuseOptions = {
    keys: keysToSearch,
    threshold: 0.6, 
    includeScore: true,
    ignoreLocation: true, 
  };
  const fuse = new Fuse(datasets, fuseOptions);

  let searchTerms = activeQuery
    .replace(/מחפש|עם|את/g, '')
    .trim();
  
  console.log(`[SmartMatcher] Fuse dynamically searching for: "${searchTerms}"`);
  
  let results = fuse.search(searchTerms); 
  console.log(`[SmartMatcher] Fuse found ${results.length} matches before hard filtering.`);

  // ==== HARD FILTERING (The Agent's Guarantee) ====
  // If the user specified a HARD spec like RAM or a phone generation, filter out what does not match.
  if (extractedSpecs.ram) {
      results = results.filter(r => {
        const itemRam = r.item.ram;
        if (!itemRam) return true; // If we don't know the RAM, keep it just in case
        const ramStr = Array.isArray(itemRam) ? itemRam.join(" ") : String(itemRam);
        return ramStr.includes(String(extractedSpecs.ram));
      });
  }

  if (extractedSpecs.modelNumber || extractedSpecs.model) {
    const targetModel = String(extractedSpecs.modelNumber || extractedSpecs.model).toLowerCase();
    results = results.filter(r => {
      const mn = (r.item.modelName || "").toLowerCase();
      // אכיפה מדויקת למודל אם נמצא ע"י המילון
      return mn.includes(targetModel);
    });
  }

  // Ensure results are sorted by score before returning
  results.sort((a, b) => (a.score || 0) - (b.score || 0));

  return results.slice(0, limit).map((r) => ({
    score: r.score as number,
    item: r.item,
    matchedCategory: category,
    extractedSpecs
  }));
}

