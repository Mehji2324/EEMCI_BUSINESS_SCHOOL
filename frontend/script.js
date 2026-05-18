const API_URL = '/api';
let socket;

// ─── AUTHENTICATION & INITIALIZATION ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));

    // Real-time date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Initialize Socket.io if logged in
    if (token && user) {
        initSocket(user.id);
    }

    // Protect dashboard pages
    const path = window.location.pathname;
    const isDashboard = path.includes('dashboard.html');
    const isAdminDashboard = path.includes('admin-dashboard.html');
    const isProfDashboard = path.includes('professor-dashboard.html');

    if (isDashboard || isAdminDashboard || isProfDashboard) {
        if (!token) {
            window.location.href = '/login';
        } else {
            // Check role authorization
            if (isAdminDashboard && user.role !== 'admin') window.location.href = '/login';
            if (isProfDashboard && user.role !== 'professor') window.location.href = '/login';
            if (isDashboard && !isAdminDashboard && !isProfDashboard && user.role !== 'student') window.location.href = '/login';
            
            initDashboard(user);
        }
    }

    // Role-based redirect if on login page
    if (path.includes('login.html')) {
        if (token && user) {
            redirectByRole(user.role);
        }
    }
});

function redirectByRole(role) {
    // Redirect to the new Accueil page as requested
    window.location.href = 'index.html';
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    if (socket) socket.disconnect();
    window.location.href = '/';
}

// ─── SOCKET.IO ───────────────────────────────────────────────────────────────
function initSocket(userId) {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to real-time server');
        socket.emit('join_room', userId);
    });

    socket.on('new_notification', (data) => {
        showNotify(data.content, 'info');
        refreshBadges();
        
        const dropdown = document.getElementById('notifDropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            renderNotifications();
        }
    });
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function showNotify(message, type = 'success') {
    Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    }).fire({ icon: type, title: message });
}

// Global API Fetch Helper with 401 handling
async function apiFetch(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    
    // Auto-detect if body is FormData
    const isFormData = options.body instanceof FormData;
    
    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        
        if (response.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = 'index.html';
            return null;
        }
        
        return response;
    } catch (err) {
        console.error('Fetch error:', err);
        showNotify('Server connection failed', 'error');
        throw err;
    }
}


async function confirmAction(title, text) {
    const result = await Swal.fire({
        title, text, icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#ef4444'
    });
    return result.isConfirmed;
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Non-JSON error response' }));
                showNotify(errorData.message || 'Invalid credentials', 'error');
                return;
            }

            const data = await res.json();
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            initSocket(data.user.id);
            redirectByRole(data.user.role);
        } catch (err) {
            console.error('Login error details:', err);
            showNotify('Connection error to server', 'error');
        }
    });
}

// ─── DASHBOARD LOGIC ─────────────────────────────────────────────────────────
async function loadUnreadCount() {
    try {
        const res = await apiFetch('/messages/notifications');
        if (!res) return 0;
        const notifs = await res.json();
        return notifs.length;
    } catch (err) { return 0; }
}

async function refreshBadges() {
    const unread = await loadUnreadCount();
    const navBadge = document.getElementById('navMsgBadge');
    if (navBadge) {
        navBadge.textContent = unread;
        if (unread > 0) navBadge.classList.remove('hidden');
        else navBadge.classList.add('hidden');
    }

    const sideBadge = document.getElementById('msgBadge');
    if (sideBadge) {
        sideBadge.textContent = unread;
        if (unread > 0) sideBadge.classList.remove('hidden');
        else sideBadge.classList.add('hidden');
    }
}

async function toggleNotificationDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('notifDropdown');
    const isHidden = dropdown.classList.contains('hidden');

    if (isHidden) {
        await renderNotifications();
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
}

