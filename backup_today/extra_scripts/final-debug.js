const net = require('net');

const targets = [
    { host: '8.8.8.8', port: 53, name: 'Google DNS (Port 53)' },
    { host: 'www.google.com', port: 443, name: 'Google Web (Port 443)' },
    { host: '3.69.34.233', port: 5432, name: 'Neon DB (Port 5432)' }
];

targets.forEach(target => {
    console.log(`Checking ${target.name}...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`SUCCESS: Reached ${target.name}`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`TIMEOUT: Failed to reach ${target.name}`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`ERROR on ${target.name}: ${err.message}`);
        socket.destroy();
    });

    socket.connect(target.port, target.host);
});
