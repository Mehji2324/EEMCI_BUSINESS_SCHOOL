const Event = require('../models/Event');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.createEvent = asyncHandler(async (req, res) => {
    // req.body is populated by multer
    const { title, description, date, location, type } = req.body;
    const file = req.file;
    
    if (!title || !type || !date) {
        return res.status(400).json({ success: false, message: 'Title, type and date are required' });
    }

    const file_path = file ? `/uploads/${file.filename}` : null;

    const eventId = await Event.create({ 
        title, 
        description, 
        date, 
        location, 
        type, 
        file_path 
    });

    // Real-time Broadcast via Socket.io
    const io = req.app.get('socketio');
    if (io) {
        io.emit('new_notification', {
            type: 'news',
            title: 'School Update',
            content: `New ${type.replace('_', ' ')}: ${title}`,
            created_at: new Date(),
            link: type === 'exam_plan' ? 'studentExamSchedule' : 'studentEvents'
        });
    }

    res.status(201).json({ 
        success: true, 
        message: 'Published successfully', 
        eventId 
    });
});

exports.getAllEvents = asyncHandler(async (req, res) => {
    const events = await Event.getAll();
    res.json(events);
});

exports.deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Event.delete(id);
    res.json({ success: true, message: 'Deleted successfully' });
});

exports.getEventsByType = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const events = await Event.getByType(type);
    res.json(events);
});

exports.markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await db.execute(
        'INSERT IGNORE INTO event_reads (user_id, event_id) VALUES (?, ?)',
        [userId, id]
    );

    res.json({ success: true });
});