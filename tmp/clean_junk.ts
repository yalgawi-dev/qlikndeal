import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanJunk() {
    try {
        console.log("Deleting 'מושלם' from batteryHealth...");
        await prisma.fieldValueReliability.deleteMany({
            where: { value: "מושלם", field: "batteryHealth" }
        });
        
        console.log("Deleting 'לקנות!' from Numeric...");
        await prisma.fieldValueReliability.deleteMany({
            where: { value: "לקנות!", field: "Numeric" }
        });
        console.log("Deleting 'Numeric' mapped ContextPatterns...");
        await prisma.contextPattern.deleteMany({
            where: { field: "Numeric" }
        });

        console.log("Done cleaning junk from DB.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanJunk();
