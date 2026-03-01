const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmins() {
  const emails = ['yalgawi@gmail.com', 'darohadd@walla.com', 'dpccomp@gmail.com', 'itay@qlikndeal.com'];
  
  console.log("Upgrading users to ADMIN...");
  
  for (const email of emails) {
    try {
      const user = await prisma.user.update({
        where: { email: email },
        data: {
          roles: {
            set: ['BUYER', 'ADMIN']
          }
        }
      });
      console.log(`✅ User ${email} is now an ADMIN.`);
    } catch (error) {
      console.error(`❌ Could not update ${email}:`, error.message);
    }
  }
  
  await prisma.$disconnect();
}

makeAdmins();
