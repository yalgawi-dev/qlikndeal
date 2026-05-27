const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB AUDIT FOR MOTHERBOARDS ===");

    // 1. Check MOTHERBOARDS form structure
    try {
        const fields = await prisma.categoryFormStructure.findMany({
            where: { category: "MOTHERBOARDS" },
            orderBy: { order: 'asc' }
        });
        console.log(`\nFound ${fields.length} fields for MOTHERBOARDS category:`);
        fields.forEach(f => {
            console.log(`  FieldID: ${f.fieldId} | Label: "${f.labelHera}" | Type: ${f.fieldType}`);
        });
    } catch (e) {
        console.error("Error reading MOTHERBOARDS form structure:", e);
    }

    // 2. Check options for 'motherboard' field in CUSTOM_COMPUTERS
    try {
        const options = await prisma.formFieldOption.findMany({
            where: {
                category: "CUSTOM_COMPUTERS",
                fieldId: "motherboard"
            },
            take: 20
        });
        console.log(`\nFound ${options.length} options for 'motherboard' in CUSTOM_COMPUTERS (showing up to 20):`);
        options.forEach(o => {
            console.log(`  Value: "${o.value}" | Dynamic: ${o.isDynamic}`);
        });
    } catch (e) {
        console.error("Error reading CUSTOM_COMPUTERS motherboard options:", e);
    }

    // 3. Check MotherboardCatalog count
    try {
        const count = await prisma.motherboardCatalog.count();
        console.log(`\nTotal motherboards in MotherboardCatalog: ${count}`);
        
        const sample = await prisma.motherboardCatalog.findMany({ take: 5 });
        console.log("Sample motherboards:");
        sample.forEach(m => {
            console.log(`  Brand: ${m.brand} | Model: ${m.model} | Socket: ${m.socket} | RAM: ${m.ramType}`);
        });
    } catch (e) {
        console.error("Error reading MotherboardCatalog:", e);
    }

    await prisma.$disconnect();
}

main().catch(console.error);
