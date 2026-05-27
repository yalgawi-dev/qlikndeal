const fs = require('fs');
const path = require('path');

const filePath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\src\\app\\api\\marketplace\\smart-search\\route.ts';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);
lines.forEach((line, idx) => {
    if (line.includes('listingType') || line.includes('"BUY"') || line.includes("'BUY'") || line.includes('BuyerRequest')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
