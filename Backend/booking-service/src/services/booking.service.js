const Booking = require('../models/booking.model');
const { publishEvent } = require('../messaging/publisher');

const toEvent = (b) => ({
    id: b.id,
    idUtilisateur: b.idUtilisateur,
    idTrajet: b.idTrajet,
    nombrePlaces: b.nombrePlaces,
    prixTotal: b.prixTotal,
    statut: b.statut,
    date: new Date().toISOString(),
});

const httpError = (status, message) => Object.assign(new Error(message), { status });

exports.create = async (data) => {
    const booking = await Booking.create(data);
    publishEvent('booking.created', toEvent(booking));
    return booking;
};

exports.findAll = (filters) => {
    const where = {};
    ['idUtilisateur', 'idTrajet', 'statut'].forEach((key) => {
        if (filters[key]) where[key] = filters[key];
    });
    return Booking.findAll({ where, order: [['createdAt', 'DESC']] });
};

exports.findById = async (id) => {
    const reservation = await Booking.findByPk(id);
    if (!reservation) throw httpError(404, 'Réservation introuvable');
    return reservation;
};

exports.confirm = async (id) => {
    const reservation = await exports.findById(id);
    if (reservation.statut !== 'EN_ATTENTE') {
        throw httpError(409, `Impossible de confirmer une réservation au statut ${reservation.statut}`);
    }
    reservation.statut = 'CONFIRMEE';
    await reservation.save();
    publishEvent('booking.confirmed', toEvent(reservation));
    return reservation;
};

exports.cancel = async (id) => {
    const reservation = await exports.findById(id);
    if (!['EN_ATTENTE', 'CONFIRMEE'].includes(reservation.statut)) {
        throw httpError(409, `Impossible d'annuler une réservation au statut ${reservation.statut}`);
    }
    reservation.statut = 'ANNULEE';
    await reservation.save();
    publishEvent('booking.cancelled', toEvent(reservation));
    return reservation;
};