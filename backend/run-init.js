const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Force load the .env file ONLY in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
const envPath = path.resolve(__dirname, '.env');

if (!isProduction && fs.existsSync(envPath)) {
    console.log(`[INIT] Development mode detected. Loading .env from: ${envPath}`);
    require('dotenv').config({ path: envPath });
} else if (isProduction) {
    console.log(`[INIT] Production mode detected. Ignoring local .env file.`);
}

// 2. SSL and Connection Logic
const dbUrl = process.env.DATABASE_URL;
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

if (dbUrl) {
    const host = dbUrl.split('@').pop().split('/')[0];
    console.log(`[DB] Initializing Database at: ${host} (SSL: ${!isLocal})`);
} else {
    console.error(`[DB] CRITICAL: DATABASE_URL is not defined! Use 'set DATABASE_URL=...' before running.`);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function runInit() {
    try {
        console.log('[INIT] Reading init.sql...');
        const initSqlPath = path.resolve(__dirname, 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');

        console.log('[INIT] Executing script on target database...');
        await pool.query(initSql);

        console.log('✅ Database initialized successfully!');
    } catch (err) {
        console.error('❌ Error during database initialization:', err.message);
        if (err.detail) console.error('Details:', err.detail);
    } finally {
        await pool.end();
    }
}

runInit();
