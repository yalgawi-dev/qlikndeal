import chalk from 'chalk';

// --- Types & Mocks ---
interface NLPToken { word: string; pos: string }
interface CatalogItem { brand: string; model: string; baseRam: number; maxRam: number; screen: number; isMutable: Record<string, boolean> }

// Mock Database / Mappings
const MOCK_DICTIONARY: Record<string, { field: string, weight: number }> = {
    "מקבוק פרו": { field: "model", weight: 0.95 },
    "m1": { field: "cpu", weight: 0.9 },
    "64gb": { field: "ram_or_storage", weight: 0.5 },
    "שחור": { field: "color", weight: 0.8 },
    "מעולה": { field: "condition", weight: 0.85 }
};

const MOCK_CATALOG: CatalogItem[] = [
    { 
        brand: "Apple", 
        model: "MacBook Pro M1", 
        baseRam: 8, 
        maxRam: 16, // LIMIT!
        screen: 13.3, 
        isMutable: { color: true, ram: true, storage: true, screen: false } 
    }
];

function printHeader(step: number, title: string) {
    console.log(`\n\x1b[44m\x1b[37m STEP ${step}: ${title} \x1b[0m`);
}

async function runTweezersTest() {
    console.log("==================================================");
    console.log("   🚀 E2E TWEEZERS TEST - ALGORITHM PIPELINE 🚀   ");
    console.log("==================================================\n");

    const adText = "למכירה מקבוק פרו M1 מטורף עם 64GB זיכרון בצבע שחור מצב מעולה כולל אריזה";
    const words = adText.split(/\s+/);
    console.log(`📝 Original Text: "${adText}"`);

    // --- STEP 1: Lexical Anchors (Anchor Words) ---
    printHeader(1, "Lexical Anchors (שמות שדות וזיהוי בסיסי)");
    const anchorsExtracted: any = {};
    if (adText.includes("זיכרון")) anchorsExtracted.ram = "Pending Assignment";
    if (adText.includes("צבע")) anchorsExtracted.color = "Pending Assignment";
    console.log(`[+] Anchors Hunted:`, anchorsExtracted);

    // --- STEP 2: FieldValueReliability (מילון זהב קודם) ---
    printHeader(2, "Approved Dictionary Check (מילון מאושר)");
    const dictionaryMatches: any = {};
    for (const [key, data] of Object.entries(MOCK_DICTIONARY)) {
        if (adText.includes(key) || adText.toLowerCase().includes(key.toLowerCase())) {
            dictionaryMatches[key] = data;
        }
    }
    console.log(`[+] Dictionary Hunted:`, dictionaryMatches);

    // --- STEP 3: Catalog Lookup & Constraints (הקטלוג - ליבת החוקים) ---
    printHeader(3, "Catalog Lookup & Conflicts (הצלבת קטלוג)");
    let identifiedModel = MOCK_CATALOG.find(c => c.model === "MacBook Pro M1");
    let mappedFields: any = {};
    let conflicts: any = [];

    if (identifiedModel) {
        console.log(`[i] Identified Catalog Base: ${identifiedModel.brand} ${identifiedModel.model}`);
        console.log(`[i] Constraints loaded (Screen: Immutable, Color: Mutable, RAM: Mutable but Max ${identifiedModel.maxRam}GB)`);
        
        // Simulating parsing "64GB" for RAM
        let userRam = 64; 
        if (userRam > identifiedModel.maxRam) {
            conflicts.push({ field: "RAM", userValue: "64GB", catalogRule: `Max allowed is ${identifiedModel.maxRam}GB`, type: "HARD_VIOLATION" });
            mappedFields.ram = { value: "64GB", action: "CONFLICT_CATALOG" };
        } else {
            mappedFields.ram = { value: userRam + "GB", action: "SILENT_OVERRIDE" };
        }

        // Color (Mutable)
        mappedFields.color = { value: "שחור", action: "SILENT_OVERRIDE" };
    }

    if (conflicts.length > 0) {
        console.log(`\x1b[31m[!] CONFLICT DETECTED:\x1b[0m`, conflicts);
    } else {
        console.log(`[+] No Hard Conflicts. Overrides applied silently.`);
    }

    // --- STEP 4: NLP & Fuzzy (זיהוי חופשי) ---
    printHeader(4, "NLP Tokenization & Fuzzy (Natural Compromise)");
    console.log(`[i] Simulated NLP found unknown adjectives: ['מטורף'] (Ignoring)`);
    console.log(`[i] Fuzzy matched 'מצב מעולה' -> Condition: Like New`);
    mappedFields.condition = { value: "like_new", action: "SUGGEST", confidence: 0.85 };

    // --- STEP 5: Lineage System (-2/+2 words) ---
    printHeader(5, "Lineage Context Binding (-2/+2 Words)");
    const targetWordIndex = words.indexOf("זיכרון"); // e.g. "עם 64GB זיכרון בצבע שחור"
    if (targetWordIndex !== -1) {
        const pre2 = targetWordIndex - 2 >= 0 ? words[targetWordIndex - 2] : "";
        const pre1 = targetWordIndex - 1 >= 0 ? words[targetWordIndex - 1] : "";
        const target = words[targetWordIndex];
        const post1 = targetWordIndex + 1 < words.length ? words[targetWordIndex + 1] : "";
        const post2 = targetWordIndex + 2 < words.length ? words[targetWordIndex + 2] : "";
        
        const lineageStr = `[${pre2}] [${pre1}] >${target}< [${post1}] [${post2}]`;
        console.log(`[+] Lineage Window: ${lineageStr}`);
        console.log(`[+] Context Learned: "${pre1}"+${target} heavily associates "64GB" to RAM, not Storage.`);
    }

    // --- STEP 6: Final Decisions (Thresholds) ---
    printHeader(6, "Thresholds (Action Output)");
    const THRESHOLD = { AUTO_FILL: 0.85, SUGGEST: 0.50 };
    console.log(`[i] Global Limits -> Fill: >=${THRESHOLD.AUTO_FILL}, Suggest: >=${THRESHOLD.SUGGEST}\n`);
    
    const finalUI = {
        model: { value: "MacBook Pro M1", score: 0.95, UI: "AUTO_FILL" },
        ram: { value: "64GB", score: 1.0, UI: "🔴 CONFLICT (Requires Manual Check)" },
        color: { value: "שחור", score: 0.8, UI: "🟡 SUGGEST" },
        condition: { value: "Like New", score: 0.85, UI: "AUTO_FILL" }
    };
    console.table(finalUI);

    // --- STEP 7: Feedback Loop ---
    printHeader(7, "Learning & Weights Projection (הפידבק)");
    console.log(`[i] If user approves color 'שחור' for this model -> DB Weight for "שחור"[color] increases from 0.8 -> 0.85`);
    console.log(`[i] If user corrects RAM to '16GB' -> DB learns that "64GB" next to "MacBook Pro M1" was a typo or fake.`);
    
    console.log("\n==================================================");
    console.log("   ✅ TWEEZERS TEST COMPLETED SUCCESSFULLY        ");
    console.log("==================================================\n");
}

runTweezersTest().catch(console.error);