async function renderNotifications() {
    const list = document.getElementById('notifList');
    list.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>';

    try {
        const res = await apiFetch('/messages/notifications');
        const notifs = await res.json();

        if (notifs.length === 0) {
            list.innerHTML = '<div class="text-center py-4 text-muted small">No new updates</div>';
            return;
        }

        list.innerHTML = notifs.map(n => `
            <div class="notif-item" onclick="handleNotifClick(${JSON.stringify(n).replace(/"/g, '&quot;')})">
                <div class="notif-icon ${n.type}">
                    <i class="fas ${n.type === 'message' ? 'fa-envelope' : 'fa-bullhorn'}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-text text-truncate">${n.content || ''}</div>
                    <div class="notif-time">${new Date(n.created_at).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        list.innerHTML = '<div class="text-center py-3 text-danger small">Error loading updates</div>';
    }
}

async function handleNotifClick(notif) {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (notif.type === 'message') {
        if (user.role === 'admin') {
            switchAdminTab('mailboxSection', document.querySelector('[onclick*=\'mailboxSection\']'));
        } else if (user.role === 'student') {
            switchStudentSection('mailboxSection', document.querySelector('[onclick*=\'mailboxSection\']'));
        }
        loadInbox();
    } else {
        await apiFetch(`/events/read/${notif.id}`, { method: 'POST' });
        if (user.role === 'admin') {
            switchAdminTab('event-mgmt', document.querySelector('[onclick*=\'event-mgmt\']'));
        } else if (user.role === 'student') {
            switchStudentSection('studentEvents', document.querySelector('[onclick*=\'studentEvents\']'));
        }
    }

    document.getElementById('notifDropdown').classList.add('hidden');
    refreshBadges();
}

async function markAllNotifsRead(event) {
    if (event) event.stopPropagation();
    document.getElementById('notifDropdown').classList.add('hidden');
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const bell = document.querySelector('.notification-bell');
    if (dropdown && !dropdown.contains(e.target) && !bell?.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

async function initDashboard(user) {
    const hour = new Date().getHours();
    const timeMsg = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    await refreshBadges();

    if (document.getElementById('userNameSidebar')) document.getElementById('userNameSidebar').textContent = user.name;
    if (document.getElementById('userAvatar')) document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    if (document.getElementById('welcomeText')) document.getElementById('welcomeText').textContent = `${timeMsg}, ${user.name.split(' ')[0]}!`;
    
    // Sidebar profile info
    if (document.getElementById('studentEmailDisplaySidebar')) document.getElementById('studentEmailDisplaySidebar').textContent = user.email;
    if (document.getElementById('adminEmailDisplaySidebar')) document.getElementById('adminEmailDisplaySidebar').textContent = user.email;
    if (document.getElementById('adminRoleDisplaySidebar')) document.getElementById('adminRoleDisplaySidebar').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (document.getElementById('userAvatarSidebar')) document.getElementById('userAvatarSidebar').textContent = user.name.charAt(0).toUpperCase();

    const menu = document.getElementById('sidebarMenu');
    if (user.role === 'student') {
        const studentSec = document.getElementById('studentSection');
        if (studentSec) studentSec.classList.remove('hidden');
        if (menu) {
            menu.innerHTML = `
                <li onclick="switchStudentSection('studentOverview', this)" class="nav-item active"><span class="nav-icon">🏠</span> Overview</li>
                <li onclick="switchStudentSection('studentGrades', this)" class="nav-item"><span class="nav-icon">📊</span> My Grades</li>
                <li onclick="switchStudentSection('studentCourses', this)" class="nav-item"><span class="nav-icon">📚</span> My Courses</li>
                <li onclick="switchStudentSection('studentStudySchedule', this)" class="nav-item"><span class="nav-icon">🗓️</span> Study Plan</li>
                <li onclick="switchStudentSection('studentExamSchedule', this)" class="nav-item"><span class="nav-icon">📝</span> Exam Plan</li>
                <li onclick="switchStudentSection('studentEvents', this)" class="nav-item"><span class="nav-icon">📅</span> Events</li>
                <li onclick="switchStudentSection('mailboxSection', this)" class="nav-item" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><span class="nav-icon">📩</span> Mailbox</span>
                    <span id="msgBadge" class="badge bg-danger rounded-pill hidden" style="font-size: 0.7rem;">0</span>
                </li>
            `;
        }
        loadStudentData(user);
    }
    else if (user.role === 'professor') {
        const profSec = document.getElementById('professorSection');
        if (profSec) profSec.classList.remove('hidden');
        loadProfessorData();
    }
    else if (user.role === 'admin') {
        const adminSec = document.getElementById('adminSection');
        if (adminSec) adminSec.classList.remove('hidden');
        
        if (menu) {
            menu.innerHTML = `
                <li onclick="switchAdminTab('user-mgmt', this)" class="nav-item active"><span class="nav-icon">👥</span> Users</li>
                <li onclick="switchAdminTab('event-mgmt', this)" class="nav-item"><span class="nav-icon">📅</span> Events</li>
                <li onclick="switchAdminTab('stats-mgmt', this)" class="nav-item"><span class="nav-icon">📈</span> Stats</li>
                <li onclick="switchAdminTab('data-mgmt', this)" class="nav-item"><span class="nav-icon">💾</span> Data</li>
                <li onclick="switchAdminTab('mailboxSection', this)" class="nav-item"><span class="nav-icon">📩</span> Mailbox</li>
            `;
        }
        loadAdminData();
    }
}

function quickMessage(receiverId) {
    showComposeModal();
    setTimeout(() => {
        const recipientSelect = document.getElementById('msgRecipient');
        if (recipientSelect) recipientSelect.value = receiverId;
        const msgSubject = document.getElementById('msgSubject');
        if (msgSubject) msgSubject.focus();
    }, 200);
}

function switchStudentSection(sectionId, el) {
    document.querySelectorAll('#studentSection .section-content, #mailboxSection').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('#sidebarMenu li').forEach(li => li.classList.remove('active'));
    if (el) el.classList.add('active');
    
    if (sectionId === 'mailboxSection') loadInbox();
}

function switchAdminTab(id, el) {
    document.querySelectorAll('#adminSection .section-content, #mailboxSection').forEach(s => s?.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('#sidebarMenu li').forEach(li => li.classList.remove('active'));
    if (el) el.classList.add('active');

    if (id === 'mailboxSection') loadInbox();
}

// ─── MESSAGING FEATURES ──────────────────────────────────────────────────────
let allRecipients = [];

async function loadInbox() {
    const mailList = document.getElementById('mailList');
    const messageView = document.getElementById('messageView');
    if (mailList) mailList.classList.remove('hidden');
    if (messageView) messageView.classList.add('hidden');
    
    document.querySelectorAll('#mailTabs button').forEach(b => b.classList.remove('active'));
    const firstTab = document.querySelector('#mailTabs button:first-child');
    if (firstTab) firstTab.classList.add('active');

    const res = await apiFetch('/messages/inbox');
    if (!res) return;
    const messages = await res.json();
    
    renderMailList(messages, 'inbox');
}

async function loadSent() {
    const mailList = document.getElementById('mailList');
    const messageView = document.getElementById('messageView');
    if (mailList) mailList.classList.remove('hidden');
    if (messageView) messageView.classList.add('hidden');
    
    document.querySelectorAll('#mailTabs button').forEach(b => b.classList.remove('active'));
    const lastTab = document.querySelector('#mailTabs button:last-child');
    if (lastTab) lastTab.classList.add('active');

    const res = await apiFetch('/messages/sent');
    if (!res) return;
    const messages = await res.json();
    
    renderMailList(messages, 'sent');
}

function renderMailList(messages, type) {
    const list = document.getElementById('mailList');
    if (!list) return;
    if (messages.length === 0) {
        list.innerHTML = `<div class="text-center py-5 text-muted">No ${type} messages.</div>`;
        return;
    }

    list.innerHTML = messages.map(m => `
        <button class="list-group-item list-group-item-action p-3 ${m.is_read || type === 'sent' ? '' : 'bg-light fw-bold'}" onclick="viewMessage(${JSON.stringify(m).replace(/"/g, '&quot;')}, '${type}')">
            <div class="d-flex justify-content-between mb-1">
                <span>${type === 'inbox' ? m.sender_name : m.receiver_name}</span>
                <small class="text-muted">${new Date(m.created_at).toLocaleDateString()}</small>
            </div>
            <div class="small text-primary">${m.subject}</div>
            <div class="small text-muted text-truncate">${m.content}</div>
        </button>
    `).join('');
}

async function viewMessage(msg, type) {
    const listView = document.getElementById('mailList');
    const detailView = document.getElementById('messageView');
    
    if (listView) listView.classList.add('hidden');
    if (detailView) {
        detailView.classList.remove('hidden');
        detailView.innerHTML = `
            <button class="btn btn-sm btn-link mb-3 p-0" onclick="backToMailList('${type}')"><i class="fas fa-arrow-left"></i> Back to ${type}</button>
            <div class="border-bottom pb-3 mb-3">
                <h4 class="mb-1">${msg.subject}</h4>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${type === 'inbox' ? 'From' : 'To'}:</strong> ${type === 'inbox' ? msg.sender_name : msg.receiver_name} 
                        <span class="text-muted small">&lt;${type === 'inbox' ? msg.sender_email : msg.receiver_email}&gt;</span>
                    </div>
                    <small class="text-muted">${new Date(msg.created_at).toLocaleString()}</small>
                </div>
            </div>
            <div class="message-body" style="white-space: pre-wrap; line-height: 1.6;">${msg.content}</div>
            ${type === 'inbox' ? `<button class="btn btn-primary mt-4" onclick="replyMessage('${msg.sender_id}', '${msg.subject}', '${msg.sender_name}')"><i class="fas fa-reply"></i> Reply</button>` : ''}
        `;
    }

    if (type === 'inbox' && !msg.is_read) {
        await apiFetch(`/messages/read/${msg.id}`, { method: 'PUT' });
        await refreshBadges();
    }
}

function backToMailList(type) {
    if (type === 'inbox') loadInbox();
    else loadSent();
}

async function showComposeModal() {
    const modal = document.getElementById('composeModal');
    if (modal) modal.classList.remove('hidden');
    
    if (allRecipients.length === 0) {
        const res = await apiFetch('/messages/recipients');
        if (res) allRecipients = await res.json();
    }
    
    const select = document.getElementById('msgRecipient');
    if (select) {
        select.innerHTML = '<option value="">Select recipient...</option>' + 
            allRecipients.map(r => `<option value="${r.id}">${r.name} (${r.role}) - ${r.email}</option>`).join('');
    }
}

function hideComposeModal() {
    const modal = document.getElementById('composeModal');
    if (modal) modal.classList.add('hidden');
    const form = document.getElementById('composeForm');
    if (form) form.reset();
}

function replyMessage(senderId, subject, senderName) {
    showComposeModal();
    setTimeout(() => {
        const recipient = document.getElementById('msgRecipient');
        if (recipient) recipient.value = senderId;
        const sub = document.getElementById('msgSubject');
        if (sub) sub.value = `Re: ${subject}`;
        const content = document.getElementById('msgContent');
        if (content) content.focus();
    }, 100);
}

const composeForm = document.getElementById('composeForm');
if (composeForm) {
    composeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            receiver_id: document.getElementById('msgRecipient').value,
            subject: document.getElementById('msgSubject').value,
            content: document.getElementById('msgContent').value
        };

        const res = await apiFetch('/messages/send', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            showNotify('Message sent!');
            hideComposeModal();
            loadSent();
        } else {
            showNotify('Error sending message', 'error');
        }
    });
}

// ─── STUDENT FEATURES ────────────────────────────────────────────────────────
async function loadStudentData(user) {
    try {
        const [grades, courses, events, studySchedule, examSchedule] = await Promise.all([
            apiFetch('/student/grades').then(r => r ? r.json() : []),
            apiFetch('/student/courses').then(r => r ? r.json() : []),
            apiFetch('/student/events').then(r => r ? r.json() : []),
            apiFetch('/student/schedule?type=study').then(r => r ? r.json() : []),
            apiFetch('/student/schedule?type=exam').then(r => r ? r.json() : [])
        ]);

        // Profile Display
        if (courses.length > 0) {
            const dept = courses[0].department || 'General';
            const deptEl = document.getElementById('studentDeptDisplay');
            if (deptEl) deptEl.textContent = dept;
            
            const deptSidebar = document.getElementById('studentDeptDisplaySidebar');
            if (deptSidebar) deptSidebar.textContent = dept;
        }
        const emailEl = document.getElementById('studentEmailDisplay');
        if (emailEl) emailEl.textContent = user.email;
        
        const emailSidebar = document.getElementById('studentEmailDisplaySidebar');
        if (emailSidebar) emailSidebar.textContent = user.email;

        // Grades table
        const gTable = document.querySelector('#gradesTable tbody');
        if (gTable) {
            gTable.innerHTML = grades.length > 0 ? grades.map(g => `
                <tr><td>${g.module}</td><td>${g.note}</td><td><span class="badge ${g.note >= 10 ? 'bg-success' : 'bg-danger'}">${g.note >= 10 ? 'Valid' : 'Retake'}</span></td></tr>
            `).join('') : '<tr><td colspan="3" class="text-center">No grades recorded yet.</td></tr>';
        }

        // Study Schedule
        const sTable = document.querySelector('#scheduleTable tbody');
        if (sTable) {
            sTable.innerHTML = studySchedule.length > 0 ? studySchedule.map(s => `
                <tr><td>${s.day}</td><td>${s.time}</td><td>${s.module}</td></tr>
            `).join('') : '<tr><td colspan="3" class="text-center">No study plan available.</td></tr>';
        }

        // Exam Schedule
        const eSTable = document.querySelector('#examScheduleTable tbody');
        if (eSTable) {
            eSTable.innerHTML = examSchedule.length > 0 ? examSchedule.map(e => `
                <tr><td>${e.day}</td><td>${e.time}</td><td>${e.module}</td></tr>
            `).join('') : '<tr><td colspan="3" class="text-center">No exams scheduled.</td></tr>';
        }

        // Courses & Email Prof
        const cList = document.getElementById('studentCoursesList');
        if (cList) {
            cList.innerHTML = courses.length > 0 ? courses.map(c => `
                <div class="course-item glass p-3 mb-2">
                    <h5>${c.title}</h5>
                    <p class="mb-1">Prof: ${c.professor_name}</p>
                    <div class="d-flex gap-2">
                        <a href="${c.file_path}" target="_blank" class="btn btn-sm btn-primary">View Materials</a>
                        <button onclick="quickMessage(${c.professor_id})" class="btn btn-sm btn-outline-secondary"><i class="fas fa-envelope"></i> Message Prof</button>
                    </div>
                </div>
            `).join('') : '<p class="text-center w-100">No courses assigned to your department.</p>';
        }

        // Events & Plans
        const eList = document.getElementById('eventsContainer');
        if (eList) {
            eList.innerHTML = events.length > 0 ? events.map(e => `
                <div class="event-card glass p-3 mb-2">
                    <span class="badge bg-info">${e.type.replace('_', ' ')}</span>
                    <h6>${e.title}</h6>
                    <p class="small text-muted">${new Date(e.date).toLocaleDateString()}</p>
                    <p>${e.description || ''}</p>
                    ${e.file_path ? `<a href="${e.file_path}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">Download Plan</a>` : ''}
                </div>
            `).join('') : '<p class="text-center w-100">No upcoming events or plans.</p>';
        }
    } catch (err) { console.error('Student data error:', err); }
}

// ─── PROFESSOR FEATURES ──────────────────────────────────────────────────────
async function loadProfessorData() {
    try {
        const res = await apiFetch('/professor/students');
        if (!res) return;
        const students = await res.json();

        const selectors = document.querySelectorAll('#studentSelect, #attnStudentSelect');
        const options = '<option value="">Select Student</option>' + students.map(s => `<option value="${s.id}">${s.name} (${s.group_name})</option>`).join('');
        selectors.forEach(s => s.innerHTML = options);
    } catch (err) { console.error('Prof data error:', err); }
}

// ─── ADMIN FEATURES ──────────────────────────────────────────────────────────
async function loadAdminData() {
    try {
        // Load Users
        const usersRes = await apiFetch('/admin/users');
        if (usersRes) {
            const users = await usersRes.json();
            const uTable = document.querySelector('#usersTable tbody');
            if (uTable) {
                uTable.innerHTML = users.map(u => `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td><span class="badge bg-secondary">${u.role}</span></td>
                        <td>
                            <div class="input-group input-group-sm" style="max-width: 150px;">
                                <input type="password" class="form-control border-0 bg-transparent" value="${u.raw_password || '********'}" readonly id="pwd-${u.id}">
                                <button class="btn btn-outline-secondary border-0" type="button" onclick="togglePwdVisibility(${u.id})">
                                    <i class="fas fa-eye" id="eye-${u.id}"></i>
                                </button>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex gap-1">
                                <button onclick="quickMessage(${u.id})" class="btn btn-sm btn-info text-white" title="Message User"><i class="fas fa-envelope"></i></button>
                                <button onclick="deleteUser(${u.id})" class="btn btn-sm btn-danger" title="Delete User"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Load Events for Admin
        const eventsRes = await apiFetch('/events');
        if (eventsRes) {
            const events = await eventsRes.json();
            const eTable = document.querySelector('#eventsListTable tbody');
            if (eTable) {
                eTable.innerHTML = events.map(e => `
                    <tr>
                        <td>${e.title}</td>
                        <td>${e.type}</td>
                        <td>${new Date(e.date).toLocaleDateString()}</td>
                        <td><button onclick="deleteEvent(${e.id})" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button></td>
                    </tr>
                `).join('');
            }
        }

        // Load School Data
        const gradesRes = await apiFetch('/admin/grades');
        const attendanceRes = await apiFetch('/admin/attendance');
        
        if (gradesRes) {
            const grades = await gradesRes.json();
            const gList = document.getElementById('recentGradesList');
            if (gList) gList.innerHTML = grades.slice(0, 10).map(g => `<p class="small border-bottom mb-1"><b>${g.student_name}</b>: ${g.note} (${g.module})</p>`).join('');
        }
        if (attendanceRes) {
            const attendance = await attendanceRes.json();
            const aList = document.getElementById('recentAttendanceList');
            if (aList) aList.innerHTML = attendance.slice(0, 10).map(a => `<p class="small border-bottom mb-1"><b>${a.student_name}</b>: <span class="text-${a.status === 'absent' ? 'danger' : 'warning'}">${a.status}</span> (${a.module})</p>`).join('');
        }

        const statsRes = await apiFetch('/admin/stats');
        if (statsRes) {
            const stats = await statsRes.json();
            const statsCards = document.getElementById('statsCards');
            if (statsCards) {
                statsCards.innerHTML = `
                    <div class="col-md-4"><div class="stat-card glass p-3 text-center"><h4>Users</h4><div class="h2">${stats.users}</div></div></div>
                    <div class="col-md-4"><div class="stat-card glass p-3 text-center"><h4>Courses</h4><div class="h2">${stats.courses}</div></div></div>
                `;
            }
        }
    } catch (err) { console.error('Admin data error:', err); }
}

