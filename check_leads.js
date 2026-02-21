const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manually load .env because we might not have 'dotenv' installed
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;

            const firstEq = trimmedLine.indexOf('=');
            if (firstEq > -1) {
                const key = trimmedLine.substring(0, firstEq).trim();
                let val = trimmedLine.substring(firstEq + 1).trim();

                // Remove quotes if present
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }

                if (key === 'DATABASE_URL') {
                    process.env.DATABASE_URL = val;
                    console.log('Loaded DATABASE_URL from .env successfully.');
                }
            }
        }
    } else {
        console.log('Warning: No .env file found at ' + envPath);
    }
} catch (e) {
    console.log('Could not load .env file manually:', e.message);
}

const prisma = new PrismaClient();

async function checkLeads() {
    try {
        const leads = await prisma.shadowLead.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log("--- Latest Leads in Database ---");
        if (leads.length === 0) {
            console.log("No leads found yet (Empty Array).");
            console.log("Current DB URL used by Prisma: " + process.env.DATABASE_URL);
        } else {
            leads.forEach((lead, i) => {
                console.log(`\nLead #${i + 1}:`);
                console.log(`Seller: ${lead.sellerName}`);
                console.log(`Link: ${lead.sellerLink}`);
                console.log(`Text: ${lead.postText ? lead.postText.substring(0, 50) + "..." : "No text"}`);
                console.log(`Text: ${lead.postText ? lead.postText.substring(0, 50) + "..." : "No text"}`);
                console.log(`Images: ${lead.images ? JSON.parse(lead.images).length : 0}`);
                if (lead.images && lead.images !== "[]") {
                    try {
                        const imgs = JSON.parse(lead.images);
                        console.log(`Example Image: ${imgs[0].substring(0, 40)}...`);
                    } catch (e) { }
                }
                console.log(`Captured At: ${lead.createdAt}`);
            });
        }
    } catch (e) {
        console.error("Error checking DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkLeads();
