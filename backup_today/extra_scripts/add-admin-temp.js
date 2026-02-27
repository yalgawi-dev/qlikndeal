require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'Dpccomp@gmail.com';
    try {
        console.log(`Checking for user with email: ${email}`);
        let user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            // Try lower case just in case
            user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (user) console.log(`Found user ${user.id} with lowercased email: ${user.email}`);
        }

        if (user) {
            console.log(`User found: ${user.id}. Current roles: ${user.roles}`);
            if (user.roles.includes('ADMIN')) {
                console.log('User is already an ADMIN.');
            } else {
                const newRoles = Array.from(new Set([...user.roles, 'ADMIN']));
                const updatedUser = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        roles: {
                            set: newRoles
                        }
                    }
                });
                console.log(`User updated! New roles: ${updatedUser.roles}`);
            }
        } else {
            console.log('User not found. Creating new admin user...');
            const newUser = await prisma.user.create({
                data: {
                    email: email,
                    roles: ['ADMIN', 'BUYER'],
                    firstName: 'Tomer',
                    isGuest: false
                }
            });
            console.log(`New admin user created: ${newUser.id}`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
