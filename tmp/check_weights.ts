import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    console.log("=== CHECKING WEIGHTS IN DB ===");
    
    const ram = await prisma.fieldValueReliability.findFirst({ where: { field: 'ram' } });
    console.log('RAM:', ram);
    
    const cpu = await prisma.fieldValueReliability.findFirst({ where: { field: 'cpu' } });
    console.log('CPU:', cpu);

    const storage = await prisma.fieldValueReliability.findFirst({ where: { field: 'storage' } });
    console.log('STORAGE:', storage);
    
    const all = await prisma.fieldValueReliability.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    console.log('Recent Additions:', all);
}

check().finally(() => prisma.$disconnect());
