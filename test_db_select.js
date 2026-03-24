const { pool } = require('./lib/db');

async function checkDb() {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        console.log("Categories in DB:");
        console.dir(rows, { depth: null });
    } catch (e) {
        console.error("DB_ERROR:", e);
    } finally {
        process.exit();
    }
}
checkDb();
