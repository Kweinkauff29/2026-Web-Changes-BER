/**
 * 2026 Sponsors Admin — Full Admin Page
 * Swiss-Tech Styled, SPA with sidebar nav
 */
import { swissTechCSS } from './styles.js';

export function adminPageHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2026 Sponsors — Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>
        ${swissTechCSS()}

        /* Admin Layout */
        .admin-shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
        .sidebar { background: var(--ink); color: #d1d5db; padding: 24px 16px; display: flex; flex-direction: column; }
        .sidebar .logo { font-family: var(--mono); font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: white; padding-bottom: 16px; border-bottom: 1px solid #374151; margin-bottom: 20px; line-height: 1.4; }
        .sidebar .logo span { color: var(--blue); }
        .sidebar .logo .year { color: var(--gold); font-size: 10px; display: block; }
        .nav-item { display: block; font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px; color: #9ca3af; cursor: pointer; border: 1px solid transparent; border-radius: 2px; margin-bottom: 2px; transition: all 0.15s; text-decoration: none; }
        .nav-item:hover, .nav-item.active { color: white; background: rgba(255,255,255,0.06); border-color: #374151; }
        .nav-item.active { border-left: 2px solid var(--blue); }
        .nav-item .nav-badge { float: right; background: var(--red); color: white; font-size: 9px; padding: 1px 5px; border-radius: 2px; }
        .main { padding: 28px 32px; overflow-y: auto; height: 100vh; }

        /* Page Header */
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 2px solid var(--ink); }
        .page-header .title { font-size: 18px; font-weight: 700; }
        .page-header .subtitle { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }

        /* Stats Row */
        .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 180px)); gap: 12px; margin-bottom: 20px; }

        /* Filter Bar */
        .filter-bar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; align-items: center; }
        .filter-bar .form-select, .filter-bar .form-input { width: auto; min-width: 130px; padding: 6px 8px; font-size: 12px; }

        /* View Panels */
        .view-panel { display: none; }
        .view-panel.active { display: block; }

        /* Detail Panel */
        .detail-section { margin-bottom: 24px; }
        .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .detail-name { font-size: 20px; font-weight: 700; }
        .detail-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .detail-info .info-item .info-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 2px; }
        .detail-info .info-item .info-value { font-size: 14px; font-weight: 600; }

        /* Inline edit */
        .editable { cursor: pointer; border-bottom: 1px dashed #d1d5db; }
        .editable:hover { border-color: var(--blue); }

        /* Compact list */
        .compact-list { font-size: 12px; }
        .compact-list td { padding: 6px 10px; }

        @media (max-width: 768px) {
            .admin-shell { grid-template-columns: 1fr; }
            .sidebar { display: none; }
            .main { margin-left: 0; }
            .stats-row { grid-template-columns: 1fr 1fr; }
            .detail-info { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
<div class="admin-shell">
    <nav class="sidebar">
        <div class="logo"><span>2026</span> Sponsors<span class="year">Admin Tracker</span></div>
        <a class="nav-item" href="https://ccre-checklist-api.bonitaspringsrealtors.workers.dev/admin">CCRE Dashboard</a>
        <a class="nav-item active" data-view="dashboard">Dashboard</a>
        <a class="nav-item" data-view="sponsors">Sponsors</a>
        <a class="nav-item" data-view="events">Events & Claims</a>
        <a class="nav-item" data-view="reminders">Reminder Queue <span class="nav-badge" id="reminderBadge" style="display:none">0</span></a>
        <a class="nav-item" data-view="templates">Templates</a>
        <a class="nav-item" data-view="settings">Settings</a>
        <a class="nav-item" data-view="activity">Activity Log</a>
    </nav>

    <div class="main">
        <!-- ═══ DASHBOARD ═══ -->
        <div id="view-dashboard" class="view-panel active">
            <div class="page-header">
                <div><div class="title">2026 Sponsors Dashboard</div><div class="subtitle">Overview & Quick Actions</div></div>
            </div>
            <div id="dashStats" class="stats-row"></div>
            <div class="section-title">Recent Activity</div>
            <div id="dashActivity"></div>
        </div>

        <!-- ═══ SPONSORS LIST ═══ -->
        <div id="view-sponsors" class="view-panel">
            <div class="page-header">
                <div><div class="title">Sponsors</div><div class="subtitle">All Confirmed 2026 Sponsors</div></div>
                <button class="btn btn-primary btn-sm" onclick="openModal('addSponsorModal')">+ Add Sponsor</button>
            </div>
            <div class="filter-bar">
                <select class="form-select" id="filterLevel"><option value="">All Levels</option><option value="diamond">Diamond</option><option value="platinum">Platinum</option><option value="gold">Gold</option><option value="silver">Silver</option><option value="bronze">Bronze</option></select>
                <input class="form-input" id="filterSearch" placeholder="Search name or email…">
                <button class="btn btn-sm" onclick="loadSponsors()">Filter</button>
            </div>
            <table class="data-table" id="sponsorsTable">
                <thead><tr><th>Sponsor</th><th>Level</th><th>Email</th><th>Benefits</th><th>Open Tasks</th><th>Actions</th></tr></thead>
                <tbody id="sponsorsBody"></tbody>
            </table>
        </div>

        <!-- ═══ SPONSOR DETAIL ═══ -->
        <div id="view-detail" class="view-panel">
            <div class="detail-header">
                <div>
                    <button class="btn btn-sm" onclick="showView('sponsors')" style="margin-bottom:8px">← Back to Sponsors</button>
                    <div class="detail-name" id="detailName"></div>
                    <div id="detailBadge" style="margin-top:4px"></div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm" onclick="openNoteModal()">+ Note</button>
                    <button class="btn btn-sm btn-primary" onclick="openEmailModal()">Compose Email</button>
                </div>
            </div>
            <div class="detail-info" id="detailInfo"></div>

            <div class="tabs" id="detailTabs">
                <div class="tab active" data-dtab="benefits">Benefits</div>
                <div class="tab" data-dtab="events">Events</div>
                <div class="tab" data-dtab="placements">Placements</div>
                <div class="tab" data-dtab="assets">Assets</div>
                <div class="tab" data-dtab="emails">Email History</div>
                <div class="tab" data-dtab="notes">Notes</div>
            </div>
            <div id="detailContent"></div>
        </div>

        <!-- ═══ EVENTS & CLAIMS ═══ -->
        <div id="view-events" class="view-panel">
            <div class="page-header">
                <div><div class="title">Events & Claims</div><div class="subtitle">Event Calendar & Open House Slot Management</div></div>
            </div>
            <div class="tabs" id="eventTabs">
                <div class="tab active" data-etab="openhouse">Open House</div>
                <div class="tab" data-etab="breakfasts">Breakfasts</div>
                <div class="tab" data-etab="other">Other Events</div>
            </div>
            <div id="eventsContent"></div>
        </div>

        <!-- ═══ REMINDER QUEUE ═══ -->
        <div id="view-reminders" class="view-panel">
            <div class="page-header">
                <div><div class="title">Reminder Queue</div><div class="subtitle">Outreach Due Today & Upcoming</div></div>
            </div>
            <div class="filter-bar">
                <select class="form-select" id="reminderScope"><option value="all">All Upcoming</option><option value="today">Due Today</option><option value="overdue">Overdue</option><option value="upcoming">Next 14 Days</option></select>
                <button class="btn btn-sm" onclick="loadReminders()">Filter</button>
            </div>
            <table class="data-table">
                <thead><tr><th>Sponsor</th><th>Event</th><th>Reminder</th><th>Due Date</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="remindersBody"></tbody>
            </table>
        </div>

        <!-- ═══ TEMPLATES ═══ -->
        <div id="view-templates" class="view-panel">
            <div class="page-header">
                <div><div class="title">Email Templates</div><div class="subtitle">Editable Outreach Templates</div></div>
                <button class="btn btn-primary btn-sm" onclick="openModal('addTemplateModal')">+ New Template</button>
            </div>
            <table class="data-table">
                <thead><tr><th>Name</th><th>Type</th><th>Event Type</th><th>Subject</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody id="templatesBody"></tbody>
            </table>
        </div>

        <!-- ═══ SETTINGS ═══ -->
        <div id="view-settings" class="view-panel">
            <div class="page-header">
                <div><div class="title">Settings</div><div class="subtitle">System Configuration</div></div>
            </div>
            <div id="settingsContent"></div>
        </div>

        <!-- ═══ ACTIVITY LOG ═══ -->
        <div id="view-activity" class="view-panel">
            <div class="page-header">
                <div><div class="title">Activity / Email Log</div><div class="subtitle">All Sent Communication</div></div>
            </div>
            <table class="data-table">
                <thead><tr><th>Date</th><th>Sponsor</th><th>Event</th><th>Subject</th><th>Sent By</th><th>Response</th></tr></thead>
                <tbody id="activityBody"></tbody>
            </table>
        </div>
    </div>
</div>

<!-- ═══ MODALS ═══ -->

<!-- Add Sponsor Modal -->
<div class="modal-overlay" id="addSponsorModal">
    <div class="modal">
        <button class="modal-close" onclick="closeModal('addSponsorModal')">×</button>
        <div class="micro" style="margin-bottom:14px">Add New Sponsor</div>
        <form id="addSponsorForm" onsubmit="createSponsor(event)">
            <div class="form-row">
                <div class="form-group"><label class="form-label">Sponsor Name</label><input class="form-input" name="sponsor_name" required></div>
                <div class="form-group"><label class="form-label">Level</label>
                    <select class="form-select" name="sponsor_level" required><option value="diamond">Diamond</option><option value="platinum">Platinum</option><option value="gold">Gold</option><option value="silver">Silver</option><option value="bronze">Bronze</option></select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Contact Email</label><input class="form-input" type="email" name="primary_contact_email"></div>
                <div class="form-group"><label class="form-label">Contact Name</label><input class="form-input" name="primary_contact_name"></div>
            </div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" name="notes_general" rows="2"></textarea></div>
            <button type="submit" class="btn btn-primary">Create Sponsor</button>
        </form>
    </div>
</div>

<!-- Note Modal -->
<div class="modal-overlay" id="noteModal">
    <div class="modal">
        <button class="modal-close" onclick="closeModal('noteModal')">×</button>
        <div class="micro" style="margin-bottom:14px">Add Note</div>
        <form id="noteForm" onsubmit="submitNote(event)">
            <div class="form-group"><label class="form-label">Note</label><textarea class="form-textarea" name="note_body" required></textarea></div>
            <div class="form-group"><label class="form-label">Your Name</label><input class="form-input" name="created_by" value="Admin"></div>
            <button type="submit" class="btn btn-primary">Save Note</button>
        </form>
    </div>
</div>

<!-- Email Compose Modal -->
<div class="modal-overlay" id="emailModal">
    <div class="modal" style="max-width:700px">
        <button class="modal-close" onclick="closeModal('emailModal')">×</button>
        <div class="micro" style="margin-bottom:14px">Compose / Log Email</div>
        <form id="emailForm" onsubmit="sendEmail(event)">
            <div class="form-group"><label class="form-label">Template</label>
                <select class="form-select" id="emailTemplate" onchange="loadTemplatePreview()"><option value="">— Select Template —</option></select>
            </div>
            <div class="form-group"><label class="form-label">To</label><input class="form-input" name="email_to" id="emailTo"></div>
            <div class="form-group"><label class="form-label">Subject</label><input class="form-input" name="subject" id="emailSubject"></div>
            <div class="form-group"><label class="form-label">Body</label><textarea class="form-textarea" name="body" id="emailBody" rows="8"></textarea></div>
            <div class="form-group"><label class="form-label">Sent By</label><input class="form-input" name="sent_by" value="Admin"></div>
            <div class="btn-group">
                <button type="button" class="btn btn-sm" onclick="copyEmailToClipboard()">Copy to Clipboard</button>
                <button type="submit" class="btn btn-primary">Log as Sent</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Template Modal -->
<div class="modal-overlay" id="editTemplateModal">
    <div class="modal" style="max-width:700px">
        <button class="modal-close" onclick="closeModal('editTemplateModal')">×</button>
        <div class="micro" style="margin-bottom:14px">Edit Template</div>
        <form id="editTemplateForm" onsubmit="updateTemplate(event)">
            <input type="hidden" name="id" id="editTemplateId">
            <div class="form-row">
                <div class="form-group"><label class="form-label">Name</label><input class="form-input" name="template_name" id="editTemplateName"></div>
                <div class="form-group"><label class="form-label">Type</label><input class="form-input" name="template_type" id="editTemplateType"></div>
            </div>
            <div class="form-group"><label class="form-label">Subject</label><input class="form-input" name="subject_template" id="editTemplateSubject"></div>
            <div class="form-group"><label class="form-label">Body (use {{merge_fields}})</label><textarea class="form-textarea" name="body_template" id="editTemplateBody" rows="10"></textarea></div>
            <div class="micro" style="margin-bottom:8px; color: var(--blue)">Available merge fields: sponsor_name, sponsor_level, contact_email, event_name, event_date, month_label, benefit_name, notes</div>
            <button type="submit" class="btn btn-primary">Save Template</button>
        </form>
    </div>
</div>

<!-- Add Template Modal -->
<div class="modal-overlay" id="addTemplateModal">
    <div class="modal" style="max-width:700px">
        <button class="modal-close" onclick="closeModal('addTemplateModal')">×</button>
        <div class="micro" style="margin-bottom:14px">New Template</div>
        <form id="addTemplateForm" onsubmit="createTemplate(event)">
            <div class="form-row">
                <div class="form-group"><label class="form-label">Template Key (unique)</label><input class="form-input" name="template_key" required></div>
                <div class="form-group"><label class="form-label">Name</label><input class="form-input" name="template_name" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Type</label><input class="form-input" name="template_type" value="outreach" required></div>
                <div class="form-group"><label class="form-label">Event Type</label><input class="form-input" name="event_type" placeholder="optional"></div>
            </div>
            <div class="form-group"><label class="form-label">Subject</label><input class="form-input" name="subject_template" required></div>
            <div class="form-group"><label class="form-label">Body</label><textarea class="form-textarea" name="body_template" rows="8" required></textarea></div>
            <button type="submit" class="btn btn-primary">Create Template</button>
        </form>
    </div>
</div>

<!-- Claim Modal -->
<div class="modal-overlay" id="claimModal">
    <div class="modal">
        <button class="modal-close" onclick="closeModal('claimModal')">×</button>
        <div class="micro" style="margin-bottom:14px">Assign Sponsor to Event</div>
        <form id="claimForm" onsubmit="submitClaim(event)">
            <input type="hidden" name="event_id" id="claimEventId">
            <div class="form-group"><label class="form-label">Event</label><div id="claimEventName" style="font-weight:600"></div></div>
            <div class="form-group"><label class="form-label">Sponsor</label>
                <select class="form-select" name="sponsor_id" id="claimSponsorSelect" required></select>
            </div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" name="notes" rows="2"></textarea></div>
            <div class="form-group"><label style="font-size:12px"><input type="checkbox" name="admin_override" value="true"> Admin override (bypass capacity)</label></div>
            <button type="submit" class="btn btn-primary">Assign Claim</button>
        </form>
    </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
const API = location.origin;
let currentSponsorId = null;
let currentDetailTab = 'benefits';
let currentEventTab = 'openhouse';
let sponsorDetailCache = null;
let allTemplates = [];
let allSponsors = [];

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => showView(el.dataset.view));
});

