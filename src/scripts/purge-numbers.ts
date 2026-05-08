import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function purgePureNumbers() {
  console.log("🧹 Starting purge of pure numbers from knowledge base...");

  // Regex for pure numbers in JS (including dots and commas)
  const isPureNumber = (str: string) => /^[\d.,]+$/.test(str.trim());

  // 1. Purge from FieldValueReliability
  const dictEntries = await db.fieldValueReliability.findMany();
  let deletedDicts = 0;
  for (const entry of dictEntries) {
      if (isPureNumber(entry.value)) {
          await db.fieldValueReliability.delete({ where: { id: entry.id } });
          deletedDicts++;
      }
  }
  console.log(`✅ Deleted ${deletedDicts} pure numbers from FieldValueReliability.`);

  // 2. Purge from FieldSignal
  const signalEntries = await db.fieldSignal.findMany();
  let deletedSignals = 0;
  for (const entry of signalEntries) {
      if (isPureNumber(entry.rawValue)) {
          await db.fieldSignal.delete({ where: { id: entry.id } });
          deletedSignals++;
      }
  }
  console.log(`✅ Deleted ${deletedSignals} pure numbers from FieldSignal.`);

  // 3. Purge from FieldAnchor
  const anchorEntries = await db.fieldAnchor.findMany();
  let deletedAnchors = 0;
  for (const entry of anchorEntries) {
      if (isPureNumber(entry.phrase)) {
          await db.fieldAnchor.delete({ where: { id: entry.id } });
          deletedAnchors++;
      }
  }
  console.log(`✅ Deleted ${deletedAnchors} pure numbers from FieldAnchor.`);

  console.log("🎉 DB is now clean of numeric anomalies!");
}

purgePureNumbers()
  .catch(console.error)
  .finally(() => db.$disconnect());
