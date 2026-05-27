const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking active computer listings in the database...");
  const listings = await prisma.marketplaceListing.findMany({
    where: {
      status: "ACTIVE"
    }
  });

  console.log(`Found ${listings.length} active listings.`);
  listings.forEach((l, index) => {
    console.log(`\nListing #${index + 1}:`);
    console.log(`ID: ${l.id}`);
    console.log(`Title: ${l.title}`);
    console.log(`Price: ${l.price}`);
    console.log(`Category: ${l.category}`);
    console.log(`extraData: ${l.extraData}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
