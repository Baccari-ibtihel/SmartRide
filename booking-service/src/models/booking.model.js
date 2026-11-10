const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define(
    'Booking',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        idUtilisateur: { type: DataTypes.STRING, allowNull: false },
        idTrajet: { type: DataTypes.STRING, allowNull: false },
        nombrePlaces: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
        prixTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        statut: {
            type: DataTypes.ENUM('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE'),
            allowNull: false,
            defaultValue: 'EN_ATTENTE',
        },
    },
    { tableName: 'bookings', timestamps: true }
);

module.exports = Booking;