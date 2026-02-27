const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking for AdminTask table...");
        const tasks = await prisma.adminTask.findMany();
        console.log("AdminTask table exists. Count:", tasks.length);

        console.log("Checking for AdminNote table...");
        const notes = await prisma.adminNote.findMany();
        console.log("AdminNote table exists. Count:", notes.length);
    } catch (e) {
        console.error("Tables might not exist yet:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
