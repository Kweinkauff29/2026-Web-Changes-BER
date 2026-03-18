/**
 * Admin Dashboard Page — Swiss-Tech Styled
 */
import { swissTechCSS } from './styles.js';

export function adminPageHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard — CCRE Member Experience</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>
        ${swissTechCSS()}

        /* Admin Layout */
        .admin-shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
        .sidebar { background: var(--ink); color: #d1d5db; padding: 24px 16px; display: flex; flex-direction: column; }
        .sidebar .logo { font-family: var(--mono); font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: white; padding-bottom: 16px; border-bottom: 1px solid #374151; margin-bottom: 20px; }
        .sidebar .logo span { color: var(--blue); }
        .nav-item { display: block; font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px; color: #9ca3af; cursor: pointer; border: 1px solid transparent; border-radius: 2px; margin-bottom: 2px; transition: all 0.15s; text-decoration: none; }
        .nav-item:hover, .nav-item.active { color: white; background: rgba(255,255,255,0.06); border-color: #374151; }
        .nav-item.active { border-left: 2px solid var(--blue); }
        .main { padding: 28px 32px; overflow-y: auto; }

        /* Page Header */
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--ink); }
        .page-header .index { font-family: var(--mono); font-size: 48px; font-weight: 700; color: var(--blue); line-height: 1; margin-right: 16px; }
        .page-header .title { font-size: 18px; font-weight: 700; }
        .page-header .subtitle { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }

        /* Stats Row */
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }

        /* Filters */
        .filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .filter-bar .form-select, .filter-bar .form-input { width: auto; min-width: 140px; }

        /* View Panels */
        .view-panel { display: none; }
        .view-panel.active { display: block; }

        /* Detail Panel */
        .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .detail-name { font-size: 22px; font-weight: 700; }
        .detail-tabs { display: flex; gap: 0; margin-bottom: 20px; }
        .detail-tab { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 16px; border: 1px solid var(--ink); cursor: pointer; background: var(--panel); margin-right: -1px; }
        .detail-tab.active { background: var(--blue); color: white; border-color: var(--blue); }

        /* Timeline */
        .timeline-item { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .timeline-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--blue); margin-top: 5px; flex-shrink: 0; }
        .timeline-dot.done { background: var(--green); border-color: var(--green); }
        .timeline-dot.overdue { background: var(--red); border-color: var(--red); }
        .timeline-title { font-weight: 600; font-size: 13px; }
        .timeline-meta { font-family: var(--mono); font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Touchpoint Report */
        .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        @media (max-width: 768px) {
            .admin-shell { grid-template-columns: 1fr; }
            .sidebar { display: none; }
            .stats-row { grid-template-columns: 1fr 1fr; }
            .report-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
<div class="admin-shell">
    <nav class="sidebar">
        <div class="logo"><span>CCRE</span> Dashboard</div>
        <a class="nav-item active" data-view="list">Members</a>
        <a class="nav-item" data-view="report">Touchpoint Report</a>
        <a class="nav-item" data-view="add">+ Add Member</a>
    </nav>

    <div class="main">
        <!-- LIST VIEW -->
        <div id="view-list" class="view-panel active">
            <div class="page-header">
                <div style="display:flex;align-items:center;gap:16px">
                    <div class="index">02</div>
                    <div><div class="title">Member Directory</div><div class="subtitle">Onboarding Pipeline</div></div>
                </div>
            </div>
            <div id="stats-row" class="stats-row"></div>
            <div class="filter-bar">
                <select class="form-select" id="filterStatus"><option value="">All Statuses</option><option value="active">Active</option><option value="new">New</option><option value="complete">Complete</option><option value="archived">Archived</option></select>
                <select class="form-select" id="filterType"><option value="">All Types</option><option value="realtor">REALTOR</option><option value="affiliate">Affiliate</option></select>
                <input class="form-input" id="filterSearch" placeholder="Search name or email…" style="min-width:200px">
                <button class="btn btn-sm" onclick="loadMembers()">Filter</button>
            </div>
            <table class="data-table" id="membersTable">
                <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Progress</th><th>Overdue</th><th>Start Date</th></tr></thead>
                <tbody id="membersBody"></tbody>
            </table>
        </div>

        <!-- DETAIL VIEW -->
        <div id="view-detail" class="view-panel">
            <div class="detail-header">
                <div>
                    <button class="btn btn-sm" onclick="showView('list')" style="margin-bottom:10px">← Back</button>
                    <div class="detail-name" id="detailName"></div>
                    <div style="margin-top:4px" id="detailBadges"></div>
                </div>
                <div id="detailMeta" style="text-align:right"></div>
            </div>
            <div class="detail-tabs">
                <div class="detail-tab active" data-dtab="tasks">Tasks</div>
                <div class="detail-tab" data-dtab="touchpoints">Touchpoints</div>
                <div class="detail-tab" data-dtab="notes">Notes</div>
            </div>
            <div id="detailContent"></div>
        </div>

        <!-- ADD MEMBER VIEW -->
        <div id="view-add" class="view-panel">
            <div class="page-header">
                <div style="display:flex;align-items:center;gap:16px">
                    <div class="index">+</div>
                    <div><div class="title">Add New Member</div><div class="subtitle">Manual Entry</div></div>
                </div>
            </div>
            <div class="tech-panel" style="max-width:500px">
                <form id="addForm">
                    <div class="form-group"><label class="form-label">First Name</label><input class="form-input" name="first_name" required></div>
                    <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" name="last_name" required></div>
                    <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" name="email"></div>
                    <div class="form-group"><label class="form-label">Phone</label><input class="form-input" name="phone"></div>
                    <div class="form-group"><label class="form-label">Organization</label><input class="form-input" name="organization"></div>
                    <div class="form-group"><label class="form-label">Member Type</label><select class="form-select" name="member_type"><option value="realtor">REALTOR</option><option value="affiliate">Affiliate</option></select></div>
                    <div class="form-group"><label class="form-label">Start Date</label><input class="form-input" type="date" name="start_date"></div>
                    <div class="form-group"><label class="form-label">Assigned Owner</label><input class="form-input" name="assigned_owner"></div>
                    <button type="submit" class="btn btn-primary">Create Member</button>
                </form>
            </div>
        </div>

        <!-- TOUCHPOINT REPORT VIEW -->
        <div id="view-report" class="view-panel">
            <div class="page-header">
                <div style="display:flex;align-items:center;gap:16px">
                    <div class="index">03</div>
                    <div><div class="title">Touchpoint Report</div><div class="subtitle">Member Experience Metrics</div></div>
                </div>
            </div>
            <div class="filter-bar">
                <input class="form-input" type="month" id="reportMonth" style="min-width:180px">
                <button class="btn btn-sm btn-primary" onclick="loadReport()">Load Report</button>
            </div>
            <div id="reportStats" class="stats-row" style="margin-bottom:20px"></div>
            <table class="data-table" id="reportTable">
                <thead><tr><th>Category</th><th>Count</th></tr></thead>
                <tbody id="reportBody"></tbody>
            </table>
        </div>
    </div>
</div>

<!-- Touchpoint Modal -->
<div class="modal-overlay" id="tpModal">
    <div class="modal">
        <button class="modal-close" id="tpModalClose">×</button>
        <div class="micro" style="margin-bottom:12px">Log Touchpoint</div>
        <form id="tpForm">
            <input type="hidden" name="member_id" id="tpMemberId">
            <div class="form-group"><label class="form-label">Category</label>
                <select class="form-select" name="category">
                    <option value="welcome_call">Welcome Call</option>
                    <option value="check_in">Check-In</option>
                    <option value="ambassador">Ambassador / Introduction</option>
                    <option value="engagement">Engagement Outreach</option>
                    <option value="follow_up">Member Follow-Up</option>
                </select>
            </div>
            <div class="form-group"><label class="form-label">Outcome</label><input class="form-input" name="outcome" placeholder="Brief outcome…"></div>
            <div class="form-group"><label class="form-label">Staff</label><input class="form-input" name="staff_user"></div>
            <div class="form-group"><label class="form-label">Note</label><textarea class="form-textarea" name="note"></textarea></div>
            <button type="submit" class="btn btn-primary">Log Touchpoint</button>
        </form>
    </div>
</div>

<script>
const API = location.origin;
let currentMemberId = null;
let currentDetailTab = 'tasks';
let memberDetailCache = null;

// Navigation
document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => { showView(el.dataset.view); });
});

