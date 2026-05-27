const fs = require('fs');
const path = require('path');

function searchInFiles(dirPath, query) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                searchInFiles(fullPath, query);
            }
        } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.mjs')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(query)) {
                console.log(`Found "${query}" in file: ${fullPath}`);
            }
        }
    });
}

console.log("=== SEARCHING FOR MOTHERBOARD_DATABASE IN CODEBASE ===");
searchInFiles('c:/yehuda/project/אפליקציה/Qlikndeal', 'MOTHERBOARD_DATABASE');
searchInFiles('c:/yehuda/project/אפליקציה/Qlikndeal', 'motherboardCatalog');
