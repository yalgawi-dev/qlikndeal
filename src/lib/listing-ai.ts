export interface ListingAnalysis {
    title: string;
    price: number | null;
    originalPrice: number | null;
    currency: string;
    priceNegotiable: boolean;
    category: string;
    subCategory: string;
    condition: string;
    conditionDetails: string | null;
    attributes: { key: string; value: string; unit?: string }[];
    location: string | null;
    deliveryAvailable: boolean;
    deliveryCost: string | null;
    contactInfo: string | null;
    missingFields: string[];
    confidence: number;
    warning?: string; // Kept for compatibility if used
    make?: string;
    model?: string; // New field for specific car model (e.g. "Corolla", "CHR")
    description?: string;
}

// --- Interface for Dynamic Knowledge ---
export interface AiOptions {
    knowledgeBase?: {
        blocked_price_patterns?: string[];
        brand_mappings?: Record<string, string>;
        highlight_keywords?: string[];
    }
}

// ============================================================
// SPOKEN HEBREW NORMALIZATION
// Converts voice-transcribed text into machine-readable format
// e.g. "מאה חמישים ואחת אלף שקל" → "151000 ₪"
// ============================================================

const MONTH_MAP: Record<string, string> = {
    "ינואר": "01", "פברואר": "02", "מרץ": "03", "אפריל": "04",
    "מאי": "05", "יוני": "06", "יולי": "07", "אוגוסט": "08",
    "ספטמבר": "09", "אוקטובר": "10", "נובמבר": "11", "דצמבר": "12"
};

const ORDINAL_MAP: Record<string, string> = {
    "ראשון": "1", "ראשונה": "1", "שני": "2", "שנייה": "2", "שניה": "2",
    "שלישי": "3", "שלישית": "3", "רביעי": "4", "רביעית": "4",
    "חמישי": "5", "חמישית": "5", "שישי": "6", "שישית": "6",
    "שביעי": "7", "שביעית": "7", "שמיני": "8", "שמינית": "8",
    "תשיעי": "9", "תשיעית": "9", "עשירי": "10", "עשירית": "10"
};

// Converts a spoken Hebrew number phrase to an integer
// Handles: "מאתיים חמישים ואחד", "שלשת אלפים", "מאה וחמישים", etc.
function hebrewWordsToNumber(phrase: string): number | null {
    const ones: Record<string, number> = {
        "אחד": 1, "אחת": 1, "שניים": 2, "שתיים": 2, "שנים": 2, "שתים": 2,
        "שלשה": 3, "שלש": 3, "שלוש": 3, "ארבעה": 4, "ארבע": 4,
        "חמישה": 5, "חמש": 5, "ששה": 6, "שש": 6, "שבעה": 7, "שבע": 7,
        "שמונה": 8, "תשעה": 9, "תשע": 9, "עשרה": 10, "עשר": 10,
        "אחד עשר": 11, "אחת עשרה": 11, "שנים עשר": 12, "שתים עשרה": 12,
        "שלשה עשר": 13, "שלש עשרה": 13, "ארבעה עשר": 14, "ארבע עשרה": 14,
        "חמישה עשר": 15, "חמש עשרה": 15, "שישה עשר": 16, "שש עשרה": 16,
        "שבעה עשר": 17, "שבע עשרה": 17, "שמונה עשר": 18, "שמונה עשרה": 18,
        "תשעה עשר": 19, "תשע עשרה": 19
    };
    const tens: Record<string, number> = {
        "עשרים": 20, "שלשים": 30, "ארבעים": 40, "חמישים": 50,
        "שישים": 60, "שבעים": 70, "שמונים": 80, "תשעים": 90
    };
    const hundreds: Record<string, number> = {
        "מאה": 100, "מאתיים": 200, "שלש מאות": 300, "ארבע מאות": 400,
        "חמש מאות": 500, "שש מאות": 600, "שבע מאות": 700,
        "שמונה מאות": 800, "תשע מאות": 900
    };
    const thousands: Record<string, number> = {
        "אלף": 1000, "אלפיים": 2000, "שלשת אלפים": 3000, "ארבעת אלפים": 4000,
        "חמשת אלפים": 5000, "ששת אלפים": 6000, "שבעת אלפים": 7000,
        "שמונת אלפים": 8000, "תשעת אלפים": 9000
    };

    let p = phrase.trim().toLowerCase();
    p = p.replace(/\bו\b/g, " ").replace(/\s+/g, " ").trim(); // remove "ו" connectors

    let total = 0;
    // Try thousands
    for (const [k, v] of Object.entries(thousands)) {
        if (p.includes(k)) { total += v; p = p.replace(k, "").trim(); break; }
    }
    // Digit-based thousands: "N אלף"
    const nThousand = p.match(/(\d+)\s*אלף/);
    if (nThousand) { total += parseInt(nThousand[1]) * 1000; p = p.replace(nThousand[0], "").trim(); }

    for (const [k, v] of Object.entries(hundreds)) {
        if (p.includes(k)) { total += v; p = p.replace(k, "").trim(); break; }
    }
    for (const [k, v] of Object.entries(tens)) {
        if (p.includes(k)) { total += v; p = p.replace(k, "").trim(); break; }
    }
    for (const [k, v] of Object.entries(ones)) {
        if (p.includes(k)) { total += v; p = p.replace(k, "").trim(); break; }
    }
    return total > 0 ? total : null;
}

