const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    await prisma.fieldValueReliability.deleteMany({
        where: { category: 'PHONES', value: { in: ['16gb', 'intel core i7-13700h', '512gb ssd', '98', 'xps 13', 'xps 1'] } }
    });
    console.log("Deleted erroneous PHONES learned entries.");
}

clean().finally(() => prisma.$disconnect());
