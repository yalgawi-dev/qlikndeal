import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLaptopsForm() {
    const fields = await prisma.categoryFormStructure.findMany({
        where: { category: 'LAPTOPS' }
    });
    console.log(JSON.stringify(fields, null, 2));
}

checkLaptopsForm()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
