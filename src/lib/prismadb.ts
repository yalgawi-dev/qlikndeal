import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

declare global {
    var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
    const sql = neon(process.env.DATABASE_URL!);
    const adapter = new PrismaNeonHTTP(sql);
    return new PrismaClient({ adapter } as any);
}

const prismadb = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;

export default prismadb;
