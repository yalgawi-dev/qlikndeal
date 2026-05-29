import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL is not defined in environment");
        return;
    }

    console.log("Connecting using database URL...");
    const sql = neon(url);
    const adapter = new PrismaNeonHTTP(sql);
    const prisma = new PrismaClient({ adapter } as any);

    try {
        console.log("Altering User table to add idNo column...");
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "idNo" text;
        `);
        console.log("Success! Column idNo added or already exists.");
    } catch (error) {
        console.error("Error executing query:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
