const fs = require('fs');
const path = require('path');

const pagePath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\src\\app\\dashboard\\marketplace\\my-requests\\page.tsx';
const content = fs.readFileSync(pagePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
    if (line.includes('RadarDetailModal') || line.includes('selectedRequest') || line.includes('Modal') || line.includes('<Dialog')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
