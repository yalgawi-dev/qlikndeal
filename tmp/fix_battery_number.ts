import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setBatteryNumber() {
    try {
        await prisma.categoryFormStructure.updateMany({
            where: { fieldId: "batteryHealth" },
            data: { fieldType: "number" }
        });
        console.log("batteryHealth is now dynamically set to 'number' in the DB.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

setBatteryNumber();
