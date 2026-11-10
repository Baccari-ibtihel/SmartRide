module.exports = (err, req, res, next) => {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({
        message: status === 500 ? 'Erreur interne du serveur' : err.message,
    });
};