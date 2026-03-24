const mysql = require('mysql2/promise');

async function initDb() {
    let connection;
    try {
        console.log('Connecting to MySQL...');
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('Creating database caprice_mignon_db...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS caprice_mignon_db`);
        await connection.query(`USE caprice_mignon_db`);

        console.log('Creating tables...');
        // Restaurants
        await connection.query(`
            CREATE TABLE IF NOT EXISTS restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Categories
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                UNIQUE KEY unique_slug_per_resto (restaurant_id, slug)
            )
        `);

        // Products
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);

        console.log('Clearing existing data...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE products');
        await connection.query('TRUNCATE TABLE categories');
        await connection.query('TRUNCATE TABLE restaurants');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Inserting seed data...');
        // Insert Restaurants
        const [restoResult] = await connection.query(`
            INSERT INTO restaurants (name, slug, description, image_url) VALUES 
            ('Caprice', 'caprice', 'Une expérience culinaire inoubliable.', '/images/caprice.jpg'),
            ('Mignon', 'mignon', 'Douceurs et délices pour les gourmands.', '/images/mignon.jpg')
        `);

        // Find IDs
        const [restaurants] = await connection.query('SELECT id, slug FROM restaurants');
        const capriceId = restaurants.find(r => r.slug === 'caprice').id;
        const mignonId = restaurants.find(r => r.slug === 'mignon').id;

        // Insert Categories for Caprice
        await connection.query(`
            INSERT INTO categories (restaurant_id, name, slug, image_url) VALUES 
            (?, 'Pizzas', 'pizzas', '/images/pizzas.jpg'),
            (?, 'Pâtes', 'pates', '/images/pates.jpg'),
            (?, 'Boissons', 'boissons', '/images/boissons.jpg')
        `, [capriceId, capriceId, capriceId]);

        // Insert Categories for Mignon
        await connection.query(`
            INSERT INTO categories (restaurant_id, name, slug, image_url) VALUES 
            (?, 'Crêpes', 'crepes', '/images/crepes.jpg'),
            (?, 'Gaufres', 'gaufres', '/images/gaufres.jpg'),
            (?, 'Milkshakes', 'milkshakes', '/images/milkshakes.jpg')
        `, [mignonId, mignonId, mignonId]);

        // Find Category IDs
        const [categories] = await connection.query('SELECT id, slug, restaurant_id FROM categories');
        const getCatId = (restoId, slug) => categories.find(c => c.restaurant_id === restoId && c.slug === slug).id;

        // Insert Products for Caprice (Pizzas)
        await connection.query(`
            INSERT INTO products (category_id, name, description, price, image_url) VALUES 
            (?, 'Margherita', 'Tomate, mozzarella, basilic frais', 10.50, '/images/margherita.jpg'),
            (?, 'Regina', 'Tomate, mozzarella, jambon, champignons', 12.00, '/images/regina.jpg'),
            (?, 'Quatre Fromages', 'Mozzarella, chèvre, gorgonzola, emmental', 14.50, '/images/4fromages.jpg')
        `, [getCatId(capriceId, 'pizzas'), getCatId(capriceId, 'pizzas'), getCatId(capriceId, 'pizzas')]);

        // Insert Products for Mignon (Crêpes)
        await connection.query(`
            INSERT INTO products (category_id, name, description, price, image_url) VALUES 
            (?, 'Sucre Beurre', 'La classique, fondante et sucrée', 3.50, '/images/crepe_sucre.jpg'),
            (?, 'Nutella Banane', 'Pâte à tartiner noisette et rondelles de banane', 5.00, '/images/crepe_nutella.jpg'),
            (?, 'Caramel Beurre Salé', 'Nappage maison onctueux', 4.50, '/images/crepe_caramel.jpg')
        `, [getCatId(mignonId, 'crepes'), getCatId(mignonId, 'crepes'), getCatId(mignonId, 'crepes')]);

        console.log('Database initialization completed successfully!');

    } catch (e) {
        console.error('Error initializing database:', e);
    } finally {
        if (connection) {
            await connection.end();
            console.log('MySQL connection closed.');
        }
    }
}

initDb();