function showView(view) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const panel = document.getElementById('view-' + view);
    if (panel) panel.classList.add('active');
    const nav = document.querySelector('.nav-item[data-view="' + view + '"]');
    if (nav) nav.classList.add('active');
    if (view === 'list') loadMembers();
}

// Stats
async function loadStats() {
    const res = await fetch(API + '/api/admin/stats');
    const d = await res.json();
    document.getElementById('stats-row').innerHTML =
        statBlock(d.totalMembers, 'Total Members', 'accent-blue') +
        statBlock(d.activeMembers, 'Active', 'accent-green') +
        statBlock(d.overdueTasks, 'Overdue Tasks', 'accent-red') +
        statBlock(d.dueTodayTasks, 'Due Today', 'accent-gold') +
        statBlock(d.realtorCount, 'Realtors', '') +
        statBlock(d.affiliateCount, 'Affiliates', '');
}

function statBlock(val, label, cls) {
    return '<div class="stat-block ' + cls + '"><div class="stat-val">' + val + '</div><div class="stat-label">' + label + '</div></div>';
}

// Members List
async function loadMembers() {
    const status = document.getElementById('filterStatus').value;
    const type = document.getElementById('filterType').value;
    const q = document.getElementById('filterSearch').value;
    let url = API + '/api/admin/members?';
    if (status) url += 'status=' + status + '&';
    if (type) url += 'type=' + type + '&';
    if (q) url += 'q=' + encodeURIComponent(q) + '&';

    const res = await fetch(url);
    const data = await res.json();
    const tbody = document.getElementById('membersBody');
    tbody.innerHTML = data.members.map(m => {
        const pct = m.total_tasks ? Math.round((m.completed_tasks / m.total_tasks) * 100) : 0;
        const badgeCls = m.member_type === 'affiliate' ? 'badge-affiliate' : 'badge-realtor';
        const typeLabel = m.member_type === 'affiliate' ? 'Affiliate' : 'REALTOR';
        return '<tr class="clickable" onclick="openDetail(' + m.id + ')">'
            + '<td><strong>' + (m.first_name || '') + ' ' + (m.last_name || '') + '</strong></td>'
            + '<td><span class="badge ' + badgeCls + '">' + typeLabel + '</span></td>'
            + '<td>' + m.status + '</td>'
            + '<td>' + m.completed_tasks + '/' + m.total_tasks + ' (' + pct + '%)</td>'
            + '<td>' + (m.overdue_tasks > 0 ? '<span class="badge badge-overdue">' + m.overdue_tasks + '</span>' : '—') + '</td>'
            + '<td style="font-family:var(--mono);font-size:12px">' + (m.start_date || '—') + '</td>'
            + '</tr>';
    }).join('');
}

