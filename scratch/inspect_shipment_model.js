const fs = require('fs');
const path = require('path');

const schemaPath = 'c:\\yehuda\\project\\אפליקציה\\Qlikndeal\\prisma\\schema.prisma';
const content = fs.readFileSync(schemaPath, 'utf8');

const regex = /model\s+Shipment\s+\{([^}]+)\}/;
const match = regex.exec(content);
if (match) {
    console.log(match[0]);
} else {
    console.log('Shipment model not found');
}
