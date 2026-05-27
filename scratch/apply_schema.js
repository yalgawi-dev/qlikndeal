require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  console.log("Creating software_applications table...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS software_applications (
        id SERIAL PRIMARY KEY,
        app_name_en VARCHAR(255) NOT NULL,
        app_name_he VARCHAR(255),
        category_id INT REFERENCES computer_use_categories(id) ON DELETE SET NULL,
        min_ram_gb_override INT,              
        min_vram_gb_override INT,
        is_popular BOOLEAN DEFAULT FALSE,
        icon_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Table software_applications created successfully.");
  } catch (e) {
    console.error("Failed to create table:", e);
  }
}

main();
