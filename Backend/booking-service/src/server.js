require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
require('./models/booking.model');
const { connectRabbit, closeRabbit } = require('./messaging/rabbitmq');

const port = process.env.PORT || 3003;
let eurekaClient = null;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion à PostgreSQL réussie');
        await sequelize.sync();
        console.log('Tables synchronisées');

        app.listen(port, () => {
            console.log(`Booking service sur le port ${port}`);

            // RabbitMQ en arrière-plan : le service démarre même s'il n'est pas prêt
            connectRabbit();

            if (process.env.EUREKA_ENABLED === 'true') {
                eurekaClient = require('./config/eureka');
                eurekaClient.start((error) => {
                    if (error) console.error("Enregistrement Eureka impossible :", error.message || error);
                    else console.log("Enregistré auprès d'Eureka");
                });
            }
        });
    } catch (err) {
        console.error('Démarrage impossible :', err.message);
        process.exit(1);
    }
})();

const shutdown = async () => {
    console.log('Arrêt du service...');
    await closeRabbit();
    if (eurekaClient) {
        eurekaClient.stop(() => process.exit(0));
    } else {
        process.exit(0);
    }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);