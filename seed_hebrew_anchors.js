const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// In JavaScript memory, strings are stored left-to-right based on typing order.
// Hebrew typing order:
// "זיכרון 16GB" -> Index 0 is "זיכרון", Index 1 is "16GB". 
// Therefore, the anchor "זיכרון" expects the value in the FORWARD direction.
// "16GB זיכרון" -> Index 0 is "16GB", Index 1 is "זיכרון".
// Therefore, the anchor "זיכרון" expects the value in the BACKWARD direction.
// We will set expectedDirection strictly based on how Hebrew speakers type.

const COMPUTER_ANCHORS = [
  // brand
  { phrase: 'יצרן', fields: ['brand'], dir: 'FORWARD' },
  { phrase: 'מותג', fields: ['brand'], dir: 'FORWARD' },
  { phrase: 'חברה', fields: ['brand'], dir: 'FORWARD' },
  // family / series
  { phrase: 'סדרה', fields: ['family'], dir: 'FORWARD' },
  { phrase: 'דגם', fields: ['family', 'model'], dir: 'FORWARD' },
  
  // condition
  { phrase: 'מצב', fields: ['condition'], dir: 'FORWARD' },
  { phrase: 'כמו חדש', fields: ['condition'], dir: 'SELF' }, // Value is the anchor itself
  { phrase: 'חדש', fields: ['condition'], dir: 'SELF' },
  { phrase: 'באריזה', fields: ['condition'], dir: 'SELF' },
  
  // os
  { phrase: 'מערכת הפעלה', fields: ['os'], dir: 'FORWARD' },
  { phrase: 'ווינדוס', fields: ['os'], dir: 'SELF' },
];

const SCREEN_ANCHORS = [
  { phrase: 'יצרן', fields: ['brand'], dir: 'FORWARD' },
  { phrase: 'מותג', fields: ['brand'], dir: 'FORWARD' },
  { phrase: 'טלוויזיה של', fields: ['brand'], dir: 'FORWARD' },
  
  // screenSize
  { phrase: 'מסך', fields: ['screenSize'], dir: 'FORWARD' },
  { phrase: 'גודל', fields: ['screenSize'], dir: 'FORWARD' },
  { phrase: 'גודל מסך', fields: ['screenSize'], dir: 'FORWARD' },
  { phrase: 'אינץ', fields: ['screenSize'], dir: 'BACKWARD' }, // "55 אינץ" -> BACKWARD
  { phrase: 'אינצ', fields: ['screenSize'], dir: 'BACKWARD' }, 
  { phrase: "אינץ'", fields: ['screenSize'], dir: 'BACKWARD' }, 
  { phrase: '"', fields: ['screenSize'], dir: 'BACKWARD' },    // '55"' -> BACKWARD
  
  // resolution / panel
  { phrase: 'רזולוציה', fields: ['resolution'], dir: 'FORWARD' },
  { phrase: 'פאנל', fields: ['panelTech'], dir: 'FORWARD' },
  { phrase: 'מסך מסוג', fields: ['panelTech'], dir: 'FORWARD' },
  { phrase: 'טלוויזיה מסוג', fields: ['panelTech'], dir: 'FORWARD' },
];

