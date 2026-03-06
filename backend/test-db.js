const { Pool } = require('pg');
require('dotenv').config();

console.log('--- Database Connection Diagnostic ---');
console.log('Attempting to connect with:');
console.log(`URL: ${process.env.DATABASE_URL}`);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        console.log('\nChecking connection...');
        const client = await pool.connect();
        console.log('✅ SUCCESS: Connected to PostgreSQL server!');

        const res = await client.query('SELECT current_database(), current_user, version()');
        console.log(`\nDatabase: ${res.rows[0].current_database}`);
        console.log(`User: ${res.rows[0].current_user}`);
        console.log(`Postgres Version: ${res.rows[0].version.split(',')[0]}`);

        client.release();

        console.log('\nChecking tables...');
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables found:', tables.rows.map(t => t.table_name).join(', ') || 'NONE');

        if (tables.rows.length === 0) {
            console.log('\n⚠️ WARNING: Database exists but no tables found. Did you run node run-init.js?');
        } else {
            console.log('\n✅ READY: All systems go!');
        }

    } catch (err) {
        console.error('\n❌ ERROR: Connection failed!');
        console.error('---------------------------');
        if (err.code === 'ECONNREFUSED') {
            console.error('CAUSE: PostgreSQL is not running on your computer.');
            console.error('FIX: Start the PostgreSQL service in Windows Services.');
        } else if (err.code === '28P01') {
            console.error('CAUSE: Invalid password.');
            console.error('FIX: Update the password in your backend/.env file to match your PostgreSQL password.');
        } else if (err.code === '3D000') {
            console.error('CAUSE: Database "polling_db" does not exist.');
            console.error('FIX: Run "CREATE DATABASE polling_db;" in your PostgreSQL terminal.');
        } else {
            console.error(`ERROR CODE: ${err.code}`);
            console.error(`MESSAGE: ${err.message}`);
        }
    } finally {
        await pool.end();
        process.exit();
    }
}

testConnection();
