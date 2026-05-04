document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    const commentsList = document.getElementById('commentsList');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const saveEditBtn = document.getElementById('saveEdit');

    // Fetch and display comments
    const fetchComments = async () => {
        try {
            const response = await fetch('/api/comments');
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const displayComments = (comments) => {
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const card = document.createElement('div');
            card.className = 'card comment-card';
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${comment.author} <small class="text-muted">(Post ID: ${comment.post_id})</small></h5>
                    <p class="card-text">${comment.content}</p>
                    <p class="card-text"><small class="text-muted">${new Date(comment.created_at).toLocaleString()}</small></p>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${comment.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${comment.id}">Delete</button>
                </div>
            `;
            commentsList.appendChild(card);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteComment(btn.dataset.id));
        });
    };

    // Add new comment
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const post_id = document.getElementById('post_id').value;
        const author = document.getElementById('author').value;
        const content = document.getElementById('content').value;

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id, author, content })
            });

            if (response.ok) {
                commentForm.reset();
                fetchComments();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    });

    // Delete comment
    const deleteComment = async (id) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            try {
                const response = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchComments();
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    // Open Edit Modal
    const openEditModal = async (id) => {
        try {
            const response = await fetch(`/api/comments/${id}`);
            const comment = await response.json();
            document.getElementById('editId').value = comment.id;
            document.getElementById('editContent').value = comment.content;
            editModal.show();
        } catch (error) {
            console.error('Error fetching comment details:', error);
        }
    };

    // Save edited comment
    saveEditBtn.addEventListener('click', async () => {
        const id = document.getElementById('editId').value;
        const content = document.getElementById('editContent').value;

        try {
            const response = await fetch(`/api/comments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                editModal.hide();
                fetchComments();
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    });

    // Initial load
    fetchComments();
});
