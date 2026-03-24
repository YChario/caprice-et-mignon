import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

let db = null;

export async function getDb() {
    if (db) return db;
    try {
        await client.connect();
        db = client.db('caprice_mignon_db');
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

export const pool = {
    // Shimming for compatibility if needed, but we should update callers.
    query: async (sql, params) => {
        console.warn('SQL query called on MongoDB pool shim. Needs manual update.');
        return [[]];
    }
};

