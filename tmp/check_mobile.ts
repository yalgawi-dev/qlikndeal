import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function check() {
  const count = await p.mobileCatalog.count();
  console.log("ACTUAL DB MOBILE COUNT:", count);
  await p.$disconnect();
}
check();
