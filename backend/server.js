const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const professorRoutes = require('./routes/professorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 5001;

// 1. Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach IO to app
app.set('socketio', io);

// Socket logic
io.on('connection', (socket) => {
    socket.on('join_room', (userId) => {
        socket.join(`user_${userId}`);
    });
});

// 2. API Routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// 3. Static Files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Specific route for login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// 4. SPA Fallback (Must be after all other routes)
app.get(/^(?!\/(api|socket\.io)).*$/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// 5. Error Handler
app.use(errorMiddleware);

server.listen(PORT, () => {
    console.log(`🚀 Server on port ${PORT}`);
});