// Member Detail
async function openDetail(id) {
    currentMemberId = id;
    const res = await fetch(API + '/api/admin/members/' + id);
    memberDetailCache = await res.json();
    renderDetail();
    showView('detail');
}

function renderDetail() {
    const { member, tasks, touchpoints, notes } = memberDetailCache;
    document.getElementById('detailName').textContent = (member.first_name || '') + ' ' + (member.last_name || '');
    const badgeCls = member.member_type === 'affiliate' ? 'badge-affiliate' : 'badge-realtor';
    const typeLabel = member.member_type === 'affiliate' ? 'Affiliate' : 'REALTOR';
    document.getElementById('detailBadges').innerHTML = '<span class="badge ' + badgeCls + '">' + typeLabel + '</span> <span class="badge">' + member.status + '</span>';
    document.getElementById('detailMeta').innerHTML = '<div class="micro">Email</div><div>' + (member.email || '—') + '</div><div class="micro" style="margin-top:8px">Phone</div><div>' + (member.phone || '—') + '</div>';

    const today = new Date().toISOString().split('T')[0];

    if (currentDetailTab === 'tasks') {
        document.getElementById('detailContent').innerHTML =
            '<div style="margin-bottom:12px;display:flex;gap:8px"><button class="btn btn-sm btn-primary" onclick="openModal(&apos;tpModal&apos;)">Log Touchpoint</button></div>'
            + tasks.map(t => {
                const isDone = t.state === 'complete';
                const isOverdue = !isDone && t.due_date < today;
                const dotCls = isDone ? 'done' : (isOverdue ? 'overdue' : '');
                return '<div class="timeline-item">'
                    + '<div class="timeline-dot ' + dotCls + '"></div>'
                    + '<div style="flex:1"><div class="timeline-title">' + t.title + '</div>'
                    + '<div class="timeline-meta">' + (isDone ? 'Completed ' + (t.completed_at || '').split('T')[0] : 'Due ' + t.due_date) + '</div>'
                    + (t.description ? '<div style="font-size:12px;color:#6b7280;margin-top:2px">' + t.description + '</div>' : '')
                    + '</div>'
                    + (!isDone ? '<button class="btn btn-sm" onclick="completeTask(' + t.id + ')">Complete</button>' : '')
                    + '</div>';
            }).join('');
    } else if (currentDetailTab === 'touchpoints') {
        document.getElementById('detailContent').innerHTML =
            '<div style="margin-bottom:12px"><button class="btn btn-sm btn-primary" onclick="openModal(&apos;tpModal&apos;)">Log Touchpoint</button></div>'
            + (touchpoints.length === 0 ? '<div class="micro">No touchpoints recorded yet.</div>' : '')
            + touchpoints.map(tp => {
                return '<div class="timeline-item"><div class="timeline-dot done"></div><div style="flex:1"><div class="timeline-title">' + formatCategory(tp.category) + '</div>'
                    + '<div class="timeline-meta">' + (tp.occurred_at || '').split('T')[0] + (tp.staff_user ? ' · ' + tp.staff_user : '') + '</div>'
                    + (tp.outcome ? '<div style="font-size:12px;margin-top:2px">' + tp.outcome + '</div>' : '')
                    + (tp.note ? '<div style="font-size:12px;color:#6b7280;margin-top:2px">' + tp.note + '</div>' : '')
                    + '</div></div>';
            }).join('');
    } else if (currentDetailTab === 'notes') {
        document.getElementById('detailContent').innerHTML =
            '<form id="noteForm" style="margin-bottom:16px" onsubmit="addNote(event)"><div class="form-group"><textarea class="form-textarea" name="body" placeholder="Add a note…" required></textarea></div><div class="form-group"><input class="form-input" name="author" placeholder="Your name"></div><button class="btn btn-sm btn-primary" type="submit">Save Note</button></form>'
            + notes.map(n => '<div class="timeline-item"><div class="timeline-dot"></div><div style="flex:1"><div style="font-size:13px">' + n.body + '</div><div class="timeline-meta">' + (n.author || 'System') + ' · ' + (n.created_at || '').split('T')[0] + '</div></div></div>').join('');
    }

    document.getElementById('tpMemberId').value = currentMemberId;
}

