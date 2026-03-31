// ═══════════════════════════════════════════════════════════════
// 🔴 LIVE WET TEST — Real DB interaction
// Laptop listing → 3 iterations → weight evolution tracking
// ═══════════════════════════════════════════════════════════════

const BASE_URL = "http://localhost:3000";
const ANALYZE_URL = `${BASE_URL}/api/marketplace/analyze`;
const LEARN_URL   = `${BASE_URL}/api/admin/ai-learn`;

const C = {
  reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m",
  yellow: "\x1b[33m", cyan: "\x1b[36m", white: "\x1b[37m",
  gray: "\x1b[90m", bold: "\x1b[1m", blue: "\x1b[34m",
  magenta: "\x1b[35m", dim: "\x1b[2m"
};

// ─── Test sentence ─────────────────────────────────────────────
const LISTING_TEXT = "לנובו ThinkPad X1 Carbon Gen 11 עם 32 גיגה זיכרון ו-1TB SSD מסך 14 אינץ מעבד i7 מצב כמו חדש מחיר 5500 שקל";
const CATEGORY     = "LAPTOPS";

// Expected ground truth (what the system SHOULD extract)
const GROUND_TRUTH = {
  brand:    ["lenovo", "לנובו"],
  modelName:["thinkpad", "x1", "carbon"],
  ram:      ["32"],
  storage:  ["1tb", "1"],
  cpu:      ["i7"],
  condition:["חדש", "new", "כמו חדש"],
  price:    ["5500"],
};

function header(msg) {
  console.log(`\n${C.cyan}${"═".repeat(60)}${C.reset}`);
  console.log(`${C.bold}${C.cyan}  ${msg}${C.reset}`);
  console.log(`${C.cyan}${"═".repeat(60)}${C.reset}`);
}

function score(field, value) {
  const expected = GROUND_TRUTH[field];
  if (!expected || !value) return C.gray;
  const v = String(value).toLowerCase();
  const hit = expected.some(e => v.includes(e.toLowerCase()));
  return hit ? C.green : C.yellow;
}

function getActionIcon(action) {
  return action === "AUTO_FILL" ? "🟢" : action === "SUGGEST" ? "🟡" : "🔴";
}

function confidenceBar(conf) {
  const pct = Math.round(conf * 20);
  const bar = "█".repeat(pct) + "░".repeat(20 - pct);
  const col = conf >= 0.85 ? C.green : conf >= 0.65 ? C.yellow : C.red;
  return `${col}[${bar}] ${(conf * 100).toFixed(0)}%${C.reset}`;
}

async function analyzeText(text, category) {
  try {
    const res = await fetch(ANALYZE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, category }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.result || null;
  } catch (e) {
    console.log(`  ${C.red}Fetch error: ${e.message}${C.reset}`);
    return null;
  }
}

async function triggerLearn(text, userFinalData, category) {
  // Simulate a seller correcting/confirming the AI output
  // This is what happens when form is submitted with verified data
  try {
    const res = await fetch(LEARN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        category,
        userFinal: userFinalData,
        isCorrection: false,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      return d;
    }
    return null;
  } catch(e) {
    return null;
  }
}

