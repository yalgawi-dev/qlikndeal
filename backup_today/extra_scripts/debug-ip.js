const net = require('net');

const ips = ['3.69.34.233', '63.179.28.86'];
const port = 5432;

ips.forEach(host => {
    console.log(`Checking connection to IP ${host}:${port}...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`SUCCESS: Connected to ${host}!`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`TIMEOUT: Could not reach ${host}`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`ERROR on ${host}: ${err.message}`);
        socket.destroy();
    });

    socket.connect(port, host);
});
