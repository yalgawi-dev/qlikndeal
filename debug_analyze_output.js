require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tsContent = `
import { masterAnalyze } from './src/lib/analyze';

async function main() {
  const text = [
    "למכירה: Dell Latitude 5440 – סוס עבודה דגם 2024!",
    "מחשב עסקי עוצמתי, אמין ומהיר בטירוף, במצב חדש מהניילון!",
    "יצרן: Dell",
    "סדרת יצרן: Latitude",
    "דגם יצרן: Latitude 5440",
    "מעבד (CPU): Intel Core i5 דור 13 (1335U)",
    "זיכרון (RAM): 16GB DDR5",
    "נפח אחסון (Storage): 512GB NVMe SSD",
    "מסך: 14 Full HD Anti-Glare",
    "מערכת הפעלה: Windows 11 Pro"
  ].join("\\n");

  console.log('Running masterAnalyze...');
  const results = await masterAnalyze(text, 'LAPTOPS');

  console.log('\\n=== RESULTS ===');
  results.forEach((r: any) => {
    const act = (r as any).action || r.uiAction || 'NONE';
    const icon = act === 'AUTO_FILL' ? '✅ AUTO_FILL' :
                 act === 'SUGGEST'   ? '💡 SUGGEST  ' :
                 act === 'CONFLICT_CATALOG' ? '🔴 CAT_CONF ' :
                 '❓ ' + act;
    const field = r.field.padEnd(14);
    console.log(\`  \${icon} | \${field} | "\${r.value}" | conf: \${r.confidence.toFixed(3)} | \${r.source}\`);
  });

  console.log('\\n=== MISSING FIELDS ===');
  const foundFields = new Set(results.map((r: any) => r.field));
  const expected = ['brand', 'family', 'subModel', 'cpu', 'ram', 'storage', 'os', 'screen'];
  expected.forEach(f => {
    console.log(\`  \${foundFields.has(f) ? '✅ FOUND' : '❌ MISSING'}: "\${f}"\`);
  });

  process.exit(0);
}
main().catch((e: any) => { console.error(e); process.exit(1); });
`;

const tmpFile = path.join(process.cwd(), '_tmp_analyze_test.ts');
fs.writeFileSync(tmpFile, tsContent, 'utf8');

console.log('Running masterAnalyze test...');
try {
  const output = execSync('npx tsx _tmp_analyze_test.ts 2>&1', {
    cwd: process.cwd(),
    timeout: 60000,
    encoding: 'utf8'
  });
  console.log(output);
} catch (e) {
  console.log((e).stdout || (e).message);
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