async function fetchWeights(category) {
  try {
    // Try to get FieldValueReliability for LAPTOPS
    const res = await fetch(`${BASE_URL}/api/admin/weights?category=${category}`, {
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) return await res.json();
    return null;
  } catch { return null; }
}

function showIteration(iter, result) {
  console.log(`\n${C.bold}${C.blue}  📊 RESULT — Iteration ${iter}${C.reset}`);
  console.log(`  ${C.dim}─────────────────────────────────────────────────${C.reset}`);

  // Core fields
  const coreFields = ["brand","modelName","ram","storage","cpu","condition","price","category"];
  for (const f of coreFields) {
    const v = result[f];
    if (v && String(v).trim()) {
      const col = score(f, v);
      const truth = GROUND_TRUTH[f] ? ` ${C.dim}(expect: ${GROUND_TRUTH[f][0]})${C.reset}` : "";
      console.log(`  ${col}📌 ${f.padEnd(12)}${C.reset} = ${C.white}'${v}'${C.reset}${truth}`);
    }
  }

  // Suggestions with confidence bars
  if (result.suggestions?.length > 0) {
    console.log(`\n  ${C.cyan}🧠 Suggestions (${result.suggestions.length}):${C.reset}`);
    // Sort by confidence desc
    const sorted = [...result.suggestions].sort((a,b) => b.confidence - a.confidence);
    for (const s of sorted) {
      const icon = getActionIcon(s.action);
      const bar  = confidenceBar(s.confidence);
      const col  = score(s.field, s.value);
      console.log(`  ${icon} ${col}${s.field.padEnd(14)}${C.reset} '${s.value}' ${bar}`);
      console.log(`     ${C.dim}source: ${s.source}${C.reset}`);
    }
  } else {
    console.log(`  ${C.gray}  (no suggestions returned)${C.reset}`);
  }

  // Accuracy summary
  let correct = 0, total = 0;
  for (const [field, expected] of Object.entries(GROUND_TRUTH)) {
    total++;
    const v = String(result[field] || "").toLowerCase();
    const sugg = result.suggestions?.find(s => s.field === field);
    const sv = String(sugg?.value || "").toLowerCase();
    const hit = expected.some(e => v.includes(e.toLowerCase()) || sv.includes(e.toLowerCase()));
    if (hit) correct++;
  }
  const pct = Math.round(correct / total * 100);
  const col = pct >= 85 ? C.green : pct >= 60 ? C.yellow : C.red;
  console.log(`\n  ${col}${C.bold}  Extraction accuracy: ${correct}/${total} (${pct}%)${C.reset}`);
}

async function compareIterations(results) {
  header("📈 EVOLUTION — How system improved across iterations");

  const fields = Object.keys(GROUND_TRUTH);
  console.log(`\n  ${"Field".padEnd(14)} | ${"Iter 1".padEnd(16)} | ${"Iter 2".padEnd(16)} | ${"Iter 3".padEnd(16)}`);
  console.log(`  ${"-".repeat(70)}`);

  for (const field of fields) {
    const expected = GROUND_TRUTH[field];
    const vals = results.map(r => {
      const direct = String(r?.[field] || "").toLowerCase();
      const sugVal = String(r?.suggestions?.find(s => s.field === field)?.value || "").toLowerCase();
      const hit = expected.some(e => direct.includes(e.toLowerCase()) || sugVal.includes(e.toLowerCase()));
      const conf = r?.suggestions?.find(s => s.field === field)?.confidence;
      const confStr = conf ? ` (${(conf*100).toFixed(0)}%)` : "";
      return hit ? `${C.green}✅${direct || sugVal}${confStr}${C.reset}` : `${C.red}❌ missing${C.reset}`;
    });
    const row = vals.map(v => v.padEnd ? v.padEnd(20) : v).join(" | ");
    console.log(`  ${C.white}${field.padEnd(14)}${C.reset} | ${vals[0]} | ${vals[1] || C.gray+"N/A"+C.reset} | ${vals[2] || C.gray+"N/A"+C.reset}`);
  }
}

// ─── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.bold}${C.magenta}🔴 LIVE WET TEST — Laptop Listing Pipeline${C.reset}`);
  console.log(`${C.dim}   Testing: self-improvement through repeated submission${C.reset}\n`);
  console.log(`${C.white}📋 Listing text:${C.reset}`);
  console.log(`   "${C.yellow}${LISTING_TEXT}${C.reset}"`);
  console.log(`   Category: ${C.cyan}${CATEGORY}${C.reset}`);

  const results = [];

  // ─── ITERATION 1: First time system sees this listing ──────
  header("WAVE 1 — First encounter (cold DB)");
  console.log(`  ${C.dim}System has never seen this before. Pure NLP + Regex.${C.reset}`);
  let r1 = await analyzeText(LISTING_TEXT, CATEGORY);
  if (r1) {
    showIteration(1, r1);
    results.push(r1);
  }

  // Simulate user submitting the form (triggers masterLearn)
  console.log(`\n  ${C.dim}⏳ User submits listing → masterLearn() triggered...${C.reset}`);
  await triggerLearn(LISTING_TEXT, {
    brand: "Lenovo",
    modelName: "ThinkPad X1 Carbon",
    ram: "32GB",
    storage: "1TB",
    cpu: "Intel Core i7",
    condition: "כמו חדש",
    price: "5500"
  }, CATEGORY);
  await new Promise(r => setTimeout(r, 800));

  // ─── ITERATION 2: Second submission (same or similar listing) ─
  header("WAVE 2 — Second encounter (partially warm DB)");
  console.log(`  ${C.dim}After one learn cycle. Expect higher confidence.${C.reset}`);
  let r2 = await analyzeText(LISTING_TEXT, CATEGORY);
  if (r2) {
    showIteration(2, r2);
    results.push(r2);
  }

  // Another learn cycle
  console.log(`\n  ${C.dim}⏳ User confirms data again → masterLearn() runs again...${C.reset}`);
  await triggerLearn(LISTING_TEXT, {
    brand: "Lenovo",
    modelName: "ThinkPad X1 Carbon",
    ram: "32GB",
    storage: "1TB",
    cpu: "Intel Core i7",
    condition: "כמו חדש",
    price: "5500"
  }, CATEGORY);
  await new Promise(r => setTimeout(r, 800));

  // ─── ITERATION 3: Third time — should show improved weights ──
  header("WAVE 3 — Third encounter (warm DB, learned signals)");
  console.log(`  ${C.dim}After two learn cycles. FieldSignal weights should be higher.${C.reset}`);
  let r3 = await analyzeText(LISTING_TEXT, CATEGORY);
  if (r3) {
    showIteration(3, r3);
    results.push(r3);
  }

  // ─── EVOLUTION COMPARISON ────────────────────────────────────
  if (results.length >= 2) {
    await compareIterations(results);
  }

  // ─── WEIGHT SNAPSHOT ─────────────────────────────────────────
  header("⚖️  WEIGHT SNAPSHOT — FieldValueReliability (LAPTOPS)");
  const weights = await fetchWeights(CATEGORY);
  if (weights?.extractionWeights) {
    console.log(`\n  ${C.bold}Extraction Weights:${C.reset}`);
    for (const [field, w] of Object.entries(weights.extractionWeights)) {
      const bar = confidenceBar(Number(w));
      console.log(`  ${C.white}${field.padEnd(20)}${C.reset} ${bar}`);
    }
  } else if (weights) {
    console.log(`  ${C.dim}${JSON.stringify(weights, null, 2).slice(0, 500)}${C.reset}`);
  } else {
    console.log(`  ${C.yellow}Weight API not available — check /api/admin/weights endpoint${C.reset}`);
    console.log(`  ${C.dim}(FieldSignal table still being populated in background)${C.reset}`);
  }

  console.log(`\n${C.bold}${C.green}✅ Live test complete.${C.reset}\n`);
}

main().catch(e => { console.error("Test error:", e); process.exit(1); });
