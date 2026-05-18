const db = require('../config/db');

/**
 * Create a notification in DB and emit via Socket.io
 */
const createNotification = async (app, userId, type, title, content, link = null) => {
    try {
        // 1. Save to Database
        const [result] = await db.execute(
            'INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)',
            [userId, type, title, content, link]
        );

        // 2. Emit Real-time via Socket.io
        const io = app.get('socketio');
        if (io) {
            io.to(`user_${userId}`).emit('new_notification', {
                id: result.insertId,
                type,
                title,
                content,
                link,
                created_at: new Date()
            });
        }
        return result.insertId;
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};

module.exports = { createNotification };