function showView(view) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const panel = document.getElementById('view-' + view);
    if (panel) panel.classList.add('active');
    const nav = document.querySelector('.nav-item[data-view="' + view + '"]');
    if (nav) nav.classList.add('active');

    if (view === 'dashboard') loadDashboard();
    if (view === 'sponsors') loadSponsors();
    if (view === 'events') loadEvents();
    if (view === 'reminders') loadReminders();
    if (view === 'templates') loadTemplates();
    if (view === 'settings') loadSettings();
    if (view === 'activity') loadActivity();
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function statBlock(val, label, cls) {
    return '<div class="stat-block ' + (cls||'') + '"><div class="stat-val">' + val + '</div><div class="stat-label">' + label + '</div></div>';
}

function levelBadge(level) {
    return '<span class="badge badge-' + level + '">' + level + '</span>';
}

function statusBadge(status) {
    const cls = {completed:'badge-completed',claimed:'badge-claimed',pending_outreach:'badge-waiting',
        sent_waiting_response:'badge-sent',overdue:'badge-overdue',responded:'badge-completed',
        ready:'badge-completed',waiting_assets:'badge-waiting',not_started:'badge-pending'}[status] || '';
    return '<span class="badge ' + cls + '">' + (status||'—').replace(/_/g,' ') + '</span>';
}

