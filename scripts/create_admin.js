const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'caprice_mignon_db'
        });

        const username = 'admin';
        const email = 'admin@capriceetmignon.com';
        const plainPassword = 'password123'; // Changer après le premier login
        const role = 'super_admin';

        // Check if admin already exists
        const [rows] = await connection.query('SELECT * FROM admins WHERE username = ?', [username]);
        if (rows.length > 0) {
            console.log('L\'administrateur existe déjà. Suppression et recréation...');
            await connection.query('DELETE FROM admins WHERE username = ?', [username]);
        }

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        await connection.query(
            'INSERT INTO admins (username, email, password_hash, role, restaurant_id) VALUES (?, ?, ?, ?, NULL)',
            [username, email, passwordHash, role]
        );

        console.log('Super administrateur créé avec succès !');
        console.log('---');
        console.log('Nom d\'utilisateur :', username);
        console.log('Mot de passe :', plainPassword);
        console.log('---');

    } catch (e) {
        console.error('Erreur :', e);
    } finally {
        if (connection) await connection.end();
    }
}

createSuperAdmin();
