import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const corrections = await prisma.userCorrection.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        console.log("--- User Corrections ---");
        console.log(JSON.stringify(corrections, null, 2));
    } catch (e: any) {
        console.log("No UserCorrection table or error:", e.message);
    }
}

main().finally(() => prisma.$disconnect());
