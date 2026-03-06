const { Client } = require('pg');
require('dotenv').config();

// We need to connect to the default 'postgres' database first to create a new database
const connectionString = process.env.DATABASE_URL.replace('/polling_db', '/postgres');

const client = new Client({
    connectionString: connectionString,
});

async function createDatabase() {
    try {
        console.log('Connecting to PostgreSQL to create "polling_db"...');
        await client.connect();

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'polling_db'");

        if (res.rows.length === 0) {
            // Databases cannot be created inside a transaction, and 'pg' uses transactions by default for some queries
            // but this raw query should work. 
            await client.query('CREATE DATABASE polling_db');
            console.log('✅ SUCCESS: Database "polling_db" created successfully!');
        } else {
            console.log('ℹ️ INFO: Database "polling_db" already exists.');
        }
    } catch (err) {
        console.error('❌ ERROR: could not create database.');
        console.error(err.message);
        if (err.message.includes('authentication failed')) {
            console.error('\nFIX: Your password in the .env file might still be wrong.');
        }
    } finally {
        await client.end();
        process.exit();
    }
}

createDatabase();
