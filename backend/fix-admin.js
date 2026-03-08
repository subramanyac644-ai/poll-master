require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db.js');

async function seedAdmin() {
    const email = 'admin@example.com';
    const password = '1Aa@1212';

    try {
        console.log("Connecting to Render database...");

        // Check if admin exists
        const checkRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkRes.rows.length > 0) {
            console.log("Admin account found. Overwriting password to guarantee it works...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);
            console.log("Admin password successfully reset to 1Aa@1212!");
        } else {
            console.log("Admin account not found. Creating a fresh admin account...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['Super Admin', email, hashedPassword, 'admin']
            );
            console.log("Admin account successfully created!");
        }
    } catch (err) {
        console.error("Error setting up admin:", err);
    } finally {
        console.log("Testing complete. You can now log in at https://poll-master-sigma.vercel.app/login");
        process.exit(0);
    }
}

seedAdmin();
