import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function runCleanup() {
  console.log("🚀 Starting DB Surgical Cleanup...");

  // 1. REVIVE ANCHORS: Undo the global "isIgnored=true" from the first sweep
  // So the new, smarter pruner can evaluate them per-field!
  const revived = await db.fieldAnchor.updateMany({
    where: { isIgnored: true },
    data: { isIgnored: false }
  });
  console.log(`✅ Revived ${revived.count} anchors for re-evaluation.`);

  // 2. CLEAN UP ALL VARIATIONS OF SUB-MODEL IN ANCHORS
  const subModelVariations = ["sub_model", "subModel", "sub model", "sub-model"];
  
  for (const badField of subModelVariations) {
      const anchorsWithBad = await db.fieldAnchor.findMany({
        where: { relatedFields: { has: badField } }
      });

      for (const anchor of anchorsWithBad) {
        const updatedRelated = anchor.relatedFields
          .filter((f: string) => f !== badField) 
          .concat(["model"]); // Add model

        const cleanRelatedFields = Array.from(new Set(updatedRelated));

        const fc = (anchor.fieldConfidences as Record<string, number>) || {};
        let newFc = { ...fc };
        if (badField in newFc) {
          const val = newFc[badField];
          delete newFc[badField];
          if (!newFc["model"]) newFc["model"] = val;
        }

        await db.fieldAnchor.update({
          where: { id: anchor.id },
          data: {
            relatedFields: cleanRelatedFields,
            fieldConfidences: newFc
          }
        });
      }
      if (anchorsWithBad.length > 0) {
        console.log(`✅ Fixed '${badField}' -> 'model' in ${anchorsWithBad.length} FieldAnchors.`);
      }

      // 3. CLEAN UP IN DICTIONARY
      const dictsWithBad = await db.fieldValueReliability.updateMany({
        where: { field: badField },
        data: { field: "model" }
      });
      if (dictsWithBad.count > 0) {
        console.log(`✅ Fixed '${badField}' in ${dictsWithBad.count} Dictionary entries.`);
      }

      // 4. CLEAN UP IN SIGNALS
      const sigsWithBad = await db.fieldSignal.updateMany({
        where: { field: badField },
        data: { field: "model" }
      });
      if (sigsWithBad.count > 0) {
        console.log(`✅ Fixed '${badField}' in ${sigsWithBad.count} Signal entries.`);
      }
  }

  // 5. RUN THE NEW MASTER PRUNER
  // Now it will correctly separate same-field conflicts vs cross-field relations
  const { pruneWeakNodes } = require('./src/lib/learning');
  const pruneRes = await pruneWeakNodes(false, true);
  console.log("\n🧹 Pruner results after cleanup:");
  console.log(pruneRes);

  console.log("\n🎉 ALL DONE!");
}

runCleanup()
  .catch(console.error)
  .finally(() => db.$disconnect());
