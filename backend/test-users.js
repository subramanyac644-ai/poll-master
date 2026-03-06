const db = require('./db');

async function showUsers() {
    try {
        console.log("Fetching users table...");
        const result = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
        console.table(result.rows);
    } catch (err) {
        console.error("Error querying database:", err);
    } finally {
        process.exit(0);
    }
}

showUsers();
