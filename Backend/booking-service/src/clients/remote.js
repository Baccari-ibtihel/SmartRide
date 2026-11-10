const axios = require('axios');

const userClient = axios.create({
    baseURL: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    timeout: 3000,
});

const trajetClient = axios.create({
    baseURL: process.env.TRAJET_SERVICE_URL || 'http://localhost:3002',
    timeout: 3000,
});

async function getOrNull(client, path) {
    try {
        const res = await client.get(path);
        return res.data;
    } catch (err) {
        if (err.response && err.response.status === 404) return null;
        const e = new Error('Service distant indisponible');
        e.status = 503;
        throw e;
    }
}

const getUser = (id) => getOrNull(userClient, `/api/users/${id}`);
const getTrajet = (id) => getOrNull(trajetClient, `/api/trajets/${id}`);

module.exports = { getUser, getTrajet };