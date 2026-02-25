const fs = require('fs');

// Read both HTML databases
function loadDB(path) {
    const html = fs.readFileSync(path, 'utf8');
    const match = html.match(/const DB = (\[.*?\]);/s);
    if (!match) { console.error('No DB found in', path); return []; }
    return JSON.parse(match[1]);
}

const db1 = loadDB('c:/Users/yalga/Desktop/offline-pc-database.html');
const db2 = loadDB('c:/Users/yalga/Desktop/offline-pc-database (1).html');

// Merge, dedup by model_number (db2 overrides db1 for same SKU as it's likely more detailed)
const bySkuMap = new Map();
[...db1, ...db2].forEach(item => {
    if (item.model_number) bySkuMap.set(item.model_number, item);
});
const db = Array.from(bySkuMap.values());
console.log(`HTML records: db1=${db1.length}, db2=${db2.length}, merged unique=${db.length}`);

// Read current computer-data.ts
const code = fs.readFileSync('./src/lib/computer-data.ts', 'utf8');

function getBrand(name) {
    if (name.includes('Apple') || name.includes('MacBook') || name.includes('iMac') || name.includes('Mac ')) return 'Apple';
    if (name.includes('Alienware')) return 'Dell';
    if (name.includes('Dell')) return 'Dell';
    if (name.includes('HP') || name.includes('Spectre') || name.includes('Envy') || name.includes('EliteBook') || name.includes('Omen') || name.includes('Pavilion') || name.includes('ZBook')) return 'HP';
    if (name.includes('Lenovo') || name.includes('ThinkPad') || name.includes('IdeaPad') || name.includes('Legion') || name.includes('Yoga') || name.includes('ThinkStation')) return 'Lenovo';
    if (name.includes('ASUS') || name.includes('ZenBook') || name.includes('ROG') || name.includes('VivoBook') || name.includes('ProArt') || name.includes('Mini PC PN')) return 'ASUS';
    if (name.includes('MSI')) return 'MSI';
    if (name.includes('Razer')) return 'Razer';
    if (name.includes('Microsoft') || name.includes('Surface')) return 'Microsoft';
    if (name.includes('Samsung') || name.includes('Galaxy Book')) return 'Samsung';
    if (name.includes('Acer') || name.includes('Predator') || name.includes('Nitro') || name.includes('Swift')) return 'Acer';
    return 'Other';
}

function getFamily(item) {
    const n = item.model_name;
    const families = [
        'MacBook Air', 'MacBook Pro', 'Mac Mini', 'Mac Studio', 'Mac Pro', 'iMac',
        'XPS', 'Inspiron', 'Latitude', 'Precision', 'Alienware', 'OptiPlex', 'Aurora',
        'Spectre x360', 'Envy', 'EliteBook', 'Omen', 'Pavilion', 'ZBook', 'Z4',
        'ThinkPad X1 Carbon', 'ThinkPad T', 'ThinkPad E', 'ThinkPad P', 'ThinkStation', 'IdeaPad', 'Legion', 'Yoga',
        'ZenBook', 'ROG Zephyrus', 'ROG Strix', 'VivoBook', 'ProArt', 'Mini PC PN',
        'Titan', 'Raider', 'Creator',
        'Blade',
        'Surface Laptop Studio', 'Surface Laptop', 'Surface Pro',
        'Galaxy Book',
        'Swift', 'Predator Helios', 'Nitro',
        'Intel NUC', 'Beelink'
    ];
    for (const f of families) {
        if (n.includes(f)) return f;
    }
    return n.split(' ').slice(0, 2).join(' ');
}

// Build the new enriched entries - keyed by SKU (model_number) for dedup
const htmlEntries = {};
db.forEach(item => {
    htmlEntries[item.model_number] = item;
});

// Now read and update the COMPUTER_DATABASE in the TS file
// We'll merge the rich data into existing subModels where SKU matches
// Find COMPUTER_DATABASE bounds
const dbStart = code.indexOf('export const COMPUTER_DATABASE');
const jsonStart = code.indexOf(': Record<string, ComputerModelFamily[]> = ', dbStart) + ': Record<string, ComputerModelFamily[]> = '.length;

