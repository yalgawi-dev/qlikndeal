import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Promoting Yehuda to ADMIN...");
    const user = await prisma.user.update({
        where: { id: "ff390bde-8e83-42a5-bbc0-d8f56de8819e" },
        data: {
            roles: ["BUYER", "ADMIN"]
        }
    });
    console.log("Updated user:", user);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
