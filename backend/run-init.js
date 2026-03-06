const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Force load the .env file with an absolute path
const envPath = path.resolve(__dirname, '.env');
console.log(`[INIT] Running run-init.js. Checking .env at: ${envPath}`);
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`[INIT] .env loaded successfully.`);
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
