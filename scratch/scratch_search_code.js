const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
                walk(filePath, results);
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.tsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk('C:\\yehuda\\project\\אפליקציה\\Qlikndeal\\src');
console.log(`Searching in ${files.length} files...`);

const query = 'my-requests';
const matches = [];

files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
            matches.push(f);
        }
    } catch (e) {
        // ignore
    }
});

console.log("Matches found for query:", query);
matches.forEach(m => console.log(" -", m));
