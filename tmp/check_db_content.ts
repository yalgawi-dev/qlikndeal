
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
    const list = await prisma.vehicleCatalog.findMany({ take: 50 });
    console.log("FIRST 50 VEHICLES:", JSON.stringify(list, null, 2));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
