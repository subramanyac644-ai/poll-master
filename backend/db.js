const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// 1. Force load the .env file ONLY in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
const envPath = path.resolve(__dirname, '.env');

if (!isProduction && fs.existsSync(envPath)) {
    console.log(`[INIT] Development mode detected. Loading .env from: ${envPath}`);
    require('dotenv').config({ path: envPath });
} else if (isProduction) {
    console.log(`[INIT] Production mode detected. Using system environment variables.`);
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
