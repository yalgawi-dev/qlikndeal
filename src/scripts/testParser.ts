import prisma from "../lib/prismadb";
import { ContextAwareParser } from "../lib/parsing/contextAwareParser";

async function main() {
  console.log("🚀 Starting Seed and Test for 'Navigation in the Dark'");

  const category = "LAPTOPS";

  await prisma.fieldAnchor.deleteMany({ where: { category } });
  await prisma.fieldValueReliability.deleteMany({ where: { category } });

  console.log("💡 Seeding 'Anchors' (המכוונים והפנסים)...");
  await prisma.fieldAnchor.createMany({
    data: [
      {
        phrase: "עולה",
        category,
        relatedFields: ["price"],
        expectedType: "NUMBER",
        expectedDirection: "FORWARD",
        maxDistance: 4,
        confidence: 0.9,
      },
      {
        phrase: "שח",
        category,
        relatedFields: ["price"],
        expectedType: "NUMBER",
        expectedDirection: "BACKWARD",
        maxDistance: 2,
        isSuffix: true,
        confidence: 0.95,
      },
      {
        phrase: "נפח",
        category,
        relatedFields: ["storage"],
        expectedType: "NUMBER",
        expectedDirection: "FORWARD",
        maxDistance: 3,
        confidence: 0.85,
      }
    ]
  });

  console.log("🕯️ Seeding 'Candles' (נרות / ערכים בטוחים)...");
  await prisma.fieldValueReliability.createMany({
    data: [
      {
        category,
        field: "ram",
        value: "16GB",
        confidence: 0.99,
      },
      {
        category,
        field: "brand",
        value: "Lenovo",
        confidence: 0.99,
      }
    ]
  });

  const originalText = "אני מוכר פה מחשב נייד מטורף Lenovo פצצה עולה רק 2500 שח ויש לו זיכרון של 16GB נפח אחסון 256 מוזמנים להתקשר";
  
  console.log("\n==================================");
  console.log("🕵️ THE PARSER IS NAVIGATING IN THE DARK");
  console.log("Input Text:", originalText);
  console.log("==================================\n");

  const results = await ContextAwareParser.parse({
    category,
    originalText
  });

  console.log("✅ EXTRACTED FIELDS:");
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
