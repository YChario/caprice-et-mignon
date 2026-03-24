const { pool } = require('./lib/db');

async function updateSchema() {
    try {
        // Add image_url to restaurants table
        const [results] = await pool.query(`
            ALTER TABLE restaurants 
            ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;
        `);
        console.log("Successfully added image_url to restaurants table.", results);

        // Let's seed initial images based on the slugs so the page doesn't break
        await pool.query(`UPDATE restaurants SET image_url = '/uploads/categories/caprice_pizza.jpg' WHERE slug = 'caprice'`);
        await pool.query(`UPDATE restaurants SET image_url = '/uploads/categories/mignon_dessert.jpg' WHERE slug = 'mignon'`);

        console.log("Updated existing restaurants with initial placeholder images (to be updated by user later).");

    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column image_url already exists, skipping ADD COLUMN.");
        } else {
            console.error("Error updating schema:", e);
        }
    } finally {
        process.exit();
    }
}
updateSchema();
