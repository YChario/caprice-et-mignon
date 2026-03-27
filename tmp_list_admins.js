const { MongoClient } = require('mongodb');
const fs = require('fs');

async function listAdmins() {
    let mongoUri;
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/MONGODB_URI=(.*)/);
        if (match) mongoUri = match[1].trim();
    } catch (e) {
        console.error('Erreur lecture .env.local');
        return;
    }

    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const db = client.db('caprice_mignon_db');
        const admins = await db.collection('admins').find({}, { projection: { password_hash: 1, username: 1, role: 1 } }).toArray();
        console.log(JSON.stringify(admins, null, 2));
    } catch (e) {
        console.error('Erreur:', e);
    } finally {
        await client.close();
    }
}

listAdmins();
