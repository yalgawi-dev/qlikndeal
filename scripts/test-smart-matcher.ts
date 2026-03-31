import { detectCategory, smartMatch } from "../src/lib/matcher-core";
import prismadb from "../src/lib/prismadb";

async function run() {
  console.log("=== QLIKNDEAL SMART-MATCHER MOCK TEST ===\n");

  // TEST 1: Pipeline A (Global/AI)
  const query1 = "אייפון 13";
  console.log(`[TEST 1] Free Search (Pipeline A): "${query1}"`);
  console.log("--------------------------------------------------");
  const results1 = await smartMatch(query1, 5);
  console.log(`Category Decided: ${results1.length > 0 ? results1[0].matchedCategory : "No match"}`);
  console.log(`Top match: ${results1.length > 0 ? results1[0].item.brand + " " + results1[0].item.modelName : "None"}`);
  if (results1.length > 0) console.log("Extracted Specs:", results1[0].extractedSpecs, "\n");

  // TEST 2: Pipeline B (Targeted/Locked)
  const query2 = "ThinkPad";
  console.log(`[TEST 2] Targeted Search (Pipeline B): "${query2}" specifically under LAPTOPS`);
  console.log("--------------------------------------------------");
  const results2 = await smartMatch(query2, 2, "LAPTOPS"); // Lock to laptops explicitly
  console.log(`Category Locked: ${results2.length > 0 ? results2[0].matchedCategory : "No match"}`);
  console.log(`Top match: ${results2.length > 0 ? results2[0].item.brand + " " + results2[0].item.modelName : "None"}\n`);

}

run().catch(console.error).finally(() => process.exit(0));
