const http = require('http');

const usersToSeed = [
    { username: 'admin', email: 'admin@smartride.tn', firstName: 'Admin', lastName: 'SmartRide', role: 'ADMIN', password: 'admin123' },
    { username: 'driver', email: 'driver@smartride.tn', firstName: 'Conducteur', lastName: 'Demo', role: 'CONDUCTEUR', password: 'driver123' },
    { username: 'passenger', email: 'passenger@smartride.tn', firstName: 'Passager', lastName: 'Demo', role: 'PASSAGER', password: 'pass123' },
    { username: 'ibtihel_baccari', email: 'ibtihel.baccari@smartride.tn', firstName: 'Ibtihel', lastName: 'Baccari', role: 'ADMIN', password: 'admin123' },
    { username: 'sami_mansouri', email: 'sami.mansouri@gmail.com', firstName: 'Sami', lastName: 'Mansouri', role: 'CONDUCTEUR', password: 'driver123' },
    { username: 'amira_bensalah', email: 'amira.bensalah@topnet.tn', firstName: 'Amira', lastName: 'Ben Salah', role: 'CONDUCTEUR', password: 'driver123' },
    { username: 'youssef_trabelsi', email: 'youssef.tr@gmail.com', firstName: 'Youssef', lastName: 'Trabelsi', role: 'CONDUCTEUR', password: 'driver123' },
    { username: 'karim_gharbi', email: 'karim.gharbi@yahoo.fr', firstName: 'Karim', lastName: 'Gharbi', role: 'CONDUCTEUR', password: 'driver123' },
    { username: 'fatma_khelifi', email: 'fatma.kh@gmail.com', firstName: 'Fatma', lastName: 'Khelifi', role: 'PASSAGER', password: 'pass123' },
    { username: 'mohamed_dridi', email: 'med.dridi@outlook.com', firstName: 'Mohamed', lastName: 'Dridi', role: 'PASSAGER', password: 'pass123' },
    { username: 'leila_bouazizi', email: 'leila.bouazizi@gmail.com', firstName: 'Leila', lastName: 'Bouazizi', role: 'PASSAGER', password: 'pass123' }
];

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data ? (tryParse(data)) : null }));
        });
        req.on('error', reject);
        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
    });
}

function tryParse(d) {
    try { return JSON.parse(d); } catch (e) { return d; }
}

async function run() {
    console.log('Fetching Keycloak Admin Token...');
    const tokenRes = await request({
        hostname: 'localhost',
        port: 8180,
        path: '/realms/master/protocol/openid-connect/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, 'client_id=admin-cli&username=admin&password=admin&grant_type=password');

    if (!tokenRes.data || !tokenRes.data.access_token) {
        console.error('Failed to get token:', tokenRes);
        return;
    }
    const token = tokenRes.data.access_token;
    console.log('Admin token acquired successfully!');

    // Fetch roles in smartride-realm
    const rolesRes = await request({
        hostname: 'localhost',
        port: 8180,
        path: '/admin/realms/smartride-realm/roles',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const rolesMap = {};
    if (Array.isArray(rolesRes.data)) {
        rolesRes.data.forEach(r => rolesMap[r.name] = r);
    }
    console.log('Roles found:', Object.keys(rolesMap));

    for (const u of usersToSeed) {
        // Create user
        const createRes = await request({
            hostname: 'localhost',
            port: 8180,
            path: '/admin/realms/smartride-realm/users',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }, {
            username: u.username,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            enabled: true,
            emailVerified: true,
            credentials: [{ type: 'password', value: u.password, temporary: false }]
        });

        console.log(`User ${u.username} (${u.role}): status ${createRes.status}`);

        // Fetch user to get ID
        const findRes = await request({
            hostname: 'localhost',
            port: 8180,
            path: `/admin/realms/smartride-realm/users?username=${u.username}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (Array.isArray(findRes.data) && findRes.data.length > 0) {
            const userId = findRes.data[0].id;
            const targetRole = rolesMap[u.role];
            if (targetRole) {
                await request({
                    hostname: 'localhost',
                    port: 8180,
                    path: `/admin/realms/smartride-realm/users/${userId}/role-mappings/realm`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }, [targetRole]);
                console.log(`  -> Role ${u.role} mapped to ${u.username}`);
            }
        }
    }

    console.log('All users seeded into Keycloak smartride-realm successfully!');
}

run().catch(console.error);
