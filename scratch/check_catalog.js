const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // MobileCatalog brands
    const brands = await prisma.mobileCatalog.groupBy({ 
        by: ['brand'], 
        _count: { id: true }, 
        orderBy: { _count: { id: 'desc' } }, 
        take: 20 
    });
    console.log('=== MobileCatalog brands ===');
    brands.forEach(b => console.log(' ', b.brand, ':', b._count.id, 'models'));
    
    // Xiaomi/Redmi
    const redmi = await prisma.mobileCatalog.findMany({ 
        where: { 
            OR: [
                { brand: { contains: 'redmi', mode: 'insensitive' } }, 
                { modelName: { contains: 'redmi', mode: 'insensitive' } },
                { brand: { contains: 'xiaomi', mode: 'insensitive' } }
            ] 
        }, 
        take: 10 
    });
    console.log('\n=== Redmi/Xiaomi in catalog ===');
    if (redmi.length === 0) console.log('  ❌ NONE');
    redmi.forEach(m => console.log(' ', m.modelName, '| brand:', m.brand));
    
    // Total listings
    const total = await prisma.marketplaceListing.count();
    const active = await prisma.marketplaceListing.count({ where: { status: 'ACTIVE' } });
    console.log('\n=== Listings stats ===');
    console.log('Total:', total, '| Active:', active);
    
    // All listings - show categories
    const allListings = await prisma.marketplaceListing.findMany({
        select: { id: true, title: true, category: true, status: true, listingType: true },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    console.log('\n=== All listings (last 20) ===');
    allListings.forEach(l => console.log(` [${l.status}][${l.listingType}] cat="${l.category}" | "${l.title.substring(0,50)}"`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
