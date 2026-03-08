const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const db = require('../db');

const router = express.Router();

// GET all active polls with vote counts and options
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                (SELECT COUNT(*)::int FROM votes v WHERE v.poll_id = p.id) as total_votes,
                (SELECT COALESCE(json_agg(json_build_object('id', o.id, 'text', o.option_text)), '[]') FROM options o WHERE o.poll_id = p.id) as options
            FROM polls p
            WHERE p.is_active = true
            ORDER BY p.created_at DESC
        `;
        const pollsResult = await db.query(query);
        // Cache results for 60 seconds (public, shared)
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json(pollsResult.rows);
    } catch (error) {
        console.error('Main Polls API Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET all polls with options and vote counts (for Explore page)
router.get('/explore', async (req, res) => {
    res.json({ message: 'Hello from Explore' });
});

// GET all polls (Admin)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const query = `
      SELECT p.*, u.name as creator_name 
      FROM polls p 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.created_at DESC
    `;
        const pollsResult = await db.query(query);
        res.json(pollsResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST a new poll (Authenticated Users)
router.post('/', authMiddleware, async (req, res) => {
    const { question, options } = req.body;
    if (!question || !options || options.length < 2) {
        return res.status(400).json({ message: 'Question and at least two options are required' });
    }

    try {
        // Start transaction with dedicated client
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // Insert poll
            const pollResult = await client.query(
                'INSERT INTO polls (question, is_active, created_by) VALUES ($1, $2, $3) RETURNING *',
                [question, true, req.user.id]
            );
            const poll = pollResult.rows[0];

            // Insert options
            for (const option of options) {
                await client.query(
                    'INSERT INTO options (poll_id, option_text) VALUES ($1, $2)',
                    [poll.id, option]
                );
            }

            await client.query('COMMIT');
            res.status(201).json({ message: 'Poll created successfully', poll });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET a specific poll and its options
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Get poll
        const pollResult = await db.query('SELECT * FROM polls WHERE id = $1', [id]);
        if (pollResult.rows.length === 0) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        const poll = pollResult.rows[0];

        // Get options
        const optionsResult = await db.query('SELECT * FROM options WHERE poll_id = $1', [id]);

        // Check if current user has voted
        const voteCheck = await db.query('SELECT * FROM votes WHERE user_id = $1 AND poll_id = $2', [req.user.id, id]);

        res.json({
            ...poll,
            options: optionsResult.rows,
            hasVoted: voteCheck.rows.length > 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT Update poll status (Admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const result = await db.query(
            'UPDATE polls SET is_active = $1 WHERE id = $2 RETURNING *',
            [is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        res.json({ message: 'Poll updated', poll: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE a poll (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Get dedicated client for Transaction
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Manual Cascade 1: Delete all votes for this poll
            await client.query('DELETE FROM votes WHERE poll_id = $1', [id]);

            // Manual Cascade 2: Delete all options for this poll
            await client.query('DELETE FROM options WHERE poll_id = $1', [id]);

            // Finally: Delete the poll
            const result = await client.query('DELETE FROM polls WHERE id = $1 RETURNING *', [id]);

            await client.query('COMMIT');

            console.log(`Poll ${id} deletion attempt. Rows affected: ${result.rowCount}`);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Poll not found' });
            }

            res.json({ message: 'Poll deleted successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Delete Poll Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// POST submit a vote (User)
router.post('/:id/vote', authMiddleware, async (req, res) => {
    const { id } = req.params; // poll_id
    const { option_id } = req.body;
    const user_id = req.user.id;

    try {
        // Check if poll is active
        const pollResult = await db.query('SELECT is_active FROM polls WHERE id = $1', [id]);
        if (pollResult.rows.length === 0) return res.status(404).json({ message: 'Poll not found' });
        if (!pollResult.rows[0].is_active) return res.status(400).json({ message: 'Poll is not active' });

        // Check if user already voted on this poll
        const existingVote = await db.query('SELECT * FROM votes WHERE user_id = $1 AND poll_id = $2', [user_id, id]);
        if (existingVote.rows.length > 0) {
            return res.status(400).json({ message: 'You have already voted on this poll' });
        }

        // Insert vote
        await db.query(
            'INSERT INTO votes (user_id, poll_id, option_id) VALUES ($1, $2, $3)',
            [user_id, id, option_id]
        );

        res.status(201).json({ message: 'Vote submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET poll results (Admin or if User has voted)
router.get('/:id/results', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const user_role = req.user.role;

        // Check if user has voted on this poll (unless they are admin)
        if (user_role !== 'admin') {
            const voteCheck = await db.query('SELECT * FROM votes WHERE user_id = $1 AND poll_id = $2', [user_id, id]);
            if (voteCheck.rows.length === 0) {
                return res.status(403).json({ message: 'You must vote to see the results' });
            }
        }

        // Check poll exists
        const pollResult = await db.query('SELECT * FROM polls WHERE id = $1', [id]);
        if (pollResult.rows.length === 0) return res.status(404).json({ message: 'Poll not found' });

        // Get options with vote counts
        const query = `
      SELECT o.id, o.option_text, COUNT(v.id) as vote_count
      FROM options o
      LEFT JOIN votes v ON o.id = v.option_id
      WHERE o.poll_id = $1
      GROUP BY o.id, o.option_text
      ORDER BY o.id ASC
    `;
        const results = await db.query(query, [id]);

        res.json({
            poll: pollResult.rows[0],
            results: results.rows
        });
        // Cache poll results for 30 seconds
        res.setHeader('Cache-Control', 'public, max-age=30');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
