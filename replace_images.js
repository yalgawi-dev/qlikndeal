const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if there are img tags
    if (content.includes('<img ')) {
        console.log(`Fixing ${filePath}`);

        // Add import if missing
        if (!content.includes('import Image from "next/image"')) {
            // Find the last import
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLine = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, endOfLine + 1) + 'import Image from "next/image";\n' + content.slice(endOfLine + 1);
            } else {
                content = 'import Image from "next/image";\n' + content;
            }
        }

        // Replace <img ... /> and <img ...>...</img>
        content = content.replace(/<img(.*?)(\/?)>/g, (match, p1, p2) => {
            // Add width/height if missing to prevent Next.js errors
            let extra = '';
            if (!p1.includes('width=')) extra += ' width={400}';
            if (!p1.includes('height=')) extra += ' height={400}';
            // ensure any "class=" becomes "className=" (though standard React should already be className)

            // For Next.js, use style={{ width: '100%', height: 'auto', objectFit: 'contain' }} or just keep the original classes
            return `<Image${p1}${extra}${p2 ? '/' : ''}>`;
        });

        fs.writeFileSync(filePath, content, 'utf8');
    }
}

walkDir('./src', processFile);
console.log('Done!');
