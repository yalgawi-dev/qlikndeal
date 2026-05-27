const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    // Show all Xiaomi models - are they stored by model number or actual name?
    const xiaomi = await p.mobileCatalog.findMany({ 
        where: { brand: 'Xiaomi' }, 
        select: { modelName: true, brand: true, constraints: true }, 
        take: 10 
    });
    console.log('=== Xiaomi catalog entries (modelName field) ===');
    xiaomi.forEach(m => { 
        console.log('  modelName:', m.modelName); 
        if (m.constraints) {
            const c = typeof m.constraints === 'string' ? JSON.parse(m.constraints) : m.constraints;
            if (c && c.officialName) console.log('   officialName:', c.officialName);
            if (c && c.displayName) console.log('   displayName:', c.displayName);
        }
    });
    
    // Show Samsung models for comparison
    const samsung = await p.mobileCatalog.findMany({ 
        where: { brand: 'Samsung' }, 
        select: { modelName: true, brand: true }, 
        take: 5 
    });
    console.log('\n=== Samsung catalog entries ===');
    samsung.forEach(m => console.log('  modelName:', m.modelName));
    
    // Search for redmi note 13 by any field
    const note13 = await p.mobileCatalog.findMany({ 
        where: { 
            OR: [
                { modelName: { contains: 'redmi', mode: 'insensitive' } },
                { modelName: { contains: 'note 13', mode: 'insensitive' } },
                { modelName: { contains: '23116PN5BC', mode: 'insensitive' } }, // known redmi note 13 pro code
                { modelName: { contains: '2312DRA50G', mode: 'insensitive' } }, // another redmi
            ]
        }
    });
    console.log('\n=== Redmi Note 13 specifically ===');
    if (note13.length === 0) console.log('  ❌ Not found by any variant of name');
    note13.forEach(m => console.log('  brand:', m.brand, '| modelName:', m.modelName));
    
    // Show constraints of a Xiaomi record to understand the structure
    console.log('\n=== First Xiaomi full record ===');
    const first = await p.mobileCatalog.findFirst({ where: { brand: 'Xiaomi' } });
    console.log(JSON.stringify(first, null, 2).substring(0, 500));
}

main().catch(console.error).finally(() => p.$disconnect());
