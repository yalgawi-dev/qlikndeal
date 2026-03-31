import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking Dict for מושלם...");
        const res = await prisma.fieldValueReliability.findMany({
            where: { value: { contains: "מושלם" } }
        });
        console.dir(res, { depth: null });
        
        console.log("Checking Context for מושלם...");
        const res2 = await prisma.contextPattern.findMany({
            where: { patternPart: { contains: "מושלם" } }
        });
        console.dir(res2, { depth: null });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
