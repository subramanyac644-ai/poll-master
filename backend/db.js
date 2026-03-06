const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// 1. Force load the .env file with an absolute path
const envPath = path.resolve(__dirname, '.env');
console.log(`[INIT] Checking for .env at: ${envPath}`);
if (fs.existsSync(envPath)) {
    console.log(`[INIT] Found .env file, loading...`);
    require('dotenv').config({ path: envPath });
} else {
    console.warn(`[INIT] WARNING: .env file NOT found at ${envPath}`);
}

// 2. SSL and Connection Logic
const dbUrl = process.env.DATABASE_URL;
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

// Neon often includes sslmode in the URL, but pg driver needs explicit ssl object
const needsSSL = !isLocal || (dbUrl && dbUrl.includes('sslmode=require'));

if (dbUrl) {
    const host = dbUrl.split('@').pop().split('/')[0];
    console.log(`[DB] Preparing pool for: ${host} (SSL: ${needsSSL})`);
} else {
    console.error(`[DB] CRITICAL: DATABASE_URL is not defined in environment!`);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: needsSSL ? { rejectUnauthorized: false } : false
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
