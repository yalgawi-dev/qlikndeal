"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_neon_1 = require("@prisma/adapter-neon");
const serverless_1 = require("@neondatabase/serverless");
function createPrismaClient() {
    const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
    const adapter = new adapter_neon_1.PrismaNeonHTTP(sql);
    return new client_1.PrismaClient({ adapter });
}
const prismadb = globalThis.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production")
    globalThis.prisma = prismadb;
exports.default = prismadb;
