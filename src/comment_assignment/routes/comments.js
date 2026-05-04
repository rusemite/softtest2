const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all comments
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM comments ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET comment by id
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM comments WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new comment
router.post('/', async (req, res) => {
    const { post_id, author, content } = req.body;
    if (!post_id || !author || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const result = await db.query(
            'INSERT INTO comments (post_id, author, content) VALUES ($1, $2, $3) RETURNING *',
            [post_id, author, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update comment
router.put('/:id', async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Missing content field' });
    }
    try {
        const result = await db.query(
            'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
            [content, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE comment
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM comments WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
