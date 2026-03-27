const { MongoClient } = require('mongodb');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
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
        const username = 'admin';
        const newPassword = 'password123';
        const passwordHash = await bcrypt.hash(newPassword, 10);

        const result = await db.collection('admins').updateOne(
            { username: username },
            { $set: { password_hash: passwordHash } }
        );

        if (result.matchedCount > 0) {
            console.log(`Le mot de passe de l'utilisateur "${username}" a été réinitialisé à: ${newPassword}`);
        } else {
            console.log(`Utilisateur "${username}" non trouvé.`);
        }
    } catch (e) {
        console.error('Erreur:', e);
    } finally {
        await client.close();
    }
}

resetAdmin();
