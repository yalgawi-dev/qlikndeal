const fs = require("fs");
const path = require("path");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (file === "node_modules" || file === ".next" || file === ".git") return;
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".json")) {
                const content = fs.readFileSync(fullPath, "utf8");
                if (content.includes("extraData")) {
                    results.push(fullPath);
                }
            }
        }
    });
    return results;
}

const found = walk(process.cwd());
console.log("Found files containing 'extraData':");
found.forEach(f => console.log(`- ${f}`));