function formatCategory(cat) {
    const map = { welcome_call: 'Welcome Call', check_in: 'Check-In', ambassador: 'Ambassador / Introduction', engagement: 'Engagement Outreach', follow_up: 'Member Follow-Up' };
    return map[cat] || cat;
}

// Detail tabs
document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentDetailTab = tab.dataset.dtab;
        renderDetail();
    });
});

// Task completion
async function completeTask(taskId) {
    await fetch(API + '/api/admin/tasks/' + taskId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: 'complete' }) });
    openDetail(currentMemberId);
}

// Add Member
document.getElementById('addForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    const res = await fetch(API + '/api/admin/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { alert('Member created! Token: ' + data.public_token); e.target.reset(); showView('list'); }
});

// Touchpoint form
document.getElementById('tpForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    await fetch(API + '/api/admin/touchpoints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    closeModal('tpModal');
    e.target.reset();
    openDetail(currentMemberId);
});

// Notes
async function addNote(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    body.member_id = currentMemberId;
    await fetch(API + '/api/admin/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    openDetail(currentMemberId);
}

// Report
async function loadReport() {
    const month = document.getElementById('reportMonth').value;
    const url = API + '/api/admin/touchpoints' + (month ? '?month=' + month : '');
    const res = await fetch(url);
    const data = await res.json();

    const cats = ['welcome_call', 'check_in', 'ambassador', 'engagement', 'follow_up'];
    document.getElementById('reportStats').innerHTML = statBlock(data.total, 'Total Touchpoints', 'accent-blue');
    document.getElementById('reportBody').innerHTML = cats.map(c => '<tr><td>' + formatCategory(c) + '</td><td style="font-family:var(--mono);font-weight:700">' + (data.summary[c] || 0) + '</td></tr>').join('');
}

// Modal
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Modal close button
document.getElementById('tpModalClose').addEventListener('click', function() { closeModal('tpModal'); });

// Init
loadStats();
loadMembers();
document.getElementById('reportMonth').value = new Date().toISOString().slice(0, 7);
</script>
</body>
</html>`;
}