// Find the end - look for next export after the DB
const dbEnd = code.indexOf('\nexport const COMPUTER_MODELS', jsonStart);
const afterDB = dbEnd; // position of \nexport const COMPUTER_MODELS

// The JSON ends with };\n before the next export
// Find the semicolon before the next export
const jsonEnd = code.lastIndexOf('};', afterDB) + 1; // include the }

let existingDB;
try {
    const jsonStr = code.substring(jsonStart, jsonEnd);
    existingDB = JSON.parse(jsonStr);
    console.log('Existing brands:', Object.keys(existingDB).length);
} catch (e) {
    console.error('Failed to parse existing DB:', e.message.substring(0, 100));
    // Try to find exact position
    const testStr = code.substring(jsonStart, jsonEnd);
    console.log('JSON length:', testStr.length);
    process.exit(1);
}

// Enrich existing entries AND add new HTML entries
let enriched = 0, added = 0;

// First, enrich existing entries
for (const brand in existingDB) {
    for (const family of existingDB[brand]) {
        for (const sub of family.subModels) {
            if (sub.skus) {
                for (const sku of sub.skus) {
                    const htmlItem = htmlEntries[sku.id];
                    if (htmlItem) {
                        // Enrich the submodel with rich data from HTML
                        if (htmlItem.battery && !sub.battery) sub.battery = htmlItem.battery;
                        if (htmlItem.ports && !sub.ports) sub.ports = htmlItem.ports;
                        if (htmlItem.weight && !sub.weight) sub.weight = htmlItem.weight;
                        if (htmlItem.release_year && !sub.release_year) sub.release_year = htmlItem.release_year;
                        if (htmlItem.notes && !sub.notes) sub.notes = htmlItem.notes;
                        // Also fix display to be full string
                        if (htmlItem.display) sub.display = htmlItem.display;
                        enriched++;
                    }
                }
            }
        }
    }
}

// Then add any HTML entries not already in the DB
db.forEach(item => {
    const brand = getBrand(item.model_name);
    const family = getFamily(item);

    if (!existingDB[brand]) existingDB[brand] = [];

    let familyObj = existingDB[brand].find(f => f.name === family);
    if (!familyObj) {
        familyObj = { name: family, type: item.type.toLowerCase(), subModels: [] };
        existingDB[brand].push(familyObj);
    }

    // Check if SKU already exists anywhere
    const alreadyExists = familyObj.subModels.some(s =>
        s.skus && s.skus.some(sk => sk.id === item.model_number)
    );

    if (!alreadyExists) {
        const sizeM = item.display ? item.display.match(/^([\d.]+)\"/) : null;
        familyObj.subModels.push({
            name: item.model_name,
            screenSize: sizeM ? [sizeM[1] + '"'] : undefined,
            cpu: [item.cpu],
            gpu: item.gpu ? [item.gpu] : undefined,
            ram: [item.ram],
            storage: [item.storage],
            os: [item.os],
            battery: item.battery || undefined,
            ports: item.ports || undefined,
            weight: item.weight || undefined,
            release_year: item.release_year || undefined,
            notes: item.notes || undefined,
            display: item.display || undefined,
            skus: [{ id: item.model_number, cpu: [item.cpu], gpu: item.gpu ? [item.gpu] : undefined, ram: [item.ram], storage: [item.storage], os: [item.os] }]
        });
        added++;
    }
});

console.log(`Enriched: ${enriched}, Added new: ${added}`);

// Rebuild the TS file
const newJsonStr = JSON.stringify(existingDB, null, 4);
const newCode = code.substring(0, jsonStart) + newJsonStr + ';\n\n// Legacy export for backward compatibility\n' + code.substring(dbEnd + 1);
fs.writeFileSync('./src/lib/computer-data.ts', newCode);
console.log('Done! File updated.');

// Verify Nitro 5
const nitro = existingDB['Acer']?.find(f => f.name === 'Nitro')?.subModels?.find(s => s.skus?.some(sk => sk.id === 'AN515-58-525P'));
if (nitro) {
    console.log('Nitro 5 sample:', JSON.stringify({ battery: nitro.battery, ports: nitro.ports, weight: nitro.weight, release_year: nitro.release_year, notes: nitro.notes }, null, 2));
}
