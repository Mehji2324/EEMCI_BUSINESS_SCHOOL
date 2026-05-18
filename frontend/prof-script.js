/* prof-script.js - Logic for Professor Dashboard */

const API_URL = '/api';
let allStudents = [];
let myCourses = [];
let allRecords = [];
let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!token || user?.role !== 'professor') {
        window.location.href = 'index.html';
        return;
    }

    // Initialize Socket
    initSocket(user.id);

    // Set Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', dateOptions);

    // Initialize
    loadProfile();
    loadDashboardData();
    setupDropZone();
    refreshBadges();
});

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    if (socket) socket.disconnect();
    window.location.href = 'index.html';
}

function showNotify(title, icon = 'success') {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: icon,
        title: title,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

// ─── UI Navigation ───
function switchTab(clickedLi) {
    const targetId = clickedLi.getAttribute('data-section');
    switchTabById(targetId);
}

// ─── DASHBOARD LOGIC EXTENSION ───
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
    const sideBadge = document.getElementById('msgBadge');

    if (navBadge) {
        navBadge.textContent = unread;
        if (unread > 0) navBadge.classList.remove('hidden');
        else navBadge.classList.add('hidden');
    }
    
    if (sideBadge) {
        if (unread > 0) {
            sideBadge.textContent = unread;
            sideBadge.classList.remove('hidden');
        } else {
            sideBadge.classList.add('hidden');
        }
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
    if (notif.type === 'message') {
        switchTabById('secMessages');
    } else {
        await apiFetch(`/events/read/${notif.id}`, { method: 'POST' });
        switchTabById('secOverview'); 
    }

    document.getElementById('notifDropdown').classList.add('hidden');
    refreshBadges();
}

async function markAllNotifsRead(event) {
    if (event) event.stopPropagation();
    document.getElementById('notifDropdown').classList.add('hidden');
}

// Global click listener to close dropdown
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    const bell = document.querySelector('.notification-bell');
    if (dropdown && !dropdown.contains(e.target) && !bell?.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

// ─── SOCKET.IO ───
function initSocket(userId) {
    socket = io();

    socket.on('connect', () => {
        console.log('Professor connected to real-time server');
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

function switchTabById(targetId) {
    document.querySelectorAll('.dash-section').forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(targetId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
    const targetLi = document.querySelector(`.nav-item[data-section="${targetId}"]`);
    if (targetLi) targetLi.classList.add('active');

    if (targetId === 'secMessages') {
        loadInbox();
    }
}

function quickMessage(receiverId) {
    showComposeModal();
    setTimeout(() => {
        const recipient = document.getElementById('msgRecipient');
        if (recipient) recipient.value = receiverId;
        const sub = document.getElementById('msgSubject');
        if (sub) sub.focus();
    }, 200);
}

// ─── Data Loading ───
async function fetchWithAuth(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    if (!options.headers) options.headers = {};
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }
    options.headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, options);
    if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error('Unauthorized');
    }
    return res;
}

async function apiFetch(endpoint, options = {}) {
    return await fetchWithAuth(endpoint, options);
}

async function loadProfile() {
    try {
        const res = await apiFetch('/professor/profile');
        if (res.ok) {
            const profile = await res.json();
            const nameEl = document.getElementById('profName');
            if (nameEl) nameEl.textContent = profile.name;
            const emailEl = document.getElementById('profEmail');
            if (emailEl) emailEl.textContent = profile.academic_email || profile.email;
            const deptEl = document.getElementById('profDept');
            if (deptEl) deptEl.textContent = profile.department || 'EEMCI Faculty';
            const welcomeEl = document.getElementById('welcomeText');
            if (welcomeEl) welcomeEl.textContent = `Good day, ${profile.name.split(' ')[0]}!`;
            const avatarEl = document.getElementById('profAvatar');
            if (avatarEl) avatarEl.textContent = profile.name.charAt(0).toUpperCase();
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadDashboardData() {
    try {
        // 1. Students
        const resStudents = await apiFetch('/professor/students');
        if (resStudents.ok) {
            allStudents = await resStudents.json();
            const statStudents = document.getElementById('statStudents');
            if (statStudents) statStudents.textContent = allStudents.length;
            populateStudentSelects();
            renderAttendanceTable(allStudents);
            
            // Populate groups filter
            const groupSelect = document.getElementById('bulkGroup');
            if (groupSelect) {
                groupSelect.innerHTML = '<option value="">All Groups</option>';
                const groups = [...new Set(allStudents.map(s => s.group_name))];
                groups.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g;
                    groupSelect.appendChild(opt);
                });
            }
        }

        // 2. Courses
        const resCourses = await apiFetch('/professor/my-courses');
        if (resCourses.ok) {
            myCourses = await resCourses.json();
            const statCourses = document.getElementById('statCourses');
            if (statCourses) statCourses.textContent = myCourses.length;
            renderCourses();
        }

        // 3. Records (Attendance)
        const resRecords = await apiFetch('/professor/attendance');
        if (resRecords.ok) {
            allRecords = await resRecords.json();
            const statAttendance = document.getElementById('statAttendance');
            if (statAttendance) statAttendance.textContent = allRecords.length;
            renderRecordsTable(allRecords);
            const statGrades = document.getElementById('statGrades');
            if (statGrades) statGrades.textContent = "—"; 
        }

    } catch (err) {
        console.error("Failed to load dashboard data", err);
    }
}

function populateStudentSelects() {
    const gradeSelect = document.getElementById('gradeStudentSelect');
    if (!gradeSelect) return;
    
    let html = '<option value="">Select Student</option>';
    allStudents.forEach(s => {
        html += `<option value="${s.id}">${s.name} (${s.group_name})</option>`;
    });
    gradeSelect.innerHTML = html;
}

// ─── MESSAGING FEATURES ──────────────────────────────────────────────────────
async function loadInbox() {
    const list = document.getElementById('mailList');
    const view = document.getElementById('messageView');
    if (list) list.classList.remove('hidden');
    if (view) view.classList.add('hidden');
    
    const btnIn = document.getElementById('btnInbox');
    const btnSent = document.getElementById('btnSent');
    if (btnIn) btnIn.classList.add('active');
    if (btnSent) btnSent.classList.remove('active');

    const res = await apiFetch('/messages/inbox');
    const messages = await res.json();
    renderMailList(messages, 'inbox');
}

async function loadSent() {
    const list = document.getElementById('mailList');
    const view = document.getElementById('messageView');
    if (list) list.classList.remove('hidden');
    if (view) view.classList.add('hidden');
    
    const btnIn = document.getElementById('btnInbox');
    const btnSent = document.getElementById('btnSent');
    if (btnIn) btnIn.classList.remove('active');
    if (btnSent) btnSent.classList.add('active');

    const res = await apiFetch('/messages/sent');
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
        <button class="list-group-item list-group-item-action p-3 border-0 border-bottom ${m.is_read || type === 'sent' ? '' : 'bg-light fw-bold'}" onclick="viewMessage(${JSON.stringify(m).replace(/"/g, '&quot;')}, '${type}')">
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
    if (!listView || !detailView) return;
    
    listView.classList.add('hidden');
    detailView.classList.remove('hidden');

    detailView.innerHTML = `
        <button class="btn btn-sm btn-link mb-3 p-0 text-decoration-none" onclick="backToMailList('${type}')">← Back to ${type}</button>
        <div class="border-bottom pb-3 mb-3">
            <h4 class="mb-1">${msg.subject}</h4>
            <div class="d-flex justify-content-between align-items-center">
                <div class="small">
                    <strong>${type === 'inbox' ? 'From' : 'To'}:</strong> ${type === 'inbox' ? msg.sender_name : msg.receiver_name} 
                    <span class="text-muted">&lt;${type === 'inbox' ? msg.sender_email : msg.receiver_email}&gt;</span>
                </div>
                <small class="text-muted">${new Date(msg.created_at).toLocaleString()}</small>
            </div>
        </div>
        <div class="message-body" style="white-space: pre-wrap; line-height: 1.6;">${msg.content}</div>
        ${type === 'inbox' ? `<button class="btn btn-primary mt-4" style="width:auto;" onclick="replyMessage('${msg.sender_id}', '${msg.subject}', '${msg.sender_name}')">Reply</button>` : ''}
    `;

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
        if (res.ok) allRecipients = await res.json();
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

document.getElementById('composeForm')?.addEventListener('submit', async (e) => {
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

    if (res.ok) {
        showNotify('Message sent!');
        hideComposeModal();
        if (!document.getElementById('secMessages').classList.contains('hidden')) {
            loadSent();
        }
    } else {
        showNotify('Failed to send message', 'error');
    }
});


// ─── Upload Notes ───
function setupDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('courseFile');
    const nameDisplay = document.getElementById('fileNameDisplay');

    if (!dropZone || !fileInput) return;

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            nameDisplay.textContent = `Selected: ${e.target.files[0].name}`;
            nameDisplay.classList.remove('hidden');
        } else {
            nameDisplay.classList.add('hidden');
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change'));
    });
}

