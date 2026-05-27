const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB CLEANUP FOR CUSTOM_COMPUTERS FORM STRUCTURE ===");
    
    // 1. Delete fields from CategoryFormStructure
    const deletedFields = await prisma.categoryFormStructure.deleteMany({
        where: {
            category: "CUSTOM_COMPUTERS",
            fieldId: { in: ["brand", "family", "subModel"] }
        }
    });
    console.log(`Deleted ${deletedFields.count} fields from CategoryFormStructure.`);

    // 2. Delete options from FormFieldOption
    const deletedOptions = await prisma.formFieldOption.deleteMany({
        where: {
            category: "CUSTOM_COMPUTERS",
            fieldId: { in: ["brand", "family", "subModel"] }
        }
    });
    console.log(`Deleted ${deletedOptions.count} options from FormFieldOption.`);

    await prisma.$disconnect();
}

main().catch(console.error);
