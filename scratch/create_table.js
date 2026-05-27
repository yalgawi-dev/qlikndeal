const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    console.log("Connecting to Neon database over HTTPS (Port 443)...");
    await sql(`
      CREATE TABLE IF NOT EXISTS "software_requests" (
        "id" SERIAL PRIMARY KEY,
        "app_name" TEXT NOT NULL,
        "is_added" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'software_requests' successfully created/verified!");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

run();
