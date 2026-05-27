const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
                results = results.concat(walk(filePath));
            }
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk('./src');
console.log(`Found ${files.length} code files. Searching for queries...`);

const query1 = 'listingType';
const query2 = 'BuyerRequest';
const query3 = 'createListing';

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(query1)) {
            console.log(`[listingType] in: ${file}`);
        }
        if (content.includes(query2)) {
            console.log(`[BuyerRequest] in: ${file}`);
        }
        if (content.includes(query3)) {
            // Find specific lines
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.includes(query3)) {
                    console.log(`[createListing] in: ${file}:${index + 1} - ${line.trim()}`);
                }
            });
        }
    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
});
