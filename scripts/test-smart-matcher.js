const { smartMatch } = require("../src/lib/matcher-core");

async function run() {
  const query = "מחפש מחשב נייד לנובו עם 16GB";
  console.log(`Testing query: "${query}"...\n`);
  
  const results = await smartMatch(query);
  
  console.log("JSON Output:");
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