function truncate(str, len) {
    if (!str) return '—';
    return str.length > len ? str.substring(0, len) + '…' : str;
}

function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

async function apiFetch(path, opts) {
    const res = await fetch(API + path, opts);
    return res.json();
}
async function apiPost(path, body) {
    return apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
async function apiPut(path, body) {
    return apiFetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

// ═══════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════
async function loadDashboard() {
    const d = await apiFetch('/api/dashboard');
    const levels = d.byLevel || {};
    document.getElementById('dashStats').innerHTML =
        statBlock(d.totalSponsors, 'Total Sponsors', 'accent-blue') +
        statBlock(levels.diamond || 0, 'Diamond', 'accent-purple') +
        statBlock(levels.platinum || 0, 'Platinum', 'accent-blue') +
        statBlock(levels.gold || 0, 'Gold', 'accent-gold') +
        statBlock(levels.silver || 0, 'Silver', '') +
        statBlock(d.overdueReminders, 'Overdue', 'accent-red') +
        statBlock(d.remindersDueSoon, 'Due Soon', 'accent-orange') +
        statBlock(d.waitingResponse, 'Awaiting Response', 'accent-gold') +
        statBlock(d.waitingAssets, 'Waiting Assets', 'accent-orange') +
        statBlock(d.openOHMonths, 'Open OH Months', 'accent-green') +
        statBlock(d.pendingPlacements, 'Pending Placements', 'accent-teal');

    // Update reminder badge
    const badge = document.getElementById('reminderBadge');
    if (d.overdueReminders > 0) { badge.textContent = d.overdueReminders; badge.style.display = 'inline'; }
    else { badge.style.display = 'none'; }

    const activity = d.recentActivity || [];
    document.getElementById('dashActivity').innerHTML = activity.length === 0
        ? '<div class="empty-state">No recent activity</div>'
        : '<table class="data-table compact-list"><thead><tr><th>Date</th><th>Sponsor</th><th>Subject</th><th>Sent By</th></tr></thead><tbody>'
        + activity.map(a => '<tr><td style="font-family:var(--mono);font-size:11px">' + (a.sent_at||'').split('T')[0] + '</td><td>' + a.sponsor_name + '</td><td>' + truncate(a.subject_rendered, 50) + '</td><td>' + (a.sent_by||'—') + '</td></tr>').join('')
        + '</tbody></table>';
}

// ═══════════════════════════════════════
// SPONSORS
// ═══════════════════════════════════════
async function loadSponsors() {
    const level = document.getElementById('filterLevel').value;
    const q = document.getElementById('filterSearch').value;
    let url = '/api/sponsors?';
    if (level) url += 'level=' + level + '&';
    if (q) url += 'q=' + encodeURIComponent(q) + '&';
    const data = await apiFetch(url);
    allSponsors = data.sponsors || [];

    document.getElementById('sponsorsBody').innerHTML = allSponsors.map(s => {
        const pct = s.total_benefits ? Math.round((s.completed_benefits / s.total_benefits) * 100) : 0;
        return '<tr class="clickable" onclick="openSponsorDetail(' + s.id + ')">'
            + '<td><strong>' + s.sponsor_name + '</strong></td>'
            + '<td>' + levelBadge(s.sponsor_level) + '</td>'
            + '<td style="font-size:12px">' + (s.primary_contact_email || '—') + '</td>'
            + '<td><div class="progress-bar" style="width:80px;display:inline-block;vertical-align:middle"><div class="progress-fill green" style="width:' + pct + '%"></div></div> <span style="font-family:var(--mono);font-size:11px">' + pct + '%</span></td>'
            + '<td style="font-family:var(--mono)">' + (s.open_tasks || 0) + '</td>'
            + '<td><button class="btn btn-xs" onclick="event.stopPropagation();openSponsorDetail(' + s.id + ')">View</button></td>'
            + '</tr>';
    }).join('');
}

// ═══════════════════════════════════════
// SPONSOR DETAIL
// ═══════════════════════════════════════
async function openSponsorDetail(id) {
    currentSponsorId = id;
    const data = await apiFetch('/api/sponsors/' + id);
    sponsorDetailCache = data;
    renderSponsorDetail();
    showView('detail');
}

function renderSponsorDetail() {
    const { sponsor, benefits, events, notes, assets, placements, emailHistory } = sponsorDetailCache;

    document.getElementById('detailName').textContent = sponsor.sponsor_name;
    document.getElementById('detailBadge').innerHTML = levelBadge(sponsor.sponsor_level);
    document.getElementById('detailInfo').innerHTML =
        '<div class="info-item"><div class="info-label">Email</div><div class="info-value">' + (sponsor.primary_contact_email || '—') + '</div></div>'
        + '<div class="info-item"><div class="info-label">Contact</div><div class="info-value">' + (sponsor.primary_contact_name || '—') + '</div></div>'
        + '<div class="info-item"><div class="info-label">Status</div><div class="info-value">' + (sponsor.active_2026 ? '<span class="badge badge-completed">Active</span>' : '<span class="badge badge-overdue">Inactive</span>') + '</div></div>';

    if (currentDetailTab === 'benefits') {
        renderBenefitsTab(benefits);
    } else if (currentDetailTab === 'events') {
        renderEventsTab(events);
    } else if (currentDetailTab === 'placements') {
        renderPlacementsTab(placements);
    } else if (currentDetailTab === 'assets') {
        renderAssetsTab(assets);
    } else if (currentDetailTab === 'emails') {
        renderEmailsTab(emailHistory);
    } else if (currentDetailTab === 'notes') {
        renderNotesTab(notes);
    }
}

function renderBenefitsTab(benefits) {
    let html = '<div class="section-title">Sponsor Benefits (' + benefits.length + ')</div>';
    html += benefits.map(b => {
        const checked = b.status === 'completed' ? 'checked' : '';
        return '<div class="check-item" onclick="toggleBenefit(' + b.id + ',\\'' + b.status + '\\')">'
            + '<div class="check-box ' + checked + '">' + (checked ? '✓' : '') + '</div>'
            + '<div class="check-label">' + b.benefit_name + '</div>'
            + '<div class="check-status">' + statusBadge(b.status) + '</div>'
            + '</div>';
    }).join('');
    document.getElementById('detailContent').innerHTML = html;
}

function renderEventsTab(events) {
    if (!events.length) {
        document.getElementById('detailContent').innerHTML = '<div class="empty-state">No event tracking records</div>';
        return;
    }
    let html = '<table class="data-table compact-list"><thead><tr><th>Event</th><th>Status</th><th>Reminder 1</th><th>Reminder 2</th><th>Reminder 3</th><th>Responded</th><th>Notes</th></tr></thead><tbody>';
    html += events.map(e => {
        return '<tr>'
            + '<td><strong>' + e.event_name + '</strong><br><span class="micro">' + (e.event_date || 'TBD') + '</span></td>'
            + '<td>' + statusBadge(e.status) + '</td>'
            + '<td>' + reminderCell(e.email_sent_1, e.email_sent_1_at, e.first_reminder_due) + '</td>'
            + '<td>' + reminderCell(e.email_sent_2, e.email_sent_2_at, e.second_reminder_due) + '</td>'
            + '<td>' + reminderCell(e.email_sent_3, e.email_sent_3_at, e.final_reminder_due) + '</td>'
            + '<td>' + (e.responded ? '<span class="badge badge-completed">Yes</span>' : '—') + '</td>'
            + '<td style="font-size:12px">' + truncate(e.notes_internal, 40) + '</td>'
            + '</tr>';
    }).join('');
    html += '</tbody></table>';
    document.getElementById('detailContent').innerHTML = html;
}

function reminderCell(sent, sentAt, due) {
    if (sent) return '<span class="badge badge-sent">Sent</span><br><span class="micro">' + (sentAt||'').split('T')[0] + '</span>';
    if (due) return '<span class="micro">Due ' + due + '</span>';
    return '—';
}

function renderPlacementsTab(placements) {
    let html = '<div class="section-title">Recurring Placement Checks</div>';
    html += placements.map(p => {
        const checked = p.status === 'completed' ? 'checked' : '';
        return '<div class="check-item">'
            + '<div class="check-box ' + checked + '" onclick="togglePlacement(' + p.id + ',\\'' + p.status + '\\')">' + (checked ? '✓' : '') + '</div>'
            + '<div class="check-label">' + p.placement_label + '<br><span class="micro">' + (p.checked_at ? 'Checked ' + p.checked_at.split('T')[0] + ' by ' + (p.checked_by||'—') : 'Not checked yet') + '</span></div>'
            + '<div class="check-status">' + statusBadge(p.status) + '</div>'
            + '</div>';
    }).join('');
    document.getElementById('detailContent').innerHTML = html;
}

function renderAssetsTab(assets) {
    if (!assets.length) {
        document.getElementById('detailContent').innerHTML = '<div class="empty-state">No assets tracked yet</div><button class="btn btn-sm btn-primary" onclick="addAsset()" style="margin-top:12px">+ Add Asset</button>';
        return;
    }
    let html = '<button class="btn btn-sm btn-primary" onclick="addAsset()" style="margin-bottom:12px">+ Add Asset</button>';
    html += '<table class="data-table compact-list"><thead><tr><th>Type</th><th>Event</th><th>Asset URL</th><th>Click URL</th><th>Received</th><th>Approved</th><th>Actions</th></tr></thead><tbody>';
    html += assets.map(a => '<tr>'
        + '<td>' + a.asset_type + '</td>'
        + '<td>' + (a.event_name || '—') + '</td>'
        + '<td style="font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis">' + (a.asset_url ? '<a href="' + a.asset_url + '" target="_blank">View</a>' : '—') + '</td>'
        + '<td style="font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis">' + (a.clickthrough_url ? '<a href="' + a.clickthrough_url + '" target="_blank">Link</a>' : '—') + '</td>'
        + '<td>' + (a.received ? '<span class="badge badge-completed">Yes</span>' : '<button class="btn btn-xs" onclick="markAssetReceived(' + a.id + ')">Mark</button>') + '</td>'
        + '<td>' + (a.approved ? '<span class="badge badge-completed">Yes</span>' : (a.received ? '<button class="btn btn-xs" onclick="markAssetApproved(' + a.id + ')">Approve</button>' : '—')) + '</td>'
        + '<td><button class="btn btn-xs" onclick="editAssetPrompt(' + a.id + ')">Edit</button></td>'
        + '</tr>').join('');
    html += '</tbody></table>';
    document.getElementById('detailContent').innerHTML = html;
}

function renderEmailsTab(emails) {
    if (!emails.length) {
        document.getElementById('detailContent').innerHTML = '<div class="empty-state">No email history</div>';
        return;
    }
    let html = '<table class="data-table compact-list"><thead><tr><th>Date</th><th>Event</th><th>Subject</th><th>Sent By</th><th>Response</th></tr></thead><tbody>';
    html += emails.map(e => '<tr>'
        + '<td style="font-family:var(--mono);font-size:11px">' + (e.sent_at||'').split('T')[0] + '</td>'
        + '<td>' + (e.event_name || '—') + '</td>'
        + '<td>' + truncate(e.subject_rendered, 50) + '</td>'
        + '<td>' + (e.sent_by||'—') + '</td>'
        + '<td>' + (e.response_recorded ? '<span class="badge badge-completed">Yes</span>' : '—') + '</td>'
        + '</tr>').join('');
    html += '</tbody></table>';
    document.getElementById('detailContent').innerHTML = html;
}

function renderNotesTab(notes) {
    let html = '<button class="btn btn-sm btn-primary" onclick="openNoteModal()" style="margin-bottom:12px">+ Add Note</button>';
    html += notes.map(n => '<div class="timeline-item"><div class="timeline-dot completed"></div><div style="flex:1"><div style="font-size:13px">' + n.note_body + '</div><div class="micro">' + (n.created_by||'Admin') + ' · ' + (n.created_at||'').split('T')[0] + '</div></div></div>').join('');
    if (!notes.length) html += '<div class="empty-state">No notes yet</div>';
    document.getElementById('detailContent').innerHTML = html;
}

// Detail tab navigation
document.querySelectorAll('#detailTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#detailTabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentDetailTab = tab.dataset.dtab;
        renderSponsorDetail();
    });
});

