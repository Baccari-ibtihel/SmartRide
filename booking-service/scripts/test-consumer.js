const amqp = require('amqplib');

const QUEUE = process.env.QUEUE || 'notification.booking';

(async () => {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const ch = await conn.createChannel();

    // Le CONSOMMATEUR déclare sa queue
    await ch.assertExchange('booking.events', 'topic', { durable: true });
    await ch.assertQueue(QUEUE, { durable: true });
    await ch.bindQueue(QUEUE, 'booking.events', 'booking.*');

    console.log(`En attente sur la queue ${QUEUE}...`);
    ch.consume(QUEUE, (msg) => {
        console.log(msg.fields.routingKey, JSON.parse(msg.content.toString()));
        ch.ack(msg);
    });
})();
