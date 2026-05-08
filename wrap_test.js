const fs = require('fs');
const { execSync } = require('child_process');

const script = `
const { ContextAwareParser } = require('./src/lib/parsing/contextAwareParser');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  const text = "מכירה עקב גיוס - מחשב גיימינג מפלצת! אסוס רוג סטריקס שנת 2022. דגם G15. מוכר ב-3800 שח סופי בהחלט, לא להתווכח על השקל. שנת 2022 ככה שזה מחיר פצצה. איסוף מראשון לציון או משלוח בתוספת תשלום. לא בשבת.";
  
  const ctx = {
    category: 'LAPTOPS',
    originalText: text,
    anchors: await p.fieldAnchor.findMany({ where: { category: 'LAPTOPS' } }),
    safeValues: await p.fieldValueReliability.findMany({ where: { category: 'LAPTOPS' } })
  };
  
  const res = await ContextAwareParser.parse(ctx);
  console.log(JSON.stringify(res, null, 2));
}

run().finally(() => process.exit(0));
`;

fs.writeFileSync('temp_test.cjs', script);

try {
  // Use ts-node directly on the CJS file? No, we can compile it with swc/ts-node.
  // Actually, let's just write a script that runs internal analyze.
  console.log("Written temp_test.cjs");
} catch(e) {
  console.error(e);
}
