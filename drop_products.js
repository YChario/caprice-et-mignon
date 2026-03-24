const { pool } = require('./lib/db');

async function dropProducts() {
    try {
        await pool.query('DROP TABLE IF EXISTS products');
        console.log("Products table dropped successfully");
    } catch (e) {
        console.error("Drop error:", e);
    } finally {
        process.exit();
    }
}
dropProducts();
