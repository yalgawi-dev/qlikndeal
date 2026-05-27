const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB AUDIT FOR IMAC PARSER LOGS ===");
    try {
        const logs = await prisma.parserLog.findMany({
            where: {
                OR: [
                    { originalText: { contains: "iMac", mode: "insensitive" } },
                    { originalText: { contains: "איימק", mode: "insensitive" } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log(`Found ${logs.length} iMac parser logs:`);
        logs.forEach((log, idx) => {
            console.log(`\n--- Log #${idx + 1} ---`);
            console.log(`ID: ${log.id}`);
            console.log(`Created At: ${log.createdAt}`);
            console.log(`Original Text: "${log.originalText.replace(/\n/g, ' ')}"`);
            console.log(`AI Parsed Category (if in JSON):`, log.category);
            console.log(`AI Parsed details (aiParsed):`, log.aiParsed);
        });
    } catch (e) {
        console.error("Error reading parser logs:", e);
    }
    await prisma.$disconnect();
}

main().catch(console.error);
