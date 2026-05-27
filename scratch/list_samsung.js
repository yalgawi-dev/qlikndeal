const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const samsung = await prisma.mobileCatalog.findMany({
        where: { brand: { contains: "samsung", mode: "insensitive" } },
        take: 30
    });
    console.log("Samsung count in MobileCatalog:", samsung.length);
    for (const s of samsung) {
        console.log(`ID: ${s.id} | Brand: ${s.brand} | Series: ${s.series} | Model: ${s.modelName} | Aliases: ${JSON.stringify(s.hebrewAliases)}`);
    }
}

main()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
