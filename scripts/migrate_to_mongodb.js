const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

async function migrate() {
    // MySQL Connection
    const mysqlConn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'caprice_mignon_db'
    });

    // MongoDB Connection
    const mongoUrl = 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db('caprice_mignon_db');

    console.log('Connected to both databases.');

    try {
        // 1. Migrate Restaurants
        const [restaurants] = await mysqlConn.query('SELECT * FROM restaurants');
        if (restaurants.length > 0) {
            await db.collection('restaurants').deleteMany({});
            await db.collection('restaurants').insertMany(restaurants);
            console.log(`Migrated ${restaurants.length} restaurants.`);
        }

        // 2. Migrate Categories
        const [categories] = await mysqlConn.query('SELECT * FROM categories');
        if (categories.length > 0) {
            await db.collection('categories').deleteMany({});
            await db.collection('categories').insertMany(categories);
            console.log(`Migrated ${categories.length} categories.`);
        }

        // 3. Migrate Products
        const [products] = await mysqlConn.query('SELECT * FROM products');
        if (products.length > 0) {
            await db.collection('products').deleteMany({});
            await db.collection('products').insertMany(products);
            console.log(`Migrated ${products.length} products.`);
        }

        // 4. Migrate Admins
        const [admins] = await mysqlConn.query('SELECT * FROM admins');
        if (admins.length > 0) {
            await db.collection('admins').deleteMany({});
            await db.collection('admins').insertMany(admins);
            console.log(`Migrated ${admins.length} admins.`);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mysqlConn.end();
        await client.close();
    }
}

migrate();
