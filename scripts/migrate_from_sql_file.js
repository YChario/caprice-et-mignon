const fs = require('fs');
const { MongoClient } = require('mongodb');

async function migrate() {
    const sqlFile = fs.readFileSync('c:/Users/Shift/OneDrive/Bureau/caprice et mignon/caprice_mignon_db.sql', 'utf8');
    
    const mongoUrl = 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db('caprice_mignon_db');

    // Simple parser for the specific SQL file
    function extractInserts(tableName) {
        const regex = new RegExp(`INSERT INTO ${tableName} .*? VALUES ([\\s\\S]*?);`, 'g');
        const matches = [...sqlFile.matchAll(regex)];
        const data = [];
        
        matches.forEach(match => {
            const valuesStr = match[1].trim();
            // Match all (...) groups
            const rowRegex = /\(([\s\S]*?)\)/g;
            let rowMatch;
            while ((rowMatch = rowRegex.exec(valuesStr)) !== null) {
                const cleanedRow = rowMatch[1].trim();
                // Split by comma outside of quotes
                const fields = cleanedRow.split(/,(?=(?:(?:[^']*'){2})*[^']*$)/).map(f => f.trim().replace(/^'|'$/g, ''));
                
                if (tableName === 'restaurants') {
                    data.push({
                        id: parseInt(fields[0]),
                        name: fields[1],
                        slug: fields[2],
                        description: fields[3],
                        image_url: fields[4],
                        created_at: new Date()
                    });
                } else if (tableName === 'categories') {
                    data.push({
                        id: parseInt(fields[0]),
                        restaurant_id: parseInt(fields[1]),
                        name: fields[2],
                        slug: fields[3],
                        image_url: fields[4],
                        created_at: new Date()
                    });
                } else if (tableName === 'products') {
                    data.push({
                        category_id: parseInt(fields[0]),
                        name: fields[1],
                        description: fields[2],
                        price: parseFloat(fields[3]),
                        image_url: fields[4],
                        created_at: new Date()
                    });
                }
            }
        });
        return data;
    }

    try {
        const restos = extractInserts('restaurants');
        if (restos.length > 0) {
            await db.collection('restaurants').deleteMany({});
            await db.collection('restaurants').insertMany(restos);
            console.log(`Migrated ${restos.length} restaurants from SQL file.`);
        }

        const cats = extractInserts('categories');
        if (cats.length > 0) {
            await db.collection('categories').deleteMany({});
            await db.collection('categories').insertMany(cats);
            console.log(`Migrated ${cats.length} categories from SQL file.`);
        }

        const prods = extractInserts('products');
        if (prods.length > 0) {
            await db.collection('products').deleteMany({});
            await db.collection('products').insertMany(prods);
            console.log(`Migrated ${prods.length} products from SQL file.`);
        }

        console.log('Migration from SQL file completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.close();
    }
}

migrate();
