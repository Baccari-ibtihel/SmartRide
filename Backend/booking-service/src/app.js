const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const sequelize = require('./config/database');
const swaggerSpec = require('./config/swagger');
const bookingRoutes = require('./routes/booking.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'UP', db: 'UP' });
    } catch (err) {
        res.status(503).json({ status: 'DOWN', db: 'DOWN' });
    }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/bookings', bookingRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));
app.use(errorHandler);

module.exports = app;