const Eureka = require('eureka-js-client').Eureka;

const port = Number(process.env.PORT) || 3003;
const host = process.env.APP_HOST || 'localhost';
const appName = process.env.APP_NAME || 'BOOKING-SERVICE';

const client = new Eureka({
    instance: {
        app: appName,
        instanceId: `${host}:${appName.toLowerCase()}:${port}`,
        hostName: host,
        ipAddr: '127.0.0.1',
        port: { $: port, '@enabled': true },
        vipAddress: appName,
        statusPageUrl: `http://${host}:${port}/health`,
        healthCheckUrl: `http://${host}:${port}/health`,
        homePageUrl: `http://${host}:${port}/`,
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: process.env.EUREKA_HOST || 'localhost',
        port: Number(process.env.EUREKA_PORT) || 8761,
        servicePath: '/eureka/apps/',
        maxRetries: 5,
        requestRetryDelay: 2000,
    },
});

module.exports = client;