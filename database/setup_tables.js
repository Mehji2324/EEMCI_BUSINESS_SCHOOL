/**
 * Create all EEMCI database tables
 * Run: node database/setup_tables.js
 */
const db = require('../backend/config/db');

const tables = [
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'professor', 'admin') NOT NULL,
        raw_password VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS students_info (
        user_id INT PRIMARY KEY,
        group_name VARCHAR(50) NOT NULL,
        department ENUM('Développement Informatique', 'Systèmes et Réseaux') NOT NULL,
        academic_email VARCHAR(100) UNIQUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS professors_info (
        user_id INT PRIMARY KEY,
        academic_email VARCHAR(100) UNIQUE,
        department ENUM('Développement Informatique', 'Systèmes et Réseaux'),
        modules TEXT DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT,
        receiver_id INT,
        subject VARCHAR(255),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS event_reads (
        user_id INT,
        event_id INT,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, event_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        professor_id INT,
        department ENUM('Développement Informatique', 'Systèmes et Réseaux'),
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE SET NULL
    )`,

    `CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        module VARCHAR(100) NOT NULL,
        note DECIMAL(4, 2) NOT NULL,
        type ENUM('exam', 'assignment') DEFAULT 'exam',
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        module VARCHAR(100) NOT NULL,
        status ENUM('present', 'absent', 'retard') NOT NULL,
        date DATE DEFAULT (CURRENT_DATE),
        professor_id INT,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE SET NULL
    )`,

    `CREATE TABLE IF NOT EXISTS schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_name VARCHAR(50) NOT NULL,
        type ENUM('study', 'exam') NOT NULL,
        day VARCHAR(20) NOT NULL,
        time VARCHAR(20) NOT NULL,
        module VARCHAR(100) NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        location VARCHAR(255),
        type ENUM('exam_plan', 'course_plan', 'event', 'debate', 'trip') NOT NULL,
        file_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        type ENUM('message', 'news', 'grade', 'attendance') NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
];

async function setup() {
    console.log('🔧 Creating EEMCI database tables...\n');

    for (const sql of tables) {
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
        try {
            await db.execute(sql);
            console.log(`  ✅ ${tableName}`);
        } catch (err) {
            console.error(`  ❌ ${tableName}: ${err.message}`);
        }
    }

    console.log('\n✅ All tables ready!\n');

    // Extra: Ensure raw_password exists
    try {
        await db.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255) AFTER role');
        console.log('  ✨ Users table schema updated (raw_password)');
    } catch (e) {}

    process.exit(0);
}

setup().catch(err => { console.error(err); process.exit(1); });
