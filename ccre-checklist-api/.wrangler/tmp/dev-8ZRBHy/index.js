var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-JN2SVF/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-JN2SVF/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// ../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/pages/member.js
var member_exports = {};
__export(member_exports, {
  memberPageHTML: () => memberPageHTML
});
function memberPageHTML(token) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Onboarding Checklist \u2014 CCRE</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>
        :root {
            --canvas: #ffffff;
            --panel: #fafafa;
            --ink: #111827;
            --border: #111827;
            --blue: #0284c7;
            --gold: #ca8a04;
            --green: #16a34a;
            --red: #dc2626;
            --mono: 'Share Tech Mono', monospace;
            --sans: 'Inter', sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--sans); background: var(--canvas); color: var(--ink); line-height: 1.6; }

        /* Layout */
        .page { max-width: 740px; margin: 0 auto; padding: 40px 24px 80px; }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--ink); padding-bottom: 20px; margin-bottom: 32px; }
        .header-left .index { font-family: var(--mono); font-size: 64px; font-weight: 700; line-height: 1; color: var(--blue); letter-spacing: -2px; }
        .header-left .title { font-size: 13px; font-family: var(--mono); text-transform: uppercase; letter-spacing: 1px; color: var(--ink); margin-top: 4px; }
        .header-right { text-align: right; padding-top: 8px; }
        .header-right .org { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }

        /* Member Info Panel */
        .info-panel { background: var(--panel); border: 1px solid var(--ink); padding: 24px; margin-bottom: 28px; position: relative; }
        .info-panel::before, .info-panel::after { content: ''; position: absolute; width: 8px; height: 8px; border: 1.5px solid var(--blue); }
        .info-panel::before { top: -4px; left: -4px; border-right: none; border-bottom: none; }
        .info-panel::after { bottom: -4px; right: -4px; border-left: none; border-top: none; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 2px; }
        .info-value { font-size: 16px; font-weight: 600; }
        .badge { display: inline-block; font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 3px 10px; border: 1px solid; border-radius: 2px; font-weight: 700; }
        .badge-realtor { color: var(--blue); border-color: var(--blue); background: rgba(2,132,199,0.06); }
        .badge-affiliate { color: var(--gold); border-color: var(--gold); background: rgba(202,138,4,0.06); }

        /* Progress Bar */
        .progress-section { margin-bottom: 28px; }
        .progress-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 8px; }
        .progress-bar { height: 6px; background: #e5e7eb; border: 1px solid var(--ink); position: relative; }
        .progress-fill { height: 100%; background: var(--blue); transition: width 0.5s ease; }
        .progress-text { font-family: var(--mono); font-size: 12px; margin-top: 6px; color: var(--ink); }

        /* Task List */
        .tasks-title { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .task-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border: 1px solid #d1d5db; margin-bottom: -1px; background: var(--canvas); transition: background 0.15s; }
        .task-item.complete { background: var(--panel); }
        .task-item.next { border-left: 3px solid var(--blue); }
        .task-check { width: 20px; height: 20px; border: 1.5px solid var(--ink); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .task-check.done { background: var(--green); border-color: var(--green); color: white; font-size: 12px; }
        .task-body { flex: 1; }
        .task-title { font-weight: 600; font-size: 14px; }
        .task-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .task-meta { font-family: var(--mono); font-size: 10px; color: #9ca3af; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .task-meta .due { color: var(--blue); }
        .task-meta .overdue { color: var(--red); font-weight: 700; }
        .task-meta .completed { color: var(--green); }

        /* Contact Card */
        .contact-card { background: var(--panel); border: 1px solid var(--ink); padding: 20px; margin-top: 32px; position: relative; }
        .contact-card::before, .contact-card::after { content: ''; position: absolute; width: 8px; height: 8px; border: 1.5px solid var(--gold); }
        .contact-card::before { top: -4px; right: -4px; border-left: none; border-bottom: none; }
        .contact-card::after { bottom: -4px; left: -4px; border-right: none; border-top: none; }
        .contact-title { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--gold); margin-bottom: 8px; }
        .contact-info { font-size: 14px; line-height: 1.8; }
        .contact-info a { color: var(--blue); text-decoration: none; border-bottom: 1px solid var(--blue); }

        /* Loading */
        .loading { text-align: center; padding: 60px; font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; }

        /* Footer */
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-family: var(--mono); font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }

        /* Calendar */
        .calendar-section { margin-top: 40px; }
        .calendar-container { border: 1px solid var(--ink); background: var(--canvas); width: 100%; margin-top: 12px; }
        .calendar-header { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--ink); background: var(--panel); }
        .calendar-title { font-family: var(--mono); font-size: 13px; font-weight: 700; text-transform: uppercase; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
        .calendar-day-head { font-family: var(--mono); font-size: 9px; text-align: center; padding: 8px; border-bottom: 1px solid var(--ink); border-right: 1px solid var(--ink); background: #f9fafb; font-weight: 700; text-transform: uppercase; }
        .calendar-day-head:last-child { border-right: none; }
        .calendar-day { min-height: 80px; padding: 6px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; position: relative; }
        .calendar-day:nth-child(7n) { border-right: none; }
        .calendar-day.other-month { background: #f9f9f9; color: #d1d5db; }
        .calendar-day.today { background: rgba(2,132,199,0.03); }
        .calendar-day.today .calendar-day-num { font-weight: 700; color: var(--blue); border-bottom: 1.5px solid var(--blue); display: inline-block; }
        .calendar-day-num { font-family: var(--mono); font-size: 10px; margin-bottom: 4px; display: block; }
        .calendar-event { font-size: 8.5px; padding: 2px 4px; border: 1px solid; border-radius: 1px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--mono); line-height: 1.2; }
        .calendar-event.status-pending { border-color: var(--blue); color: var(--blue); background: rgba(2,132,199,0.04); }
        .calendar-event.status-complete { border-color: var(--green); color: var(--green); background: rgba(22,163,74,0.04); }
        .calendar-event.status-overdue { border-color: var(--red); color: var(--red); background: rgba(220,38,38,0.04); }
    </style>
</head>
<body>
    <div class="page">
        <div id="content" class="loading">Loading checklist data\u2026</div>
    </div>
    <script>
        const TOKEN = '${token}';
        const API = location.origin;

        async function loadChecklist() {
            try {
                const res = await fetch(API + '/api/member/' + TOKEN);
                if (!res.ok) { document.getElementById('content').innerHTML = '<div class="loading">Checklist not found. Please check your link.</div>'; return; }
                const data = await res.json();
                render(data);
            } catch (e) {
                document.getElementById('content').innerHTML = '<div class="loading">Error loading data. Please try again.</div>';
            }
        }

        function render({ member, tasks }) {
            const today = new Date().toISOString().split('T')[0];
            const completed = tasks.filter(t => t.state === 'complete').length;
            const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
            const badgeClass = member.memberType === 'affiliate' ? 'badge-affiliate' : 'badge-realtor';
            const typeLabel = member.memberType === 'affiliate' ? 'Affiliate' : 'REALTOR';
            let foundNext = false;

            const taskHTML = tasks.map(t => {
                const isDone = t.state === 'complete';
                const isOverdue = !isDone && t.due_date < today;
                const isNext = !isDone && !foundNext;
                if (isNext) foundNext = true;

                let metaText = '';
                if (isDone) metaText = '<span class="completed">\u2713 Completed ' + (t.completed_at ? t.completed_at.split('T')[0] : '') + '</span>';
                else if (isOverdue) metaText = '<span class="overdue">Overdue \u2014 Due ' + t.due_date + '</span>';
                else metaText = '<span class="due">Due ' + t.due_date + '</span>';

                return '<div class="task-item ' + (isDone ? 'complete' : '') + (isNext ? ' next' : '') + '">'
                    + '<div class="task-check ' + (isDone ? 'done' : '') + '">' + (isDone ? '\u2713' : '') + '</div>'
                    + '<div class="task-body">'
                    + '<div class="task-title">' + t.title + '</div>'
                    + (t.description ? '<div class="task-desc">' + t.description + '</div>' : '')
                    + '<div class="task-meta">' + metaText + '</div>'
                    + '</div></div>';
            }).join('');

            document.getElementById('content').innerHTML = ''
                + '<div class="header"><div class="header-left"><div class="index">01</div><div class="title">Member Onboarding Checklist</div></div><div class="header-right"><div class="org">CCRE School</div></div></div>'
                + '<div class="info-panel"><div class="info-grid">'
                + '<div><div class="info-label">Member</div><div class="info-value">' + (member.firstName || '') + ' ' + (member.lastName || '') + '</div></div>'
                + '<div><div class="info-label">Type</div><div class="info-value"><span class="badge ' + badgeClass + '">' + typeLabel + '</span></div></div>'
                + '<div><div class="info-label">Organization</div><div class="info-value">' + (member.organization || '\u2014') + '</div></div>'
                + '<div><div class="info-label">Status</div><div class="info-value">' + (member.status || '\u2014') + '</div></div>'
                + '</div></div>'
                + '<div class="progress-section"><div class="progress-label">Onboarding Progress</div><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div><div class="progress-text">' + completed + ' of ' + tasks.length + ' steps complete (' + pct + '%)</div></div>'
                + '<div class="tasks-title">Your Checklist</div>' + taskHTML
                + '<div class="calendar-section"><div class="tasks-title">Scheduled Timeline</div>' + renderCalendar(tasks) + '</div>'
                + '<div class="contact-card"><div class="contact-title">Need Help?</div><div class="contact-info">Contact us at <a href="mailto:info@ccreschool.com">info@ccreschool.com</a> or call <a href="tel:+12395551234">(239) 555-1234</a></div></div>'
                + '<div class="footer">CCRE School \xB7 Member Experience Dashboard</div>';
        }

        function renderCalendar(tasks) {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const prevMonthDays = new Date(year, month, 0).getDate();
            const fillDays = firstDay === 0 ? 6 : firstDay - 1; // Monday start
            
            let html = '<div class="calendar-container">';
            html += '<div class="calendar-header"><div class="calendar-title">' + monthNames[month] + ' ' + year + '</div></div>';
            html += '<div class="calendar-grid">';
            ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(d => html += '<div class="calendar-day-head">' + d + '</div>');
            
            for (let i = fillDays; i > 0; i--) {
                html += '<div class="calendar-day other-month"><span class="calendar-day-num">' + (prevMonthDays - i + 1) + '</span></div>';
            }
            
            const todayStr = new Date().toISOString().split('T')[0];
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
                const isToday = dateStr === todayStr;
                const dayTasks = tasks.filter(t => t.due_date === dateStr);
                
                html += '<div class="calendar-day ' + (isToday ? 'today' : '') + '">';
                html += '<span class="calendar-day-num">' + d + '</span>';
                dayTasks.forEach(t => {
                    html += '<div class="calendar-event status-' + t.state + '" title="' + t.title + '">' + t.title + '</div>';
                });
                html += '</div>';
            }
            
            html += '</div></div>';
            return html;
        }

        loadChecklist();
    <\/script>
</body>
</html>`;
}
var init_member = __esm({
  "src/pages/member.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    __name(memberPageHTML, "memberPageHTML");
  }
});

// src/pages/styles.js
function swissTechCSS() {
  return `
        :root {
            --canvas: #ffffff; --panel: #fafafa; --ink: #111827; --border: #111827;
            --blue: #0284c7; --gold: #ca8a04; --green: #16a34a; --red: #dc2626;
            --mono: 'Share Tech Mono', monospace; --sans: 'Inter', sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--sans); background: var(--canvas); color: var(--ink); line-height: 1.6; font-size: 14px; }

        /* Tech Panel */
        .tech-panel { background: var(--panel); border: 1px solid var(--ink); padding: 20px; position: relative; margin-bottom: 20px; }
        .tech-panel::before, .tech-panel::after { content:''; position:absolute; width:8px; height:8px; border:1.5px solid var(--blue); }
        .tech-panel::before { top:-4px; left:-4px; border-right:none; border-bottom:none; }
        .tech-panel::after { bottom:-4px; right:-4px; border-left:none; border-top:none; }

        /* Micro-label */
        .micro { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }

        /* Stat Block */
        .stat-block { background: var(--canvas); border: 1px solid var(--ink); padding: 16px; box-shadow: 2px 2px 0 rgba(0,0,0,0.05); }
        .stat-block .stat-val { font-family: var(--mono); font-size: 28px; font-weight: 700; line-height: 1.1; }
        .stat-block .stat-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-top: 4px; }
        .stat-block.accent-blue .stat-val { color: var(--blue); }
        .stat-block.accent-red .stat-val { color: var(--red); }
        .stat-block.accent-green .stat-val { color: var(--green); }
        .stat-block.accent-gold .stat-val { color: var(--gold); }

        /* Badge */
        .badge { display:inline-block; font-family:var(--mono); font-size:10px; text-transform:uppercase; letter-spacing:1px; padding:3px 10px; border:1px solid; border-radius:2px; font-weight:700; }
        .badge-realtor { color:var(--blue); border-color:var(--blue); background:rgba(2,132,199,0.06); }
        .badge-affiliate { color:var(--gold); border-color:var(--gold); background:rgba(202,138,4,0.06); }
        .badge-new { color:var(--green); border-color:var(--green); background:rgba(22,163,74,0.06); }
        .badge-overdue { color:var(--red); border-color:var(--red); background:rgba(220,38,38,0.06); }

        /* Buttons */
        .btn { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 18px; border: 1px solid var(--ink); background: var(--canvas); cursor: pointer; transition: all 0.15s; border-radius: 2px; }
        .btn:hover { background: var(--ink); color: var(--canvas); }
        .btn-primary { background: var(--blue); color: white; border-color: var(--blue); }
        .btn-primary:hover { background: #0369a1; }
        .btn-sm { padding: 4px 10px; font-size: 10px; }

        /* Table */
        .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .data-table th { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px; text-align: left; border: 1px solid var(--ink); background: var(--panel); }
        .data-table td { padding: 10px 12px; border: 1px solid #d1d5db; }
        .data-table tr:hover td { background: #f3f4f6; }
        .data-table tr.clickable { cursor: pointer; }

        /* Forms */
        .form-group { margin-bottom: 14px; }
        .form-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; display: block; margin-bottom: 4px; }
        .form-input, .form-select, .form-textarea { width: 100%; padding: 8px 10px; border: 1px solid var(--ink); font-family: var(--sans); font-size: 13px; background: var(--canvas); border-radius: 2px; }
        .form-textarea { min-height: 80px; resize: vertical; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; z-index: 1000; }
        .modal-overlay.active { display: flex; }
        .modal { background: var(--canvas); border: 2px solid var(--ink); width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; padding: 28px; position: relative; }
        .modal-close { position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--ink); }

        /* Calendar */
        .calendar-container { margin-top: 24px; border: 1px solid var(--ink); background: var(--canvas); width: 100%; }
        .calendar-header { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--ink); background: var(--panel); }
        .calendar-title { font-family: var(--mono); font-size: 14px; font-weight: 700; text-transform: uppercase; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
        .calendar-day-head { font-family: var(--mono); font-size: 10px; text-align: center; padding: 8px; border-bottom: 1px solid var(--ink); border-right: 1px solid var(--ink); background: #f9fafb; font-weight: 700; text-transform: uppercase; }
        .calendar-day-head:last-child { border-right: none; }
        .calendar-day { min-height: 90px; padding: 6px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; position: relative; transition: background 0.1s; }
        .calendar-day:nth-child(7n) { border-right: none; }
        .calendar-day.other-month { background: #f9f9f9; color: #9ca3af; }
        .calendar-day.today { background: rgba(2,132,199,0.03); }
        .calendar-day.today .calendar-day-num { font-weight: 700; color: var(--blue); border-bottom: 1.5px solid var(--blue); display: inline-block; }
        .calendar-day-num { font-family: var(--mono); font-size: 11px; margin-bottom: 6px; display: block; }
        .calendar-event { font-size: 9px; padding: 2px 4px; border: 1px solid; border-radius: 2px; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--mono); cursor: pointer; line-height: 1.2; }
        .calendar-event:hover { opacity: 0.8; }
        .calendar-event.status-pending { border-color: var(--blue); color: var(--blue); background: rgba(2,132,199,0.05); }
        .calendar-event.status-complete { border-color: var(--green); color: var(--green); background: rgba(22,163,74,0.05); }
        .calendar-event.status-overdue { border-color: var(--red); color: var(--red); background: rgba(220,38,38,0.05); }
    `;
}
var init_styles = __esm({
  "src/pages/styles.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    __name(swissTechCSS, "swissTechCSS");
  }
});

// src/pages/admin.js
var admin_exports = {};
__export(admin_exports, {
  adminPageHTML: () => adminPageHTML
});
function adminPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard \u2014 CCRE Member Experience</title>
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
                <input class="form-input" id="filterSearch" placeholder="Search name or email\u2026" style="min-width:200px">
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
                    <button class="btn btn-sm" onclick="showView('list')" style="margin-bottom:10px">\u2190 Back</button>
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
        <button class="modal-close" id="tpModalClose">\xD7</button>
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
            <div class="form-group"><label class="form-label">Outcome</label><input class="form-input" name="outcome" placeholder="Brief outcome\u2026"></div>
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
            + '<td>' + (m.overdue_tasks > 0 ? '<span class="badge badge-overdue">' + m.overdue_tasks + '</span>' : '\u2014') + '</td>'
            + '<td style="font-family:var(--mono);font-size:12px">' + (m.start_date || '\u2014') + '</td>'
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
    document.getElementById('detailMeta').innerHTML = '<div class="micro">Email</div><div>' + (member.email || '\u2014') + '</div><div class="micro" style="margin-top:8px">Phone</div><div>' + (member.phone || '\u2014') + '</div>';

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
                    + '<div class="timeline-meta">' + (tp.occurred_at || '').split('T')[0] + (tp.staff_user ? ' \xB7 ' + tp.staff_user : '') + '</div>'
                    + (tp.outcome ? '<div style="font-size:12px;margin-top:2px">' + tp.outcome + '</div>' : '')
                    + (tp.note ? '<div style="font-size:12px;color:#6b7280;margin-top:2px">' + tp.note + '</div>' : '')
                    + '</div></div>';
            }).join('');
    } else if (currentDetailTab === 'notes') {
        document.getElementById('detailContent').innerHTML =
            '<form id="noteForm" style="margin-bottom:16px" onsubmit="addNote(event)"><div class="form-group"><textarea class="form-textarea" name="body" placeholder="Add a note\u2026" required></textarea></div><div class="form-group"><input class="form-input" name="author" placeholder="Your name"></div><button class="btn btn-sm btn-primary" type="submit">Save Note</button></form>'
            + notes.map(n => '<div class="timeline-item"><div class="timeline-dot"></div><div style="flex:1"><div style="font-size:13px">' + n.body + '</div><div class="timeline-meta">' + (n.author || 'System') + ' \xB7 ' + (n.created_at || '').split('T')[0] + '</div></div></div>').join('');
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
<\/script>
</body>
</html>`;
}
var init_admin = __esm({
  "src/pages/admin.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_styles();
    __name(adminPageHTML, "adminPageHTML");
  }
});

