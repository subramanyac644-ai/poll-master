const { db } = require('./db.js');

async function testAdmin() {
    try {
        const res = await db.query('SELECT id, name, email, role, password_hash FROM users WHERE email = $1', ['admin@example.com']);
        console.log("Admin Query Result:");
        console.log(res.rows);
    } catch (err) {
        console.error("Error querying db:", err);
    } finally {
        process.exit(0);
    }
}

testAdmin();
