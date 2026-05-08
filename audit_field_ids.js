const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// ה-fieldIds הקנוניים שה-pipeline מכיר
const CANONICAL_FIELDS = new Set([
  // Common
  'brand', 'family', 'subModel', 'condition',
  // Computers/Laptops
  'cpu', 'ram', 'storage', 'os', 'screen', 'screenType', 'batteryHealth',
  'releaseYear', 'type', 'gpu', 'sku',
  // Screens / TVs
  'screenSize', 'resolution', 'panelTech',
  // Smartphones
  'color', 'camera', 'cameraMain', 'cameraSystem', 'hasOpticalZoom',
  'connectivity',
  // Vehicles
  'year', 'mileage', 'fuelType', 'transmission', 'bodyType',
  'engineSize', 'seats', 'doors', 'driveType'
]);

// שדות ישנים שצריכים תיקון
const LEGACY_NAMES = {
  'series': 'family',
  'model': 'subModel',
  'release_year': 'releaseYear',
  'battery_health': 'batteryHealth',
  'screen_type': 'screenType',
  'fuel_type': 'fuelType',
  'body_type': 'bodyType',
  'engine_size': 'engineSize',
  'drive_type': 'driveType',
};

async function main() {
  const allFields = await p.categoryFormStructure.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
    select: { category: true, fieldId: true, labelHera: true }
  });

  // Group by category
  const byCategory = {};
  for (const f of allFields) {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  }

  console.log('=== CATEGORY FIELD AUDIT ===\n');
  
  let totalIssues = 0;
  const fixes = [];

  for (const [cat, fields] of Object.entries(byCategory)) {
    const issues = [];
    for (const f of fields) {
      if (LEGACY_NAMES[f.fieldId]) {
        issues.push({ from: f.fieldId, to: LEGACY_NAMES[f.fieldId], label: f.labelHera });
        fixes.push({ category: cat, oldId: f.fieldId, newId: LEGACY_NAMES[f.fieldId] });
      } else if (!CANONICAL_FIELDS.has(f.fieldId)) {
        issues.push({ from: f.fieldId, to: '???', label: f.labelHera, unknown: true });
      }
    }
    
    const status = issues.length === 0 ? '✅' : '❌';
    console.log(`${status} ${cat} (${fields.length} fields)`);
    for (const f of fields) {
      const legacyFix = LEGACY_NAMES[f.fieldId];
      const icon = legacyFix ? '🔴' : CANONICAL_FIELDS.has(f.fieldId) ? '  ' : '🟡';
      const fix = legacyFix ? ` → RENAME TO: "${legacyFix}"` : '';
      console.log(`   ${icon} ${f.fieldId}${fix}`);
    }
    totalIssues += issues.length;
    console.log();
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total issues: ${totalIssues}`);
  if (fixes.length > 0) {
    console.log(`\nFixes needed:`);
    fixes.forEach(f => console.log(`  UPDATE ${f.category}.${f.oldId} → ${f.newId}`));
  } else {
    console.log('✅ All fieldIds are canonical!');
  }

  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
