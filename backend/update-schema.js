const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateSchema() {
    try {
        console.log('Fetching existing constraints...');

        // Disable existing constraints for options
        await pool.query(`
            ALTER TABLE options DROP CONSTRAINT IF EXISTS options_poll_id_fkey;
            ALTER TABLE options ADD CONSTRAINT options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE;
        `);

        // Disable existing constraints for votes
        await pool.query(`
            ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
            ALTER TABLE votes ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

            ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_poll_id_fkey;
            ALTER TABLE votes ADD CONSTRAINT votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE;

            ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_option_id_fkey;
            ALTER TABLE votes ADD CONSTRAINT votes_option_id_fkey FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE;
        `);

        // Disable existing constraints for polls
        await pool.query(`
            ALTER TABLE polls DROP CONSTRAINT IF EXISTS polls_created_by_fkey;
            ALTER TABLE polls ADD CONSTRAINT polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        `);

        console.log('Successfully updated constraints with ON DELETE CASCADE and ON DELETE SET NULL.');
    } catch (err) {
        console.error('Error updating schema constraints:', err);
    } finally {
        await pool.end();
    }
}

updateSchema();
