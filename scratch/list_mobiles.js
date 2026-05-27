const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const mobiles = await prisma.mobileCatalog.findMany({
        where: { brand: { contains: "xiaomi", mode: "insensitive" } },
        take: 30
    });
    console.log("Xiaomi/Redmi models count:", mobiles.length);
    for (const m of mobiles) {
        console.log(`ID: ${m.id} | Brand: ${m.brand} | Series: ${m.series} | Model: ${m.modelName} | Aliases: ${JSON.stringify(m.hebrewAliases)}`);
    }
}

main()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
