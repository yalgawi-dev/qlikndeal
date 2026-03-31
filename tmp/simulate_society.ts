import prismadb from "@/lib/prismadb";
import { masterLearn } from "@/lib/learning";
import { masterAnalyze } from "@/lib/analyze";

async function runSimulation() {
    console.log("🚀 STARTING E2E SOCIETY SIMULATION (The War of Families) 🚀\n");

    const cat = "TEST_SIM_MATRIX";

    // Clean previous test runs for purity
    await prismadb.contextPattern.deleteMany({ where: { category: cat } });
    await prismadb.fieldValueReliability.deleteMany({ where: { category: cat } });

    console.log("--- 🧠 PHASE 1: Users Teach The AI (Building The Ecosystem) ---");
    
    // User 1 teaches the system "Price" semantics
    await masterLearn("מוצר פצצה עולה רק 5000 שח בלבד", "price", "5000", cat);
    
    // User 2 uses another variation. The algorithm will cluster 'עולה' into the same 'Price' family!
    await masterLearn("חדש באריזה עולה בערך 5000 שקלים", "price", "5000", cat);
    
    // User 3 teaches the system "Temperature" semantics
    await masterLearn("שימו לב המנוע רותח והחום עולה 90 מעלות תמיד", "temperature", "90", cat);

    // Let's force a Harvest by artificially repeating 'עולה'->'Price' 5 times to trigger the 85% Harvesting limit
    for (let i = 0; i < 5; i++) {
        await masterLearn("סתם מילים עולה 5000 שח רגיל", "price", "5000", cat);
    }

    console.log("✅ Users completed teaching. Harvesting triggered autonomously.\n");

    console.log("--- ⚔️ PHASE 2: The New Ad Arrives (DNA Tie-Breaker) ---");
    
    // Test A: The sentence brings "עולה" (which strongly points to Price in dictionary), but surrounds it with Temperature DNA.
    const testA = "חום המנוע עולה 95 מעלות בנסיעה";
    console.log(`[Test A] Analyzing: "${testA}"`);
    console.log(`[Hypothesis] Even though 'עולה' is a harvested 'Price' word, the DNA ('מעלות', 'חום') should force it to Temperature!`);
    
    const resA = await masterAnalyze(testA, cat);
    console.log(`Result A:\n`, JSON.stringify(resA, null, 2), "\n");


    const testB = "מחשב אש עולה 2400 שח גמיש";
    console.log(`[Test B] Analyzing: "${testB}"`);
    console.log(`[Hypothesis] The DNA ('שח', 'גמיש') should strongly attach 2400 to Price!`);
    
    const resB = await masterAnalyze(testB, cat);
    console.log(`Result B:\n`, JSON.stringify(resB, null, 2), "\n");

    console.log("🏁 SOCIETY SIMULATION ENDED 🏁");
}

runSimulation()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
