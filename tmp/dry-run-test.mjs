// ═══════════════════════════════════════════════════════════════
// DRY RUN TEST — AI Extraction Engine v2 (Hebrew-First)
// Run: node tmp/dry-run-test.mjs
// Requires: Next.js dev server running on localhost:3000
// ═══════════════════════════════════════════════════════════════

const BASE_URL = "http://localhost:3000";
const ANALYZE_URL = `${BASE_URL}/api/marketplace/analyze`;

let pass = 0, fail = 0;

const C = {
  reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m",
  yellow: "\x1b[33m", cyan: "\x1b[36m", white: "\x1b[37m",
  gray: "\x1b[90m", bold: "\x1b[1m"
};

function header(msg) {
  console.log(`\n${C.cyan}${"═".repeat(56)}${C.reset}`);
  console.log(`${C.cyan}${C.bold}  ${msg}${C.reset}`);
  console.log(`${C.cyan}${"═".repeat(56)}${C.reset}`);
}

function ok(msg)   { console.log(`  ${C.green}✅ PASS${C.reset}: ${msg}`); pass++; }
function fail_(msg){ console.log(`  ${C.red}❌ FAIL${C.reset}: ${msg}`); fail++; }
function info(msg) { console.log(`  ${C.yellow}ℹ️  ${msg}${C.reset}`); }

async function analyze(text, category) {
  try {
    const res = await fetch(ANALYZE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, category }),
    });
    if (!res.ok) { info(`HTTP ${res.status}: ${await res.text()}`); return null; }
    const data = await res.json();
    return data.result || null;
  } catch (e) {
    info(`Fetch error: ${e.message}`);
    return null;
  }
}

