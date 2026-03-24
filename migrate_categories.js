const { pool } = require('./lib/db');

async function migrate() {
    try {
        await pool.query('ALTER TABLE categories ADD COLUMN menu_file_url VARCHAR(255) NULL AFTER image_url');
        console.log("Migration successful");
    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        process.exit();
    }
}
migrate();
