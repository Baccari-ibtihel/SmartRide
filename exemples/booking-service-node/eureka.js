// Enregistrement du Booking Service dans Eureka (npm install eureka-js-client)
const { Eureka } = require('eureka-js-client');

const PORT = Number(process.env.PORT || 8083);

const eurekaClient = new Eureka({
  instance: {
    app: 'BOOKING-SERVICE',
    instanceId: `booking-service:${PORT}`,
    hostName: 'localhost',
    ipAddr: '127.0.0.1',
    port: { $: PORT, '@enabled': true },
    vipAddress: 'booking-service', // OBLIGATOIRE : c'est ce nom que Spring cherche
    statusPageUrl: `http://localhost:${PORT}/health`,
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/', // chemin du serveur Eureka de Spring
  },
});

module.exports = eurekaClient;
