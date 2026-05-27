const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\src');
const searchPhrases = ["מודעות שלי ובבקשות", "הצע מוצר", "צפה במודעות שלי", "צפה בהצעות שקיבלת", "יש לי כזה מוצר"];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        searchPhrases.forEach(phrase => {
            if (content.includes(phrase)) {
                console.log(`Found "${phrase}" in file: ${file}`);
            }
        });
    } catch (e) {
        console.error(`Error reading file: ${file}`, e);
    }
});
