const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function fixDb() {
    // Load env
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in .env');
        return;
    }

    // Parse URL to connect to default 'postgres' database first
    // Format: postgres://user:pass@host:port/dbname
    const baseDbUrl = dbUrl.substring(0, dbUrl.lastIndexOf('/') + 1) + 'postgres';

    console.log('🔍 Checking PostgreSQL connection...');
    const client = new Client({ connectionString: baseDbUrl });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL service!');

        // Check if polling_db exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'polling_db'");
        if (res.rowCount === 0) {
            console.log("🛠️ 'polling_db' doesn't exist. Creating it...");
            await client.query("CREATE DATABASE polling_db");
            console.log("✅ 'polling_db' created successfully!");
        } else {
            console.log("✅ 'polling_db' already exists.");
        }

    } catch (err) {
        console.error('❌ CONNECTION FAILED!');
        console.error('--- ERROR DETAILS ---');
        console.error(err.message);
        console.error('----------------------');

        if (err.message.includes('password authentication failed')) {
            console.log('\n💡 TIP: Your PostgreSQL password (2Ss8050) might be wrong.');
            console.log('Please check your pgAdmin or PostgreSQL installation password.');
        } else if (err.message.includes('ECONNREFUSED')) {
            console.log('\n💡 TIP: PostgreSQL service might not be running.');
            console.log('Open your "Services" app in Windows and make sure "postgresql" is "Running".');
        }
    } finally {
        await client.end();
    }
}

fixDb();
