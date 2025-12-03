// Comments, star-rating and hearting functionality (persists on server)
(function() {
    const API_URL = 'http://localhost:3000/api/comments';

    function qs(sel, ctx = document) { return ctx.querySelector(sel); }
    function qsa(sel, ctx = document) { return Array.from((ctx || document).querySelectorAll(sel)); }

    const form = qs('#comment-form');
    const nameInput = qs('#comment-name');
    const textInput = qs('#comment-text');
    const stars = qsa('#star-rating .star');
    const commentsList = qs('#comments-list');

    if (!form || !commentsList) return; // exit if elements don't exist

    let selectedRating = 0;
    let replyingTo = null;
    let allComments = [];

    async function loadComments() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                allComments = await response.json();
                return allComments;
            }
        } catch (e) {
            console.error('Error loading comments:', e);
        }
        return [];
    }

    async function saveComment(name, text, rating, replyingToId = null) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    text,
                    rating,
                    replyingTo: replyingToId
                })
            });
            if (response.ok) {
                const data = await response.json();
                allComments = data.comments;
                renderComments();
                return true;
            }
        } catch (e) {
            console.error('Error saving comment:', e);
            alert('Error: Could not save comment. Make sure the server is running.');
        }
        return false;
    }

    async function heartComment(commentId, replyId = null) {
        try {
            const response = await fetch(`${API_URL}/heart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId, replyId })
            });
            if (response.ok) {
                const data = await response.json();
                allComments = data.comments;
                renderComments();
                return true;
            }
        } catch (e) {
            console.error('Error hearting comment:', e);
        }
        return false;
    }

    async function deleteComment(commentId, replyId = null) {
        try {
            const response = await fetch(`${API_URL}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId, replyId })
            });
            if (response.ok) {
                const data = await response.json();
                allComments = data.comments;
                renderComments();
                return true;
            }
        } catch (e) {
            console.error('Error deleting comment:', e);
        }
        return false;
    }

    function renderStars(el, value) {
        el.innerHTML = '';
        for (let i = 1; i <= 5; i++) el.innerHTML += (i <= value ? '★' : '☆');
    }

    function renderReplies(comment, repliesContainer) {
        repliesContainer.innerHTML = '';
        const replies = comment.replies || [];
        replies.forEach(reply => {
            const replyEl = document.createElement('div');
            replyEl.className = 'reply';
            
            const replyMeta = document.createElement('div');
            replyMeta.className = 'reply-meta';
            
            const nameTime = document.createElement('div');
            nameTime.className = 'reply-name-time';
            const name = document.createElement('span');
            name.className = 'reply-name';
            name.textContent = reply.name;
            const time = document.createElement('span');
            time.className = 'reply-time';
            time.textContent = new Date(reply.time).toLocaleDateString();
            nameTime.appendChild(name);
            nameTime.appendChild(time);
            
            const actions = document.createElement('div');
            actions.className = 'reply-actions';
            
            const heartBtn = document.createElement('button');
            heartBtn.className = 'heart-btn reply-heart';
            heartBtn.type = 'button';
            heartBtn.setAttribute('aria-label', 'Like reply');
            heartBtn.textContent = `❤ ${reply.hearts || 0}`;
            heartBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await heartComment(comment.id, reply.id);
            });
            actions.appendChild(heartBtn);
            
            const deleteReplyBtn = document.createElement('button');
            deleteReplyBtn.className = 'action-btn delete-btn';
            deleteReplyBtn.type = 'button';
            deleteReplyBtn.setAttribute('aria-label', 'Delete reply');
            deleteReplyBtn.textContent = '🗑';
            deleteReplyBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('Delete this reply?')) {
                    await deleteComment(comment.id, reply.id);
                }
            });
            actions.appendChild(deleteReplyBtn);
            
            replyMeta.appendChild(nameTime);
            replyMeta.appendChild(actions);
            
            const replyText = document.createElement('div');
            replyText.className = 'reply-text';
            replyText.textContent = reply.text;
            
            replyEl.appendChild(replyMeta);
            replyEl.appendChild(replyText);
            repliesContainer.appendChild(replyEl);
        });
    }

    async function renderComments() {
        const list = await loadComments();
        commentsList.innerHTML = '';
        
        // Display newest first
        const displayList = list.slice().reverse();
        
        displayList.forEach((comment) => {
            const wrap = document.createElement('div');
            wrap.className = 'comment';

            const meta = document.createElement('div');
            meta.className = 'meta';
            const left = document.createElement('div');
            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = comment.name;
            const rating = document.createElement('div');
            rating.className = 'rating';
            rating.textContent = ' ';
            renderStars(rating, comment.rating || 0);
            left.appendChild(name);
            left.appendChild(rating);

            const right = document.createElement('div');
            right.className = 'actions';
            
            const heartBtn = document.createElement('button');
            heartBtn.className = 'heart-btn';
            heartBtn.setAttribute('aria-label', 'Like comment');
            heartBtn.type = 'button';
            heartBtn.innerHTML = `❤ ${comment.hearts || 0}`;
            heartBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await heartComment(comment.id);
            });
            right.appendChild(heartBtn);

            const replyBtn = document.createElement('button');
            replyBtn.className = 'action-btn reply-btn';
            replyBtn.type = 'button';
            replyBtn.setAttribute('aria-label', 'Reply to comment');
            replyBtn.textContent = 'reply?';
            replyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                replyingTo = comment.id;
                nameInput.focus();
                textInput.placeholder = `Reply to ${comment.name}...`;
                form.style.backgroundColor = '#e8f5e9';
                form.scrollIntoView({ behavior: 'smooth' });
            });
            right.appendChild(replyBtn);

            const reportBtn = document.createElement('button');
            reportBtn.className = 'action-btn report-btn';
            reportBtn.type = 'button';
            reportBtn.setAttribute('aria-label', 'Report comment');
            reportBtn.textContent = '🚩';
            reportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openReportModal(comment);
            });
            right.appendChild(reportBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.type = 'button';
            deleteBtn.setAttribute('aria-label', 'Delete comment');
            deleteBtn.textContent = '🗑';
            deleteBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('Delete this comment?')) {
                    await deleteComment(comment.id);
                }
            });
            right.appendChild(deleteBtn);

            meta.appendChild(left);
            meta.appendChild(right);

            const text = document.createElement('div');
            text.className = 'text';
            text.textContent = comment.text;

            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            renderReplies(comment, repliesContainer);

            wrap.appendChild(meta);
            wrap.appendChild(text);
            wrap.appendChild(repliesContainer);
            commentsList.appendChild(wrap);
        });
    }

    function openReportModal(comment) {
        const reason = prompt('Please describe why you are reporting this comment:');
        if (reason && reason.trim()) {
            alert(`Thank you for reporting. Your report has been recorded:\n\nComment by: ${comment.name}\nReason: ${reason}`);
        }
    }

    // Star interactions
    stars.forEach(s => {
        const val = Number(s.dataset.value);
        s.addEventListener('mouseenter', () => {
            stars.forEach(x => x.classList.toggle('filled', Number(x.dataset.value) <= val));
        });
        s.addEventListener('mouseleave', () => {
            stars.forEach(x => x.classList.toggle('filled', Number(x.dataset.value) <= selectedRating));
        });
        s.addEventListener('click', () => {
            selectedRating = val;
            stars.forEach(x => x.classList.toggle('filled', Number(x.dataset.value) <= selectedRating));
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        if (!name || !text) return;
        
        await saveComment(name, text, selectedRating, replyingTo);
        
        replyingTo = null;
        textInput.placeholder = 'Share your thoughts...';
        form.style.backgroundColor = '';
        nameInput.value = '';
        textInput.value = '';
        selectedRating = 0;
        stars.forEach(x => x.classList.remove('filled'));
    });

    // Initial render
    renderComments();

    // Auto-refresh comments every 3 seconds to show new comments from other users
    setInterval(renderComments, 3000);
})();
