const { Client } = require('pg');

// הכתובת הישירה ששמנו ב-.env
const connectionString = "postgresql://neondb_owner:npg_xc2BgOjkFQt7@ep-lively-term-ag64z2el-pooler.c-2.eu-central-1.aws.neon.tech:443/neondb?sslmode=require&options=project%3Dlively-bar-05047458";

async function testConnection() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log("Trying to connect to Neon directly...");

    try {
        await client.connect();
        console.log("✅ SUCCESS! Your computer can reach the database.");
        const res = await client.query('SELECT NOW()');
        console.log("Server time:", res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error("❌ FAILED to connect!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);

        if (err.message.includes("ETIMEDOUT")) {
            console.log("\nInsight: The connection timed out. This usually means a firewall or your ISP is blocking the port (5432).");
        } else if (err.message.includes("no pg_hba.conf entry")) {
            console.log("\nInsight: The server reached but rejected you. This means the IP is definitely blocked in Neon settings.");
        }
    }
}

testConnection();
