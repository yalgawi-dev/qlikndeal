const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(process.cwd(), "src/app/api/marketplace/smart-search/route.ts"), "utf8");
const lines = content.split("\n");
lines.forEach((line, idx) => {
    if (line.includes("extraData")) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
