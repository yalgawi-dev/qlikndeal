const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB AUDIT FOR CUSTOM_COMPUTERS FORM STRUCTURE ===");
    try {
        const fields = await prisma.categoryFormStructure.findMany({
            where: {
                OR: [
                    { category: "CUSTOM_COMPUTERS" },
                    { category: "custom_computers" }
                ]
            },
            orderBy: { order: 'asc' }
        });
        console.log(`Found ${fields.length} fields for CUSTOM_COMPUTERS:`);
        fields.forEach(f => {
            console.log(`ID: ${f.id} | FieldID: ${f.fieldId} | Label: "${f.labelHera}" | Type: ${f.fieldType} | Section: "${f.sectionName}" | Required: ${f.isRequired}`);
        });
    } catch (e) {
        console.error("Error reading form structure:", e);
    }
    await prisma.$disconnect();
}

main().catch(console.error);
