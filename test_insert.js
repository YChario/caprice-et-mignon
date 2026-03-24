const { pool } = require('./lib/db');

async function testInsert() {
    try {
        const restoId = 1;
        const name = "Test Category Script";
        const slug = "test-category-script";
        const imageUrl = null;

        await pool.query(
            'INSERT INTO categories (restaurant_id, name, slug, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [restoId, name, slug, imageUrl, 0, 1]
        );
        console.log("Success");
    } catch (error) {
        console.error("DB_ERROR:", error);
    } finally {
        process.exit();
    }
}
testInsert();
