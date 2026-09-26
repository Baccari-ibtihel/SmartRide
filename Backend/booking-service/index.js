const express = require('express');
const app = express();
const PORT = 8083;

app.use(express.json());

app.get('/api/bookings/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'Booking Service (Node.js + Express)'
    });
});

app.listen(PORT, () => {
    console.log(`Booking Service running on port ${PORT}`);
});
