import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixBatteryField() {
    try {
        console.log("Updating batteryHealth to be a text input field...");
        await prisma.categoryFormStructure.updateMany({
            where: { fieldId: "batteryHealth" },
            data: { fieldType: "text" }
        });
        
        console.log("Deleted old dropdown options for batteryHealth...");
        await prisma.formFieldOption.deleteMany({
            where: { fieldId: "batteryHealth" }
        });

        console.log("Done!");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixBatteryField();
