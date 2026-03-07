const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function debugExplore() {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();
        console.log('Connected to DB. Running Explore query...');

        // This is the query that failed
        const query = `
            SELECT 
                p.id, p.question, p.is_active, p.created_at,
                u.name as creator_name,
                COALESCE(COUNT(DISTINCT v.id), 0) as total_votes,
                COALESCE(
                    json_agg(DISTINCT jsonb_build_object('id', o.id, 'text', o.option_text)) FILTER (WHERE o.id IS NOT NULL),
                    '[]'
                ) as options
            FROM polls p
            LEFT JOIN users u ON p.created_by = u.id
            LEFT JOIN options o ON p.id = o.poll_id
            LEFT JOIN votes v ON p.id = v.poll_id
            GROUP BY p.id, u.name
            ORDER BY p.created_at DESC
        `;
        const res = await client.query(query);
        console.log('Query successful! Rows:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('Sample Row:', JSON.stringify(res.rows[0], null, 2));
        }
    } catch (err) {
        console.error('❌ QUERY FAILED!');
        console.error(err.message);
        console.error(err.stack);
    } finally {
        await client.end();
    }
}

debugExplore();
