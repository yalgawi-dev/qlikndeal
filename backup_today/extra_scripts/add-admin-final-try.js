const { PrismaClient } = require('@prisma/client');

async function main() {
    const url = "postgresql://neondb_owner:npg_xc2BgOjkFQt7@ep-lively-term-ag64z2el-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
    });

    try {
        console.log("Connecting with modified URL...");
        const count = await prisma.user.count();
        console.log(`Connection success! User count: ${count}`);

        const email = 'Dpccomp@gmail.com';
        let user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive'
                }
            }
        });

        if (user) {
            console.log(`User found: ${user.id}. Roles: ${user.roles}`);
            const newRoles = Array.from(new Set([...user.roles, 'ADMIN']));
            await prisma.user.update({
                where: { id: user.id },
                data: { roles: { set: newRoles } }
            });
            console.log("Updated existing user to ADMIN");
        } else {
            console.log("Creating new user...");
            await prisma.user.create({
                data: {
                    email: email,
                    roles: ['ADMIN', 'BUYER'],
                    firstName: 'Tomer',
                    isGuest: false
                }
            });
            console.log("Created new admin user");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
