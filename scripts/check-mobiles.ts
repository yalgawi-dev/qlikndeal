import prismadb from "../src/lib/prismadb";

async function run() {
  const mobiles = await prismadb.mobileCatalog.findMany({
    where: { brand: "Apple" }
  });
  console.log(`Found ${mobiles.length} Apple mobiles`);
  mobiles.forEach(m => console.log(m.brand, m.modelName));
}

run().catch(console.error).finally(() => process.exit(0));
