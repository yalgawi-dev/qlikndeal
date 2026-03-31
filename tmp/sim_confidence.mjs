import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

console.log("=== Confidence Simulation for ThinkPad ===");

const text = "Lenovo ThinkPad X1 Carbon Gen 13 2025 " +
    "Intel Core Ultra 7 258V " +
    "32GB LPDDR5x " +
    "1TB SSD NVMe Gen5 " +
    "14 OLED " +
    "chadash beariza";  // Hebrew approximation for matching

const textHebrew = "\u05de\u05e2\u05d1\u05d3 Intel Core Ultra 7 258V\n\u05d6\u05d9\u05db\u05e8\u05d5\u05df 32GB\n\u05d0\u05d7\u05e1\u05d5\u05df 1TB SSD\n\u05de\u05e6\u05d1 \u05d7\u05d3\u05e9 \u05d1\u05d0\u05e8\u05d9\u05d6\u05d4 Lenovo ThinkPad X1 Carbon Gen 13";
const fullText = text + " " + textHebrew;
const textLower = fullText.toLowerCase();

const signals = await p.fieldSignal.findMany({ where: { category: "LAPTOPS" } });
const dict = await p.fieldValueReliability.findMany({ where: { category: "LAPTOPS" } });

console.log("FieldSignals: " + signals.length + ", Dictionary: " + dict.length);

const hypoMap = new Map();

function addHypo(field, value, confidence, source) {
    const key = field + "___" + String(value).toLowerCase();
    const existing = hypoMap.get(key);
    if (!existing) {
        hypoMap.set(key, { field, value, confidence, source });
    } else {
        const remainingDoubt = 1.0 - existing.confidence;
        existing.confidence = existing.confidence + (remainingDoubt * confidence);
        existing.source = existing.source + "+" + source;
    }
}

for (const s of signals) {
    if (s.rawValue && textLower.includes(String(s.rawValue).toLowerCase())) {
        addHypo(s.field, s.rawValue, Number(s.weight), "SIGNAL");
    }
}

for (const d of dict) {
    if (d.value && textLower.includes(String(d.value).toLowerCase())) {
        addHypo(d.field, d.value, Number(d.confidence), "DICT");
    }
}

const FILL = 0.85;
const SUGGEST = 0.45;

console.log("\n=== Result per field ===");
const fieldWinner = new Map();
for (const [key, hypo] of hypoMap) {
    const existing = fieldWinner.get(hypo.field);
    if (!existing || hypo.confidence > existing.confidence) {
        fieldWinner.set(hypo.field, hypo);
    }
}

for (const [field, hypo] of fieldWinner) {
    let action = "NONE";
    if (hypo.confidence >= FILL) action = "AUTO_FILL (blue)";
    else if (hypo.confidence >= SUGGEST) action = "SUGGEST (yellow)";
    const val = String(hypo.value).substring(0, 25);
    console.log("  " + field.padEnd(18) + " conf=" + hypo.confidence.toFixed(3) + " -> " + action + "  val=" + val);
}

const EXPECTED = ["brand", "subModel", "cpu", "ram", "storage", "screen", "condition", "batteryHealth", "os"];
const missing = EXPECTED.filter(f => !fieldWinner.has(f));
if (missing.length > 0) {
    console.log("\nNOT FOUND in Signal/Dict: " + missing.join(", "));
    console.log("  -> These rely on Regex fallback only");
}

await p.$disconnect();
