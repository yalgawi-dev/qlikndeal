const fs = require('fs');
const path = require('path');

const pagePath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\src\\app\\dashboard\\marketplace\\my-requests\\page.tsx';
const content = fs.readFileSync(pagePath, 'utf8');
const lines = content.split('\n');

for (let i = 800; i < 860 && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
