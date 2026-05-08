const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
    const brands = new Set();
    const series = new Set();
    const models = new Set();
    
    const items = await p.laptopCatalog.findMany({ select: { brand: true, series: true, modelName: true } });
    console.log('Total laptop catalog entries:', items.length);
    
    items.forEach(i => {
        if (i.brand) brands.add(i.brand);
        if (i.series) series.add(i.series);
        if (i.modelName) models.add(i.modelName);
    });
    
    console.log('Unique brands:', brands.size, '->', [...brands].slice(0, 10));
    console.log('Unique series:', series.size, '->', [...series].slice(0, 10));
    console.log('Unique models:', models.size, '->', [...models].slice(0, 10));
}

run().catch(console.error).finally(() => p.$disconnect());
