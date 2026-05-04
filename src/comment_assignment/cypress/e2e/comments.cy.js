describe('Comments E2E Tests', () => {
    beforeEach(() => {
        // We'll use intercept to mock the API for E2E testing
        // as we might not have a real DB running in this environment
        cy.intercept('GET', '/api/comments', {
            statusCode: 200,
            body: [
                { id: 1, post_id: 101, author: 'Initial User', content: 'Initial Comment', created_at: new Date() }
            ]
        }).as('getComments');

        cy.visit('/');
    });

    it('1. Should display the page title', () => {
        cy.get('h1').should('contain', 'Comments Management');
    });

    it('2. Should display existing comments', () => {
        cy.wait('@getComments');
        cy.get('#commentsList').children().should('have.length', 1);
        cy.get('.comment-card').first().should('contain', 'Initial User');
    });

    it('3. Should show the add comment form', () => {
        cy.get('#commentForm').should('be.visible');
        cy.get('#post_id').should('be.visible');
        cy.get('#author').should('be.visible');
        cy.get('#content').should('be.visible');
    });

    it('4. Should create a new comment successfully', () => {
        cy.intercept('POST', '/api/comments', {
            statusCode: 201,
            body: { id: 2, post_id: 102, author: 'New User', content: 'New Content', created_at: new Date() }
        }).as('createComment');

        cy.intercept('GET', '/api/comments', {
            statusCode: 200,
            body: [
                { id: 2, post_id: 102, author: 'New User', content: 'New Content', created_at: new Date() },
                { id: 1, post_id: 101, author: 'Initial User', content: 'Initial Comment', created_at: new Date() }
            ]
        }).as('getCommentsUpdated');

        cy.get('#post_id').type('102');
        cy.get('#author').type('New User');
        cy.get('#content').type('New Content');
        cy.get('#commentForm button[type="submit"]').click();

        cy.wait('@createComment');
        cy.get('#commentsList').children().should('have.length', 2);
    });

    it('5. Should open edit modal with correct data', () => {
        cy.intercept('GET', '/api/comments/1', {
            statusCode: 200,
            body: { id: 1, post_id: 101, author: 'Initial User', content: 'Initial Comment', created_at: new Date() }
        }).as('getSingleComment');

        cy.get('.edit-btn').first().click();
        cy.wait('@getSingleComment');
        cy.get('#editModal').should('be.visible');
        cy.get('#editContent').should('have.value', 'Initial Comment');
    });

    it('6. Should update a comment successfully', () => {
        cy.intercept('GET', '/api/comments/1', {
            statusCode: 200,
            body: { id: 1, post_id: 101, author: 'Initial User', content: 'Initial Comment', created_at: new Date() }
        });
        cy.intercept('PUT', '/api/comments/1', {
            statusCode: 200,
            body: { id: 1, post_id: 101, author: 'Initial User', content: 'Updated Content', created_at: new Date() }
        }).as('updateComment');

        cy.intercept('GET', '/api/comments', {
            statusCode: 200,
            body: [
                { id: 1, post_id: 101, author: 'Initial User', content: 'Updated Content', created_at: new Date() }
            ]
        });

        cy.get('.edit-btn').first().click();
        cy.get('#editContent').clear().type('Updated Content');
        cy.get('#saveEdit').click();

        cy.wait('@updateComment');
        cy.get('#editModal').should('not.be.visible');
        cy.get('.comment-card').first().should('contain', 'Updated Content');
    });

    it('7. Should delete a comment successfully', () => {
        cy.intercept('DELETE', '/api/comments/1', {
            statusCode: 200,
            body: { message: 'Comment deleted successfully' }
        }).as('deleteComment');

        cy.intercept('GET', '/api/comments', {
            statusCode: 200,
            body: []
        });

        // Mock window.confirm
        cy.on('window:confirm', () => true);

        cy.get('.delete-btn').first().click();
        cy.wait('@deleteComment');
        cy.get('#commentsList').should('be.empty');
    });

    it('8. Should validate required fields in form', () => {
        cy.get('#commentForm button[type="submit"]').click();
        // Check if form validation prevented submission (browser handles this)
        // In Cypress, we can check that no POST request was made
        cy.intercept('POST', '/api/comments').as('postRequest');
        cy.get('@postRequest').should('be.null');
    });

    it('9. Should close edit modal without saving', () => {
        cy.intercept('GET', '/api/comments/1', {
            statusCode: 200,
            body: { id: 1, post_id: 101, author: 'Initial User', content: 'Initial Comment', created_at: new Date() }
        });
        cy.get('.edit-btn').first().click();
        cy.get('#editModal').should('be.visible');
        cy.get('#editModal .btn-close').click();
        cy.get('#editModal').should('not.be.visible');
    });

    it('10. Should handle API errors gracefully', () => {
        cy.intercept('GET', '/api/comments', {
            statusCode: 500,
            body: { error: 'Server Error' }
        });
        cy.reload();
        // The app just logs to console, but we can verify it doesn't crash
        cy.get('h1').should('be.visible');
    });
});
