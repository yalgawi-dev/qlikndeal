const fs = require('fs');
const content = `
import { ContextAwareParser } from './src/lib/parsing/contextAwareParser';
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  const text = "מכירה עקב גיוס - מחשב גיימינג מפלצת! אסוס רוג סטריקס שנת 2022. דגם G15. המחשב במצב פצצה, מריץ הכל על אולטרה בלי להתאמץ. מעבד AMD Ryzen 9 חזק בטירוף, כרטיס מסך מובנה RTX 3060, ומסך 15.6 עם 144 הרץ. מגיע עם 16 ראם וכונן טרה מהיר. מוכר ב-3800 שח סופי בהחלט, לא להתווכח על השקל. שנת 2022 ככה שזה מחיר פצצה. איסוף מראשון לציון או משלוח בתוספת תשלום. לא בשבת.";
  const anchors = await p.fieldAnchor.findMany({ where: { category: 'LAPTOPS', isIgnored: false } });
  const safe = await p.fieldValueReliability.findMany({ where: { category: 'LAPTOPS', isIgnored: false } });
  
  const ctx = {
    category: 'LAPTOPS',
    originalText: text,
    anchors,
    safeValues: safe
  };
  
  const res = await ContextAwareParser.parse(ctx);
  console.log(JSON.stringify(res, null, 2));
  await p.$disconnect();
}
run().catch(console.error);
`;
fs.writeFileSync('debug_parser.ts', content);
