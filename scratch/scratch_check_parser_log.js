const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking ParserLog for Lenovo...");
    const logs = await prisma.parserLog.findMany({
        where: {
            OR: [
                { originalText: { contains: "Lenovo", mode: "insensitive" } },
                { originalText: { contains: "לנובו", mode: "insensitive" } },
                { aiParsed: { contains: "Lenovo", mode: "insensitive" } },
                { userFinal: { contains: "Lenovo", mode: "insensitive" } }
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("ParserLogs found:", JSON.stringify(logs, null, 2));

    console.log("\nChecking UserCorrection for Lenovo...");
    const corrections = await prisma.userCorrection.findMany({
        where: {
            OR: [
                { originalText: { contains: "Lenovo", mode: "insensitive" } },
                { originalText: { contains: "לנובו", mode: "insensitive" } }
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("Corrections found:", JSON.stringify(corrections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
