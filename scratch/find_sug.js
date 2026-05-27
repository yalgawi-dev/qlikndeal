const fs = require("fs");
const file = "src/components/marketplace/DynamicListingForm.tsx";
const code = fs.readFileSync(file, "utf8");
const lines = code.split("\n");
lines.forEach((l, i) => {
    if (l.includes("UniversalCatalogSearch")) {
        console.log(`${i + 1}: ${l.trim()}`);
    }
});