export function normalizeSpokenText(text: string): string {
    let t = text;

    // ── STEP 0: Normalize Hebrew geresh/apostrophe variants ──────────────────
    // Voice/STT often inserts ' (geresh) inside Hebrew words.
    // This MUST run first before any storage/unit detection.
    // Examples: "ג'יגה" → "גיגה", "ט'רה" → "טרה", "ג'יגה בייט" → "גיגה"
    t = t.replace(/ג['׳ʼ`]יגה/gi, "גיגה");      // ג'יגה → גיגה
    t = t.replace(/ט['׳ʼ`]רה/gi, "טרה");         // ט'רה → טרה
    t = t.replace(/מ['׳ʼ`]גה/gi, "מגה");         // מ'גה → מגה
    t = t.replace(/ק['׳ʼ`]מ/gi, 'ק"מ');          // ק'מ → ק"מ
    t = t.replace(/כ['׳ʼ`]ס/gi, 'כ"ס');          // כ'ס → כ"ס (כוח סוס)
    t = t.replace(/ס['׳ʼ`]מ/gi, 'ס"מ');          // ס'מ → ס"מ
    t = t.replace(/מ['׳ʼ`]ר/gi, 'מ"ר');          // מ'ר → מ"ר

    // 1. Month names → numeric dates
    // Pass A: "05 חודש מאי 2026" → "05/2026" (use existing numeric prefix, discard name)
    const monthNamesPattern = Object.keys(MONTH_MAP).join("|");
    t = t.replace(
        new RegExp(`\\b(0?[1-9]|1[0-2])\\s+(?:חודש\\s+)?(?:${monthNamesPattern})\\s+(20\\d{2})\\b`, "gi"),
        "$1/$2"
    );
    // Pass B: "חודש מאי 2026" or "מאי 2026" → "05/2026" (no prior numeric)
    for (const [name, num] of Object.entries(MONTH_MAP)) {
        t = t.replace(new RegExp(`(?:חודש\\s*)?${name}\\s+(20\\d{2})`, "gi"), `${num}/$1`);
    }

    // 2. "N אלף" number combinations → digits (for price and km)
    // "מאה וחמישים ואחד אלף" → complex (too hard to parse inline)
    // But handle "N אלף" patterns inline (digit N already done by regex rules)

    // 3. Currency spoken forms → symbol equivalents
    // Support standard quote, single quote x2, and double geresh (U+05F4)
    t = t.replace(/(\d[\d,]*)\s*(?:שקל(?:ים)?|שקלים|ש["״]ח|ש''ח|ש'ח)\b/gi, "$1 ₪");

    // 3b. Smart storage number correction BEFORE unit conversion
    // e.g. "56 גיגה" (voice for "256") → "256 גיגה"
    {
        const detectedPhone = findPhoneModel(t);
        t = t.replace(/(\d{2,4})\s*(גיגה(?:\s*(?:בייט|בית))?|טרה(?:\s*(?:בייט|בית))?|GB|TB)(?=\s|$|[^\d])/gi,
            (match, numStr, unit) => {
                const n = parseInt(numStr);
                if (KNOWN_STORAGE_SIZES.includes(n)) return match;
                const corrected = correctStorageSize(n, detectedPhone);
                return corrected !== n ? `${corrected} ${unit.trim()}` : match;
            }
        );
    }

    // 4. Storage units spoken → standard (runs AFTER number correction above)
    t = t.replace(/(\d+)\s*גיגה\s*(?:בייט|בית)?/gi, "$1 GB");
    t = t.replace(/(\d+)\s*טרה\s*(?:בייט|בית)?/gi, "$1 TB");
    t = t.replace(/(\d+)\s*מגה\s*(?:בייט|בית)?/gi, "$1 MB");

    // 5. Watt/Amp spoken → standard
    t = t.replace(/(\d+)\s*(?:ואט|וואט)\b/gi, "$1 W");
    t = t.replace(/(\d+)\s*(?:אמפר|אמפרים)\b/gi, "$1 A");

    // 6. Horsepower spoken → standard
    t = t.replace(/(\d+)\s*(?:כוח\s*סוס|כוחות\s*סוס|HP)\b/gi, "$1 כ\"ס");

    // 7. Screen size spoken
    t = t.replace(/(\d+(?:\.\d+)?)\s*(?:אינץ|אינצ|אינצ')\b/gi, `$1"`);

    // 8. Km spoken variations → compact form
    t = t.replace(/(\d+)\s*(?:אלף|k)\s*(?:קילומטר(?:ים)?|קמ)\b/gi, (_, n) => `${parseInt(n) * 1000} ק"מ`);

    // 9. Engine size spoken "אחד פוינט שמונה" is too complex, but handle "1.8 ליטר"
    t = t.replace(/(\d+(?:\.\d+)?)\s*ליטר\b/gi, "$1 ל'");

    // 10. Grade / Stage spoken forms
    t = t.replace(/(?:stage|סטייג|שלב)\s*(שני[יה]?|שתיים?|2)\b/gi, "Stage 2");
    t = t.replace(/(?:stage|סטייג|שלב)\s*(ראשון[הא]?|אחד|1)\b/gi, "Stage 1");
    t = t.replace(/(?:stage|סטייג|שלב)\s*(שלישי[ת]?|שלש|3)\b/gi, "Stage 3");

    // 11. Condition spoken → standard
    t = t.replace(/\b(?:מצב\s*)?(?:ממש\s*)?(?:טוב\s*)?מאד(?:מאוד)?\b/gi, "מצב טוב");
    t = t.replace(/\bכמו\s*חדש(?:ה)?\b/gi, "כמו חדש");

    // 12. Ordinal hand numbers → digit ("יד שישית" already handled by regex, but normalize for display)
    for (const [word, num] of Object.entries(ORDINAL_MAP)) {
        t = t.replace(new RegExp(`(?<=(?:יד|hand)\\s*)${word}\\b`, "gi"), num);
    }

    // 12b. Fix double-יד from STT ("יד 0 יד שניה" → "יד שניה"):
    // When "יד N יד X" appears, keep only the second occurrence (more specific)
    t = t.replace(/(?:יד\s*\d+\s+)(יד\s*\S+)/gi, "$1");

    // 13. Rooms spoken "ארבעה חדרים" → "4 חדרים"
    const roomWords: Record<string, string> = {
        "חדר אחד": "1", "חדר אחת": "1", "שני חדרים": "2", "שתי חדרים": "2",
        "שלשה חדרים": "3", "שלש חדרים": "3", "ארבעה חדרים": "4", "ארבע חדרים": "4",
        "חמישה חדרים": "5", "חמש חדרים": "5", "ששה חדרים": "6", "שש חדרים": "6"
    };
    for (const [word, num] of Object.entries(roomWords)) {
        t = t.replace(new RegExp(word, "gi"), `${num} חדרים`);
    }

    // 14. Square meters spoken "שמונים מטר רבוע" → "80 מ\"ר"
    // Already handled by regex, but add spoken-friendly phrases
    t = t.replace(/(\d+)\s*מטר\s*(?:וחצי\s*)?רבוע(?:ים)?/gi, `$1 מ"ר`);

    // 15. Floor spoken "קומה שלישית" → "קומה 3"
    for (const [word, num] of Object.entries(ORDINAL_MAP)) {
        t = t.replace(new RegExp(`(?<=קומה\\s*)${word}\\b`, "gi"), num);
    }

    // 15b. TV screen size correction: "5 אינץ" (spoken "חמישים וחמש") → common misparse
    // "טלוויזיה 5 אינץ" → "טלוויזיה 55 אינץ" (suffix match)
    if (/טלוויזיה|טלויזיה|TV|OLED|QLED|QLed/i.test(t)) {
        t = t.replace(/\b(\d{1,2})\s*(?:אינץ|אינצ'|inch|")/gi, (match, numStr) => {
            const n = parseInt(numStr);
            if (KNOWN_TV_SIZES.includes(n)) return match;
            const corrected = correctTVSize(n);
            return corrected !== n ? `${corrected}"` : match;
        });
    }

    // 15c. AC capacity: "9 BTU" → "9000 BTU", "12 BTU" → "12000 BTU"
    t = t.replace(/\b(\d{1,2})\s*(?:BTU|בי.?טי.?יו)\b/gi, (match, numStr) => {
        const n = parseInt(numStr) * 1000;
        if (KNOWN_AC_BTU.includes(n)) return `${n} BTU`;
        return match;
    });

    // 15d. Washing machine capacity: "9 קג" / "9 ק"ג" → known sizes
    // Already handled by regex, but validate range


    // 17. Popular product name normalization (voice → standard written form)
    // Samsung Galaxy models
    t = t.replace(/\b(?:גלקסי|גאלקסי|galaxy)\s*(?:אס|s)\s*(\d{1,2})\s*(אולטרה|ultra|פלוס|plus|fe|FE)?\b/gi,
        (_, model, suffix) => `Samsung Galaxy S${model}${suffix ? ' ' + suffix.replace(/אולטרה/gi, 'Ultra').replace(/פלוס/gi, 'Plus') : ''}`);
    t = t.replace(/\b(?:גלקסי|גאלקסי|galaxy)\s*(?:איי|a)\s*(\d{1,2})\b/gi, (_, model) => `Samsung Galaxy A${model}`);
    t = t.replace(/\b(?:גלקסי|גאלקסי|galaxy)\s*(?:זי|z)\s*(פולד|fold|פליפ|flip)\s*(\d+)?\b/gi,
        (_, type, num) => `Samsung Galaxy Z ${type.replace(/פולד/gi, 'Fold').replace(/פליפ/gi, 'Flip')}${num ? ' ' + num : ''}`);
    // iPhone models
    t = t.replace(/\b(?:אי\s*פון|אייפון|iphone)\s*(\d{1,2})\s*(פרו\s*מקס|pro\s*max|פרו|pro|פלוס|plus|מיני|mini)?\b/gi,
        (_, model, suffix) => `iPhone ${model}${suffix ? ' ' + suffix.replace(/פרו מקס/gi, 'Pro Max').replace(/פרו/gi, 'Pro').replace(/פלוס/gi, 'Plus').replace(/מיני/gi, 'Mini') : ''}`);
    // iPad
    t = t.replace(/\b(?:אייפד|ipad)\s*(פרו|pro|אייר|air|מיני|mini)?\s*(\d*)?\b/gi,
        (_, variant, gen) => `iPad${variant ? ' ' + variant.replace(/פרו/gi, 'Pro').replace(/אייר/gi, 'Air').replace(/מיני/gi, 'Mini') : ''}${gen ? ' ' + gen : ''}`);
    // AirPods
    t = t.replace(/\b(?:אייר\s*פודס|airpods)\s*(פרו|pro|מקס|max)?\b/gi,
        (_, variant) => `AirPods${variant ? ' ' + variant.replace(/פרו/gi, 'Pro').replace(/מקס/gi, 'Max') : ''}`);

    // 18. Common model/spec numbers: "אס 24" → "S24", "אי פון 14" → "iPhone 14"
    t = t.replace(/\b(?:אס)\s*(\d{1,2})\b/gi, "S$1");
    t = t.replace(/\b(?:אי\s*10|i10)\b/gi, "i10");

    return t;
}


import { CAR_MODELS } from "./car-data";
import { findPhoneModel, correctStorageSize, KNOWN_STORAGE_SIZES } from "./phone-data";
import { correctTVSize, KNOWN_TV_SIZES, KNOWN_AC_BTU, KNOWN_WASHER_SIZES_KG } from "./electronics-data";
import { findMarketplaceProduct } from "./marketplace-data";


// --- Main Analyzer Function ---
export function analyzeListingText(text: string, options?: AiOptions): ListingAnalysis {
    // Clean text: remove emojis, extra spaces, multiple newlines
    let clean = text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    // Normalize spoken/voice text to written equivalents
    clean = normalizeSpokenText(clean);


    // 1. Extract Price
    const { price, originalPrice, negotiable } = extractPrice(clean, options);

    // 2. Identify Category
    const { category, subCategory } = detectCategory(clean);

    // 3. Extract Attributes
    const attributes = extractAttributes(clean);
    const highlights = extractHighlights(clean, options);
    // Add highlights to attributes
    if (highlights.length > 0) {
        highlights.forEach(h => {
            attributes.push({ key: "דגשים", value: h });
        });
    }

    const { condition, conditionDetails } = detectCondition(clean);
    const contactInfo = extractContact(clean);
    const { available: deliveryAvailable, cost: deliveryCost } = extractDelivery(clean);
    const location = extractLocation(clean);

    const missing: string[] = [];
    if (!price) missing.push("מחיר");
    if (!contactInfo) missing.push("פרטי יצירת קשר");
    if (!location) missing.push("מיקום");

    // Extended recommendations based on User feedback
    const requiredByCategory: Record<string, string[]> = {
        "טלפונים": ["נפח אחסון", "מצב סוללה", "שנת ייצור"],
        "מחשבים": ["RAM", "נפח אחסון", "מעבד", "שנת ייצור"],
        "אלקטרוניקה": ["גודל מסך", "שנת ייצור"],
        "רכב": ["שנת ייצור", "קילומטראז'", "סוג דלק", "יד", "טסט עד"],
        "ריהוט": ["מידות", "צבע", "חומר"],
        "נדלן": ["מטראז'", "חדרים", "קומה"],
        "ביגוד ואופנה": ["מידה", "צבע", "מותג"],
        "כלי נגינה": ["מצב"],
        "ספורט ופנאי": ["מצב"],
        "בית וגינה": ["מצב"],
        "תינוקות וילדים": ["מצב", "גיל מומלץ"],
        "חיות מחמד": ["מצב"],
        "כלי עבודה ומוסך": ["מצב"],
        "בריאות וקוסמטיקה": ["מצב"],
    };

    const foundKeys = new Set(attributes.map((a) => a.key));
    for (const req of requiredByCategory[category] || []) {
        // Special fuzzy check for kilometrage due to apostrophe variations
        if (req === "קילומטראז'") {
            const hasKm = attributes.some(a => a.key.includes("קילומטר"));
            if (!hasKm) missing.push(req);
        } else if (!foundKeys.has(req)) {
            missing.push(req);
        }
    }

    let confidence = 0.3;
    if (price) confidence += 0.2;
    if (category !== "כללי") confidence += 0.15;
    if (attributes.length >= 3) confidence += 0.15;
    else if (attributes.length > 0) confidence += 0.08;
    if (contactInfo) confidence += 0.1;
    confidence -= missing.length * 0.03;
    confidence = Math.max(0.1, Math.min(1, confidence));

    // Smart Title Generation
    // Try to build a title from: SubCategory/Category + Brand (from keywords) + Year + Key Attributes
    let smartTitle = "";
    let foundBrand = "";
    let foundMake = "";
    let foundModel = ""; // New: Extracted specific model

    // Blocklist for generic words that should NOT be detected as the 'Brand' or 'Make'
    const BRAND_BLOCKLIST = [
        "קילומטר", "קמ", "ק\"מ", "טסט", "ידני", "אוטומט", "דיזל", "בנזין", "היברידי", "חשמלי", "אופנוע", "קטנוע",
        "למכירה", "למסירה", "דרוש", "מחפש", "חדש", "משומש", "תקין", "null", "undefined"
    ];

    if (CATEGORIES[category]) {
        for (const kw of CATEGORIES[category].keywords) {
            if (new RegExp(kw, "i").test(clean)) {
                if (BRAND_BLOCKLIST.some(blocked => kw.toLowerCase().includes(blocked) || blocked.includes(kw.toLowerCase()))) {
                    continue;
                }
                foundBrand = kw;
                if (category === "רכב") {
                    let canonicalBrand = "";
                    for (const brandKey of Object.keys(CAR_MODELS)) {
                        if (brandKey.includes(kw) || kw.includes(brandKey) || (["BMW", "BYD"].includes(kw) && brandKey === kw)) {
                            canonicalBrand = brandKey;
                            break;
                        }
                    }
                    foundMake = canonicalBrand || kw;
                    if (CAR_MODELS[foundMake]) {
                        for (const model of CAR_MODELS[foundMake]) {
                            const escapedModel = model.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                            if (new RegExp(`(?:^|[\\s,.-])${escapedModel}(?:$|[\\s,.-])`, "i").test(clean)) {
                                foundModel = model;
                                break;
                            }
                        }
                    }
                    if (!foundModel) {
                        const afterBrand = clean.substring(clean.indexOf(kw) + kw.length).trim();
                        const modelMatch = afterBrand.match(/^([a-zA-Z0-9]+|[\u05D0-\u05EA]+(?:\s+[\u05D0-\u05EA0-9]+)?)/);
                        if (modelMatch && modelMatch[1]) {
                            const potential = modelMatch[1].trim();
                            if (!['למכירה', 'חדש', 'משומש', 'שנת', 'יד', 'פרטית', 'מנוע', 'אוטומט', 'ידני', 'שמור'].includes(potential)) {
                                foundModel = potential;
                            }
                        }
                    }
                }
                break;
            }
        }
    }

    if (category === "רכב") {
        const year = attributes.find(a => a.key === "שנת ייצור")?.value || "";
        const hand = attributes.find(a => a.key === "יד")?.value;
        smartTitle = `${foundBrand} ${foundModel} ${year}`.trim();
        smartTitle = smartTitle.replace(/\s+/g, " ");
        if (!smartTitle && foundBrand) smartTitle = foundBrand;
        if (!smartTitle || smartTitle.length < 3 || /^\d+$/.test(smartTitle.trim())) {
            const firstLine = clean.split("\n")[0].substring(0, 30);
            smartTitle = firstLine;
        } else {
            if (hand && parseInt(hand) <= 2) smartTitle += ` (יד ${hand})`;
        }
    } else if (category === "נדלן") {
        const rooms = attributes.find(a => a.key === "חדרים")?.value;
        const city = location || "";
        smartTitle = `${subCategory || "דירה"} ${rooms ? rooms + " חדרים" : ""} ${city}`.trim();
    } else {
        if (foundBrand) {
            smartTitle = `${subCategory || category} ${foundBrand}`;
            const storage = attributes.find(a => a.key === "נפח אחסון")?.value;
            if (storage) smartTitle += ` ${storage}`;
        }
    }

    if (smartTitle.length < 5) {
        smartTitle = text.split("\n")[0].trim().substring(0, 100);
    }
    if (/^[a-z]/.test(smartTitle)) {
        smartTitle = smartTitle.charAt(0).toUpperCase() + smartTitle.slice(1);
    }

    return {
        title: smartTitle,
        price,
        originalPrice,
        currency: "ILS",
        priceNegotiable: negotiable,
        category,
        subCategory,
        condition,
        conditionDetails,
        attributes,
        location,
        deliveryAvailable,
        deliveryCost,
        contactInfo,
        missingFields: missing,
        confidence,
        warning: missing.includes("מחיר") ? "שים לב: לא מצאנו מחיר במודעה." : undefined,
        make: foundMake || undefined,
        model: foundModel || undefined
    };
}


function extractPrice(text: string, options?: AiOptions): {
    price: number | null;
    originalPrice: number | null;
    negotiable: boolean;
} {
    const negotiable = /גמיש|מחיר גמיש|לא סופי|פתוח להצעות|הנחה/.test(text);

    const notPricePatterns = [
        /\d{1,5}\s*(W|ואט|וואט)\b/gi,
        /\d{1,5}\s*(mAh|אמפר)\b/gi,
        /\d{1,5}\s*(GB|TB|MB|גיגה|טרה)\b/gi,
        /\d{1,3}\s*(אינץ|אינצ'|inch|")\b/gi,
        /\d{1,4}\s*(ס"מ|cm|מ'|מטר)\b/gi,
        /\d{1,4}\s*(ק"ג|קג|kg|גרם|gr)\b/gi,
        /\d{1,3}\s*(%)\s*(סוללה|battery|טעינה)/gi,
        /0[5-9]\d{8}/g,
        /(19|20)\d{2}/g,
        /\d+\s*x\s*\d+/gi,
        /\d{1,3}\s*(Hz|הרץ)/gi,
        /\d{1,3}\s*(MP|מגה\s*פיקסל)/gi,
        /\d{1,2}\s*(חדרים|חד')/gi,
        /(?:יד|hand)\s*[0-9]+/gi,
        // Prevent km numbers from being parsed as price
        /\d{2,7}\s*(?:קילומטר(?:ים)?|ק"מ|קמ|km|ק״מ)/gi,
        /(?:רק|בלבד|עברתי|נסעתי|עשיתי)\s*\d{2,7}/gi,
    ];

    const ignoredRanges: [number, number][] = [];

    // Dynamic patterns from knowledge base if provided
    const dynamicBlocked = (options?.knowledgeBase?.blocked_price_patterns || []).map((p: string) => new RegExp(p, "gi"));
    const allNotPricePatterns = [...notPricePatterns, ...dynamicBlocked];

    for (const pattern of allNotPricePatterns) {
        let match;
        const re = new RegExp(pattern.source, pattern.flags);
        while ((match = re.exec(text)) !== null) {
            ignoredRanges.push([match.index, match.index + match[0].length]);
        }
    }

    const isIgnored = (index: number) =>
        ignoredRanges.some(([start, end]) => index >= start && index < end);

    let originalPrice: number | null = null;
    // Helper to parse numbers with potential dots like 84.900 -> 84900, but 84.9 -> 84.9
    const parsePrice = (str: string) => {
        // Remove commas
        let clean = str.replace(/,/g, "");
        // If it looks like 84.900 (dot followed by 3 digits), treat dot as thousands
        if (/\d+\.\d{3}\b/.test(clean)) {
            clean = clean.replace(/\./g, "");
        }
        return parseInt(clean);
    };

    const originalPatterns = [
        /(?:עלה|עלתה|עלות|נקנה|נקנתה|שילמתי|במקור|מחיר\s*מקורי|מחירון|בחנות|קניתי\s*ב)[^\d]{0,5}(\d{1,3}[,.]?\d{3}|\d{2,7})/i,
        /(\d{1,3}[,.]?\d{3}|\d{2,7})\s*(?:₪|ש"ח|שח|שקל|שקלים|NIS)?\s*(?:במקור|בחנות|מחיר\s*קטלוגי)/i,
    ];
    for (const pattern of originalPatterns) {
        const match = text.match(pattern);
        if (match) {
            const idx = text.indexOf(match[1]);
            if (!isIgnored(idx)) {
                originalPrice = parsePrice(match[1]);
                break;
            }
        }
    }

    const strongPatterns = [
        /(\d{1,3}[,.]?\d{3}|\d{2,7})\s*₪/,
        /(\d{1,3}[,.]?\d{3}|\d{2,7})\s*ש["״]ח/,
        /(\d{1,3}[,.]?\d{3}|\d{2,7})\s*ש''ח/,
        /(\d{1,3}[,.]?\d{3}|\d{2,7})\s*שח(?:\s|$|,|\.)/,
        /(\d{1,3}[,.]?\d{3}|\d{2,7})\s*(?:שקל|שקלים|NIS)(?:\s|$|,|\.)/,
        /₪\s*(\d{1,3}[,.]?\d{3}|\d{2,7})/,
    ];
    for (const pattern of strongPatterns) {
        const match = text.match(pattern);
        if (match) {
            const idx = text.indexOf(match[1]);
            const candidate = parsePrice(match[1]);
            if (!isIgnored(idx) && candidate !== originalPrice && candidate > 0) {
                return { price: candidate, originalPrice, negotiable };
            }
        }
    }

    const mediumPatterns = [
        /(?:מחיר|מוכר|נמכר|דורש|מבקש|רק|בלבד|תמורת|עכשיו|סופי)[^\d]{0,10}(\d{1,3}[,.]?\d{3}|\d{2,7})/i,
        /(?:ב-|ב–|ב )\s*(\d{1,3}[,.]?\d{3}|\d{2,7})(?:\s|$|,|\.)/,
        // Price at start of line followed by selling verb: "13,500 לבוא לקחת"
        /(?:^|\n)\s*(\d{1,3}[,.]?\d{3}|\d{4,7})\s+(?:לבוא|לקחת|למסירה|ניתן|בלבד|נא\s*ל|ל[א-ת])/im,
    ];
    for (const pattern of mediumPatterns) {
        const match = text.match(pattern);
        if (match) {
            const idx = text.indexOf(match[1]);
            const candidate = parsePrice(match[1]);
            if (!isIgnored(idx) && candidate !== originalPrice && candidate > 0) {
                return { price: candidate, originalPrice, negotiable };
            }
        }
    }

    const lines = text.split(/\n/);
    for (const line of lines) {
        const clean = line.trim();
        const onlyNumber = clean.match(/^(\d{1,3}[,.]?\d{3}|\d{2,7})\s*(?:₪|ש["״]ח|ש''ח|שח|שקל|שקלים|NIS)?$/);
        if (onlyNumber) {
            const candidate = parsePrice(onlyNumber[1]);
            if (candidate !== originalPrice && candidate > 10 && candidate < 5000000) {
                return { price: candidate, originalPrice, negotiable };
            }
        }
    }

    return { price: null, originalPrice, negotiable };
}

export const CATEGORIES: Record<string, { keywords: string[]; subCategories: Record<string, string[]> }> = {
    "רכב": {
        keywords: [
            "טויוטה", "מזדה", "הונדה", "יונדאי", "קיה", "BMW", "מרצדס", "פולקסווגן", "אאודי", "פורד", "ניסן", "סובארו", "לקסוס", "שברולט", "סקודה", "סיאט", "פיאט", "וולוו", "פורשה", "ג'יפ", "Jeep", "סיטרואן", "פיג'ו", "רנו", "אופל", "מיצובישי", "קילומטר", "קמ", "טסט", "ידני", "אוטומט", "דיזל", "בנזין", "היברידי", "חשמלי", "אופנוע", "קטנוע", "טסלה", "tesla", "BYD", "MG", "גיאלי"
        ],
        subCategories: {
            "רכב פרטי": ["סדאן", "האצ'בק", "טויוטה", "מזדה", "הונדה", "יונדאי", "קיה"],
            "ג'יפ / SUV": ["ג'יפ", "Jeep", "SUV", "4X4", "קרוסאובר"],
            "חשמלי / היברידי": ["חשמלי", "היברידי", "טסלה", "tesla", "BYD", "פלאג-אין"],
            "אופנועים וקטנועים": ["אופנוע", "קטנוע", "סקוטר", "טרקטורון"],
            "רכבי מסחר והובלה": ["מסחרי", "טנדר", "משאית", "פיקאפ"],
            "אביזרים וחלקי חילוף לרכב": ["חלקי חילוף", "צמיגים", "מצבר", "רדיו דיסק"],
        },
    },
    "נדלן": {
        keywords: [
            "דירה", "בית פרטי", "וילה", "פנטהאוז", "דופלקס", "יחידת דיור", "מ\"ר", "קומה", "מרפסת", "חניה פרטית", "ממ\"ד", "טאבו", "נדלן", "מגרש", "סטודיו להשכרה", "שותפים", "להשכרה", "למכירה", "נכס"
        ],
        subCategories: {
            "דירות למכירה": ["למכירה", "מכירה"],
            "דירות להשכרה": ["להשכרה", "שכירות"],
            "שותפים פנויים": ["שותפים", "שותף"],
            "נדל\"ן מסחרי": ["משרד", "חנות", "מחסן", "תעשייתי", "מסחרי"],
            "מגרשים וקרקעות": ["מגרש", "קרקע", "חקלאי"],
        },
    },
    "טלפונים": {
        keywords: [
            "אייפון", "iphone", "סמסונג", "samsung", "גלקסי", "galaxy", "שיאומי", "xiaomi", "pixel", "oneplus", "מוטורולה", "אנדרואיד", "סמארטפון", "נייד", "טלפון", "סלולרי", "שעון חכם", "apple watch", "garmin", "אוזניות", "airpods"
        ],
        subCategories: {
            "iPhone": ["אייפון", "iphone"],
            "Samsung Galaxy": ["גלקסי", "galaxy", "סמסונג"],
            "Xiaomi / אחר": ["שיאומי", "xiaomi", "pixel", "oneplus", "מוטורולה"],
            "שעונים חכמים": ["שעון חכם", "apple watch", "garmin", "smartwatch"],
            "אוזניות": ["אוזניות", "airpods", "buds"],
            "אביזרים לטלפון": ["מטען", "כיסוי", "מגן מסך", "כבל"],
        },
    },
    "מחשבים": {
        keywords: [
            "מחשב", "לפטופ", "מקבוק", "macbook", "notebook", "laptop", "PC", "שולחני", "ASUS", "dell", "lenovo", "HP", "acer", "MSI", "intel", "i5", "i7", "i9", "ryzen", "SSD", "RAM", "מעבד", "כרטיס מסך", "GPU", "גיימינג", "מסך", "מדפסת", "ראוטר"
        ],
        subCategories: {
            "מחשבים ניידים / לפטופים": ["לפטופ", "מקבוק", "macbook", "notebook", "laptop", "מחשב נייד"],
            "מחשבים שולחניים (PC)": ["מחשב שולחני", "PC", "שולחני", "מגדל", "מחשב נייח"],
            "מסכים וציוד היקפי": ["מסך", "מוניטור", "עכבר", "מקלדת", "מצלמת רשת"],
            "חלקים ורכיבים ל-PC": ["כרטיס מסך", "GPU", "RAM", "SSD", "לוח אם", "ספק כוח", "מעבד"],
            "מדפסות וסורקים": ["מדפסת", "סורק", "דיו"],
            "ציוד רשת": ["ראוטר", "מודם", "switch", "wifi"],
        },
    },
    "אלקטרוניקה": {
        keywords: [
            "טלוויזיה", "מסך", "OLED", "QLED", "4K", "8K", "פלייסטיישן", "אקסבוקס", "נינטנדו", "PS4", "PS5", "xbox", "מצלמה", "DSLR", "gopro", "רחפן", "dji", "רמקול", "סאונדבר", "קריוקי"
        ],
        subCategories: {
            "טלוויזיות ומסכים": ["טלוויזיה", "OLED", "QLED", "4K", "מסך פלזמה", "טלוויזיה חכמה"],
            "קונסולות ומשחקים": ["פלייסטיישן", "אקסבוקס", "נינטנדו", "גיימינג", "PS4", "PS5", "xbox", "משחקים"],
            "מצלמות ורחפנים": ["מצלמה", "DSLR", "gopro", "רחפן", "דרון", "עדשה"],
            "אודיו ומערכות שמע": ["רמקול", "רמקולים", "אוזניות", "סאונד", "בלוטוס", "קריוקי", "סאונדבר", "מגבר"],
        },
    },
    "ריהוט": {
        keywords: [
            "מיטה", "ספה", "ארון", "שולחן", "כסא", "מזנון", "שידה", "כורסה", "מדף", "ספרייה", "מזרן", "קומודה", "פינת אוכל", "ספסל", "וילון", "שטיח"
        ],
        subCategories: {
            "סלון וכורסאות": ["ספה", "כורסה", "מזנון", "שולחן קפה"],
            "שינה וחדרי שינה": ["מיטה", "מזרן", "שידה", "ארון בגדים", "קומודה"],
            "פינות אוכל ושולחנות": ["שולחן אוכל", "כסאות", "פינת אוכל"],
            "פתרונות אחסון": ["ארון", "מדף", "כוורת", "מגירות"],
            "ריהוט משרדי": ["שולחן עבודה", "כסא משרדי", "ספרייה", "משרד"],
        },
    },
    "מוצרי חשמל לבית": {
        keywords: [
            "מקרר", "מדיח", "מכונת כביסה", "תנור", "מיקרוגל", "מזגן", "מאוורר", "שואב אבק", "מכונת קפה", "בלנדר", "פריזר", "מנורה", "תאורה", "אפייה"
        ],
        subCategories: {
            "מוצרי חשמל גדולים": ["מקרר", "מכונת כביסה", "מדיח", "מזגן", "מזגנים", "תנור", "מייבש כביסה", "מקפיא", "מקררים", "תנורים"],
            "מוצרי חשמל קטנים": ["מכונת קפה", "בלנדר", "מיקסר", "שואב אבק", "מיקרוגל", "קומקום", "טוסטר"],
            "תאורה וגופי תאורה": ["מנורה", "תאורה", "גוף תאורה", "אהיל", "נברשת"],
        },
    },
    "ביגוד ואופנה": {
        keywords: [
            "חולצה", "מכנסיים", "שמלה", "נעליים", "תיק", "תכשיט", "שעון", "ג'קט", "מעיל", "סוודר", "מידה", "nike", "adidas", "zara", "ביגוד", "טייץ", "ארנק", "סניקרס", "משקפיים"
        ],
        subCategories: {
            "בגדי נשים": ["שמלה", "חצאית", "טייץ", "חולצת נשים"],
            "בגדי גברים": ["חולצת גברים", "חליפה", "מכנסי גברים"],
            "נעליים": ["נעליים", "סניקרס", "מגפיים", "כפכפים", "אלגנט"],
            "תיקים וארנקים": ["תיק", "תיק יד", "תיק גב", "ארנק"],
            "תכשיטים ומשקפיים": ["תכשיט", "טבעת", "צמיד", "עגיל", "שרשרת", "שעון", "משקפיים", "משקפי שמש"],
        },
    },
    "ספורט ופנאי": {
        keywords: [
            "אופניים", "קורקינט", "כושר", "משקולות", "הליכון", "כדור", "טניס", "קמפינג", "אוהל", "גלישה", "סאפ", "SUP", "קיאק", "גלשן מים", "גלשני מים", "גלגיליות", "סקייטבורד", "תרמיל", "שק שינה"
        ],
        subCategories: {
            "אופניים וקורקינטים": ["אופניים", "קורקינט", "אופניים חשמליים", "קורקינט חשמלי", "גלגיליות", "סקייטבורד"],
            "מכשירים וציוד כושר": ["משקולות", "הליכון", "אליפטי", "חדר כושר", "ספסל כושר"],
            "ספורט ימי": ["גלישה", "גלשן", "קיטבורד", "SUP", "סאפ", "קיאק", "גלשן מים", "גלשני מים", "צלילה"],
            "קמפינג, טיולים וציוד חוץ": ["אוהל", "שק שינה", "תרמיל", "גזיה", "תרמיל טיולים"],
        },
    },
    "תינוקות וילדים": {
        keywords: [
            "עגלה", "עגלת תינוק", "כסא בטיחות", "מיטת תינוק", "עריסה", "צעצוע", "לגו", "LEGO", "בובה", "פעוט", "כסא אוכל", "חיתולים"
        ],
        subCategories: {
            "עגלות ומושבי בטיחות": ["עגלה", "עגלת תינוק", "כסא בטיחות", "בוסטר", "סלקל"],
            "ריהוט לחדר התינוק": ["מיטת תינוק", "עריסה", "כסא אוכל", "שידת החתלה"],
            "צעצועים ומשחקי התפתחות": ["צעצוע", "לגו", "LEGO", "בובה", "משחק התפתחות", "פאזל"],
            "ביגוד לפעוטות וילדים": ["ביגוד לילדים", "בגד ים לילדים", "אוברול", "בגדי תינוקות"],
        },
    },
    "חיות מחמד": {
        keywords: [
            "כלב", "כלבלב", "חתול", "חתלתול", "כלוב", "אקווריום", "מזון לכלב", "מזון לחתול", "קערה", "רצועה", "צווארון", "בית לכלב", "חול לחתול", "פינת חי", "ציפור", "ארנב", "דגים", "חיות"
        ],
        subCategories: {
            "כלבים (ציוד ומזון)": ["כלב", "מזון לכלבים", "רצועה", "בית לכלב", "מיטה לכלב"],
            "חתולים (ציוד ומזון)": ["חתול", "מזון לחתולים", "חול לחתול", "מתקן גירוד"],
            "אקווריומים ודגים": ["אקווריום", "דגים", "פילטר", "משאבת מים"],
            "ציפורים ומכרסמים": ["ציפור", "תוכי", "ארנב", "כלוב", "מכרסמים"],
        },
    },
    "כלי עבודה ומוסך": {
        keywords: [
            "מקדחה", "מברגה", "מסור", "דיסקוס", "פטיש", "מפתח", "ברגים", "כלי עבודה", "מדחס", "ג'ק הרמה", "מכבש", "מחרטה", "מכונת ריתוך", "גנרטור", "מכונת דשא", "bosch", "makita", "dewalt"
        ],
        subCategories: {
            "כלי עבודה חשמליים": ["מקדחה", "מברגה", "מסור", "דיסקוס", "מכונת ריתוך", "פטישון"],
            "כלי עבודה ידניים וסטים": ["פטיש", "מפתח", "ברגים", "מפתח אלן", "סט כלים", "ארגז כלים"],
            "ציוד מוסך": ["ג'ק הרמה", "מכבש", "מדחס", "ליפט", "מטען מצברים"],
            "ציוד גינון וחקלאות": ["מכונת דשא", "גנרטור", "חרמש", "מפוח"],
        },
    },
    "בריאות וקוסמטיקה": {
        keywords: [
            "קרם", "שמפו", "מסכה", "פרפיום", "בושם", "איפור", "שפתון", "פאה", "ויטמינים", "תוספי תזונה", "מד לחץ דם", "מכשיר גילוח", "אפילטור", "מכשיר מסאז'", "מדידת חום", "מד סוכר", "לייזר"
        ],
        subCategories: {
            "טיפוח וקוסמטיקה": ["קרם", "שמפו", "מסכה", "פרפיום", "בושם", "איפור", "שפתון", "לק"],
            "ציוד רפואי ומדידה": ["מד לחץ דם", "מדידת חום", "מד סוכר", "כסא גלגלים", "קביים"],
            "מכשירי עיסוי וטיפוח חשמלי": ["מכשיר גילוח", "אפילטור", "מכשיר מסאז'", "הסרת שיער", "לייזר", "פאן"],
        },
    },
    "כלי נגינה": {
        keywords: [
            "גיטרה", "פסנתר", "תופים", "בס", "מקלדת מוזיקלית", "מגבר", "כינור", "חליל", "סקסופון", "אקורדיון", "ציוד הקלטה", "מיקסר שמע", "אורגנית", "מיקרופון אולפני", "כרטיס קול"
        ],
        subCategories: {
            "כלי מיתר": ["גיטרה", "בס", "כינור", "צ'לו", "עוד"],
            "קלידים": ["פסנתר", "מקלדת מוזיקלית", "אקורדיון", "אורגנית", "סינתיסייזר"],
            "הקשה ותופים": ["תופים", "מערכת תופים", "קאחון", "דרבוקה"],
            "כלי נשיפה": ["חליל", "סקסופון", "חצוצרה", "קלרינט"],
            "ציוד אולפן והגברה": ["מגבר", "ציוד הקלטה", "מיקסר שמע", "מיקרופון אולפני", "כרטיס קול", "רמקולים מוגברים"],
        },
    },
    "תחביבים ואמנות": {
        keywords: [
            "ציור", "צבע", "לוח ציור", "פסל", "קרמיקה", "אוסף", "בולים", "מטבעות", "כרטיסים", "משחקי קופסה", "פאזל", "שחמט", "תפירה", "סריגה", "קרושה", "קנבס", "ווינטג'"
        ],
        subCategories: {
            "חומרי יצירה ואמנות": ["ציור", "צבע", "לוח ציור", "פסל", "קרמיקה", "קנבס"],
            "אספנות": ["בולים", "מטבעות", "כרטיסים", "ווינטג'", "עתיקות", "אוסף"],
            "משחקי קופסה ופאזלים": ["משחקי קופסה", "פאזל", "שחמט", "קטאן"],
            "מלאכת יד": ["תפירה", "סריגה", "קרושה", "מכונת תפירה"],
        },
    },
    "ספרים ומדיה": {
        keywords: [
            "ספר", "ספרים", "תקליט", "DVD", "CD", "ויניל", "מגזין", "קומיקס", "מנגה", "ספר לימוד", "ספרות", "ביוגרפיה", "דיסקים"
        ],
        subCategories: {
            "ספרי קריאה": ["ספר קריאה", "רומן", "ביוגרפיה", "ספרות", "קומיקס"],
            "ספרי לימוד והדרכה": ["ספר לימוד", "אנציקלופדיה", "מדריך", "פסיכומטרי", "בגרות"],
            "מדיה ותקליטים": ["DVD", "CD", "תקליט", "ויניל", "דיסקים", "סרטים"],
        },
    },
    "כללי": {
        keywords: [
            "שונות", "כללי", "אחר"
        ],
        subCategories: {
            "שונות": ["שונות", "אחר"],
            "זיהוי כפול": ["זיהוי כפול"]
        }
    }
};



function detectCategory(text: string): { category: string; subCategory: string } {
    let bestCategory = "כללי";
    let bestSubCategory = "";
    let bestScore = 0;
    for (const [cat, data] of Object.entries(CATEGORIES)) {
        let score = 0;
        for (const kw of data.keywords) {
            if (new RegExp(kw, "i").test(text)) score++;
        }
        if (score > bestScore) {
            bestScore = score;
            bestCategory = cat;
            bestSubCategory = "";
            for (const [sub, subKws] of Object.entries(data.subCategories)) {
                for (const kw of subKws) {
                    if (new RegExp(kw, "i").test(text)) {
                        bestSubCategory = sub;
                        break;
                    }
                }
                if (bestSubCategory) break;
            }
        }
    }
    return { category: bestCategory, subCategory: bestSubCategory };
}

function detectCondition(text: string): { condition: string; conditionDetails: string | null } {
    if (/חדש\s*באריזה|חדש\s*בניילון|sealed|אריזה\s*מקורית/.test(text)) return { condition: "new", conditionDetails: "חדש באריזה מקורית" };
    if (/\bחדש\b/.test(text) && !/כמו\s*חדש/i.test(text)) return { condition: "new", conditionDetails: "חדש" };
    if (/כמו\s*חדש|כחדש|מצב\s*מצוין|10\/10|9\.5\/10|שמורה?\s*כחדשה?/.test(text)) return { condition: "like_new", conditionDetails: "כמו חדש" };
    if (/מצב(?:\s+[\s\S]{0,15})?\s*טוב|טוב\s*מאוד|שמור|8\/10|9\/10/.test(text)) return { condition: "good", conditionDetails: "מצב טוב" };
    if (/משומש|יד\s*(?:שנייה|2|שניה)|סימני\s*שימוש|שריטות|פגמים/.test(text)) return { condition: "used", conditionDetails: "משומש" };
    if (/לחלקים|לא\s*עובד|תקול|שבור/.test(text)) return { condition: "for_parts", conditionDetails: "לחלקים" };
    // Default to 'used' if not explicitly new or for parts, as most marketplace items are used
    return { condition: "used", conditionDetails: "משומש" };
}

function extractAttributes(text: string): { key: string; value: string; unit?: string }[] {
    const results: { key: string; value: string; unit?: string }[] = [];
    const patterns: { key: string; regex: RegExp; format: (m: RegExpMatchArray) => { value: string; unit?: string } }[] = [
        // Hand: supports numbers and Hebrew ordinals (ראשונה=1, שנייה=2 ... שישית=6, שביעית=7)
        {
            key: "יד", regex: /(?:יד|hand)\s*(\d+|ראשונה|ראשון|שנייה|שניה|שני|שלישית|שלישי|רביעית|רביעי|חמישית|חמישי|שישית|שישי|שביעית|שביעי|שמינית|שמיני)/i, format: (m) => ({
                value: m[1]
                    .replace(/ראשונה|ראשון/i, "1")
                    .replace(/שנייה|שניה|שני/i, "2")
                    .replace(/שלישית|שלישי/i, "3")
                    .replace(/רביעית|רביעי/i, "4")
                    .replace(/חמישית|חמישי/i, "5")
                    .replace(/שישית|שישי/i, "6")
                    .replace(/שביעית|שביעי/i, "7")
                    .replace(/שמינית|שמיני/i, "8")
            })
        },
        // Test expiry date: "טסט עד 05/2026" or "8/26" (2-digit year) or "טסט עד מאי 2026"
        {
            key: "טסט עד", regex: /(?:טסט|רישיון)\s*(?:עד|עב|עב')?[:\s-]*(?:חודש\s*)?(?:ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר)?\s*(?:0?(\d{1,2})[\/-](\d{2,4})|(\d{4}))/i,
            format: (m) => ({
                value: m[1] && m[2]
                    ? `${m[1].padStart(2, '0')}/${m[2].length === 2 ? '20' + m[2] : m[2]}`
                    : m[3] || m[0].replace(/.*?(?:עד|עב)[:\s-]*/i, '').trim()
            })
        },
        // Test expiry from speech: "טסט עד 05 חודש מאי 2026"
        { key: "טסט עד", regex: /(?:טסט|test)\s*(?:עד|until)?[:\s-]*(\d{1,2}[.\/-]\d{2,4})/i, format: (m) => ({ value: m[1] }) },
        // Fallback for general storage: look behind to ensure we didn't just match RAM, but since RAM is captured first (sorting) it's ok
        { key: "נפח אחסון", regex: /(?:נפח|אחסון|דיסק|SSD|HDD)\s*[-:]?\s*(\d{1,4})\s*(GB|TB|גיגה|טרה)\b/i, format: (m) => ({ value: m[1], unit: m[2].toUpperCase() }) },
        { key: "נפח אחסון", regex: /(\d{1,4})\s*(GB|TB|גיגה|טרה)\b/i, format: (m) => ({ value: m[1], unit: m[2].toUpperCase() }) },

        { key: "RAM", regex: /(?:RAM|זיכרון|זכרון)\s*[-:]?\s*(\d{1,3})\s*(GB|גיגה)/i, format: (m) => ({ value: m[1], unit: "GB RAM" }) },
        { key: "RAM", regex: /(\d{1,3})\s*(GB|גיגה)\s*(RAM|זיכרון|זכרון)/i, format: (m) => ({ value: m[1], unit: "GB RAM" }) },
        { key: "מעבד", regex: /(?:מעבד|processor)\s*[-:]?\s*([a-zA-Z0-9\-\s]+)(?:,|$|\n)/i, format: (m) => ({ value: m[1].trim() }) },
        { key: "עוצמה", regex: /(\d{1,5})\s*W(?:[\s,.-]|$)/i, format: (m) => ({ value: m[1], unit: "W" }) },
        { key: "סוללה", regex: /(\d{3,6})\s*(mAh|אמפר)/i, format: (m) => ({ value: m[1], unit: "mAh" }) },
        { key: "מצב סוללה", regex: /(\d{2,3})%\s*(?:סוללה|battery)/i, format: (m) => ({ value: m[1], unit: "%" }) },
        { key: "גודל מסך", regex: /(\d{1,3}(?:\.\d)?)\s*(?:אינץ|אינצ'|inch|")/i, format: (m) => ({ value: m[1], unit: "אינץ'" }) },
        { key: "רזולוציה", regex: /\b(1920|2560|3840|7680)[xX×](1080|1440|2160|4320)\b/, format: (m) => ({ value: `${m[1]}x${m[2]}` }) },
        { key: "תדר רענון", regex: /(\d{2,3})\s*(Hz|הרץ)\b/i, format: (m) => ({ value: m[1], unit: "Hz" }) },
        { key: "מצלמה", regex: /(\d{1,3})\s*(MP|מגה\s*פיקסל)\b/i, format: (m) => ({ value: m[1], unit: "MP" }) },
        { key: "מידות", regex: /(\d{2,4})\s*(?:[xX×\*]|על)\s*(\d{2,4})(?:\s*(?:[xX×\*]|על)\s*(\d{2,4}))?(?:\s*(ס"מ|cm))?/i, format: (m) => ({ value: m[3] ? `${m[1]}x${m[2]}x${m[3]}` : `${m[1]}x${m[2]}`, unit: m[4] || 'ס"מ' }) },
        { key: "גובה", regex: /גובה\s*(\d{2,4})\s*(ס"מ|cm|מטר)/i, format: (m) => ({ value: m[1], unit: m[2] }) },
        { key: "גובה", regex: /(\d{2,4})\s*(?:ס"מ|cm|מטר)\s*גובה/i, format: (m) => ({ value: m[1], unit: "ס\"מ" }) }, // Suffix support
        { key: "משקל", regex: /(?:משקל)\s*(\d{1,4}(?:\.\d)?)\s*(ק"ג|קג|kg|גרם|gr)/i, format: (m) => ({ value: m[1], unit: m[2] }) },
        { key: "משקל", regex: /(\d{1,4}(?:\.\d)?)\s*(?:ק"ג|קג|kg|גרם|gr)\s*משקל/i, format: (m) => ({ value: m[1], unit: "ק\"ג" }) }, // Suffix support
        // Improved Year: Negative lookbehind/ahead to avoid matching parts of dates like 05/2026
        // Matches "Year 2013", "2013", but NOT "05/2026"
        { key: "שנת ייצור", regex: /(?:^|[\s,.-])(?:שנת?|שנה|model)?\s*(?<![\/\d])(20[0-2]\d|199\d)(?![\/\d])(?:$|[\s,.-])/i, format: (m) => ({ value: m[1] }) },
        // Improved Price/Mileage: Handle Hebrew Gershayim (״) and common separators
        // Support both "150000 km" AND "Kilometrage: 150000"
        // Fix: Put \d{4,7} first to match "155000" before trying to match "155" with separators
        { key: "קילומטראז'", regex: /(?:קילומטראז'|קילומטראג'|קילומטר|נסע|עבר|km|ק"מ|קמ|ק״מ)\s*[:\-]?.{0,5}?\s*(\d{4,7}|\d{1,3}(?:[.,]\d{3})*)(?!\s*₪)/i, format: (m) => ({ value: m[1].replace(/[.,]/g, ""), unit: 'ק"מ' }) },
        // Support "155,000 km" format (number before unit)
        { key: "קילומטראז'", regex: /(\d{4,7}|\d{1,3}(?:[.,]\d{3})*)\s*(?:ק"מ|קמ|km|ק״מ)(?!\s*₪)/i, format: (m) => ({ value: m[1].replace(/[.,]/g, ""), unit: 'ק"מ' }) },
        // Support spoken voice: "155 אלף קילומטר" or "100 אלף קמ"
        { key: "קילומטראז'", regex: /(\d{1,4})\s*(?:אלף|k)\s*(?:קילומטר|קמ|ק"מ|km)/i, format: (m) => ({ value: String(parseInt(m[1]) * 1000), unit: 'ק"מ' }) },
        // Support short spoken: "140 קילומטר" (voice may omit 'אלף')
        { key: "קילומטראז'", regex: /(?:רק\s*)?(\d{2,3})\s*(?:קילומטר(?:ים)?)/i, format: (m) => ({ value: m[1], unit: 'ק"מ' }) },
        // Fix Hebrew word boundary for transmission
        { key: "תיבת הילוכים", regex: /(?:^|[\s,.-])(אוטומטי|אוטומט|ידני|manual|automatic)(?:$|[\s,.-])/i, format: (m) => ({ value: m[1] }) },
        { key: "סוג דלק", regex: /(?:^|[\s,.-])(בנזין|דיזל|היברידי|הברידית|חשמלי|גז)(?:$|[\s,.-])/i, format: (m) => ({ value: m[1].replace("הברידית", "היברידי") }) },
        // Allow comma in engine size
        { key: "נפח מנוע", regex: /(?:מנוע|נפח)\s*(\d{1,4}(?:,\d{3})*(?:\.\d)?)\s*(?:ל'|ליטר|סמ"ק|cc|L)?/i, format: (m) => ({ value: m[1].replace(/,/g, ""), unit: "סמ\"ק" }) },
        { key: "נפח מנוע", regex: /(\d{1,4}(?:,\d{3})*(?:\.\d)?)\s*(?:ל'|ליטר|סמ"ק|cc|L)\s*(?:מנוע|נפח)/i, format: (m) => ({ value: m[1].replace(/,/g, ""), unit: "סמ\"ק" }) }, // Suffix support
        { key: "חדרים", regex: /(\d(?:\.\d)?)\s*(?:חדרים|חד')/i, format: (m) => ({ value: m[1], unit: "חדרים" }) },
        { key: "מטראז'", regex: /(\d{2,4})\s*(?:מ"ר|מטר\s*רבוע|מטר)/i, format: (m) => ({ value: m[1], unit: 'מ"ר' }) },
        { key: "קומה", regex: /קומה\s*(\d{1,2})/i, format: (m) => ({ value: m[1] }) },
        { key: "קומה", regex: /(\d{1,2})(?:st|nd|rd|th)?\s*קומה/i, format: (m) => ({ value: m[1] }) }, // Suffix support
        { key: "מידה", regex: /(?:מידה|גודל|size)\s*(XS|S|M|L|XL|XXL|XXXL|\d{2,3})/i, format: (m) => ({ value: m[1].toUpperCase() }) },
        { key: "מידה", regex: /(XS|S|M|L|XL|XXL|XXXL|\d{2,3})\s*(?:מידה|גודל)/i, format: (m) => ({ value: m[1].toUpperCase() }) }, // Suffix support
        { key: "צבע", regex: /(?:צבע|color)\s*([\u05D0-\u05EA]{2,15}|black|white|red|blue|green)/i, format: (m) => ({ value: m[1] }) },
    ];
    for (const p of patterns) {
        const match = text.match(p.regex);
        if (match) {
            const formatted = p.format(match);
            // Validate: hand must be 1-9 (not 0 or empty)
            if (p.key === "יד" && (formatted.value === "0" || formatted.value === "00" || formatted.value === "")) continue;
            results.push({ key: p.key, ...formatted });
        }
    }
    const seen = new Set<string>();
    // Sort attributes by importance (optional, but nice)
    return results.filter((a) => {
        if (seen.has(a.key)) return false;
        seen.add(a.key);
        return true;
    });
}

function extractContact(text: string): string | null {
    const contacts: string[] = [];

    // Loose phone match: 05 followed by 8 digits, allowing for separators (-, ., space) anywhere in between
    // We match 0[5-9], then match the remaining 8 digits with optional separators
    const phoneRegex = /0[5-9](?:[-.\s]*\d){8}/g;
    let match;
    while ((match = phoneRegex.exec(text)) !== null) {
        // Clean up formatting for consistent output
        const clean = match[0].replace(/[-.\s]/g, "");
        if (clean.length === 10) {
            // Format as 05X-XXXXXXX for display
            contacts.push(`${clean.slice(0, 3)}-${clean.slice(3)}`);
        }
    }

    const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/g;
    while ((match = emailRegex.exec(text)) !== null) {
        contacts.push(match[0]);
    }

    if (contacts.length > 0) {
        return Array.from(new Set(contacts)).join(", ");
    }
    return null;
}

function extractDelivery(text: string): { available: boolean; cost: string | null } {
    if (/אין\s*(?:משלוח|הובלה)|לא\s*(?:שולח|מוביל)/.test(text)) return { available: false, cost: null };
    if (/(?:משלוח|הובלה)\s*(?:חינם|בחינם|ללא\s*עלות|כולל)/.test(text)) return { available: true, cost: "חינם" };
    if (/(?:משלוח|הובלה|שליח|דואר)/.test(text)) {
        const costMatch = text.match(/(?:משלוח|הובלה)[^₪\d]{0,15}(\d{2,4})(?!\d{3})/);
        return { available: true, cost: costMatch ? `${costMatch[1]} ₪` : "בתוספת תשלום" };
    }
    return { available: false, cost: null };
}

function extractLocation(text: string): string | null {
    const cities = ["תל אביב", "יפו", "ירושלים", "חיפה", "ראשון לציון", "פתח תקווה", "אשדוד", "נתניה", "באר שבע", "בני ברק", "חולון", "רמת גן", "אשקלון", "רחובות", "בת ים", "בית שמש", "כפר סבא", "הרצליה", "חדרה", "מודיעין", "רמת השרון", "לוד", "רמלה", "נצרת", "עכו", "אילת", "טבריה", "צפת", "גבעתיים", "קרית גת", "דימונה", "רעננה", "הוד השרון", "יהוד", "נס ציונה", "יבנה", "ראש העין", "שוהם", "עפולה", "נהריה", "כרמיאל", "זכרון יעקב"];

    // Use word boundaries to avoid partial matches (e.g., "יפו" inside "טיפול" - though not really an issue with Hebrew typically, but good practice)
    // Also prioritizes finding the city name as a distinct word.
    for (const city of cities) {
        // Create regex with word boundaries (Note: \b works poorly with Hebrew, use custom boundaries or just spaces/start/end)
        const escaped = city.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        // Look for city surrounded by whitespace, hyphen, comma, or start/end of string
        const regex = new RegExp(`(?:^|[\\s,.-])${escaped}(?:$|[\\s,.-])`, "i");
        if (regex.test(text)) return city;
    }
    return null;
}





function extractHighlights(text: string, options?: AiOptions): string[] {
    const highlights: string[] = [];

    // Dynamic highlights from options
    if (options?.knowledgeBase?.highlight_keywords) {
        for (const kw of options.knowledgeBase.highlight_keywords) {
            if (new RegExp(kw, "i").test(text)) {
                highlights.push(kw);
            }
        }
    }

    const patterns = [
        /ללא\s*תאונות/i,
        /שמורה?\s*בקנאות/i,
        /נהג\s*יחיד/i,
        /מצבר\s*חדש/i,
        /(?:\d+\s+)?צמיגים\s*(?:חדשים|טובים)/i, // Catch quantity e.g. "4 צמיגים חדשים" or "טובים"
        /אחרי\s*טיפול/i,
        /טסט\s*ארוך/i,
        /מחיר\s*מציאה/i,
        /נדיר/i,
        /תוספות\s*רבות/i,
        /גג\s*נפתח|סאנרוף/i,
        /מושבי\s*עור/i,
        /חימום\s*במושבים/i,
        /חדש\s*באריזה/i,
        /אריזה\s*מקורית/i,
        // Added based on user feedback esp. for cars
        /רכב\s*אמין/i,
        /חזק\s*ונוח/i,
        /נוח\s*לנסיעות/i,
        /שקיפות\s*מלאה/i,
        /יחס\s*אישי/i,
        /קנייה\s*בראש\s*שקט/i,
        /SAFE\s*BUY/i,
        /מתחייב\s*בבדיקה/i,
        /מזגן\s*(?:מצויין|מקפיא|תקין)/i,
        /מטופל(?:\s*במוסך)?/i,
        /סוס\s*עבודה/i,
        /שני\s*מפתחות/i,
        /טורבו(?:\s+[a-zA-Z0-9]+)?/i,
        /דאון\s*פייפ/i,
        /מערכת\s*פליטה(?:\s*על\s*שלט)?/i,
        /קיט\s*יניקה(?:\s*[a-zA-Z]+)?/i,
        /פילטר\s*אוויר\s*(?:פתוח)?/i,
        /סטייג['’]?\s*\d+(?:\s*[a-zA-Z]+)?/i,
        /קיט\s*(?:מלא\s*)?(?:RS\d*|M|AMG|GTI)/i,
        /סלון\s*(?:עור|אלקנטרה)/i,
        /מושבי\s*(?:עור|ספורט|באקט)/i,
        /גג\s*(?:פנורמי|נפתח|שמש)/i,
        /תאורת\s*אווירה/i,
        /גג\s*כוכבים/i,
        /גימורי?\s*אלקנטרה/i,
        /פנסים?\s*(?:לד|קסנון|RS)/i,
        /ג'?אנטים?\s*(?:מגנזיום|שחורים|RS)/i,
        /גריל\s*RS/i,
        /ליפ\s*(?:קדמי|אחורי)/i,
        /ספוילר/i,
        /דיפיוזר/i,
        /מערכת\s*סאונד/i,
        /סאב/i,
        /בורר\s*מצבי\s*נהיגה/i,
        /חגורות\s*אדומות/i,
        /הגה\s*(?:S|sport|ספורט|קטום)/i,
        /אפשרות\s*מימון(?:\s*מלא)?/i,
        /אפשרות\s*(?:טרייד|החלפה)/i,
        /טרייד\s*אין/i,
        // Quality car descriptors (voice-friendly)
        /מטופל(?:\s*(?:במוסך|בזמן|היטב))?/i,
        /חסכוני(?:\s*בדלק)?/i,
        /שמור(?:\s*(?:מאוד|היטב|בקנאות))?/i,
        /נקי(?:\s*מאוד)?/i,
        /מ(?:אוד\s*)?מוכסן/i,
        /ללא\s*(?:עישון|ילדים)/i,
        /בעלות\s*יחיד/i,
        /מלא\s*תוספות/i,
        /תוספות\s*רבות/i,
        /כמעט\s*חדש/i,
        // Fuel type highlights (important for vehicle buyers)
        /היברידי(?:\s*(?:\/|ו)?\s*בנזין)?/i,
        /\bחשמלי\b/i,
        /\bפלאג\s*אין\b/i,
        /\bדיזל\b/i,
        // Finance
        /מימון\s*עד\s*\d+%/i,
        /ליסינג/i,
        // Ownership duration — trust signal ("נקנה לפני שנה וחודש")
        /נקנה?\s*לפני\s*(?:\d+\s*)?(?:שנה|חודש|שבוע)(?:\s*ו(?:חודש|שבועיים|שבוע)?)?/i,
        /בשימוש\s*(?:פחות\s*מ)?(?:שנה|חודשיים|חודש|\d+\s*(?:שנ[הות]|חודש))/i,
        /(?:קנתי|קניתי|נרכש)\s*לפני\s*(?:\d+\s*)?(?:שנה|חודש|שבוע)/i,
        // Reason for selling — trust signal ("מוחלף עקב קבלת נייד מהעבודה")
        /(?:מוחלף|מוחלפת)\s*עקב\s*(?:שדרוג|קבלת)/i,
        /עקב\s*(?:קבלת\s*(?:נייד|מחשב|רכב)\s*(?:מהעבודה|מהחברה))/i,
        /(?:קיבלתי|קיבלנו)\s*(?:נייד|מחשב|רכב)\s*(?:מהעבודה|מהחברה|חדש)/i,
        /(?:עולה?\s*ל|עוברים?\s*ל|מכרתי\s*בית|הקטנת\s*דיור)/i,
        /(?:אין\s*לי\s*(?:זמן|צורך)|לא\s*(?:מספיק\s*)?משתמש)/i,
        // Warranty/extras trust signals (for all products)
        /אחריות\s*(?:יצרן|חנות)?\s*(?:עד|עוד|ל)?\s*(?:\d+\s*)?(?:שנה|חודש)/i,
        /(?:קופסא|אריזה)\s*(?:מקורית|פתוחה)/i,
        /כולל\s*(?:כל\s*)?אביזרים/i,
        /ללא\s*שברים?\s*(?:או\s*שריטות?)?/i,
        /ללא\s*שריטות?\b/i,
        /(?:מצב\s*)?מצויין\b/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            highlights.push(match[0]);
        }
    }
    return highlights;
}
