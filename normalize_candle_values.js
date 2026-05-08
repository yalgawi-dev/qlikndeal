// normalize_candle_values.js
// ONE-TIME: Normalize all FVR values to canonical format: lowercase, spaces only, trimmed
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function canonicalValue(v) {
  return String(v)
    .toLowerCase()       // lowercase
    .replace(/_/g, ' ')  // underscores → spaces
    .replace(/\s+/g, ' ')// collapse multiple spaces
    .trim();             // trim edges
}

async function main() {
  const all = await prisma.fieldValueReliability.findMany({
    where: { category: 'LAPTOPS' }
  });
  
  let fixed = 0;
  let checked = 0;
  
  for (const c of all) {
    checked++;
    const normalized = canonicalValue(c.value);
    if (normalized === c.value) continue; // already clean
    
    // Check if a canonical version already exists
    const existing = await prisma.fieldValueReliability.findFirst({
      where: { category: c.category, field: c.field, value: normalized }
    });
    
    if (existing) {
      // Merge: keep higher confidence, sum occurrences, delete this one
      await prisma.fieldValueReliability.update({
        where: { id: existing.id },
        data: {
          confidence: Math.max(existing.confidence, c.confidence),
          occurrenceCount: existing.occurrenceCount + c.occurrenceCount
        }
      });
      await prisma.fieldValueReliability.delete({ where: { id: c.id } });
      console.log(`  🔀 MERGED: "${c.value}" → "${normalized}" (field: ${c.field})`);
    } else {
      // Rename
      await prisma.fieldValueReliability.update({
        where: { id: c.id },
        data: { value: normalized }
      });
      console.log(`  ✅ FIXED: "${c.value}" → "${normalized}" (field: ${c.field})`);
    }
    fixed++;
  }
  
  console.log(`\n🎯 Checked: ${checked} | Fixed: ${fixed}`);
  if (fixed === 0) console.log('✅ All values already canonical!');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
