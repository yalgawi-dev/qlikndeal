const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fix "battery" anchor → "batteryHealth"
  const anchors = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', relatedFields: { has: 'battery' } }
  });
  for (const a of anchors) {
    const newFields = [...new Set(a.relatedFields.map(f => f === 'battery' ? 'batteryHealth' : f))];
    await prisma.fieldAnchor.update({ where: { id: a.id }, data: { relatedFields: newFields } });
  }
  console.log(`✅ Fixed ${anchors.length} anchors: "battery" → "batteryHealth"`);

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
