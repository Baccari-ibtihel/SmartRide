const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE = 'booking.events';

let connection = null;
let channel = null;
let closing = false;
let connecting = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connectRabbit() {
    if (connecting || closing) return;
    connecting = true;
    let attempt = 0;

    while (!closing) {
        attempt++;
        try {
            const conn = await amqp.connect(RABBITMQ_URL);
            conn.on('error', (e) => console.error('Erreur RabbitMQ :', e.message));
            conn.on('close', () => {
                if (connection === conn) {
                    connection = null;
                    channel = null;
                }
                if (closing) return;
                console.error('Connexion RabbitMQ perdue, reconnexion...');
                connectRabbit();
            });

            const ch = await conn.createChannel();
            ch.on('error', (e) => console.error('Erreur canal RabbitMQ :', e.message));
            await ch.assertExchange(EXCHANGE, 'topic', { durable: true });

            connection = conn;
            channel = ch;
            console.log('RabbitMQ connecté');
            break;
        } catch (err) {
            console.log(`RabbitMQ pas prêt (essai ${attempt}), nouvelle tentative dans 5 s...`);
            await sleep(5000);
        }
    }
    connecting = false;
}

async function closeRabbit() {
    closing = true;
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (err) {
        console.error('Fermeture RabbitMQ :', err.message);
    }
}

const getChannel = () => channel;

module.exports = { connectRabbit, closeRabbit, getChannel, EXCHANGE };
