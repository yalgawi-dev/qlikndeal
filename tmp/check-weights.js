const { PrismaClient } = require('@prisma/client');
const { PrismaNeonHTTP } = require('@prisma/adapter-neon');
const { neon } = require('@neondatabase/serverless');
const { config } = require('dotenv');

config();
const sql = neon(process.env.DATABASE_URL);
const adapter = new PrismaNeonHTTP(sql);
const prisma = new PrismaClient({ adapter });

async function run() {
    console.log("--- Anchor 'מעבד' ---");
    const res = await prisma.fieldValueReliability.findMany({ where: { anchor: 'מעבד' } });
    console.table(res);

    console.log("--- Anchor 'זיכרון' ---");
    const res2 = await prisma.fieldValueReliability.findMany({ where: { anchor: 'זיכרון' } });
    console.table(res2);
    
    // בוא נבדוק אם יש רשומות שמחברות מעבד אל subModel
    const wrong = await prisma.fieldValueReliability.findMany({
        where: {
            field: 'subModel',
            anchor: { in: ['מעבד', 'ram', 'זיכרון', 'מסך', 'storage', 'אחסון'] }
        }
    });
    console.log("--- Wrong subModel connections ---");
    console.table(wrong);
}

run().catch(console.error).finally(() => prisma.$disconnect());
