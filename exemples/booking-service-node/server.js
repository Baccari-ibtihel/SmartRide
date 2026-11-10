const express = require('express');
const eurekaClient = require('./eureka');

const app = express();
const PORT = Number(process.env.PORT || 8083);

// Exemple : en vrai, ces donnees viennent de PostgreSQL
const bookings = [
  { id: 10, trip_id: 100, passenger_id: 1, driver_id: 2, status: 'COMPLETED' },
  { id: 20, trip_id: 100, passenger_id: 1, driver_id: 2, status: 'CONFIRMED' },
];

// Route appelee par le Rating-Chat Service avant d'accepter une note
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === Number(req.params.id));
  if (!booking) {
    return res.status(404).json({ message: 'Reservation introuvable' });
  }
  // Contrat attendu : noms de champs en camelCase
  res.json({
    id: booking.id,
    tripId: booking.trip_id,
    passengerId: booking.passenger_id,
    driverId: booking.driver_id,
    status: booking.status,
  });
});

app.get('/health', (req, res) => res.json({ status: 'UP' }));

app.listen(PORT, () => {
  console.log(`Booking Service sur le port ${PORT}`);
  eurekaClient.start(error => console.log(error ? `Eureka : echec ${error}` : 'Eureka : enregistre'));
});

// Se desinscrire proprement d'Eureka a l'arret (Ctrl+C)
process.on('SIGINT', () => eurekaClient.stop(() => process.exit(0)));