document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('uploadBtn');
    const btnText = document.getElementById('uploadBtnText');
    const title = document.getElementById('courseTitle').value;
    const dept = document.getElementById('courseDepartment').value;
    const file = document.getElementById('courseFile').files[0];

    if (!file) {
        showNotify('Please select a file', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('department', dept);
    formData.append('courseFile', file);

    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Uploading...';

    try {
        const res = await apiFetch('/professor/upload-course', { method: 'POST', body: formData });
        if (res.ok) {
            showNotify('Notes uploaded successfully!');
            e.target.reset();
            const nameDisplay = document.getElementById('fileNameDisplay');
            if (nameDisplay) nameDisplay.classList.add('hidden');
            loadDashboardData();
        } else {
            const data = await res.json();
            showNotify(data.message || 'Upload failed', 'error');
        }
    } catch (err) {
        showNotify('Upload failed', 'error');
    } finally {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Upload to Platform';
    }
});

function renderCourses() {
    const list = document.getElementById('myCoursesList');
    const recent = document.getElementById('recentCoursesList');
    if (!list && !recent) return;

    const html = myCourses.map(c => `
        <div class="course-card">
            <span class="course-dept">${c.department}</span>
            <h4>${c.title}</h4>
            <a href="/${c.file_path}" target="_blank" class="btn-outline" style="display:inline-block; margin-top:1rem; text-decoration:none;">View File</a>
        </div>
    `).join('');

    const recentHtml = myCourses.slice(0, 3).map(c => `
        <div class="course-card">
            <span class="course-dept">${c.department}</span>
            <h4>${c.title}</h4>
        </div>
    `).join('');

    const empty = '<p class="empty-msg">No notes uploaded yet.</p>';

    if (list) list.innerHTML = myCourses.length ? html : empty;
    if (recent) recent.innerHTML = myCourses.length ? recentHtml : empty;
}