// .wrangler/tmp/bundle-JN2SVF/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-JN2SVF/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// src/index.js
init_checked_fetch();
init_modules_watch_stub();
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}
__name(jsonResponse, "jsonResponse");
function htmlResponse(html) {
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(htmlResponse, "htmlResponse");
function generateToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}
__name(generateToken, "generateToken");
async function expandWorkflow(db, memberId, memberType, startDate) {
  const templateKey = memberType === "affiliate" ? "affiliate_onboarding" : "realtor_onboarding";
  const { results: steps } = await db.prepare(
    "SELECT * FROM workflow_templates WHERE template_key = ? AND is_active = 1 ORDER BY sort_order"
  ).bind(templateKey).all();
  const base = new Date(startDate);
  for (const step of steps) {
    const due = new Date(base);
    due.setDate(due.getDate() + step.day_offset);
    const dueStr = due.toISOString().split("T")[0];
    await db.prepare(`
            INSERT OR IGNORE INTO member_tasks (member_id, step_key, title, description, due_date, owner, state)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `).bind(memberId, step.step_key, step.title, step.description, dueStr, step.default_owner).run();
  }
}
__name(expandWorkflow, "expandWorkflow");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (request.method === "GET" && path.startsWith("/api/member/")) {
        const token = path.replace("/api/member/", "");
        const member = await env.DB.prepare("SELECT * FROM members WHERE public_token = ?").bind(token).first();
        if (!member) return jsonResponse({ error: "Not found" }, 404);
        const { results: tasks } = await env.DB.prepare(
          "SELECT id, step_key, title, description, due_date, completed_at, state FROM member_tasks WHERE member_id = ? ORDER BY due_date, id"
        ).bind(member.id).all();
        return jsonResponse({
          member: {
            firstName: member.first_name,
            lastName: member.last_name,
            memberType: member.member_type,
            status: member.status,
            startDate: member.start_date,
            organization: member.organization
          },
          tasks
        });
      }
      if (request.method === "GET" && path.startsWith("/checklist/")) {
        const token = path.replace("/checklist/", "");
        const { memberPageHTML: memberPageHTML2 } = await Promise.resolve().then(() => (init_member(), member_exports));
        return htmlResponse(memberPageHTML2(token));
      }
      if (request.method === "GET" && path === "/admin") {
        const { adminPageHTML: adminPageHTML2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
        return htmlResponse(adminPageHTML2());
      }
      if (request.method === "GET" && path === "/api/admin/members") {
        const status = url.searchParams.get("status");
        const type = url.searchParams.get("type");
        const search = url.searchParams.get("q");
        let query = `SELECT m.*, 
                    (SELECT COUNT(*) FROM member_tasks WHERE member_id = m.id AND state = 'complete') as completed_tasks,
                    (SELECT COUNT(*) FROM member_tasks WHERE member_id = m.id) as total_tasks,
                    (SELECT COUNT(*) FROM member_tasks WHERE member_id = m.id AND state = 'pending' AND due_date < date('now')) as overdue_tasks
                    FROM members m WHERE 1=1`;
        const bindings = [];
        if (status) {
          query += " AND m.status = ?";
          bindings.push(status);
        }
        if (type) {
          query += " AND m.member_type = ?";
          bindings.push(type);
        }
        if (search) {
          query += " AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ?)";
          bindings.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += " ORDER BY m.created_at DESC";
        const stmt = env.DB.prepare(query);
        const { results } = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
        return jsonResponse({ members: results });
      }
      if (request.method === "GET" && path.match(/^\/api\/admin\/members\/\d+$/)) {
        const id = parseInt(path.split("/").pop());
        const member = await env.DB.prepare("SELECT * FROM members WHERE id = ?").bind(id).first();
        if (!member) return jsonResponse({ error: "Not found" }, 404);
        const { results: tasks } = await env.DB.prepare(
          "SELECT * FROM member_tasks WHERE member_id = ? ORDER BY due_date, id"
        ).bind(id).all();
        const { results: touchpoints } = await env.DB.prepare(
          "SELECT * FROM touchpoints WHERE member_id = ? ORDER BY occurred_at DESC"
        ).bind(id).all();
        const { results: notes } = await env.DB.prepare(
          "SELECT * FROM member_notes WHERE member_id = ? ORDER BY created_at DESC"
        ).bind(id).all();
        return jsonResponse({ member, tasks, touchpoints, notes });
      }
      if (request.method === "GET" && path === "/api/admin/calendar") {
        const { results: events } = await env.DB.prepare(`
                    SELECT t.*, m.first_name, m.last_name, m.member_type 
                    FROM member_tasks t
                    JOIN members m ON t.member_id = m.id
                    WHERE t.state != 'skipped'
                    ORDER BY t.due_date ASC
                `).all();
        return jsonResponse({ events });
      }
      if (request.method === "GET" && path === "/api/admin/today") {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const { results: tasks } = await env.DB.prepare(`
                    SELECT t.*, m.first_name, m.last_name 
                    FROM member_tasks t
                    JOIN members m ON t.member_id = m.id
                    WHERE t.due_date = ? AND t.state = 'pending'
                `).bind(today).all();
        return jsonResponse({ tasks });
      }
      if (request.method === "GET" && path === "/api/admin/templates") {
        const { results: templates } = await env.DB.prepare("SELECT * FROM workflow_templates ORDER BY member_type, sort_order").all();
        return jsonResponse({ templates });
      }
      if (request.method === "POST" && path.match(/^\/api\/admin\/templates\/\d+$/)) {
        const id = parseInt(path.split("/").pop());
        const { title, description, day_offset } = await request.json();
        await env.DB.prepare("UPDATE workflow_templates SET title = ?, description = ?, day_offset = ?, updated_at = datetime('now') WHERE id = ?").bind(title, description, day_offset, id).run();
        return jsonResponse({ success: true });
      }
      if (request.method === "POST" && path.match(/^\/api\/admin\/tasks\/\d+\/reschedule$/)) {
        const id = parseInt(path.split("/").pop());
        const { due_date } = await request.json();
        await env.DB.prepare("UPDATE member_tasks SET due_date = ?, updated_at = datetime('now') WHERE id = ?").bind(due_date, id).run();
        return jsonResponse({ success: true });
      }
      if (request.method === "POST" && path.match(/^\/api\/admin\/members\/\d+\/notes$/)) {
        const member_id = parseInt(path.split("/").pop());
        const { body, author } = await request.json();
        await env.DB.prepare("INSERT INTO member_notes (member_id, body, author) VALUES (?, ?, ?)").bind(member_id, body, author || "Admin").run();
        return jsonResponse({ success: true });
      }
      if (request.method === "POST" && path === "/api/admin/members") {
        const body = await request.json();
        const token = generateToken();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const startDate = body.start_date || now.split("T")[0];
        const result = await env.DB.prepare(`
                    INSERT INTO members (growthzone_contact_id, public_token, first_name, last_name, email, phone, organization, member_type, status, start_date, assigned_owner, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
                `).bind(
          body.growthzone_contact_id || null,
          token,
          body.first_name || "",
          body.last_name || "",
          body.email || null,
          body.phone || null,
          body.organization || null,
          body.member_type || "realtor",
          startDate,
          body.assigned_owner || null,
          now,
          now
        ).run();
        const memberId = result.meta.last_row_id;
        await expandWorkflow(env.DB, memberId, body.member_type || "realtor", startDate);
        return jsonResponse({ success: true, id: memberId, public_token: token });
      }
      if (request.method === "POST" && path.match(/^\/api\/admin\/tasks\/\d+$/)) {
        const taskId = parseInt(path.split("/").pop());
        const body = await request.json();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const updates = [];
        const binds = [];
        if (body.state !== void 0) {
          updates.push("state = ?");
          binds.push(body.state);
        }
        if (body.state === "complete") {
          updates.push("completed_at = ?");
          binds.push(now);
        }
        if (body.due_date !== void 0) {
          updates.push("due_date = ?");
          binds.push(body.due_date);
        }
        if (body.notes_summary !== void 0) {
          updates.push("notes_summary = ?");
          binds.push(body.notes_summary);
        }
        if (body.owner !== void 0) {
          updates.push("owner = ?");
          binds.push(body.owner);
        }
        updates.push("updated_at = ?");
        binds.push(now);
        binds.push(taskId);
        await env.DB.prepare(`UPDATE member_tasks SET ${updates.join(", ")} WHERE id = ?`).bind(...binds).run();
        return jsonResponse({ success: true });
      }
      if (request.method === "POST" && path === "/api/admin/touchpoints") {
        const body = await request.json();
        await env.DB.prepare(`
                    INSERT INTO touchpoints (member_id, task_id, category, occurred_at, outcome, staff_user, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).bind(
          body.member_id,
          body.task_id || null,
          body.category,
          body.occurred_at || (/* @__PURE__ */ new Date()).toISOString(),
          body.outcome || null,
          body.staff_user || null,
          body.note || null
        ).run();
        return jsonResponse({ success: true });
      }
      if (request.method === "GET" && path === "/api/admin/touchpoints") {
        const month = url.searchParams.get("month");
        let query = "SELECT t.*, m.first_name, m.last_name FROM touchpoints t JOIN members m ON t.member_id = m.id";
        const binds = [];
        if (month) {
          query += " WHERE t.occurred_at LIKE ?";
          binds.push(month + "%");
        }
        query += " ORDER BY t.occurred_at DESC";
        const stmt = env.DB.prepare(query);
        const { results } = binds.length > 0 ? await stmt.bind(...binds).all() : await stmt.all();
        const summary = {};
        results.forEach((tp) => {
          summary[tp.category] = (summary[tp.category] || 0) + 1;
        });
        return jsonResponse({ touchpoints: results, summary, total: results.length });
      }
      if (request.method === "POST" && path === "/api/admin/notes") {
        const body = await request.json();
        await env.DB.prepare(`
                    INSERT INTO member_notes (member_id, note_type, body, author)
                    VALUES (?, ?, ?, ?)
                `).bind(body.member_id, body.note_type || "general", body.body, body.author || null).run();
        return jsonResponse({ success: true });
      }
      if (request.method === "GET" && path === "/api/admin/stats") {
        const totalMembers = await env.DB.prepare("SELECT COUNT(*) as c FROM members").first();
        const activeMembers = await env.DB.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'active'").first();
        const overdueTasks = await env.DB.prepare("SELECT COUNT(*) as c FROM member_tasks WHERE state = 'pending' AND due_date < date('now')").first();
        const dueTodayTasks = await env.DB.prepare("SELECT COUNT(*) as c FROM member_tasks WHERE state = 'pending' AND due_date = date('now')").first();
        const realtorCount = await env.DB.prepare("SELECT COUNT(*) as c FROM members WHERE member_type = 'realtor'").first();
        const affiliateCount = await env.DB.prepare("SELECT COUNT(*) as c FROM members WHERE member_type = 'affiliate'").first();
        return jsonResponse({
          totalMembers: totalMembers.c,
          activeMembers: activeMembers.c,
          overdueTasks: overdueTasks.c,
          dueTodayTasks: dueTodayTasks.c,
          realtorCount: realtorCount.c,
          affiliateCount: affiliateCount.c
        });
      }
      if (request.method === "POST" && path === "/api/internal/sync") {
        return await performGZSync(env);
      }
      return jsonResponse({ error: "Not Found" }, 404);
    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: err.message }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    console.log("Cron triggered: GrowthZone sync");
    ctx.waitUntil(performGZSync(env));
  }
};
async function performGZSync(env) {
  if (!env.GROWTHZONE_API_KEY || !env.GROWTHZONE_BASE_URL) {
    return jsonResponse({ error: "GrowthZone credentials not configured." }, 500);
  }
  const SYNC_START_DATE = "2026-03-16";
  try {
    const syncUrl = `${env.GROWTHZONE_BASE_URL}/api/memberships/all?$top=500&$orderby=MembershipId desc`;
    const response = await fetch(syncUrl, {
      headers: {
        "Authorization": `ApiKey ${env.GROWTHZONE_API_KEY}`,
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      return jsonResponse({ error: `GZ API Error: ${response.status} ${response.statusText}`, details: await response.text() }, 500);
    }
    const data = await response.json();
    const results = data.Results || data.results || [];
    let imported = 0;
    let skipped = 0;
    for (const membership of results) {
      if (membership.MembershipStatusTypeId !== 2) continue;
      const typeStr = (membership.Type || "").toUpperCase();
      const nameStr = membership.Name || "";
      const contactId = membership.ContactId;
      const startDate = membership.StartDate ? membership.StartDate.split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      if (startDate < SYNC_START_DATE) {
        continue;
      }
      let memberType = null;
      if (typeStr.includes("REALTOR") || typeStr.includes("MLS")) {
        memberType = "realtor";
      } else if (typeStr.includes("AFFILIATE")) {
        memberType = "affiliate";
      }
      if (!memberType) {
        continue;
      }
      const existing = await env.DB.prepare("SELECT id FROM members WHERE growthzone_contact_id = ?").bind(contactId).first();
      if (existing) {
        skipped++;
        continue;
      }
      let email = null;
      let phone = null;
      try {
        const contactRes = await fetch(`${env.GROWTHZONE_BASE_URL}/api/contacts/${contactId}`, {
          headers: { "Authorization": `ApiKey ${env.GROWTHZONE_API_KEY}`, "Accept": "application/json" }
        });
        if (contactRes.ok) {
          const cData = await contactRes.json();
          email = cData.Email || cData.EmailAddress || null;
          phone = cData.Phone || cData.PhoneNumber || null;
        }
      } catch (ce) {
        console.error(`Failed to enrich contact ${contactId}: ${ce.message}`);
      }
      let firstName = "";
      let lastName = "";
      const parts = nameStr.trim().split(/\s+/);
      if (parts.length > 1) {
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else {
        firstName = nameStr;
      }
      const token = generateToken();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const result = await env.DB.prepare(`
                INSERT INTO members (growthzone_contact_id, public_token, first_name, last_name, email, phone, member_type, status, start_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
            `).bind(contactId, token, firstName, lastName, email, phone, memberType, startDate, now, now).run();
      const memberId = result.meta.last_row_id;
      await expandWorkflow(env.DB, memberId, memberType, startDate);
      imported++;
    }
    return jsonResponse({ success: true, message: `GZ Sync complete. Imported ${imported}, skipped ${skipped}.` });
  } catch (e) {
    console.error("Sync Error:", e);
    return jsonResponse({ error: e.message }, 500);
  }
}
__name(performGZSync, "performGZSync");

// ../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-JN2SVF/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-JN2SVF/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
