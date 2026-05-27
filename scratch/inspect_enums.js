const fs = require('fs');
const path = require('path');

const schemaPath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\prisma\\schema.prisma';
const content = fs.readFileSync(schemaPath, 'utf8');

const getEnumDefinition = (enumName) => {
    const regex = new RegExp(`enum\\s+${enumName}\\s+\\{([^}]+)\\}`, 'g');
    const match = regex.exec(content);
    if (match) {
        return `enum ${enumName} {${match[1]}}`;
    }
    return `Enum ${enumName} not found`;
};

console.log('--- ListingType ---');
console.log(getEnumDefinition('ListingType'));

console.log('\n--- ListingStatus ---');
console.log(getEnumDefinition('ListingStatus'));
