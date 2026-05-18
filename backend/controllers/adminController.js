const User = require('../models/User');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');

exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.getAll();
    res.json(users);
});

exports.addUser = asyncHandler(async (req, res) => {
    const { name, password, role, group_name, department } = req.body;

    console.log('[addUser] Payload:', { name, role, group_name, department });

    if (!name || !role) {
        return res.status(400).json({ success: false, message: 'Name and Role are required' });
    }

    // Generate academic email
    const nameParts = name.trim().toLowerCase().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;
    
    let academicEmail;
    if (role === 'professor') {
        academicEmail = `${firstName}.${lastName}.prof@eemci.edu.ma`;
    } else {
        academicEmail = `${firstName}.${lastName}@eemci.edu.ma`;
    }

    // Generate standard password
    const generatedPassword = password || `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}@2026`;
    
    try {
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        // 1. Create Main User
        const userId = await User.create({
            name,
            email: academicEmail,
            password: hashedPassword,
            role,
            raw_password: generatedPassword
        });

        console.log(`[addUser] Created user ID: ${userId}`);

        // 2. Add Role-Specific Info
        if (role === 'student') {
            await db.execute(
                'INSERT INTO students_info (user_id, group_name, department, academic_email) VALUES (?, ?, ?, ?)', 
                [userId, group_name || 'N/A', department || 'Développement Informatique', academicEmail]
            );
        } else if (role === 'professor') {
            await db.execute(
                'INSERT INTO professors_info (user_id, academic_email, department) VALUES (?, ?, ?)', 
                [userId, academicEmail, department || 'Développement Informatique']
            );
        }

        return res.status(201).json({ 
            success: true, 
            message: 'User created successfully', 
            user: { 
                email: academicEmail, 
                password: generatedPassword, 
                role 
            } 
        });

    } catch (err) {
        console.error('[addUser] CRITICAL ERROR:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'This academic email already exists in the system.' });
        }

        return res.status(500).json({ 
            success: false, 
            message: 'Internal Database Error', 
            error: err.message 
        });
    }
});

exports.deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await User.delete(id);
    res.json({ success: true, message: 'User deleted' });
});

exports.getStats = asyncHandler(async (req, res) => {
    const stats = await User.getStats();
    res.json(stats);
});

exports.getDetailedStats = asyncHandler(async (req, res) => {
    const [userCounts] = await db.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const [courseCount] = await db.execute('SELECT COUNT(*) as count FROM courses');
    const [revenue] = await db.execute('SELECT SUM(amount) as total FROM payments WHERE status = "paid"');
    const [avgAttendance] = await db.execute('SELECT (COUNT(CASE WHEN status = "present" THEN 1 END) * 100.0 / COUNT(*)) as percentage FROM attendance');

    const stats = {
        students: userCounts.find(u => u.role === 'student')?.count || 0,
        professors: userCounts.find(u => u.role === 'professor')?.count || 0,
        admins: userCounts.find(u => u.role === 'admin')?.count || 0,
        courses: courseCount[0].count,
        revenue: revenue[0].total || 0,
        attendance: parseFloat(avgAttendance[0].percentage || 0).toFixed(2),
        activeUsers: Math.floor(Math.random() * 50) + 10 // Mock for now, would use last_active in production
    };

    res.json(stats);
});

exports.getAnalyticsData = asyncHandler(async (req, res) => {
    // Mocking time-series data for Recharts
    const growthData = [
        { name: 'Jan', students: 400, registration: 240 },
        { name: 'Feb', students: 300, registration: 139 },
        { name: 'Mar', students: 200, registration: 980 },
        { name: 'Apr', students: 278, registration: 390 },
        { name: 'May', students: 189, registration: 480 },
        { name: 'Jun', students: 239, registration: 380 },
    ];

    const attendanceData = [
        { name: 'Mon', percentage: 85 },
        { name: 'Tue', percentage: 88 },
        { name: 'Wed', percentage: 92 },
        { name: 'Thu', percentage: 90 },
        { name: 'Fri', percentage: 80 },
    ];

    res.json({ growth: growthData, attendance: attendanceData });
});

exports.getRecentActivities = asyncHandler(async (req, res) => {
    const [activities] = await db.execute(`
        (SELECT 'registration' as type, name as title, registration_date as timestamp FROM users ORDER BY registration_date DESC LIMIT 5)
        UNION
        (SELECT 'payment' as type, CONCAT('Payment of ', amount) as title, date as timestamp FROM payments ORDER BY date DESC LIMIT 5)
        ORDER BY timestamp DESC LIMIT 10
    `);
    res.json(activities);
});

exports.getSystemOverview = asyncHandler(async (req, res) => {
    res.json({
        serverStatus: 'Online',
        databaseStatus: 'Connected',
        storageUsage: '45%',
        uptime: '12 days, 4 hours'
    });
});

exports.getAllGrades = asyncHandler(async (req, res) => {
    const [rows] = await db.execute(`
        SELECT g.id, u.name as student_name, g.module, g.note, g.type
        FROM grades g
        JOIN users u ON g.student_id = u.id
        ORDER BY g.id DESC LIMIT 50
    `);
    res.json(rows);
});

exports.getAllAttendance = asyncHandler(async (req, res) => {
    const [rows] = await db.execute(`
        SELECT a.id, u.name as student_name, a.module, a.status, a.date
        FROM attendance a
        JOIN users u ON a.student_id = u.id
        ORDER BY a.date DESC LIMIT 50
    `);
    res.json(rows);
});
