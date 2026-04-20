const express = require('express');
const router = express.Router();
const db = require('../db');

// Add Course
router.post('/', async (req, res) => {
    const { course_name, instructor, credit_hours } = req.body;
    if (!course_name || !instructor || !credit_hours) {
        return res.status(400).json({ error: 'Course name, instructor, and credit hours are required' });
    }
    if (credit_hours <= 0) {
        return res.status(400).json({ error: 'Credit hours must be greater than 0' });
    }
    try {
        const result = await db.query(
            'INSERT INTO courses (course_name, instructor, credit_hours) VALUES ($1, $2, $3) RETURNING *',
            [course_name, instructor, credit_hours]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve all Courses
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM courses');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve a specific Course
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Course
router.put('/:id', async (req, res) => {
    const { course_name, instructor, credit_hours } = req.body;
    if (!course_name || !instructor || !credit_hours) {
        return res.status(400).json({ error: 'Course name, instructor, and credit hours are required' });
    }
    if (credit_hours <= 0) {
        return res.status(400).json({ error: 'Credit hours must be greater than 0' });
    }
    try {
        const result = await db.query(
            'UPDATE courses SET course_name = $1, instructor = $2, credit_hours = $3 WHERE id = $4 RETURNING *',
            [course_name, instructor, credit_hours, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Course
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM courses WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