const SMARTPHONE_ANCHORS = [
  // brand & model
  { phrase: 'יצרן', fields: ['brand'], dir: 'FORWARD' },
  { phrase: 'מכשיר של', fields: ['brand'], dir: 'FORWARD' },
  { phrase: 'דגם', fields: ['family', 'model'], dir: 'FORWARD' },
  { phrase: 'סדרה', fields: ['family'], dir: 'FORWARD' },

  // storage
  { phrase: 'אחסון', fields: ['storage'], dir: 'FORWARD' }, // "אחסון 128" -> FORWARD
  { phrase: 'נפח', fields: ['storage'], dir: 'FORWARD' },
  { phrase: 'זיכרון פנימי', fields: ['storage'], dir: 'FORWARD' },
  { phrase: 'מקום', fields: ['storage'], dir: 'FORWARD' }, // "256 מקום" -> BACKWARD... but could be "מקום אחסון 256"
  { phrase: 'tb', fields: ['storage'], dir: 'BACKWARD' },   // "1tb" -> BACKWARD
  
  // ram
  { phrase: 'ראם', fields: ['ram'], dir: 'FORWARD' }, // "ראם 16" -> FORWARD
  { phrase: 'ram', fields: ['ram'], dir: 'FORWARD' }, 
  { phrase: 'זיכרון', fields: ['ram', 'storage'], dir: 'FORWARD' }, // Usually indicates both, let AI decide
  { phrase: 'gb', fields: ['storage', 'ram'], dir: 'BACKWARD' }, // "16 gb" -> BACKWARD
  { phrase: 'ג׳יגה', fields: ['storage', 'ram'], dir: 'BACKWARD' }, // "128 ג'יגה" -> BACKWARD
  { phrase: 'גיגה', fields: ['storage', 'ram'], dir: 'BACKWARD' },

  // battery
  { phrase: 'סוללה', fields: ['batteryHealth'], dir: 'FORWARD' }, // "סוללה 85" -> FORWARD
  { phrase: 'בריאות', fields: ['batteryHealth'], dir: 'FORWARD' },
  { phrase: 'בריאות סוללה', fields: ['batteryHealth'], dir: 'FORWARD' },
  { phrase: '%', fields: ['batteryHealth'], dir: 'BACKWARD' },      // "85 %" -> BACKWARD
  { phrase: 'אחוז', fields: ['batteryHealth'], dir: 'BACKWARD' },   // "85 אחוז" -> BACKWARD
  
  // camera
  { phrase: 'מצלמה', fields: ['cameraMain'], dir: 'FORWARD' },
  { phrase: 'מצלמה אחורית', fields: ['cameraMain'], dir: 'FORWARD' },
  { phrase: 'מצלמה ראשית', fields: ['cameraMain'], dir: 'FORWARD' },
  { phrase: 'מגה פיקסל', fields: ['cameraMain'], dir: 'BACKWARD' }, // "108 מגה פיקסל" -> BACKWARD
  { phrase: 'mp', fields: ['cameraMain'], dir: 'BACKWARD' },        // "48 mp" -> BACKWARD
  { phrase: 'מערכת מצלמות', fields: ['cameraSystem'], dir: 'FORWARD' },
  { phrase: 'זום אופטי', fields: ['hasOpticalZoom'], dir: 'FORWARD' }, // "זום אופטי x5" -> FORWARD
  { phrase: 'זום', fields: ['hasOpticalZoom'], dir: 'FORWARD' },
  
  // color
  { phrase: 'צבע', fields: ['color'], dir: 'FORWARD' },   // "צבע שחור" -> FORWARD
  { phrase: 'בצבע', fields: ['color'], dir: 'FORWARD' }, // "בצבע טיטניום" -> FORWARD
];

async function seedCategory(category, baseAnchors) {
  let count = 0;
  for (const a of baseAnchors) {
    const fieldConfMap = {};
    const defaultConf = a.dir === 'SELF' ? 0.95 : 0.88; 
    a.fields.forEach(f => fieldConfMap[f] = defaultConf);

    await p.fieldAnchor.upsert({
      where: { category_phrase: { category, phrase: a.phrase } },
      update: {
        relatedFields: a.fields,
        fieldConfidences: fieldConfMap,
        expectedDirection: a.dir,
        minDistance: a.dir === 'SELF' ? 0 : 1,
        maxDistance: a.dir === 'SELF' ? 2 : 4,
        confidence: defaultConf,
        isIgnored: false
      },
      create: {
        category,
        phrase: a.phrase,
        relatedFields: a.fields,
        fieldConfidences: fieldConfMap,
        expectedDirection: a.dir,
        minDistance: a.dir === 'SELF' ? 0 : 1,
        maxDistance: a.dir === 'SELF' ? 2 : 4,
        confidence: defaultConf,
        isIgnored: false
      }
    });
    count++;
  }
  return count;
}

async function runAll() {
  console.log("=== SEEDING HEBREW LOGIC ANCHORS FOR ALL CATEGORIES ===\n");
  
  const categories = {
    'LAPTOPS': [{ phrase: 'בריאות סוללה', fields: ['batteryHealth'], dir: 'FORWARD' }, { phrase: '%', fields: ['batteryHealth'], dir: 'BACKWARD' }],
    'DESKTOPS': COMPUTER_ANCHORS,
    'AIO': COMPUTER_ANCHORS,
    'CUSTOM_COMPUTERS': COMPUTER_ANCHORS,
    'SCREENS': SCREEN_ANCHORS,
    'TVS': SCREEN_ANCHORS,
    'טלוויזיות': SCREEN_ANCHORS,
    'SMARTPHONES': SMARTPHONE_ANCHORS
  };

  let total = 0;
  for (const [cat, items] of Object.entries(categories)) {
    console.log(`Processing ${cat}...`);
    const n = await seedCategory(cat, items);
    console.log(`✅ [${cat}] ${n} anchors verified/upserted.`);
    total += n;
  }
  console.log(`\n=== DONE! ${total} anchors perfectly adapted for Hebrew RTL typed logic ===`);
}

runAll().catch(console.error).finally(() => p.$disconnect());
