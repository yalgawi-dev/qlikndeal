const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('Searching in MarketplaceListing...');
        const listings = await prisma.marketplaceListing.findMany({
            where: {
                title: {
                    contains: 'Lenovo',
                }
            },
            include: {
                seller: true
            }
        });
        console.log(`Found ${listings.length} listings:`);
        listings.forEach(l => {
            console.log(`- ID: ${l.id}, Title: "${l.title}", Price: ${l.price}, Type: ${l.listingType}, Status: ${l.status}, Seller: ${l.seller?.firstName} ${l.seller?.lastName} (${l.seller?.primaryEmail || 'no-email'})`);
        });

        console.log('\nSearching in BuyerRequest...');
        const requests = await prisma.buyerRequest.findMany({
            where: {
                query: {
                    contains: 'Lenovo',
                }
            },
            include: {
                user: true
            }
        });
        console.log(`Found ${requests.length} requests:`);
        requests.forEach(r => {
            console.log(`- ID: ${r.id}, Query: "${r.query}", Status: ${r.status}, User: ${r.user?.firstName} ${r.user?.lastName}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