// ═══════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════
async function toggleBenefit(id, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    await apiPut('/api/benefits/' + id, { status: newStatus, date_completed: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null });
    toast('Benefit updated');
    openSponsorDetail(currentSponsorId);
}

async function togglePlacement(id, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const now = new Date().toISOString();
    await apiPut('/api/placements/' + id, { status: newStatus, checked_at: now, checked_by: 'Admin' });
    toast('Placement check updated');
    openSponsorDetail(currentSponsorId);
}

async function markAssetReceived(id) {
    await apiPut('/api/assets/' + id, { received: 1, received_at: new Date().toISOString() });
    toast('Asset marked received');
    openSponsorDetail(currentSponsorId);
}

async function markAssetApproved(id) {
    await apiPut('/api/assets/' + id, { approved: 1, approved_at: new Date().toISOString() });
    toast('Asset approved');
    openSponsorDetail(currentSponsorId);
}

async function addAsset() {
    const type = prompt('Asset type (e.g. banner, logo, clickthrough):');
    if (!type) return;
    await apiPost('/api/sponsors/' + currentSponsorId + '/assets', { asset_type: type });
    toast('Asset record created');
    openSponsorDetail(currentSponsorId);
}

async function editAssetPrompt(id) {
    const url = prompt('Enter asset URL:');
    if (url === null) return;
    const clickUrl = prompt('Enter clickthrough URL (leave empty to skip):');
    const body = {};
    if (url) body.asset_url = url;
    if (clickUrl) body.clickthrough_url = clickUrl;
    await apiPut('/api/assets/' + id, body);
    toast('Asset updated');
    openSponsorDetail(currentSponsorId);
}

