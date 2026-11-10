const { getChannel, EXCHANGE } = require('./rabbitmq');

function publishEvent(routingKey, payload) {
    const channel = getChannel();
    if (!channel) {
        console.error(`Événement ${routingKey} non publié : RabbitMQ indisponible`);
        return;
    }
    try {
        channel.publish(
            EXCHANGE,
            routingKey,
            Buffer.from(JSON.stringify(payload)),
            { persistent: true, contentType: 'application/json' }
        );
        console.log(`Événement publié : ${routingKey}`);
    } catch (err) {
        console.error(`Événement ${routingKey} non publié :`, err.message);
    }
}

module.exports = { publishEvent };
