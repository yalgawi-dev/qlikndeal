import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkOptions() {
    try {
        console.log("Checking Options for batteryHealth...");
        const res = await prisma.formFieldOption.findMany({
            where: { fieldId: "batteryHealth" }
        });
        console.dir(res, { depth: null });
        
        console.log("Checking Lexicon directly for batteryHealth...");
        const res2 = await prisma.fieldValueReliability.findMany({
            where: { field: "batteryHealth" }
        });
        console.dir(res2, { depth: null });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkOptions();
