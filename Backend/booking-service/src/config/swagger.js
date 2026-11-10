const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'SmartRide - Booking Service API', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3003' }],
        components: {
            schemas: {
                BookingInput: {
                    type: 'object',
                    required: ['userId', 'tripId'],
                    properties: {
                        userId: { type: 'string', example: 'u1' },
                        tripId: { type: 'string', example: 't1' },
                        seats: { type: 'integer', minimum: 1, example: 2 },
                        totalPrice: { type: 'number', example: 30 },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
});