function openNoteModal() { openModal('noteModal'); }

async function submitNote(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await apiPost('/api/sponsors/' + currentSponsorId + '/notes', Object.fromEntries(fd));
    closeModal('noteModal');
    e.target.reset();
    toast('Note added');
    openSponsorDetail(currentSponsorId);
}

async function createSponsor(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await apiPost('/api/sponsors', Object.fromEntries(fd));
    closeModal('addSponsorModal');
    e.target.reset();
    toast('Sponsor created');
    loadSponsors();
}

// ═══════════════════════════════════════
// EVENTS & CLAIMS
// ═══════════════════════════════════════
document.querySelectorAll('#eventTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#eventTabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentEventTab = tab.dataset.etab;
        loadEvents();
    });
});

async function loadEvents() {
    const data = await apiFetch('/api/events');
    const events = data.events || [];

    if (currentEventTab === 'openhouse') {
        renderOpenHouseGrid(events.filter(e => e.event_type === 'open_house'));
    } else if (currentEventTab === 'breakfasts') {
        renderEventList(events.filter(e => e.event_type === 'breakfast'));
    } else {
        renderEventList(events.filter(e => !['open_house','breakfast'].includes(e.event_type)));
    }
}

function renderOpenHouseGrid(events) {
    let html = '<div class="section-title">Open House Weekend Months</div><div class="claim-grid">';
    html += events.map(e => {
        const isClaimed = e.claimed_count > 0;
        const cls = isClaimed ? (e.claimed_count >= (e.max_claims||1) ? 'claimed' : 'open') : 'open';
        return '<div class="claim-card ' + cls + '">'
            + '<div class="claim-month">' + (e.month_label || e.event_name) + '</div>'
            + '<div style="margin-bottom:6px">' + statusLabel(e) + '</div>'
            + '<div class="micro">Capacity: ' + (e.capacity_mode||'solo') + ' / Max: ' + (e.max_claims||'∞') + '</div>'
            + '<div class="micro">Claims: ' + (e.claimed_count||0) + '</div>'
            + '<div style="margin-top:8px"><button class="btn btn-xs" onclick="viewEventClaims(' + e.id + ',\\'' + esc(e.event_name) + '\\')">View Claims</button> '
            + '<button class="btn btn-xs btn-primary" onclick="openClaimModal(' + e.id + ',\\'' + esc(e.event_name) + '\\')">+ Assign</button></div>'
            + '</div>';
    }).join('');
    html += '</div>';
    document.getElementById('eventsContent').innerHTML = html;
}

