const fs = require('fs');
const path = require('path');

function searchInFile(filePath, query) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let results = [];
    lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({ lineNum: idx + 1, content: line.trim() });
        }
    });
    return results;
}

const files = [
    'src/lib/analyze.ts',
    'src/lib/listing-ai.ts',
    'src/lib/matchmaker.ts',
    'src/lib/matcher-core.ts',
    'src/lib/expert-pipeline.ts'
];

console.log("=== SEARCH FOR 'aio' / 'imac' IN CORE CODE ===");
files.forEach(f => {
    const absPath = path.resolve('c:/yehuda/project/אפליקציה/Qlikndeal', f);
    if (fs.existsSync(absPath)) {
        const aioRes = searchInFile(absPath, 'aio');
        const imacRes = searchInFile(absPath, 'imac');
        console.log(`\nFile: ${f} | 'aio' matches: ${aioRes.length} | 'imac' matches: ${imacRes.length}`);
        
        if (aioRes.length > 0) {
            console.log("AIO matches sample:");
            aioRes.slice(0, 5).forEach(m => console.log(`  Line ${m.lineNum}: ${m.content}`));
        }
        if (imacRes.length > 0) {
            console.log("iMac matches sample:");
            imacRes.slice(0, 5).forEach(m => console.log(`  Line ${m.lineNum}: ${m.content}`));
        }
    } else {
        console.log(`File not found: ${f}`);
    }
});
