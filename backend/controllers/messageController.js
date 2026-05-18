const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../utils/notifHelper');

// Send a message
exports.sendMessage = asyncHandler(async (req, res) => {
    const { receiver_id, subject, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) {
        return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }

    await db.execute(
        'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES (?, ?, ?, ?)',
        [sender_id, receiver_id, subject || '(No Subject)', content]
    );

    // Persistent Real-time Notification
    await createNotification(
        req.app, 
        receiver_id, 
        'message', 
        'New Message', 
        `From ${req.user.name}: ${subject || '(No Subject)'}`,
        'mailboxSection'
    );

    res.status(201).json({ success: true, message: 'Message sent successfully' });
});

// Get inbox for current user
exports.getInbox = asyncHandler(async (req, res) => {
    const [rows] = await db.execute(`
        SELECT m.*, u.name as sender_name, u.email as sender_email 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ?
        ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json(rows);
});

// Get sent messages
exports.getSentMessages = asyncHandler(async (req, res) => {
    const [rows] = await db.execute(`
        SELECT m.*, u.name as receiver_name, u.email as receiver_email 
        FROM messages m
        JOIN users u ON m.receiver_id = u.id
        WHERE m.sender_id = ?
        ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json(rows);
});

// Mark message as read
exports.markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.execute('UPDATE messages SET is_read = TRUE WHERE id = ? AND receiver_id = ?', [id, req.user.id]);
    res.json({ success: true });
});

// Get all possible recipients (simplified for now)
exports.getRecipients = asyncHandler(async (req, res) => {
    const [rows] = await db.execute('SELECT id, name, email, role FROM users WHERE id != ?', [req.user.id]);
    res.json(rows);
});

// Unified Notifications (Messages + School News)
exports.getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Get Unread Messages
    const [messages] = await db.execute(`
        SELECT 'message' as type, m.id, m.subject as title, m.content, m.created_at, u.name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ? AND m.is_read = FALSE
    `, [userId]);

    // 2. Get Unread Events/News
    const [events] = await db.execute(`
        SELECT 'news' as type, e.id, e.title, e.description as content, e.created_at, e.type as category
        FROM events e
        LEFT JOIN event_reads er ON e.id = er.event_id AND er.user_id = ?
        WHERE er.event_id IS NULL
    `, [userId]);

    // Combine and sort by date descending
    const notifications = [...messages, ...events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(notifications);
});
