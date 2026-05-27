require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  console.log("Querying computer_use_categories...");
  try {
    const result = await sql`
      SELECT * FROM computer_use_categories ORDER BY id
    `;
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Failed to query categories:", e);
  }
}

main();