function statusLabel(e) {
    if (e.claimed_count >= (e.max_claims||999)) return '<span class="badge badge-claimed">Fully Claimed</span>';
    if (e.claimed_count > 0) return '<span class="badge badge-waiting">Partially Claimed</span>';
    return '<span class="badge badge-open">Open</span>';
}

function esc(s) { return (s||'').replace(/'/g, "\\'").replace(/"/g, '\\"'); }

function renderEventList(events) {
    let html = '<table class="data-table"><thead><tr><th>Event</th><th>Date</th><th>Type</th><th>Tracking</th><th>Completed</th><th>Actions</th></tr></thead><tbody>';
    html += events.map(e => '<tr>'
        + '<td><strong>' + e.event_name + '</strong></td>'
        + '<td style="font-family:var(--mono);font-size:12px">' + (e.event_date || 'TBD') + '</td>'
        + '<td>' + e.event_type + '</td>'
        + '<td style="font-family:var(--mono)">' + (e.total_tracking||0) + '</td>'
        + '<td style="font-family:var(--mono)">' + (e.completed_count||0) + '</td>'
        + '<td><button class="btn btn-xs" onclick="editEventDate(' + e.id + ')">Edit Date</button></td>'
        + '</tr>').join('');
    html += '</tbody></table>';
    document.getElementById('eventsContent').innerHTML = html;
}

