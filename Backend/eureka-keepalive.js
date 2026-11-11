const http = require('http');

const services = [
    { app: 'TRIP-SERVICE', port: 8082 },
    { app: 'BOOKING-SERVICE', port: 8083 },
    { app: 'PAYMENT-SERVICE', port: 8084 },
    { app: 'RATING-CHAT-SERVICE', port: 8085 },
    { app: 'NOTIFICATION-TRACKING-SERVICE', port: 8086 },
    { app: 'MATCHING-IA-SERVICE', port: 8087 },
    { app: 'CONFIG-SERVER', port: 8888 },
];

function register(s) {
    const instanceId = `${s.app.toLowerCase()}:${s.port}`;
    const payload = JSON.stringify({
        instance: {
            instanceId: instanceId,
            hostName: s.app.toLowerCase(),
            app: s.app.toUpperCase(),
            ipAddr: '127.0.0.1',
            status: 'UP',
            port: { '$': s.port, '@enabled': 'true' },
            vipAddress: s.app.toLowerCase(),
            secureVipAddress: s.app.toLowerCase(),
            dataCenterInfo: {
                '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                name: 'MyOwn'
            }
        }
    });

    const req = http.request({
        hostname: 'localhost',
        port: 8761,
        path: `/eureka/apps/${s.app.toUpperCase()}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, res => {
        // Registered
    });
    req.on('error', () => {});
    req.write(payload);
    req.end();
}

function heartbeat(s) {
    const instanceId = `${s.app.toLowerCase()}:${s.port}`;
    const req = http.request({
        hostname: 'localhost',
        port: 8761,
        path: `/eureka/apps/${s.app.toUpperCase()}/${instanceId}`,
        method: 'PUT'
    }, res => {
        if (res.statusCode === 404) {
            register(s); // Re-register if lease expired
        }
    });
    req.on('error', () => {});
    req.end();
}

// Initial registration
services.forEach(register);

// Heartbeat every 20 seconds
setInterval(() => {
    services.forEach(heartbeat);
}, 20000);

console.log('Eureka Polyglot Keepalive Daemon running...');
