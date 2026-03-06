const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runInit() {
    try {
        console.log('Reading init.sql...');
        const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

        console.log('Executing query...');
        await pool.query(initSql);

        console.log('Database initialized successfully!');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
}

runInit();
