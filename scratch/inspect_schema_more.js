const fs = require('fs');
const path = require('path');

const schemaPath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\prisma\\schema.prisma';
const content = fs.readFileSync(schemaPath, 'utf8');

const regex = /model\s+(\w+)\s+\{/g;
let match;
console.log('Models found in schema:');
while ((match = regex.exec(content)) !== null) {
    console.log(`- ${match[1]}`);
}
