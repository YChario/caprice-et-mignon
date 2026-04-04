const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const categories = await db.collection('categories').find({}).toArray();
  console.log(categories.map(c => ({id: c.id, name: c.name, restoId: c.restaurant_id})));
  process.exit(0);
}
run();