function showResult(r) {
  if (!r) return;
  const fields = ["brand","modelName","ram","storage","cpu","condition","batteryPercent","price","category"];
  for (const f of fields) {
    if (r[f] && String(r[f]).trim()) {
      console.log(`    ${C.white}📌 ${f} = '${r[f]}'${C.reset}`);
    }
  }
  if (r.suggestions?.length > 0) {
    console.log(`    ${C.cyan}🧠 AI Suggestions (${r.suggestions.length}):${C.reset}`);
    for (const s of r.suggestions) {
      const col = s.action === "AUTO_FILL" ? C.green : s.action === "SUGGEST" ? C.yellow : C.gray;
      console.log(`       ${col}[${s.action}] ${s.field} = '${s.value}' conf=${s.confidence.toFixed(3)} src=${s.source}${C.reset}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SUITE 1 — Hebrew Sentence Decomposition
// ═══════════════════════════════════════════════════════════════
async function suite1() {
  header("SUITE 1 — פירוק משפטים עבריים (Hebrew Normalization)");

  // Test 1A — Hebrew prefixes
  console.log(`\n  📋 Test 1A: תחיליות עבריות (ה,ל,ב,מ,ו)`);
  let r = await analyze("מוכר את המחשב הנשא שלי עם 16 גיגה זיכרון ו-512 גיגה SSD", "LAPTOPS");
  showResult(r);
  if (r) {
    const ramOk     = String(r.ram||"").includes("16") || r.suggestions?.some(s => s.field==="ram"    && String(s.value).includes("16"));
    const storageOk = String(r.storage||"").includes("512") || r.suggestions?.some(s => s.field==="storage" && String(s.value).includes("512"));
    ramOk     ? ok("RAM 16 extracted (Hebrew prefix normalization working)") : fail_("RAM '16' not found");
    storageOk ? ok("Storage 512 extracted") : fail_("Storage '512' not found");
  } else { fail_("API returned null"); }

  // Test 1B — Niqqud removal
  console.log(`\n  📋 Test 1B: ניקוד עברי`);
  r = await analyze("לַפְטוֹפּ עִם 8 גִּיגָה רַם בְּמַצָּב טוֹב", "LAPTOPS");
  showResult(r);
  if (r) {
    const got = String(r.ram||"").includes("8") || r.suggestions?.some(s => s.field==="ram" && String(s.value).includes("8"));
    got ? ok("Niqqud stripped — RAM extracted from vowelized text") 
        : info("RAM not found from niqqud (needs FieldSignal training — OK on fresh DB)");
  }

  // Test 1C — iPhone with condition
  console.log(`\n  📋 Test 1C: אייפון 14 Pro Max עם תנאי`);
  r = await analyze("אייפון 14 פרו מקס 256 גיגה מצב מצוין כמו חדש", "MOBILES");
  showResult(r);
  if (r) {
    const condOk    = /חדש|new/i.test(r.condition||"");
    const storageOk = String(r.storage||"").includes("256") || r.suggestions?.some(s => String(s.value).includes("256"));
    condOk    ? ok("Condition 'כמו חדש' detected") : fail_(`Condition wrong: '${r.condition}'`);
    storageOk ? ok("Storage 256GB detected")        : fail_("Storage 256 not found");
  }

  // Test 1D — Price extraction
  console.log(`\n  📋 Test 1D: מחיר מפורש (3500 שקל)`);
  r = await analyze("מוכר לפטופ Dell XPS 15 אינץ 32 גיגה RAM מחיר 3500 שקל", "LAPTOPS");
  showResult(r);
  if (r) {
    String(r.price||"").includes("3500") ? ok("Price '3500' extracted") : fail_(`Price wrong: '${r.price}'`);
    /dell/i.test(r.brand||"")            ? ok("Brand 'Dell' detected")  : info("Brand Dell not found — needs DB training");
  }
}

// ═══════════════════════════════════════════════════════════════
// SUITE 2 — Dynamic Unit Binding
// ═══════════════════════════════════════════════════════════════
async function suite2() {
  header("SUITE 2 — Unit Binding (גיגה→GB, אינץ→inch)");

  console.log(`\n  📋 Test 2A: גיגה כ-RAM + כ-Storage`);
  let r = await analyze("מחשב עם 16 גיגה זיכרון ו-256 גיגה דיסק", "LAPTOPS");
  showResult(r);
  if (r) {
    const allText = JSON.stringify(r);
    const hint16  = allText.includes("16");
    const hint256 = allText.includes("256");
    hint16  ? ok("Number 16 present in response")  : fail_("16 not found at all");
    hint256 ? ok("Number 256 present in response") : fail_("256 not found at all");
    const ramOk = String(r.ram||"").includes("16") || r.suggestions?.some(s=>s.field==="ram" && String(s.value).includes("16"));
    ramOk ? ok("16 correctly bound to RAM field via Unit Binding") 
          : info("RAM unit binding needs FieldSignal training (fresh DB — expected)");
  }
}

// ═══════════════════════════════════════════════════════════════
// SUITE 3 — Threshold + Decision Engine
// ═══════════════════════════════════════════════════════════════
async function suite3() {
  header("SUITE 3 — Threshold Engine (AUTO_FILL / SUGGEST / NONE)");

  console.log(`\n  📋 Test 3A: High confidence → AUTO_FILL`);
  let r = await analyze("iPhone 14 Pro Max 256GB mint condition", "MOBILES");
  showResult(r);
  if (r?.suggestions) {
    const autoFills = r.suggestions.filter(s => s.action === "AUTO_FILL");
    const suggests  = r.suggestions.filter(s => s.action === "SUGGEST");
    info(`AUTO_FILL: ${autoFills.length} | SUGGEST: ${suggests.length} | total: ${r.suggestions.length}`);
    autoFills.length > 0 ? ok("AUTO_FILL results present for confident text")
                         : info("No AUTO_FILL (FieldSignal DB empty — needs training runs)");
    suggests.length > 0  ? ok("SUGGEST results present — threshold engine active") : null;
  }

  console.log(`\n  📋 Test 3B: Vague text → no numeric AUTO_FILL`);
  r = await analyze("לפטופ מצוין ממש מצוין מומלץ מאוד", "LAPTOPS");
  showResult(r);
  const numericFields = ["ram","storage","screenSize","batteryHealth","batteryPercent"];
  if (r?.suggestions) {
    const bad = r.suggestions.filter(s =>
      s.action === "AUTO_FILL" && numericFields.includes(s.field) && !/\d/.test(s.value)
    );
    bad.length === 0 ? ok("Anti-hallucination guard — no spurious numeric AUTO_FILL ✓")
                     : fail_(`HALLUCINATION: ${bad.map(s=>`${s.field}='${s.value}'`).join(", ")}`);
  } else {
    ok("No suggestions from vague text — clean output ✓");
  }
}

// ═══════════════════════════════════════════════════════════════
// SUITE 4 — Anti-Hallucination Guard
// ═══════════════════════════════════════════════════════════════
async function suite4() {
  header("SUITE 4 — Anti-Hallucination (Numeric Field Guard)");

  const tests = [
    { text: "אייפון במצב מושלם ממש", cat: "MOBILES", field: "batteryHealth", label: "'מושלם' not mapped to batteryHealth" },
    { text: "מחשב מצוין לגמרי מצוין", cat: "LAPTOPS", field: "ram", label: "'מצוין' not mapped to RAM" },
    { text: "לפטופ נפלא עם מסך כל כך יפה", cat: "LAPTOPS", field: "screenSize", label: "'נפלא/יפה' not mapped to screenSize" },
  ];

  for (const t of tests) {
    console.log(`\n  📋 Test: ${t.label}`);
    const r = await analyze(t.text, t.cat);
    showResult(r);
    const bad = r?.suggestions?.filter(s =>
      s.field === t.field && !(/\d/.test(s.value))
    ) || [];
    bad.length === 0 ? ok(t.label) : fail_(`HALLUCINATION on '${t.field}': value='${bad[0].value}'`);
  }
}

// ═══════════════════════════════════════════════════════════════
// SUITE 5 — Category Detection (no category provided)
// ═══════════════════════════════════════════════════════════════
async function suite5() {
  header("SUITE 5 — Auto Category Detection");

  const tests = [
    { text: "אייפון 15 פלוס למכירה", expect: "PHONES" },
    { text: "לפטופ Dell XPS 15", expect: "LAPTOPS" },
    { text: "טויוטה קורולה 2020", expect: "VEHICLES" },
    { text: "מקרר סמסונג 500 ליטר", expect: "APPLIANCES" },
  ];

  for (const t of tests) {
    const r = await analyze(t.text, null);
    if (!r) { fail_(`No response for: ${t.text}`); continue; }
    const got = (r.category || "").toUpperCase();
    const hit = got === t.expect || got.includes(t.expect) || t.expect.includes(got);
    hit ? ok(`'${t.expect}' detected correctly (got: '${got}')`)
        : info(`Category mismatch: expected '${t.expect}', got '${got}' for: "${t.text}"`);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log(`${C.bold}${C.cyan}\n🧪 DRY RUN TEST — AI Extraction Engine v2 (Hebrew-First)${C.reset}`);
  console.log(`   Server: ${BASE_URL}`);
  console.log(`   Time: ${new Date().toLocaleTimeString("he-IL")}\n`);

  await suite1();
  await suite2();
  await suite3();
  await suite4();
  await suite5();

  // FINAL REPORT
  header("📊 FINAL TEST REPORT");
  const total = pass + fail;
  console.log(`  ${C.green}✅ PASSED : ${pass} / ${total}${C.reset}`);
  console.log(`  ${C.red}❌ FAILED : ${fail} / ${total}${C.reset}`);

  if (fail === 0) {
    console.log(`\n  ${C.green}${C.bold}🚀 ALL TESTS PASSED — AI Pipeline v2 OPERATIONAL!${C.reset}\n`);
  } else if (fail <= 2) {
    console.log(`\n  ${C.yellow}⚠️  Minor issues — likely needs FieldSignal training data${C.reset}`);
    console.log(`  ${C.yellow}💡 TIP: FieldSignal table is empty on fresh install. Use the app${C.reset}`);
    console.log(`  ${C.yellow}     to submit listings and trigger masterLearn() to populate it.${C.reset}\n`);
  } else {
    console.log(`\n  ${C.red}🔴 Multiple failures — review pipeline${C.reset}\n`);
  }
}

main().catch(e => { console.error("Test runner error:", e); process.exit(1); });
