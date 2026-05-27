const fs = require('fs');
const path = require('path');

const schemaPath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\prisma\\schema.prisma';
const content = fs.readFileSync(schemaPath, 'utf8');

const getModelDefinition = (modelName) => {
    const regex = new RegExp(`model\\s+${modelName}\\s+\\{([^}]+)\\}`, 'g');
    const match = regex.exec(content);
    if (match) {
        return `model ${modelName} {${match[1]}}`;
    }
    return `Model ${modelName} not found`;
};

console.log('--- BuyerRequest ---');
console.log(getModelDefinition('BuyerRequest'));

console.log('\n--- MarketplaceListing ---');
console.log(getModelDefinition('MarketplaceListing'));
