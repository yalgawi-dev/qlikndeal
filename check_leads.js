const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manually load .env because we might not have 'dotenv' installed
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            // Simple parser for DATABASE_URL
            if (parts.length >= 2 && parts[0].trim() === 'DATABASE_URL') {
                // Join back if '=' was in the value, and clean quotes
                const val = parts.slice(1).join('=').trim().replace(/"/g, '');
                process.env.DATABASE_URL = val;
                console.log('Loaded DATABASE_URL from .env: ' + val);
            }
        });
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