async function editEventDate(eventId) {
    const newDate = prompt('Enter new event date (YYYY-MM-DD):');
    if (!newDate) return;
    await apiPut('/api/events/' + eventId, { event_date: newDate });
    toast('Event date updated + reminders recalculated');
    loadEvents();
}

async function viewEventClaims(eventId, eventName) {
    const data = await apiFetch('/api/events/' + eventId + '/claims');
    const claims = data.claims || [];
    let html = '<div class="section-title">' + eventName + ' — Claims</div>';
    if (!claims.length) {
        html += '<div class="empty-state">No claims yet</div>';
    } else {
        html += '<table class="data-table compact-list"><thead><tr><th>Sponsor</th><th>Level</th><th>Status</th><th>Email</th><th>Notes</th></tr></thead><tbody>';
        html += claims.map(c => '<tr><td>' + c.sponsor_name + '</td><td>' + levelBadge(c.sponsor_level) + '</td><td>' + statusBadge(c.status) + '</td><td style="font-size:11px">' + (c.primary_contact_email||'—') + '</td><td style="font-size:12px">' + truncate(c.notes_internal,40) + '</td></tr>').join('');
        html += '</tbody></table>';
    }
    html += '<button class="btn btn-sm" onclick="loadEvents()" style="margin-top:12px">← Back</button>';
    document.getElementById('eventsContent').innerHTML = html;
}

async function openClaimModal(eventId, eventName) {
    document.getElementById('claimEventId').value = eventId;
    document.getElementById('claimEventName').textContent = eventName;
    // Load sponsors for dropdown
    if (!allSponsors.length) {
        const data = await apiFetch('/api/sponsors');
        allSponsors = data.sponsors || [];
    }
    document.getElementById('claimSponsorSelect').innerHTML = allSponsors.map(s => '<option value="' + s.id + '">' + s.sponsor_name + ' (' + s.sponsor_level + ')</option>').join('');
    openModal('claimModal');
}

async function submitClaim(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    body.admin_override = body.admin_override === 'true';
    const eventId = body.event_id;
    delete body.event_id;
    const result = await apiPost('/api/events/' + eventId + '/claims', body);
    if (result.error) { alert(result.error); return; }
    closeModal('claimModal');
    toast('Claim assigned');
    loadEvents();
}

// ═══════════════════════════════════════
// REMINDERS
// ═══════════════════════════════════════
async function loadReminders() {
    const scope = document.getElementById('reminderScope').value;
    const data = await apiFetch('/api/reminders?scope=' + scope);
    const reminders = data.reminders || [];

    document.getElementById('remindersBody').innerHTML = reminders.length === 0
        ? '<tr><td colspan="7" class="empty-state">No reminders ' + (scope === 'overdue' ? 'overdue' : 'due') + '</td></tr>'
        : reminders.map(r => {
            const nextDue = !r.email_sent_1 ? r.first_reminder_due : (!r.email_sent_2 ? r.second_reminder_due : r.final_reminder_due);
            const reminderNum = !r.email_sent_1 ? '1st' : (!r.email_sent_2 ? '2nd' : '3rd');
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = nextDue && nextDue < today;
            return '<tr>'
                + '<td><strong>' + r.sponsor_name + '</strong><br>' + levelBadge(r.sponsor_level) + '</td>'
                + '<td>' + r.event_name + '<br><span class="micro">' + (r.event_date || 'TBD') + '</span></td>'
                + '<td><span class="micro">' + reminderNum + ' Reminder</span></td>'
                + '<td style="font-family:var(--mono);font-size:12px;' + (isOverdue ? 'color:var(--red);font-weight:700' : '') + '">' + (nextDue||'—') + '</td>'
                + '<td style="font-size:11px">' + (r.primary_contact_email||'—') + '</td>'
                + '<td>' + statusBadge(r.status) + '</td>'
                + '<td class="btn-group" style="white-space:nowrap">'
                + '<button class="btn btn-xs btn-primary" onclick="markReminderSent(' + r.id + ',\\'' + esc(r.primary_contact_email) + '\\')">Mark Sent</button>'
                + '<button class="btn btn-xs btn-success" onclick="markReminderResponded(' + r.id + ')">Responded</button>'
                + '<button class="btn btn-xs" onclick="snoozeReminder(' + r.id + ')">Snooze</button>'
                + '<button class="btn btn-xs" onclick="openSponsorDetail(' + r.sponsor_id + ')">Open</button>'
                + '</td></tr>';
        }).join('');
}

async function markReminderSent(id, email) {
    const subject = prompt('Email subject (or leave for default):') || 'Sponsor follow-up';
    await apiPost('/api/reminders/' + id + '/sent', { sent_by: 'Admin', email_to: email, subject: subject });
    toast('Marked as sent');
    loadReminders();
}

async function markReminderResponded(id) {
    const notes = prompt('Response notes (optional):');
    await apiPost('/api/reminders/' + id + '/responded', { notes: notes || '', updated_by: 'Admin' });
    toast('Marked as responded');
    loadReminders();
}

