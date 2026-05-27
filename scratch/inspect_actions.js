const fs = require('fs');
const path = require('path');

const actionPath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\src\\app\\actions\\marketplace.ts';
const content = fs.readFileSync(actionPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
    if (line.trim().startsWith('export async function') || line.trim().startsWith('export const')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
