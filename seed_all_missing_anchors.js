const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// UNIVERSAL COMPUTER ANCHORS (shared across LAPTOPS/DESKTOPS/AIO/CUSTOM_COMPUTERS)
// ─────────────────────────────────────────────────────────────
const COMPUTER_ANCHORS = [
  // brand
  { phrase: 'יצרן', relatedFields: ['brand'], fieldConfidences: { brand: 0.88 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.88 },
  { phrase: 'מותג', relatedFields: ['brand'], fieldConfidences: { brand: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  // family / series
  { phrase: 'סדרה', relatedFields: ['family'], fieldConfidences: { family: 0.87 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.87 },
  { phrase: 'series', relatedFields: ['family'], fieldConfidences: { family: 0.87 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.87 },
  // subModel / SKU
  { phrase: 'מק"ט', relatedFields: ['subModel'], fieldConfidences: { subModel: 0.90 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.90 },
  { phrase: 'דגם מלא', relatedFields: ['subModel'], fieldConfidences: { subModel: 0.88 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.88 },
  // condition
  { phrase: 'מצב', relatedFields: ['condition'], fieldConfidences: { condition: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  { phrase: 'condition', relatedFields: ['condition'], fieldConfidences: { condition: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  { phrase: 'כמו חדש', relatedFields: ['condition'], fieldConfidences: { condition: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: 'חדש', relatedFields: ['condition'], fieldConfidences: { condition: 0.87 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.87 },
  // os
  { phrase: 'מערכת הפעלה', relatedFields: ['os'], fieldConfidences: { os: 0.92 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.92 },
  { phrase: 'windows', relatedFields: ['os'], fieldConfidences: { os: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: 'macos', relatedFields: ['os'], fieldConfidences: { os: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: 'ubuntu', relatedFields: ['os'], fieldConfidences: { os: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
];

// ─────────────────────────────────────────────────────────────
// SCREEN / TV ANCHORS (SCREENS, TVS, טלוויזיות)
// ─────────────────────────────────────────────────────────────
const SCREEN_ANCHORS = [
  // brand
  { phrase: 'יצרן', relatedFields: ['brand'], fieldConfidences: { brand: 0.88 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.88 },
  { phrase: 'מותג', relatedFields: ['brand'], fieldConfidences: { brand: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  // screenSize
  { phrase: 'מסך', relatedFields: ['screenSize'], fieldConfidences: { screenSize: 0.88 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.88 },
  { phrase: 'גודל מסך', relatedFields: ['screenSize'], fieldConfidences: { screenSize: 0.92 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.92 },
  { phrase: 'אינץ', relatedFields: ['screenSize'], fieldConfidences: { screenSize: 0.90 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 2, confidence: 0.90 },
  { phrase: 'inch', relatedFields: ['screenSize'], fieldConfidences: { screenSize: 0.90 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 2, confidence: 0.90 },
  { phrase: '"', relatedFields: ['screenSize'], fieldConfidences: { screenSize: 0.85 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 1, confidence: 0.85 },
  // resolution
  { phrase: 'רזולוציה', relatedFields: ['resolution'], fieldConfidences: { resolution: 0.92 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.92 },
  { phrase: '4k', relatedFields: ['resolution'], fieldConfidences: { resolution: 0.92 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.92 },
  { phrase: '8k', relatedFields: ['resolution'], fieldConfidences: { resolution: 0.92 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.92 },
  { phrase: 'full hd', relatedFields: ['resolution'], fieldConfidences: { resolution: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: '1080p', relatedFields: ['resolution'], fieldConfidences: { resolution: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: 'uhd', relatedFields: ['resolution'], fieldConfidences: { resolution: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  // panelTech
  { phrase: 'פאנל', relatedFields: ['panelTech'], fieldConfidences: { panelTech: 0.90 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.90 },
  { phrase: 'טכנולוגיה', relatedFields: ['panelTech'], fieldConfidences: { panelTech: 0.87 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.87 },
  { phrase: 'oled', relatedFields: ['panelTech'], fieldConfidences: { panelTech: 0.93 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.93 },
  { phrase: 'qled', relatedFields: ['panelTech'], fieldConfidences: { panelTech: 0.93 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.93 },
  { phrase: 'neo qled', relatedFields: ['panelTech'], fieldConfidences: { panelTech: 0.93 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.93 },
  { phrase: 'mini led', relatedFields: ['panelTech'], fieldConfidences: { panelTech: 0.93 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.93 },
  { phrase: 'nanocell', relatedFields: ['panelTech'], fieldConfidences: { panelTech: 0.93 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.93 },
  // condition
  { phrase: 'מצב', relatedFields: ['condition'], fieldConfidences: { condition: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  { phrase: 'כמו חדש', relatedFields: ['condition'], fieldConfidences: { condition: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
];

// ─────────────────────────────────────────────────────────────
// SMARTPHONE MISSING ANCHORS (brand, family, storage, ram, condition, batteryHealth)
// ─────────────────────────────────────────────────────────────
const SMARTPHONE_MISSING_ANCHORS = [
  // brand
  { phrase: 'יצרן', relatedFields: ['brand'], fieldConfidences: { brand: 0.87 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.87 },
  // family / series
  { phrase: 'דגם', relatedFields: ['family', 'model'], fieldConfidences: { family: 0.75, model: 0.80 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.80 },
  { phrase: 'סדרה', relatedFields: ['family'], fieldConfidences: { family: 0.87 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.87 },
  // storage
  { phrase: 'אחסון', relatedFields: ['storage'], fieldConfidences: { storage: 0.90 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.90 },
  { phrase: 'נפח', relatedFields: ['storage'], fieldConfidences: { storage: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  { phrase: 'storage', relatedFields: ['storage'], fieldConfidences: { storage: 0.90 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.90 },
  { phrase: 'gb', relatedFields: ['storage', 'ram'], fieldConfidences: { storage: 0.70, ram: 0.70 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 2, confidence: 0.80 },
  { phrase: 'tb', relatedFields: ['storage'], fieldConfidences: { storage: 0.90 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 2, confidence: 0.90 },
  // ram
  { phrase: 'ראם', relatedFields: ['ram'], fieldConfidences: { ram: 0.90 }, expectedDirection: 'BACKWARD', minDistance: 0, maxDistance: 3, confidence: 0.90 },
  { phrase: 'זיכרון', relatedFields: ['ram'], fieldConfidences: { ram: 0.88 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.88 },
  { phrase: 'ram', relatedFields: ['ram'], fieldConfidences: { ram: 0.90 }, expectedDirection: 'BACKWARD', minDistance: 0, maxDistance: 3, confidence: 0.90 },
  // condition
  { phrase: 'מצב', relatedFields: ['condition'], fieldConfidences: { condition: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  { phrase: 'כמו חדש', relatedFields: ['condition'], fieldConfidences: { condition: 0.92 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.92 },
  { phrase: 'מחודש', relatedFields: ['condition'], fieldConfidences: { condition: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: 'refurbished', relatedFields: ['condition'], fieldConfidences: { condition: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  // batteryHealth
  { phrase: 'סוללה', relatedFields: ['batteryHealth'], fieldConfidences: { batteryHealth: 0.82 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.82 },
  { phrase: 'בריאות סוללה', relatedFields: ['batteryHealth'], fieldConfidences: { batteryHealth: 0.95 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.95 },
  { phrase: 'battery', relatedFields: ['batteryHealth'], fieldConfidences: { batteryHealth: 0.85 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.85 },
  { phrase: '%', relatedFields: ['batteryHealth'], fieldConfidences: { batteryHealth: 0.80 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 2, confidence: 0.80 },
];

// LAPTOPS: only batteryHealth missing
const LAPTOPS_MISSING_ANCHORS = [
  { phrase: 'בריאות סוללה', relatedFields: ['batteryHealth'], fieldConfidences: { batteryHealth: 0.95 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.95 },
  { phrase: 'אחוז סוללה', relatedFields: ['batteryHealth'], fieldConfidences: { batteryHealth: 0.90 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.90 },
  { phrase: 'battery health', relatedFields: ['batteryHealth'], fieldConfidences: { batteryHealth: 0.95 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.95 },
];

async function upsertAnchors(category, anchors) {
  let count = 0;
  for (const a of anchors) {
    await p.fieldAnchor.upsert({
      where: { category_phrase: { category, phrase: a.phrase } },
      update: {
        relatedFields: a.relatedFields,
        fieldConfidences: a.fieldConfidences,
        expectedDirection: a.expectedDirection,
        minDistance: a.minDistance,
        maxDistance: a.maxDistance,
        confidence: a.confidence,
        isIgnored: false
      },
      create: {
        category,
        phrase: a.phrase,
        relatedFields: a.relatedFields,
        fieldConfidences: a.fieldConfidences,
        expectedDirection: a.expectedDirection,
        minDistance: a.minDistance,
        maxDistance: a.maxDistance,
        confidence: a.confidence,
        isIgnored: false
      }
    });
    count++;
  }
  return count;
}

async function seed() {
  console.log("=== SEEDING MISSING ANCHORS FOR ALL CATEGORIES ===\n");

  // Desktop-family categories
  for (const cat of ['DESKTOPS', 'AIO', 'CUSTOM_COMPUTERS']) {
    const n = await upsertAnchors(cat, COMPUTER_ANCHORS);
    console.log(`✅ [${cat}] ${n} anchors seeded`);
  }

  // Screen / TV categories
  for (const cat of ['SCREENS', 'TVS', 'טלוויזיות']) {
    const n = await upsertAnchors(cat, SCREEN_ANCHORS);
    console.log(`✅ [${cat}] ${n} anchors seeded`);
  }

  // Smartphones — fill missing basic fields
  const n1 = await upsertAnchors('SMARTPHONES', SMARTPHONE_MISSING_ANCHORS);
  console.log(`✅ [SMARTPHONES] ${n1} missing anchors seeded`);

  // Laptops — only batteryHealth missing
  const n2 = await upsertAnchors('LAPTOPS', LAPTOPS_MISSING_ANCHORS);
  console.log(`✅ [LAPTOPS] ${n2} batteryHealth anchors seeded`);

  console.log("\n=== ALL DONE ===");
}

seed().catch(console.error).finally(() => p.$disconnect());
