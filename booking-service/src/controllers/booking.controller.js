const service = require('../services/booking.service');
const asyncHandler = require('../middlewares/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
    res.status(201).json(await service.create(req.body));
});

exports.list = asyncHandler(async (req, res) => {
    res.json(await service.findAll(req.query));
});

exports.getById = asyncHandler(async (req, res) => {
    res.json(await service.findById(req.params.id));
});

exports.confirm = asyncHandler(async (req, res) => {
    res.json(await service.confirm(req.params.id));
});

exports.cancel = asyncHandler(async (req, res) => {
    res.json(await service.cancel(req.params.id));
});