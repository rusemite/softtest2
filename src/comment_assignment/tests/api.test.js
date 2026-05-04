const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Mock the database module
jest.mock('../db');

describe('Comments API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. GET all comments - Success
    test('GET /api/comments should return all comments', async () => {
        const mockComments = [
            { id: 1, post_id: 101, author: 'User1', content: 'Nice post!', created_at: new Date() },
            { id: 2, post_id: 101, author: 'User2', content: 'Thanks!', created_at: new Date() }
        ];
        db.query.mockResolvedValue({ rows: mockComments });

        const res = await request(app).get('/api/comments');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(JSON.parse(JSON.stringify(mockComments)));
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM comments ORDER BY created_at DESC');
    });

    // 2. GET all comments - Error
    test('GET /api/comments should handle database errors', async () => {
        db.query.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/api/comments');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'Database error');
    });

    // 3. GET comment by ID - Success
    test('GET /api/comments/:id should return a comment', async () => {
        const mockComment = { id: 1, post_id: 101, author: 'User1', content: 'Nice post!', created_at: new Date() };
        db.query.mockResolvedValue({ rows: [mockComment] });

        const res = await request(app).get('/api/comments/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(JSON.parse(JSON.stringify(mockComment)));
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM comments WHERE id = $1', ['1']);
    });

    // 4. GET comment by ID - Not Found
    test('GET /api/comments/:id should return 404 if not found', async () => {
        db.query.mockResolvedValue({ rows: [] });
        const res = await request(app).get('/api/comments/999');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Comment not found');
    });

    // 5. POST new comment - Success
    test('POST /api/comments should create a new comment', async () => {
        const newComment = { post_id: 101, author: 'User1', content: 'New comment' };
        const savedComment = { id: 1, ...newComment, created_at: new Date() };
        db.query.mockResolvedValue({ rows: [savedComment] });

        const res = await request(app)
            .post('/api/comments')
            .send(newComment);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(JSON.parse(JSON.stringify(savedComment)));
        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO comments'),
            [101, 'User1', 'New comment']
        );
    });

    // 6. POST new comment - Missing Fields
    test('POST /api/comments should return 400 if fields are missing', async () => {
        const res = await request(app)
            .post('/api/comments')
            .send({ author: 'User1' }); // Missing post_id and content

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Missing required fields');
    });

    // 7. PUT update comment - Success
    test('PUT /api/comments/:id should update a comment', async () => {
        const updatedComment = { id: 1, post_id: 101, author: 'User1', content: 'Updated content', created_at: new Date() };
        db.query.mockResolvedValue({ rows: [updatedComment] });

        const res = await request(app)
            .put('/api/comments/1')
            .send({ content: 'Updated content' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(JSON.parse(JSON.stringify(updatedComment)));
        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE comments SET content'),
            ['Updated content', '1']
        );
    });

    // 8. PUT update comment - Not Found
    test('PUT /api/comments/:id should return 404 if not found', async () => {
        db.query.mockResolvedValue({ rows: [] });
        const res = await request(app)
            .put('/api/comments/999')
            .send({ content: 'Updated content' });

        expect(res.statusCode).toBe(404);
    });

    // 9. DELETE comment - Success
    test('DELETE /api/comments/:id should delete a comment', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1 }] });
        const res = await request(app).delete('/api/comments/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
        expect(db.query).toHaveBeenCalledWith('DELETE FROM comments WHERE id = $1 RETURNING *', ['1']);
    });

    // 10. DELETE comment - Not Found
    test('DELETE /api/comments/:id should return 404 if not found', async () => {
        db.query.mockResolvedValue({ rows: [] });
        const res = await request(app).delete('/api/comments/999');
        expect(res.statusCode).toBe(404);
    });

    // 11. POST new comment - Database Error
    test('POST /api/comments should handle database errors', async () => {
        db.query.mockRejectedValue(new Error('Insert failed'));
        const res = await request(app)
            .post('/api/comments')
            .send({ post_id: 1, author: 'A', content: 'C' });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'Insert failed');
    });
});
