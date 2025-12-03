const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const COMMENTS_FILE = path.join(__dirname, 'comments-data.json');

// Initialize comments file if it doesn't exist
if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify([]));
}

function readComments() {
    try {
        const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeComments(comments) {
    try {
        fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    } catch (e) {
        console.error('Error writing comments:', e);
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API: GET all comments
    if (pathname === '/api/comments' && req.method === 'GET') {
        const comments = readComments();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(comments));
        return;
    }

    // API: POST new comment or reply
    if (pathname === '/api/comments' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const newData = JSON.parse(body);
                const comments = readComments();
                
                if (newData.replyingTo !== undefined && newData.replyingTo !== null) {
                    // It's a reply to an existing comment
                    const parentComment = comments.find(c => c.id === newData.replyingTo);
                    if (parentComment) {
                        if (!parentComment.replies) parentComment.replies = [];
                        parentComment.replies.push({
                            id: Date.now(),
                            name: newData.name,
                            text: newData.text,
                            rating: newData.rating || 0,
                            hearts: 0,
                            time: new Date().toISOString()
                        });
                    }
                } else {
                    // It's a top-level comment
                    comments.push({
                        id: Date.now(),
                        name: newData.name,
                        text: newData.text,
                        rating: newData.rating || 0,
                        hearts: 0,
                        replies: [],
                        time: new Date().toISOString()
                    });
                }
                
                writeComments(comments);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, comments }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
        return;
    }

    // API: Heart a comment or reply
    if (pathname === '/api/comments/heart' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { commentId, replyId } = JSON.parse(body);
                const comments = readComments();
                
                if (replyId !== undefined && replyId !== null) {
                    // Heart a reply
                    const comment = comments.find(c => c.id === commentId);
                    if (comment && comment.replies) {
                        const reply = comment.replies.find(r => r.id === replyId);
                        if (reply) reply.hearts = (reply.hearts || 0) + 1;
                    }
                } else {
                    // Heart a top-level comment
                    const comment = comments.find(c => c.id === commentId);
                    if (comment) comment.hearts = (comment.hearts || 0) + 1;
                }
                
                writeComments(comments);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, comments }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
        return;
    }

    // API: Delete a comment or reply
    if (pathname === '/api/comments/delete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { commentId, replyId } = JSON.parse(body);
                let comments = readComments();
                
                if (replyId !== undefined && replyId !== null) {
                    // Delete a reply
                    const comment = comments.find(c => c.id === commentId);
                    if (comment && comment.replies) {
                        comment.replies = comment.replies.filter(r => r.id !== replyId);
                    }
                } else {
                    // Delete a top-level comment
                    comments = comments.filter(c => c.id !== commentId);
                }
                
                writeComments(comments);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, comments }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'crazyy.html' : pathname);
    const ext = path.extname(filePath);

    if (!ext) filePath = path.join(__dirname, pathname, 'index.html');

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404: File not found');
            return;
        }

        let contentType = 'text/html';
        if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'text/javascript';
        else if (ext === '.json') contentType = 'application/json';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Comments are being stored in comments-data.json');
});