// ─── ADMIN ACTIONS ───────────────────────────────────────────────────────────
const addUserForm = document.getElementById('addUserForm');
if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('userName').value,
            role: document.getElementById('userRole').value,
            group_name: document.getElementById('userGroup').value,
            department: document.getElementById('userDept').value,
            password: document.getElementById('userPassword').value
        };

        const res = await apiFetch('/admin/add-user', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            const data = await res.json();
            document.getElementById('cred-role').textContent = data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1);
            document.getElementById('cred-email').textContent = data.user.email;
            document.getElementById('cred-password').textContent = data.user.password;
            document.getElementById('credentialModal').classList.remove('hidden');
            hideAddUserForm();
            loadAdminData();
            addUserForm.reset();
            const previewBox = document.getElementById('emailPreviewBox');
            if (previewBox) previewBox.classList.add('d-none');
        } else {
            const errorData = res ? await res.json() : { message: 'Server error' };
            Swal.fire({ title: 'Operation Failed', text: errorData.message || 'Error creating user', icon: 'error' });
        }
    });
}

const eventForm = document.getElementById('eventForm');
if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', document.getElementById('eventTitle').value);
        formData.append('type', document.getElementById('eventType').value);
        formData.append('date', document.getElementById('eventDate').value);
        formData.append('description', document.getElementById('eventDescription').value);
        const fileInput = document.getElementById('planFile');
        if (fileInput.files.length > 0) formData.append('planFile', fileInput.files[0]);

        const res = await apiFetch('/events', { method: 'POST', body: formData });

        if (res && res.ok) {
            showNotify('Posted successfully!');
            e.target.reset();
            loadAdminData();
        } else {
            showNotify('Error posting event', 'error');
        }
    });
}

