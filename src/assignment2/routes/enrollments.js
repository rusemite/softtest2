const express = require('express');
const router = express.Router();
const db = require('../db');

// Enroll Student in Course
router.post('/', async (req, res) => {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) {
        return res.status(400).json({ error: 'Student ID and Course ID are required' });
    }
    try {
        const result = await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
            [student_id, course_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Student already enrolled in this course' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Student or Course does not exist' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Update Grades for an Enrollment
router.put('/:id/grades', async (req, res) => {
    const { assignment1, assignment2, midterm_exam, final_exam, final_project } = req.body;
    
    const grades = [assignment1, assignment2, midterm_exam, final_exam, final_project];
    for (let grade of grades) {
        if (grade !== undefined && (grade < 0 || grade > 100)) {
            return res.status(400).json({ error: 'Grades must be between 0 and 100' });
        }
    }

    try {
        const result = await db.query(
            `UPDATE enrollments 
             SET assignment1 = COALESCE($1, assignment1), 
                 assignment2 = COALESCE($2, assignment2), 
                 midterm_exam = COALESCE($3, midterm_exam), 
                 final_exam = COALESCE($4, final_exam), 
                 final_project = COALESCE($5, final_project) 
             WHERE id = $6 RETURNING *`,
            [assignment1, assignment2, midterm_exam, final_exam, final_project, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve Grades and Calculate Final Grade
router.get('/:id/final-grade', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM enrollments WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        
        const enrollment = result.rows[0];
        const a1 = parseFloat(enrollment.assignment1) || 0;
        const a2 = parseFloat(enrollment.assignment2) || 0;
        const midterm = parseFloat(enrollment.midterm_exam) || 0;
        const final = parseFloat(enrollment.final_exam) || 0;
        const project = parseFloat(enrollment.final_project) || 0;

        const finalGrade = (a1 * 0.15) + (a2 * 0.15) + (midterm * 0.30) + (final * 0.30) + (project * 0.10);

        res.json({
            ...enrollment,
            final_grade: finalGrade.toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve all Enrollments for a Student
router.get('/student/:student_id', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT e.*, c.course_name 
             FROM enrollments e 
             JOIN courses c ON e.course_id = c.id 
             WHERE e.student_id = $1`,
            [req.params.student_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
