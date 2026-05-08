/**
 * E2E HTTP Test – בדיקת הצינור המלא דרך ה-API
 * שרת dev חייב לרוץ על localhost:3000
 */

const BASE = "http://localhost:3000";

const AD = "מוכר לפ טופ מדהים של Lenovo ThinkPad X1 Carbon, מצב כמו חדש ממש, קניתי לפני שנה ב-8000 שח עכשיו מוכר ב 5500 שח בלבד יש לו זיכרון Ram של 16GB ונפח אחסון SSD של 512GB מסך 14 אינץ תצוגה נהדרת, מעבד Intel Core i7 מהיר בטירוף מוזמנים להתקשר ולא לשלוח הודעות, מחיר סופי!!!";
const CATEGORY = "LAPTOPS";

function printResults(label: string, results: any[], elapsed: number) {
  console.log(`\n${"═".repeat(65)}`);
  console.log(`📊 ${label}  [${elapsed}ms]`);
  console.log("═".repeat(65));
  if (!results?.length) { console.log("  ⚠️  אין תוצאות"); return; }
  for (const r of results) {
    const icon = r.action === "AUTO_FILL" ? "🟢" : r.action === "SUGGEST" ? "🟡" : "⚪";
    console.log(`  ${icon} [${(r.action||"NONE").padEnd(9)}] ${String(r.field).padEnd(12)} = "${r.value}" (${(r.confidence*100).toFixed(1)}%) ← ${r.source}`);
  }
}

// ─── STEP 1: Analyze ───────────────────────────────────────────
async function analyzeViaApi(): Promise<{ results: any[]; elapsed: number }> {
  const t = Date.now();

  // 1a. speed-test endpoint מחזיר timings + masterAnalyze results
  const speedRes = await fetch(`${BASE}/api/test-speed`);
  const elapsed = Date.now() - t;

  if (!speedRes.ok) throw new Error(`test-speed: HTTP ${speedRes.status}`);
  const speed = await speedRes.json();

  console.log("\n  ⏱  Phase Timings from /api/test-speed:");
  for (const [k, v] of Object.entries(speed.timings || {})) {
    const ms = v as number;
    const bar = "█".repeat(Math.min(40, Math.round(ms / 50)));
    const flag = ms > 1000 ? "🔴" : ms > 500 ? "🟡" : "🟢";
    console.log(`    ${flag} ${k.padEnd(35)} ${String(ms).padStart(5)}ms ${bar}`);
  }

  // 1b. Now actually analyze our complex AD  
  const t2 = Date.now();
  const res = await fetch(`${BASE}/api/ai/skill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: AD, category: CATEGORY })
  });
  const elapsed2 = Date.now() - t2;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`/api/ai/skill: HTTP ${res.status} – ${body.substring(0, 200)}`);
  }

  const json = await res.json();
  const results = Array.isArray(json) ? json : json.results ?? json.suggestions ?? [];
  return { results, elapsed: elapsed + elapsed2 };
}

// ─── STEP 2: Learn (PATCH /api/parser-log) ─────────────────────
async function learnField(logId: string, field: string, value: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/parser-log`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: logId, field, userValue: value, originalText: AD, category: CATEGORY })
  });
  return res.ok;
}

// ─── STEP 3: Log a parser result first ─────────────────────────
async function logParserResult(suggestions: any[]): Promise<string | null> {
  const res = await fetch(`${BASE}/api/parser-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalText: AD, category: CATEGORY, suggestions })
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.id ?? json.logId ?? null;
}

// ─── MAIN ───────────────────────────────────────────────────────
async function run() {
  console.log("\n🚀 E2E AI Pipeline Simulation (HTTP)\n");
  console.log(`📝 AD: "${AD.substring(0, 90)}..."`);
  console.log(`🏷  Category: ${CATEGORY}\n`);

  // ── ROUND 1 ──
  console.log("⏱️  ROUND 1 – Cold Extraction + Performance Profile...");
  let round1: any[] = [];
  let t1 = 0;
  try {
    const r = await analyzeViaApi();
    round1 = r.results;
    t1 = r.elapsed;
    printResults("ROUND 1 – EXTRACTION", round1, t1);
  } catch (e: any) {
    console.error("  ❌ ROUND 1 failed:", e.message);
  }

  // ── LOG + LEARN ──
  console.log("\n📚 LEARNING – Simulating user form approval...");
  const logId = await logParserResult(round1);
  if (logId) {
    console.log(`  📋 Parser log created: ${logId}`);
    const fields: [string, string][] = [
      ["brand", "Lenovo"], ["model", "ThinkPad X1"], ["price", "5500"],
      ["ram", "16GB"], ["storage", "512GB"], ["screen", "14 inch"], ["condition", "כמו חדש"]
    ];
    let learned = 0;
    for (const [f, v] of fields) {
      const ok = await learnField(logId, f, v);
      if (ok) { learned++; console.log(`  ✅ Learned: ${f} = "${v}"`); }
      else { console.log(`  ⚠️  Failed: ${f}`); }
    }
    console.log(`\n  ✅ masterLearn triggered ${learned}/${fields.length} times`);
  } else {
    console.log("  ⚠️  Could not create parser log – skipping learning phase");
  }

  // ── ROUND 2 ──
  console.log("\n⏱️  ROUND 2 – Post-Learning Extraction...");
  let round2: any[] = [];
  let t2 = 0;
  try {
    const r = await analyzeViaApi();
    round2 = r.results;
    t2 = r.elapsed;
    printResults("ROUND 2 – POST-LEARNING", round2, t2);
  } catch (e: any) {
    console.error("  ❌ ROUND 2 failed:", e.message);
  }

  // ── COMPARE ──
  console.log("\n\n📈 FINAL COMPARISON");
  console.log("═".repeat(65));
  console.log(`  Round 1: ${round1.length} fields extracted  |  ${t1}ms total`);
  console.log(`  Round 2: ${round2.length} fields extracted  |  ${t2}ms total`);

  const improved = round2.filter((r2: any) => {
    const r1 = round1.find((r: any) => r.field === r2.field);
    return !r1 || r2.confidence > r1.confidence + 0.01;
  });
  const newF = round2.filter((r2: any) => !round1.find((r1: any) => r1.field === r2.field));

  if (improved.length) console.log(`  🟢 Confidence improved: ${improved.map((r: any) => r.field).join(", ")}`);
  if (newF.length) console.log(`  🆕 New fields discovered: ${newF.map((r: any) => r.field).join(", ")}`);
  
  const delta = t1 - t2;
  console.log(`  ⚡ Speed delta: ${delta > 0 ? `Round 2 was ${delta}ms FASTER (DB cache hit)` : `Δ+${Math.abs(delta)}ms`}`);

  console.log("\n✅ E2E Simulation Complete!\n");
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
