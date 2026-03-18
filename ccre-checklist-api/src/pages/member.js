/**
 * Member Checklist Page — Swiss-Tech Styled
 */
export function memberPageHTML(token) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Onboarding Checklist — CCRE</title>
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
    </style>
</head>
<body>
    <div class="page">
        <div id="content" class="loading">Loading checklist data…</div>
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
                if (isDone) metaText = '<span class="completed">✓ Completed ' + (t.completed_at ? t.completed_at.split('T')[0] : '') + '</span>';
                else if (isOverdue) metaText = '<span class="overdue">Overdue — Due ' + t.due_date + '</span>';
                else metaText = '<span class="due">Due ' + t.due_date + '</span>';

                return '<div class="task-item ' + (isDone ? 'complete' : '') + (isNext ? ' next' : '') + '">'
                    + '<div class="task-check ' + (isDone ? 'done' : '') + '">' + (isDone ? '✓' : '') + '</div>'
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
                + '<div><div class="info-label">Organization</div><div class="info-value">' + (member.organization || '—') + '</div></div>'
                + '<div><div class="info-label">Status</div><div class="info-value">' + (member.status || '—') + '</div></div>'
                + '</div></div>'
                + '<div class="progress-section"><div class="progress-label">Onboarding Progress</div><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div><div class="progress-text">' + completed + ' of ' + tasks.length + ' steps complete (' + pct + '%)</div></div>'
                + '<div class="tasks-title">Your Checklist</div>' + taskHTML
                + '<div class="contact-card"><div class="contact-title">Need Help?</div><div class="contact-info">Contact us at <a href="mailto:info@ccreschool.com">info@ccreschool.com</a> or call <a href="tel:+12395551234">(239) 555-1234</a></div></div>'
                + '<div class="footer">CCRE School · Member Experience Dashboard</div>';
        }

        loadChecklist();
    </script>
</body>
</html>`;
}
