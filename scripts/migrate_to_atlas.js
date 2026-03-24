const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');

async function migrate() {
    // Usage: node scripts/migrate_to_atlas.js "mongodb+srv://..."
    const mongoUrl = process.argv[2];
    if (!mongoUrl) {
        console.error('Please provide the MongoDB Atlas connection string as an argument.');
        console.error('Example: node scripts/migrate_to_atlas.js "mongodb+srv://user:pass@cluster..."');
        process.exit(1);
    }

    const sqlFilePath = path.join(__dirname, '../caprice_mignon_db.sql');
    if (!fs.existsSync(sqlFilePath)) {
        console.error(`SQL file not found at ${sqlFilePath}`);
        process.exit(1);
    }

    const sqlFile = fs.readFileSync(sqlFilePath, 'utf8');
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db('caprice_mignon_db');

    console.log('Connected to MongoDB Atlas.');

    function extractInserts(tableName) {
        const regex = new RegExp(`INSERT INTO ${tableName} .*? VALUES ([\\s\\S]*?);`, 'g');
        const matches = [...sqlFile.matchAll(regex)];
        const data = [];
        
        matches.forEach(match => {
            const valuesStr = match[1].trim();
            const rowRegex = /\(([\s\S]*?)\)/g;
            let rowMatch;
            while ((rowMatch = rowRegex.exec(valuesStr)) !== null) {
                const cleanedRow = rowMatch[1].trim();
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
        const collections = ['restaurants', 'categories', 'products'];
        for (const col of collections) {
            const data = extractInserts(col);
            if (data.length > 0) {
                await db.collection(col).deleteMany({});
                await db.collection(col).insertMany(data);
                console.log(`Migrated ${data.length} documents to ${col}.`);
            }
        }
        console.log('Migration to MongoDB Atlas completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.close();
    }
}

migrate();
