const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const db = require('../db');

const router = express.Router();

// GET all polls with detailed metadata
router.get('/', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.question, p.is_active, p.created_at,
                u.name as creator_name,
                (SELECT COUNT(*)::int FROM votes WHERE poll_id = p.id) as total_votes,
                (SELECT COALESCE(json_agg(json_build_object('id', o.id, 'text', o.option_text)), '[]') FROM options o WHERE o.poll_id = p.id) as options
            FROM polls p
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Explore V2 API Error:', error);
        res.status(500).json({ message: 'Server error v2', error: error.message });
    }
});

module.exports = router;