async function snoozeReminder(id) {
    const days = prompt('Snooze for how many days?', '3');
    if (!days) return;
    await apiPost('/api/reminders/' + id + '/snooze', { days: parseInt(days) });
    toast('Snoozed ' + days + ' days');
    loadReminders();
}

// ═══════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════
async function loadTemplates() {
    const data = await apiFetch('/api/templates');
    allTemplates = data.templates || [];

    document.getElementById('templatesBody').innerHTML = allTemplates.map(t => '<tr>'
        + '<td><strong>' + t.template_name + '</strong></td>'
        + '<td><span class="micro">' + t.template_type + '</span></td>'
        + '<td><span class="micro">' + (t.event_type||'—') + '</span></td>'
        + '<td style="font-size:12px">' + truncate(t.subject_template, 50) + '</td>'
        + '<td>' + (t.is_active ? '<span class="badge badge-completed">Active</span>' : '<span class="badge badge-overdue">Inactive</span>') + '</td>'
        + '<td><button class="btn btn-xs" onclick="editTemplate(' + t.id + ')">Edit</button></td>'
        + '</tr>').join('');
}

function editTemplate(id) {
    const t = allTemplates.find(x => x.id === id);
    if (!t) return;
    document.getElementById('editTemplateId').value = t.id;
    document.getElementById('editTemplateName').value = t.template_name;
    document.getElementById('editTemplateType').value = t.template_type;
    document.getElementById('editTemplateSubject').value = t.subject_template;
    document.getElementById('editTemplateBody').value = t.body_template;
    openModal('editTemplateModal');
}

async function updateTemplate(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    const id = body.id; delete body.id;
    await apiPut('/api/templates/' + id, body);
    closeModal('editTemplateModal');
    toast('Template updated');
    loadTemplates();
}

async function createTemplate(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await apiPost('/api/templates', Object.fromEntries(fd));
    closeModal('addTemplateModal');
    e.target.reset();
    toast('Template created');
    loadTemplates();
}

// ═══════════════════════════════════════
// EMAIL COMPOSE
// ═══════════════════════════════════════
async function openEmailModal() {
    // Load templates into dropdown
    if (!allTemplates.length) {
        const data = await apiFetch('/api/templates');
        allTemplates = data.templates || [];
    }
    document.getElementById('emailTemplate').innerHTML = '<option value="">— Select Template —</option>'
        + allTemplates.map(t => '<option value="' + t.id + '">' + t.template_name + '</option>').join('');

    if (sponsorDetailCache) {
        document.getElementById('emailTo').value = sponsorDetailCache.sponsor.primary_contact_email || '';
    }
    openModal('emailModal');
}

async function loadTemplatePreview() {
    const templateId = document.getElementById('emailTemplate').value;
    if (!templateId) return;
    const sponsor = sponsorDetailCache?.sponsor || {};
    const vars = {
        sponsor_name: sponsor.sponsor_name || '',
        sponsor_level: sponsor.sponsor_level || '',
        contact_email: sponsor.primary_contact_email || '',
    };
    const data = await apiPost('/api/templates/' + templateId + '/preview', { variables: vars });
    document.getElementById('emailSubject').value = data.subject || '';
    document.getElementById('emailBody').value = data.body || '';
}

function copyEmailToClipboard() {
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    navigator.clipboard.writeText('Subject: ' + subject + '\\n\\n' + body);
    toast('Copied to clipboard');
}

async function sendEmail(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    body.sponsor_id = currentSponsorId;
    body.template_id = document.getElementById('emailTemplate').value || null;
    await apiPost('/api/email-log', body);
    closeModal('emailModal');
    toast('Email logged');
    if (currentSponsorId) openSponsorDetail(currentSponsorId);
}

// ═══════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════
async function loadSettings() {
    const data = await apiFetch('/api/settings');
    const settings = data.settings || [];
    let html = '<div class="tech-panel" style="max-width:600px">';
    html += settings.map(s => {
        const val = s.setting_value_json;
        return '<div class="form-group">'
            + '<label class="form-label">' + s.setting_key.replace(/_/g, ' ') + '</label>'
            + '<textarea class="form-textarea" id="setting_' + s.setting_key + '" rows="2" style="font-family:var(--mono);font-size:12px">' + val + '</textarea>'
            + '<button class="btn btn-xs" onclick="saveSetting(\\'' + s.setting_key + '\\')" style="margin-top:4px">Save</button>'
            + '</div>';
    }).join('');
    html += '</div>';
    document.getElementById('settingsContent').innerHTML = html;
}

async function saveSetting(key) {
    const el = document.getElementById('setting_' + key);
    let value;
    try { value = JSON.parse(el.value); } catch(e) { value = el.value; }
    await apiPut('/api/settings/' + key, { value });
    toast('Setting saved');
}

// ═══════════════════════════════════════
// ACTIVITY LOG
// ═══════════════════════════════════════
async function loadActivity() {
    const data = await apiFetch('/api/email-log');
    const logs = data.logs || [];
    document.getElementById('activityBody').innerHTML = logs.length === 0
        ? '<tr><td colspan="6" class="empty-state">No email activity yet</td></tr>'
        : logs.map(l => '<tr>'
            + '<td style="font-family:var(--mono);font-size:11px">' + (l.sent_at||'').split('T')[0] + '</td>'
            + '<td>' + (l.sponsor_name||'—') + '</td>'
            + '<td>' + (l.event_name||'—') + '</td>'
            + '<td style="font-size:12px">' + truncate(l.subject_rendered, 50) + '</td>'
            + '<td>' + (l.sent_by||'—') + '</td>'
            + '<td>' + (l.response_recorded ? '<span class="badge badge-completed">Yes</span>' : '—') + '</td>'
            + '</tr>').join('');
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
loadDashboard();
</script>
</body>
</html>`;
}
