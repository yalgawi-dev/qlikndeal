const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/marketplace/RadarDetailModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update formatRadarValue for radius
const targetFormat = `    if (key === "radius") {
        return \`\${value} ק״מ\`;
    }`;

const replacementFormat = `    if (key === "radius") {
        return value && value > 0 ? \`\${value} ק״מ\` : "ללא הגבלה";
    }`;

const cleanFormat = s => s.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

if (cleanFormat(content).includes(cleanFormat(targetFormat))) {
    // Regex replace to handle line endings and spacing
    const regexFormat = /if\s*\(key\s*===\s*"radius"\)\s*\{\s*return\s*`\$\{value\}\s*ק״מ`;\s*\}/;
    const match = content.match(regexFormat);
    if (match) {
        content = content.replace(match[0], `if (key === "radius") {\n        return value && value > 0 ? \`\${value} ק״מ\` : "ללא הגבלה";\n    }`);
        console.log('✅ Updated formatRadarValue function.');
    } else {
        console.log('❌ Regex match failed for formatRadarValue.');
    }
} else {
    console.log('❌ Could not find target format function.');
}

// 2. Update Radius input in edit mode
const targetInput = `                                    {/* Radius */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">רדיוס חיפוש (ק״מ)</label>
                                        <input
                                            type="number"
                                            value={extra.radius || 25}
                                            onChange={e => updateFieldAndSyncText("radius", Number(e.target.value))}
                                            placeholder="25"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>`;

// Let's use regex matching for the input block to avoid whitespace mismatch
const regexInput = /\{\/\*\s*Radius\s*\*\/\}\s*<div\s+className="space-y-1">\s*<label\s+className="text-xs\s+text-gray-400">רדיוס\s+חיפוש\s+\(ק״מ\)<\/label>\s*<input\s+type="number"\s+value=\{extra\.radius\s*\|\|\s*25\}\s+onChange=\{e\s*=>\s*updateFieldAndSyncText\("radius",\s*Number\(e\.target\.value\)\)\}\s+placeholder="25"\s+className="w-full\s+bg-gray-800[^"]+"\s*\/>\s*<\/div>/;

const matchInput = content.match(regexInput);
if (matchInput) {
    const replacementInput = `{/* Radius */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">רדיוס חיפוש (ק״מ)</label>
                                        <input
                                            type="number"
                                            value={extra.radius === null || extra.radius === undefined ? "" : extra.radius}
                                            onChange={e => {
                                                const val = e.target.value === "" ? null : Number(e.target.value);
                                                updateFieldAndSyncText("radius", val);
                                            }}
                                            placeholder="ללא הגבלה"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>`;
    content = content.replace(matchInput[0], replacementInput);
    console.log('✅ Updated edit-mode radius input field.');
} else {
    // Let's check a looser regex
    const regexInputLoose = /<label\s+className="text-xs\s+text-gray-400">רדיוס\s+חיפוש\s+\(ק״מ\)<\/label>\s*<input\s+type="number"\s+value=\{extra\.radius\s*\|\|\s*25\}[^>]*\/>/;
    const looseMatch = content.match(regexInputLoose);
    if (looseMatch) {
        console.log('Found loose match:', looseMatch[0]);
    } else {
        console.log('❌ Could not find edit-mode radius input field.');
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
