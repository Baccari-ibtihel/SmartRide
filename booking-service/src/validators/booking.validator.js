const Joi = require('joi');

exports.createBooking = Joi.object({
    idUtilisateur: Joi.string().required(),
    idTrajet: Joi.string().required(),
    nombrePlaces: Joi.number().integer().min(1).default(1),
    prixTotal: Joi.number().min(0).optional(),
});

exports.idParam = Joi.object({
    id: Joi.string().uuid().required(),
});

exports.listQuery = Joi.object({
    idUtilisateur: Joi.string(),
    idTrajet: Joi.string(),
    statut: Joi.string().valid('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE'),
});