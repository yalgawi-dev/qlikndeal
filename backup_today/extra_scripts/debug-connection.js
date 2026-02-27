const net = require('net');

const host = 'ep-lively-term-ag64z2el-pooler.c-2.eu-central-1.aws.neon.tech';
const port = 5432;

console.log(`Checking connection to ${host}:${port}...`);

const socket = new net.Socket();
const timeout = 10000;

socket.setTimeout(timeout);

socket.on('connect', () => {
    console.log('SUCCESS: Connection established!');
    socket.destroy();
});

socket.on('timeout', () => {
    console.log('ERROR: Connection timed out.');
    socket.destroy();
});

socket.on('error', (err) => {
    console.log('ERROR: ' + err.message);
    socket.destroy();
});

socket.connect(port, host);
