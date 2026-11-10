module.exports = (schema, property = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        return res.status(400).json({
            message: 'Données invalides',
            details: error.details.map((d) => d.message),
        });
    }
    if (property === 'body') req.body = value;
    next();
};