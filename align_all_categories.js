require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log('=== CROSS-CATEGORY FIELD ALIGNMENT ===\n');

  // ─── 1. SMARTPHONES: rename "model" → "subModel" in CategoryFormStructure ───
  const smartphoneModel = await p.categoryFormStructure.findFirst({
    where: { category: 'SMARTPHONES', fieldId: 'model' }
  });

  if (smartphoneModel) {
    await p.categoryFormStructure.update({
      where: { id: smartphoneModel.id },
      data: { fieldId: 'subModel' }
    });
    console.log('✅ SMARTPHONES CategoryFormStructure: "model" → "subModel"');
  } else {
    console.log('✓  SMARTPHONES: "model" field not found (already fixed or missing)');
  }

  // ─── 2. FVR: rename field "model" → "subModel" for SMARTPHONES ───────────────
  const fvrFix = await p.fieldValueReliability.updateMany({
    where: { category: 'SMARTPHONES', field: 'model' },
    data: { field: 'subModel' }
  });
  console.log(`✅ SMARTPHONES FVR: renamed ${fvrFix.count} "model" entries → "subModel"`);

  // ─── 3. FieldSignal: rename "model" → "subModel" for SMARTPHONES ─────────────
  const signalFix = await p.fieldSignal.updateMany({
    where: { category: 'SMARTPHONES', field: 'model' },
    data: { field: 'subModel' }
  });
  console.log(`✅ SMARTPHONES FieldSignal: renamed ${signalFix.count} entries`);

  // ─── 4. "טלוויזיות" duplicate category check ─────────────────────────────────
  const hebrewTv = await p.categoryFormStructure.count({ where: { category: 'טלוויזיות' } });
  const englishTv = await p.categoryFormStructure.count({ where: { category: 'TVS' } });
  console.log(`\n📺 TVS: ${englishTv} fields | טלוויזיות: ${hebrewTv} fields`);
  console.log('   → Keeping both (Hebrew alias may be used by UI category selector)');

  // ─── 5. Add screenSize/resolution/panelTech to audit canonical list ──────────
  // (These are valid SCREENS/TVS-specific fields — documented here, no DB change needed)
  console.log('\n📊 Category-specific fields (legitimate, no rename needed):');
  console.log('   SCREENS/TVS: screenSize, resolution, panelTech');
  console.log('   SMARTPHONES: cameraMain, cameraSystem, hasOpticalZoom, color');

  // ─── 6. Final verification ────────────────────────────────────────────────────
  console.log('\n=== FINAL VERIFICATION ===');
  const remaining = await p.categoryFormStructure.findMany({
    where: { fieldId: { in: ['model', 'series', 'release_year', 'battery_health'] } },
    select: { category: true, fieldId: true }
  });

  if (remaining.length === 0) {
    console.log('✅ No legacy fieldIds remaining across all categories!');
  } else {
    console.log('⚠️  Still found legacy fields:');
    remaining.forEach(r => console.log(`   ${r.category}: "${r.fieldId}"`));
  }

  await p.$disconnect();
  console.log('\n🏁 Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
