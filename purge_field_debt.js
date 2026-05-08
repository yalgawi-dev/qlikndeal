const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function purge() {
  console.log("Starting Deep DB Pruning for deprecated fields...");

  // Delete all occurrences of 'model', 'modelName', 'modelname' across DB
  
  const delReliability = await p.fieldValueReliability.deleteMany({
    where: { field: { in: ['model', 'modelName', 'modelname'] } }
  });
  console.log(`Deleted ${delReliability.count} deprecated rows from fieldValueReliability`);

  const delSignals = await p.fieldSignal.deleteMany({
    where: { field: { in: ['model', 'modelName', 'modelname'] } }
  });
  console.log(`Deleted ${delSignals.count} deprecated rows from fieldSignal`);

  const delThresholds = await p.categoryFieldThreshold.deleteMany({
    where: { field: { in: ['model', 'modelName', 'modelname'] } }
  });
  console.log(`Deleted ${delThresholds.count} deprecated rows from CategoryFieldThreshold`);

  // Update anchors to migrate relatedFields dropping the bad ones and merging into subModel
  const anchors = await p.fieldAnchor.findMany({
    where: {
      OR: [
        { relatedFields: { hasSome: ['model', 'modelName', 'modelname'] } }
      ]
    }
  });
  
  let anchorUpdates = 0;
  for (const anchor of anchors) {
     const newFields = anchor.relatedFields.map(f => 
       ['model', 'modelName', 'modelname'].includes(f) ? 'subModel' : f
     );
     const uniqueFields = [...new Set(newFields)];
     
     let updatedFC = {};
     let fc = typeof anchor.fieldConfidences === 'object' ? anchor.fieldConfidences : {};
     for (const [key, val] of Object.entries(fc)) {
        if (['model', 'modelName', 'modelname'].includes(key)) {
            updatedFC['subModel'] = Math.max(updatedFC['subModel'] || 0, val);
        } else {
            updatedFC[key] = val;
        }
     }

     await p.fieldAnchor.update({
       where: { id: anchor.id },
       data: { 
         relatedFields: uniqueFields,
         fieldConfidences: updatedFC
       }
     });
     anchorUpdates++;
  }
  
  console.log(`Updated ${anchorUpdates} anchors to drop/migrate deprecated fields`);
  console.log("Root pruning complete!");
}

purge().catch(console.error).finally(()=>p.$disconnect());