async function deleteUser(id) {
    if (await confirmAction('Delete User?', 'This action cannot be undone.')) {
        const res = await apiFetch(`/admin/delete-user/${id}`, { method: 'DELETE' });
        if (res && res.ok) { loadAdminData(); showNotify('User deleted'); }
    }
}

async function deleteEvent(id) {
    if (await confirmAction('Delete Event?', 'This will remove the plan/event.')) {
        const res = await apiFetch(`/events/${id}`, { method: 'DELETE' });
        if (res && res.ok) { loadAdminData(); showNotify('Deleted'); }
    }
}

function showAddUserForm() { 
    const modal = document.getElementById('addUserModal');
    if (modal) modal.classList.remove('hidden'); 
    toggleGroupInput();
}

function hideAddUserForm() { 
    const modal = document.getElementById('addUserModal');
    if (modal) modal.classList.add('hidden'); 
}

function toggleGroupInput() {
    const roleEl = document.getElementById('userRole');
    if (!roleEl) return;
    const role = roleEl.value;
    const groupWrapper = document.getElementById('groupInputWrapper');
    const deptWrapper = document.getElementById('deptWrapper');
    if (groupWrapper) groupWrapper.style.display = role === 'student' ? 'block' : 'none';
    if (deptWrapper) deptWrapper.style.display = (role === 'student' || role === 'professor') ? 'block' : 'none';
}

