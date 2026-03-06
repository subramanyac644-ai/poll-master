const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
    try {
        console.log('Seeding default users, polls, and sample votes...');

        // 1. Hash passwords
        const salt = await bcrypt.genSalt(10);
        const adminPasswordHash = await bcrypt.hash('admin123', salt);
        const userPasswordHash = await bcrypt.hash('user123', salt);

        // 2. Insert Admin
        let adminResult = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
            ['Admin User', 'admin@example.com', adminPasswordHash, 'admin']
        );
        const adminId = adminResult.rows[0].id;
        console.log('✅ Admin user created/verified: admin@example.com');

        // 3. Insert Standard User
        let userResult = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
            ['Standard User', 'user@example.com', userPasswordHash, 'user']
        );
        const userId = userResult.rows[0].id;
        console.log('✅ Standard User created/verified: user@example.com');

        // 4. Create a Sample Poll created by the Admin
        const pollCheck = await db.query('SELECT id FROM polls WHERE question = $1', ['What is your favorite programming language?']);
        let pollId;

        if (pollCheck.rows.length === 0) {
            // Insert poll
            const pollResult = await db.query(
                'INSERT INTO polls (question, is_active, created_by) VALUES ($1, $2, $3) RETURNING id',
                ['What is your favorite programming language?', true, adminId]
            );
            pollId = pollResult.rows[0].id;

            // Insert options
            const options = ['JavaScript', 'Python', 'Go'];
            for (const option of options) {
                await db.query(
                    'INSERT INTO options (poll_id, option_text) VALUES ($1, $2)',
                    [pollId, option]
                );
            }
            console.log('✅ Sample Poll created: "What is your favorite programming language?" with options (JavaScript, Python, Go)');
        } else {
            pollId = pollCheck.rows[0].id;
            console.log('ℹ️ Sample Poll already exists, skipped duplication.');
        }

        // 5. Automatically Vote as the Standard User
        const voteCheck = await db.query('SELECT id FROM votes WHERE user_id = $1 AND poll_id = $2', [userId, pollId]);
        if (voteCheck.rows.length === 0) {
            // Find the "JavaScript" option ID
            const optionResult = await db.query('SELECT id FROM options WHERE poll_id = $1 AND option_text = $2', [pollId, 'JavaScript']);

            if (optionResult.rows.length > 0) {
                const optionId = optionResult.rows[0].id;

                // Insert vote
                await db.query(
                    'INSERT INTO votes (user_id, poll_id, option_id) VALUES ($1, $2, $3)',
                    [userId, pollId, optionId]
                );
                console.log('✅ Voting User Flow Completed: Standard User successfully voted for "JavaScript".');
            }
        } else {
            console.log('ℹ️ Standard User has already voted on this poll. RBAC limits user to 1 vote. Skipped duplicate vote.');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit(0);
    }
}

seedDatabase();
