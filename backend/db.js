const { Pool } = require('pg');
require('dotenv').config();

const isLocal = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'));

if (process.env.DATABASE_URL) {
    const dbName = process.env.DATABASE_URL.split('/').pop().split('?')[0];
    const host = process.env.DATABASE_URL.split('@').pop().split('/')[0];
    console.log(`[DB] Preparing connection to ${dbName} at ${host} (SSL: ${!isLocal})`);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : {
        rejectUnauthorized: false,
    },
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
};
