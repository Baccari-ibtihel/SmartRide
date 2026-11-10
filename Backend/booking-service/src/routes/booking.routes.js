const router = require('express').Router();
const controller = require('../controllers/booking.controller');
const validate = require('../middlewares/validate');
const schemas = require('../validators/booking.validator');

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     summary: Créer une réservation (statut EN_ATTENTE)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Données invalides
 */
router.post('/', validate(schemas.createBooking), controller.create);

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     summary: Lister les réservations (filtres optionnels)
 *     tags: [Bookings]
 *     parameters:
 *       - { in: query, name: idUtilisateur, schema: { type: string } }
 *       - { in: query, name: idTrajet, schema: { type: string } }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [EN_ATTENTE, CONFIRMEE, ANNULEE, TERMINEE] }
 *     responses:
 *       200:
 *         description: Liste des réservations
 *       400:
 *         description: Filtre invalide
 */
router.get('/', validate(schemas.listQuery, 'query'), controller.list);

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     summary: Consulter une réservation
 *     tags: [Bookings]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Réservation trouvée
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Réservation introuvable
 */
router.get('/:id', validate(schemas.idParam, 'params'), controller.getById);

/**
 * @openapi
 * /api/bookings/{id}/confirm:
 *   patch:
 *     summary: Confirmer une réservation (EN_ATTENTE vers CONFIRMEE)
 *     tags: [Bookings]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Réservation confirmée
 *       404:
 *         description: Réservation introuvable
 *       409:
 *         description: Transition de statut impossible
 */
router.patch('/:id/confirm', validate(schemas.idParam, 'params'), controller.confirm);

/**
 * @openapi
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Annuler une réservation (EN_ATTENTE ou CONFIRMEE vers ANNULEE)
 *     tags: [Bookings]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Réservation annulée
 *       404:
 *         description: Réservation introuvable
 *       409:
 *         description: Transition de statut impossible
 */
router.patch('/:id/cancel', validate(schemas.idParam, 'params'), controller.cancel);

module.exports = router;