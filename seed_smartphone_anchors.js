const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// FieldAnchor schema (real):
//  phrase            - the trigger word (unique per category)
//  category          - SMARTPHONES / LAPTOPS etc.
//  relatedFields     - string[] array of fieldIds this anchor points to
//  fieldConfidences  - JSON { fieldId: confidence }
//  expectedDirection - "FORWARD" (look after phrase) or "BACKWARD"
//  minDistance       - min tokens away
//  maxDistance       - max tokens away
//  confidence        - overall anchor confidence

const anchors = [
  // --- cameraMain anchors ---
  { phrase: 'מצלמה ראשית', relatedFields: ['cameraMain'], fieldConfidences: { cameraMain: 0.92 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.92 },
  { phrase: 'מצלמה אחורית', relatedFields: ['cameraMain'], fieldConfidences: { cameraMain: 0.90 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.90 },
  { phrase: 'מצלמה', relatedFields: ['cameraMain'], fieldConfidences: { cameraMain: 0.82 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.82 },
  { phrase: 'rear camera', relatedFields: ['cameraMain'], fieldConfidences: { cameraMain: 0.92 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.92 },
  { phrase: 'main camera', relatedFields: ['cameraMain'], fieldConfidences: { cameraMain: 0.92 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.92 },
  { phrase: 'mp', relatedFields: ['cameraMain'], fieldConfidences: { cameraMain: 0.88 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 2, confidence: 0.88 },

  // --- cameraSystem anchors ---
  { phrase: 'מערכת מצלמות', relatedFields: ['cameraSystem'], fieldConfidences: { cameraSystem: 0.90 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 4, confidence: 0.90 },
  { phrase: 'triple camera', relatedFields: ['cameraSystem'], fieldConfidences: { cameraSystem: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: 'dual camera', relatedFields: ['cameraSystem'], fieldConfidences: { cameraSystem: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },
  { phrase: 'quad camera', relatedFields: ['cameraSystem'], fieldConfidences: { cameraSystem: 0.90 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 2, confidence: 0.90 },

  // --- hasOpticalZoom anchors ---
  { phrase: 'זום אופטי', relatedFields: ['hasOpticalZoom'], fieldConfidences: { hasOpticalZoom: 0.90 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 3, confidence: 0.90 },
  { phrase: 'optical zoom', relatedFields: ['hasOpticalZoom'], fieldConfidences: { hasOpticalZoom: 0.90 }, expectedDirection: 'BACKWARD', minDistance: 1, maxDistance: 3, confidence: 0.90 },
  { phrase: 'telephoto', relatedFields: ['hasOpticalZoom'], fieldConfidences: { hasOpticalZoom: 0.85 }, expectedDirection: 'FORWARD', minDistance: 0, maxDistance: 3, confidence: 0.85 },

  // --- color anchors ---
  { phrase: 'בצבע', relatedFields: ['color'], fieldConfidences: { color: 0.92 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.92 },
  { phrase: 'צבע', relatedFields: ['color'], fieldConfidences: { color: 0.87 }, expectedDirection: 'FORWARD', minDistance: 1, maxDistance: 3, confidence: 0.87 },
];

const CATEGORY = 'SMARTPHONES';

async function seed() {
  console.log(`Seeding ${anchors.length} FieldAnchors for SMARTPHONES...`);
  let added = 0;

  for (const a of anchors) {
    await p.fieldAnchor.upsert({
      where: { category_phrase: { category: CATEGORY, phrase: a.phrase } },
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
        category: CATEGORY,
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
    added++;
    console.log(`  ✅ "${a.phrase}" → [${a.relatedFields.join(', ')}]`);
  }

  console.log(`\nDone. ${added} anchors seeded.`);
}

seed().catch(console.error).finally(() => p.$disconnect());
