const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// These are laptop/wrong records that ended up in mobileCatalog
const LAPTOP_KEYWORDS = [
    'Yoga', 'Slim', 'XPS', 'OmniBook', 'Zenbook', 'Zephyrus',
    'ZenBook', 'ROG', 'Predator', 'MacBook', 'Surface', 'Latitude',
    'EliteBook', 'ThinkPad', 'Spectre', 'Envy', 'IdeaPad', 'ProBook',
    'AORUS', 'LOQ', 'Victus', 'Omen', 'Pavilion'
];

async function run() {
    // Get all mobiles
    const all = await prisma.mobileCatalog.findMany({ select: { id: true, brand: true, modelName: true, os: true, battery: true } });
    
    console.log(`Total mobiles in DB: ${all.length}`);
    
    // Find records that are clearly laptops (no battery, no OS, laptop-like modelName)
    const toDelete = all.filter(m => {
        const isLaptopLike = LAPTOP_KEYWORDS.some(k => m.modelName.includes(k));
        const hasNoBattery = !m.battery;
        const hasNoOs = !m.os;
        return isLaptopLike || (!m.battery && !m.os && !m.modelName.includes('TEST'));
    });
    
    console.log('\nRecords to DELETE (wrong category):');
    toDelete.forEach(r => console.log(`  - [${r.brand}] ${r.modelName} | battery: ${r.battery || 'EMPTY'} | os: ${r.os || 'EMPTY'}`));
    
    console.log('\nRecords to KEEP:');
    const toKeep = all.filter(m => !toDelete.find(d => d.id === m.id));
    toKeep.forEach(r => console.log(`  + [${r.brand}] ${r.modelName}`));
    
    if (process.argv[2] === '--execute') {
        const ids = toDelete.map(r => r.id);
        const res = await prisma.mobileCatalog.deleteMany({ where: { id: { in: ids } } });
        console.log(`\n✅ Deleted ${res.count} wrong records.`);
        const remaining = await prisma.mobileCatalog.count();
        console.log(`Remaining mobiles: ${remaining}`);
    } else {
        console.log('\n⚠️ DRY RUN - Run with --execute to actually delete');
    }
}
run().catch(console.error).finally(() => prisma.$disconnect());
