import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking users...");
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            roles: true,
            clerkId: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
