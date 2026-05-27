const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(process.cwd(), "src/app/dashboard/marketplace/my-requests/page.tsx"), "utf8");
const lines = content.split("\n");
lines.forEach((line, idx) => {
    if (line.includes("create") || line.includes("submit") || line.includes("extraData")) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