// ─── Attendance ───
function renderAttendanceTable(students) {
    const wrap = document.getElementById('attendanceList');
    if (!wrap) return;

    if (students.length === 0) {
        wrap.innerHTML = '<p class="empty-msg">No students found.</p>';
        return;
    }

    let html = `<table class="data-table"><thead><tr><th>Student</th><th>Group</th><th>Status</th></tr></thead><tbody>`;
    students.forEach(s => {
        html += `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.group_name}</td>
                <td>
                    <div class="status-toggle" data-student-id="${s.id}">
                        <input type="radio" name="status_${s.id}" id="pres_${s.id}" value="present" class="status-radio" checked>
                        <label for="pres_${s.id}" class="status-label">Present</label>
                        <input type="radio" name="status_${s.id}" id="abs_${s.id}" value="absent" class="status-radio">
                        <label for="abs_${s.id}" class="status-label">Absent</label>
                        <input type="radio" name="status_${s.id}" id="late_${s.id}" value="retard" class="status-radio">
                        <label for="late_${s.id}" class="status-label">Retard</label>
                    </div>
                </td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
}

function filterAttendanceList() {
    const group = document.getElementById('bulkGroup').value;
    renderAttendanceTable(group ? allStudents.filter(s => s.group_name === group) : allStudents);
}

function markAll(status) {
    document.querySelectorAll(`.status-radio[value="${status}"]`).forEach(inp => inp.checked = true);
}

async function saveBulkAttendance() {
    const module = document.getElementById('bulkModule').value;
    const date = document.getElementById('bulkDate').value;
    if (!module) { showNotify('Please enter a Module name', 'warning'); return; }

    const records = [];
    document.querySelectorAll('.status-toggle').forEach(t => {
        const student_id = t.getAttribute('data-student-id');
        const checked = t.querySelector('.status-radio:checked');
        if (checked) records.push({ student_id, status: checked.value });
    });

    if (records.length === 0) { showNotify('No students to mark.', 'warning'); return; }
    
    const btn = document.getElementById('saveAttendanceBtn');
    if (btn) btn.disabled = true;

    try {
        const res = await apiFetch('/professor/bulk-attendance', {
            method: 'POST',
            body: JSON.stringify({ module, date, records })
        });
        if (res.ok) {
            showNotify('Attendance recorded!');
            loadDashboardData();
        } else {
            showNotify('Error saving attendance', 'error');
        }
    } catch (err) {
        showNotify('Network error', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ─── Grades ───
document.getElementById('gradeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        student_id: document.getElementById('gradeStudentSelect').value,
        module: document.getElementById('gradeModule').value,
        note: document.getElementById('gradeNote').value,
        type: document.getElementById('gradeType').value
    };

    try {
        const res = await apiFetch('/professor/add-grade', { method: 'POST', body: JSON.stringify(payload) });
        if (res.ok) {
            showNotify('Grade posted successfully!');
            e.target.reset();
        } else {
            showNotify('Failed to post grade', 'error');
        }
    } catch (err) {
        showNotify('Network error', 'error');
    }
});

// ─── Records Table ───
function renderRecordsTable(records) {
    const tbody = document.getElementById('recordsTableBody');
    if (!tbody) return;

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-msg">No records found.</td></tr>';
        return;
    }

    tbody.innerHTML = records.map(r => `
        <tr>
            <td><strong>${r.student_name}</strong></td>
            <td>${r.group_name}</td>
            <td>${r.module}</td>
            <td><span class="badge ${r.status}">${r.status}</span></td>
            <td>${new Date(r.date).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function filterRecords() {
    const modFilter = document.getElementById('filterModule').value.toLowerCase();
    const dateFilter = document.getElementById('filterDate').value; 
    let filtered = allRecords;
    if (modFilter) filtered = filtered.filter(r => r.module.toLowerCase().includes(modFilter));
    if (dateFilter) filtered = filtered.filter(r => r.date.startsWith(dateFilter));
    renderRecordsTable(filtered);
}

// ─── Export ───
async function exportData(type) {
    showNotify(`Preparing ${type} export...`, 'info');
    try {
        const res = await apiFetch(`/professor/export?type=${type}`);
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EEMCI_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotify('Export complete');
    } catch (err) {
        showNotify('Export failed', 'error');
    }
}
