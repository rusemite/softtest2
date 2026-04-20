const request = require('supertest');
const app = require('../../assignment2/app');
const db = require('../../assignment2/db');

jest.mock('../../assignment2/db');

describe('Student and Course Management API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Student Tests
    describe('Student CRUD', () => {
        it('should create a new student', async () => {
            const student = { name: 'John Doe', email: 'john@example.com' };
            db.query.mockResolvedValue({ rows: [{ id: 1, ...student }] });

            const res = await request(app).post('/api/students').send(student);
            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe(student.name);
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO students'), [student.name, student.email]);
        });

        it('should return 400 if name or email is missing', async () => {
            const res = await request(app).post('/api/students').send({ name: 'John' });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Name and email are required');
        });

        it('should return 404 for non-existent student', async () => {
            db.query.mockResolvedValue({ rows: [] });
            const res = await request(app).get('/api/students/999');
            expect(res.statusCode).toBe(404);
        });

        it('should update a student', async () => {
            const student = { name: 'John Updated', email: 'john.upd@example.com' };
            db.query.mockResolvedValue({ rows: [{ id: 1, ...student }] });

            const res = await request(app).put('/api/students/1').send(student);
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe(student.name);
        });

        it('should delete a student', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1 }] });
            const res = await request(app).delete('/api/students/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Student deleted successfully');
        });

        it('should return all students', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1, name: 'John' }] });
            const res = await request(app).get('/api/students');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
        });
    });

    // Course Tests
    describe('Course CRUD', () => {
        it('should create a new course', async () => {
            const course = { course_name: 'Node.js', instructor: 'Jane Smith', credit_hours: 3 };
            db.query.mockResolvedValue({ rows: [{ id: 1, ...course }] });

            const res = await request(app).post('/api/courses').send(course);
            expect(res.statusCode).toBe(201);
            expect(res.body.course_name).toBe(course.course_name);
        });

        it('should return 400 for invalid credit hours', async () => {
            const course = { course_name: 'Invalid', instructor: 'Me', credit_hours: 0 };
            const res = await request(app).post('/api/courses').send(course);
            expect(res.statusCode).toBe(400);
        });

        it('should return all courses', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1, course_name: 'Node.js' }] });
            const res = await request(app).get('/api/courses');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
        });

        it('should return a specific course', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1, course_name: 'Node.js' }] });
            const res = await request(app).get('/api/courses/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.course_name).toBe('Node.js');
        });

        it('should return 404 for non-existent course', async () => {
            db.query.mockResolvedValue({ rows: [] });
            const res = await request(app).get('/api/courses/999');
            expect(res.statusCode).toBe(404);
        });

        it('should update a course', async () => {
            const course = { course_name: 'Updated', instructor: 'Me', credit_hours: 4 };
            db.query.mockResolvedValue({ rows: [{ id: 1, ...course }] });
            const res = await request(app).put('/api/courses/1').send(course);
            expect(res.statusCode).toBe(200);
            expect(res.body.course_name).toBe('Updated');
        });

        it('should delete a course', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1 }] });
            const res = await request(app).delete('/api/courses/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Course deleted successfully');
        });
    });

    // Enrollment Tests
    describe('Enrollment Operations', () => {
        it('should enroll a student in a course', async () => {
            const enrollment = { student_id: 1, course_id: 1 };
            db.query.mockResolvedValue({ rows: [{ id: 1, ...enrollment }] });

            const res = await request(app).post('/api/enrollments').send(enrollment);
            expect(res.statusCode).toBe(201);
        });

        it('should get all enrollments for a student', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1, student_id: 1, course_id: 1, course_name: 'Node.js' }] });
            const res = await request(app).get('/api/enrollments/student/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
        });

        it('should update grades', async () => {
            const grades = { assignment1: 90, assignment2: 85, midterm_exam: 80, final_exam: 88, final_project: 95 };
            db.query.mockResolvedValue({ rows: [{ id: 1, student_id: 1, course_id: 1, ...grades }] });

            const res = await request(app).put('/api/enrollments/1/grades').send(grades);
            expect(res.statusCode).toBe(200);
            expect(res.body.assignment1).toBe(90);
        });

        it('should return 400 for grades out of range', async () => {
            const res = await request(app).put('/api/enrollments/1/grades').send({ assignment1: 110 });
            expect(res.statusCode).toBe(400);
        });

        it('should calculate final grade correctly', async () => {
            const enrollment = {
                id: 1,
                assignment1: 100, // 15% = 15
                assignment2: 100, // 15% = 15
                midterm_exam: 100, // 30% = 30
                final_exam: 100,   // 30% = 30
                final_project: 100 // 10% = 10
            };
            db.query.mockResolvedValue({ rows: [enrollment] });

            const res = await request(app).get('/api/enrollments/1/final-grade');
            expect(res.statusCode).toBe(200);
            expect(res.body.final_grade).toBe("100.00");
        });

        it('should calculate final grade with mixed scores', async () => {
            const enrollment = {
                id: 1,
                assignment1: 80,  // 12
                assignment2: 90,  // 13.5
                midterm_exam: 70, // 21
                final_exam: 85,   // 25.5
                final_project: 95 // 9.5
            };
            // Total: 12 + 13.5 + 21 + 25.5 + 9.5 = 81.5
            db.query.mockResolvedValue({ rows: [enrollment] });

            const res = await request(app).get('/api/enrollments/1/final-grade');
            expect(res.statusCode).toBe(200);
            expect(res.body.final_grade).toBe("81.50");
        });
    });

    // Validation Tests
    describe('Validation Checks', () => {
        it('should return 400 for empty course name', async () => {
            const res = await request(app).post('/api/courses').send({ instructor: 'Dr. Who', credit_hours: 3 });
            expect(res.statusCode).toBe(400);
        });

        it('should return 400 for negative credit hours', async () => {
            const res = await request(app).post('/api/courses').send({ course_name: 'Math', instructor: 'Dr. Who', credit_hours: -1 });
            expect(res.statusCode).toBe(400);
        });

        it('should return 400 for duplicate email in DB', async () => {
            const error = new Error('duplicate key value violates unique constraint');
            error.code = '23505';
            db.query.mockRejectedValue(error);

            const res = await request(app).post('/api/students').send({ name: 'John', email: 'john@example.com' });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Email already exists');
        });
        
        it('should return 400 if student or course does not exist on enrollment', async () => {
            const error = new Error('foreign key violation');
            error.code = '23503';
            db.query.mockRejectedValue(error);

            const res = await request(app).post('/api/enrollments').send({ student_id: 999, course_id: 999 });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Student or Course does not exist');
        });
    });
});
