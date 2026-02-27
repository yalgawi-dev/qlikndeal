import { PrismaClient, UserRole } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = 'Dpccomp@gmail.com';
    console.log(`Searching for email: ${email}`);

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive'
                }
            }
        });

        if (user) {
            console.log(`Found user: ${user.id}`);
            const newRoles: UserRole[] = Array.from(new Set([...user.roles, UserRole.ADMIN]));
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    roles: { set: newRoles }
                }
            });
            console.log("Successfully added ADMIN role to Tomer.");
        } else {
            console.log("Tomer not found in DB. Creating a placeholder user with ADMIN role.");
            await prisma.user.create({
                data: {
                    email: email,
                    roles: [UserRole.ADMIN, UserRole.BUYER],
                    firstName: 'Tomer',
                    isGuest: false
                }
            });
            console.log("Successfully created Tomer as an ADMIN.");
        }
    } catch (error) {
        console.error("Database connection failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
