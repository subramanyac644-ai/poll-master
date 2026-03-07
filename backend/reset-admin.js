const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

async function resetAdmin() {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();
        const hash = await bcrypt.hash('password123', 10);

        await client.query(`
            INSERT INTO users (name, email, password_hash, role) 
            VALUES ('Admin User', 'admin@example.com', $1, 'admin')
            ON CONFLICT (email) DO UPDATE SET password_hash = $1
        `, [hash]);

        console.log('✅ Admin password reset to: password123');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

resetAdmin();