function previewEmail() {
    const nameEl = document.getElementById('userName');
    const roleEl = document.getElementById('userRole');
    if (!nameEl || !roleEl) return;
    const name = nameEl.value.trim();
    const role = roleEl.value;
    const previewBox = document.getElementById('emailPreviewBox');
    const previewText = document.getElementById('emailPreviewText');

    if (!name) {
        if (previewBox) previewBox.classList.add('d-none');
        return;
    }

    const nameParts = name.toLowerCase().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;
    
    let academicEmail;
    if (role === 'professor') academicEmail = `${firstName}.${lastName}.prof@eemci.edu.ma`;
    else if (role === 'student') academicEmail = `${firstName}.${lastName}@eemci.edu.ma`;
    else academicEmail = `${firstName}.${lastName}.admin@eemci.com`;

    if (previewText) previewText.textContent = academicEmail;
    if (previewBox) previewBox.classList.remove('d-none');
}

async function copyCredField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.textContent;
    try {
        await navigator.clipboard.writeText(text);
        showNotify('Copied to clipboard!');
    } catch (err) {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showNotify('Copied!');
    }
}

function togglePwdVisibility(id) {
    const pwdInput = document.getElementById(`pwd-${id}`);
    const eyeIcon = document.getElementById(`eye-${id}`);
    if (!pwdInput || !eyeIcon) return;
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}
