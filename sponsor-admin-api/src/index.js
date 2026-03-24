/**
 * 2026 Sponsors Admin Tracker — Cloudflare Worker
 * All API routes + admin page serving
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
}

function html(body) {
    return new Response(body, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Route matching helpers
function matchGet(method, path, pattern) {
    if (method !== 'GET') return null;
    return matchPath(path, pattern);
}
function matchPost(method, path, pattern) {
    if (method !== 'POST') return null;
    return matchPath(path, pattern);
}
function matchPut(method, path, pattern) {
    if (method !== 'PUT') return null;
    return matchPath(path, pattern);
}
function matchPath(path, pattern) {
    const pp = pattern.split('/');
    const sp = path.split('/');
    if (pp.length !== sp.length) return null;
    const params = {};
    for (let i = 0; i < pp.length; i++) {
        if (pp[i].startsWith(':')) {
            params[pp[i].slice(1)] = sp[i];
        } else if (pp[i] !== sp[i]) {
            return null;
        }
    }
    return params;
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;
        const DB = env.DB;

        try {
            // ── ADMIN PAGE ──
            if (method === 'GET' && path === '/admin') {
                const { adminPageHTML } = await import('./pages/admin.js');
                return html(adminPageHTML());
            }

            // ══════════════════════════════════════
            // DASHBOARD
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/dashboard')) {
                const total = await DB.prepare('SELECT COUNT(*) as c FROM sponsors WHERE active_2026=1').first();
                const byLevel = await DB.prepare('SELECT sponsor_level, COUNT(*) as c FROM sponsors WHERE active_2026=1 GROUP BY sponsor_level').all();
                const today = new Date().toISOString().split('T')[0];

                const overdueReminders = await DB.prepare(`
                    SELECT COUNT(*) as c FROM sponsor_event_tracking
                    WHERE (first_reminder_due <= ? AND email_sent_1=0)
                       OR (second_reminder_due <= ? AND email_sent_2=0 AND email_sent_1=1)
                       OR (final_reminder_due <= ? AND email_sent_3=0 AND email_sent_2=1)
                `).bind(today, today, today).first();

                const dueSoon = await DB.prepare(`
                    SELECT COUNT(*) as c FROM sponsor_event_tracking
                    WHERE (first_reminder_due <= date(?, '+7 days') AND email_sent_1=0)
                       OR (second_reminder_due <= date(?, '+7 days') AND email_sent_2=0 AND email_sent_1=1)
                       OR (final_reminder_due <= date(?, '+7 days') AND email_sent_3=0 AND email_sent_2=1)
                `).bind(today, today, today).first();

                const waitingResponse = await DB.prepare(`SELECT COUNT(*) as c FROM sponsor_event_tracking WHERE status='sent_waiting_response'`).first();
                const waitingAssets = await DB.prepare(`SELECT COUNT(*) as c FROM sponsor_assets WHERE received=0`).first();

                const openOH = await DB.prepare(`
                    SELECT COUNT(*) as c FROM events WHERE event_type='open_house'
                    AND id NOT IN (SELECT event_id FROM sponsor_event_tracking WHERE event_id IS NOT NULL AND status IN ('claimed','completed','ready'))
                `).first();

                const pendingPlacements = await DB.prepare(`SELECT COUNT(*) as c FROM recurring_placement_checks WHERE status='pending'`).first();

                const recentActivity = await DB.prepare(`
                    SELECT el.*, s.sponsor_name FROM email_log el
                    JOIN sponsors s ON el.sponsor_id = s.id
                    ORDER BY el.sent_at DESC LIMIT 10
                `).all();

                const levels = {};
                (byLevel.results || []).forEach(r => { levels[r.sponsor_level] = r.c; });

                return json({
                    totalSponsors: total.c,
                    byLevel: levels,
                    overdueReminders: overdueReminders.c,
                    remindersDueSoon: dueSoon.c,
                    waitingResponse: waitingResponse.c,
                    waitingAssets: waitingAssets?.c || 0,
                    openOHMonths: openOH.c,
                    pendingPlacements: pendingPlacements.c,
                    recentActivity: recentActivity.results || []
                });
            }

            // ══════════════════════════════════════
            // SPONSORS
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/sponsors')) {
                const level = url.searchParams.get('level');
                const status = url.searchParams.get('status');
                const q = url.searchParams.get('q');
                const overdue = url.searchParams.get('overdue');
                const missingAssets = url.searchParams.get('missing_assets');

                let query = `SELECT s.*,
                    (SELECT COUNT(*) FROM sponsor_benefits WHERE sponsor_id=s.id AND status='completed') as completed_benefits,
                    (SELECT COUNT(*) FROM sponsor_benefits WHERE sponsor_id=s.id) as total_benefits,
                    (SELECT COUNT(*) FROM sponsor_event_tracking WHERE sponsor_id=s.id AND status NOT IN ('completed','waived','not_applicable')) as open_tasks
                FROM sponsors s WHERE s.active_2026=1`;
                const binds = [];

                if (level) { query += ' AND s.sponsor_level=?'; binds.push(level); }
                if (q) { query += ' AND (s.sponsor_name LIKE ? OR s.primary_contact_email LIKE ?)'; binds.push(`%${q}%`, `%${q}%`); }
                query += ' ORDER BY CASE s.sponsor_level WHEN "diamond" THEN 1 WHEN "platinum" THEN 2 WHEN "gold" THEN 3 WHEN "silver" THEN 4 WHEN "bronze" THEN 5 END, s.sponsor_name';

                const stmt = DB.prepare(query);
                const { results } = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
                return json({ sponsors: results });
            }

            // Sponsor Detail
            let m = matchGet(method, path, '/api/sponsors/:id');
            if (m) {
                const id = parseInt(m.id);
                const sponsor = await DB.prepare('SELECT * FROM sponsors WHERE id=?').bind(id).first();
                if (!sponsor) return json({ error: 'Not found' }, 404);

                const { results: benefits } = await DB.prepare('SELECT * FROM sponsor_benefits WHERE sponsor_id=? ORDER BY benefit_name').bind(id).all();
                const { results: events } = await DB.prepare(`
                    SELECT set1.*, e.event_name, e.event_type, e.event_date, e.month_label
                    FROM sponsor_event_tracking set1
                    JOIN events e ON set1.event_id = e.id
                    WHERE set1.sponsor_id=?
                    ORDER BY e.event_date
                `).bind(id).all();
                const { results: notes } = await DB.prepare('SELECT * FROM sponsor_notes WHERE sponsor_id=? ORDER BY created_at DESC').bind(id).all();
                const { results: assets } = await DB.prepare('SELECT * FROM sponsor_assets WHERE sponsor_id=? ORDER BY created_at DESC').bind(id).all();
                const { results: placements } = await DB.prepare('SELECT * FROM recurring_placement_checks WHERE sponsor_id=? ORDER BY placement_type').bind(id).all();
                const { results: emailHistory } = await DB.prepare('SELECT el.*, e.event_name FROM email_log el LEFT JOIN events e ON el.event_id=e.id WHERE el.sponsor_id=? ORDER BY el.sent_at DESC').bind(id).all();

                return json({ sponsor, benefits, events, notes, assets, placements, emailHistory });
            }

            // Create Sponsor
            if (matchPost(method, path, '/api/sponsors')) {
                const body = await request.json();
                const now = new Date().toISOString();
                const result = await DB.prepare(`
                    INSERT INTO sponsors (sponsor_name, sponsor_level, primary_contact_email, primary_contact_name, active_2026, notes_general, created_at, updated_at)
                    VALUES (?, ?, ?, ?, 1, ?, ?, ?)
                `).bind(body.sponsor_name, body.sponsor_level, body.primary_contact_email || null, body.primary_contact_name || null, body.notes_general || null, now, now).run();

                const sponsorId = result.meta.last_row_id;

                // Auto-create benefits from level template
                const { results: templates } = await DB.prepare('SELECT * FROM sponsor_level_benefits WHERE sponsor_level=? AND active=1 ORDER BY sort_order').bind(body.sponsor_level).all();
                for (const t of templates) {
                    await DB.prepare(`INSERT INTO sponsor_benefits (sponsor_id, benefit_code, benefit_name, benefit_type, included_by_level, status) VALUES (?,?,?,?,1,'not_started')`)
                        .bind(sponsorId, t.benefit_code, t.benefit_name, t.benefit_type).run();
                }

                // Auto-create recurring placement checks
                const placementTypes = [
                    { type: 'banner', label: 'Logo/Name on Annual Banner' },
                    { type: 'magazine', label: 'Logo/Name in Magazine' },
                    { type: 'mp_page', label: 'Logo/Name on MP Page' },
                    { type: 'lobby', label: ['diamond','platinum'].includes(body.sponsor_level) ? 'Logo in Front Lobby' : 'Logo on Front Lobby Loop' }
                ];
                for (const p of placementTypes) {
                    await DB.prepare('INSERT INTO recurring_placement_checks (sponsor_id, placement_type, placement_label, status) VALUES (?,?,?,?)')
                        .bind(sponsorId, p.type, p.label, 'pending').run();
                }

                return json({ success: true, id: sponsorId });
            }

            // Update Sponsor
            m = matchPut(method, path, '/api/sponsors/:id');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const fields = [];
                const vals = [];
                for (const key of ['sponsor_name','sponsor_level','primary_contact_email','primary_contact_name','active_2026','notes_general']) {
                    if (body[key] !== undefined) { fields.push(`${key}=?`); vals.push(body[key]); }
                }
                fields.push("updated_at=datetime('now')");
                vals.push(id);
                await DB.prepare(`UPDATE sponsors SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // EVENTS
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/events')) {
                const eventType = url.searchParams.get('type');
                let query = `SELECT e.*,
                    (SELECT COUNT(*) FROM sponsor_event_tracking WHERE event_id=e.id) as total_tracking,
                    (SELECT COUNT(*) FROM sponsor_event_tracking WHERE event_id=e.id AND status IN ('claimed','completed','ready')) as claimed_count,
                    (SELECT COUNT(*) FROM sponsor_event_tracking WHERE event_id=e.id AND status='completed') as completed_count
                FROM events e WHERE 1=1`;
                const binds = [];
                if (eventType) { query += ' AND e.event_type=?'; binds.push(eventType); }
                query += ' ORDER BY e.event_date';
                const stmt = DB.prepare(query);
                const { results } = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
                return json({ events: results });
            }

            m = matchPut(method, path, '/api/events/:id');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const fields = [];
                const vals = [];
                for (const key of ['event_name','event_date','start_time','end_time','month_label','capacity_mode','max_claims','is_active','notes']) {
                    if (body[key] !== undefined) { fields.push(`${key}=?`); vals.push(body[key]); }
                }
                fields.push("updated_at=datetime('now')");
                vals.push(id);
                await DB.prepare(`UPDATE events SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();

                // If event date changed, recalculate reminder dates
                if (body.event_date) {
                    const settings = await DB.prepare("SELECT setting_value_json FROM settings WHERE setting_key='reminder_intervals'").first();
                    const intervals = settings ? JSON.parse(settings.setting_value_json) : { first: 45, second: 21, final: 7 };
                    await DB.prepare(`
                        UPDATE sponsor_event_tracking SET
                            first_reminder_due = date(?, '-' || ? || ' days'),
                            second_reminder_due = date(?, '-' || ? || ' days'),
                            final_reminder_due = date(?, '-' || ? || ' days'),
                            updated_at = datetime('now')
                        WHERE event_id = ?
                    `).bind(body.event_date, intervals.first, body.event_date, intervals.second, body.event_date, intervals.final, id).run();
                }

                return json({ success: true });
            }

            // Event claims
            m = matchGet(method, path, '/api/events/:id/claims');
            if (m) {
                const eventId = parseInt(m.id);
                const { results } = await DB.prepare(`
                    SELECT set1.*, s.sponsor_name, s.sponsor_level, s.primary_contact_email
                    FROM sponsor_event_tracking set1
                    JOIN sponsors s ON set1.sponsor_id = s.id
                    WHERE set1.event_id = ?
                `).bind(eventId).all();
                return json({ claims: results });
            }

            m = matchPost(method, path, '/api/events/:id/claims');
            if (m) {
                const eventId = parseInt(m.id);
                const body = await request.json();

                // Check capacity
                const event = await DB.prepare('SELECT * FROM events WHERE id=?').bind(eventId).first();
                if (!event) return json({ error: 'Event not found' }, 404);

                if (event.max_claims) {
                    const current = await DB.prepare(`SELECT COUNT(*) as c FROM sponsor_event_tracking WHERE event_id=? AND status IN ('claimed','ready','completed','waiting_assets')`).bind(eventId).first();
                    if (current.c >= event.max_claims && !body.admin_override) {
                        return json({ error: 'Event at capacity. Use admin_override=true with a note to override.' }, 400);
                    }
                }

                const now = new Date().toISOString();
                await DB.prepare(`
                    INSERT INTO sponsor_event_tracking (sponsor_id, event_id, benefit_code, status, outreach_required, notes_internal, created_at, updated_at)
                    VALUES (?, ?, ?, 'claimed', 0, ?, ?, ?)
                `).bind(body.sponsor_id, eventId, body.benefit_code || null, body.notes || null, now, now).run();

                return json({ success: true });
            }

            // ══════════════════════════════════════
            // REMINDER QUEUE
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/reminders')) {
                const today = new Date().toISOString().split('T')[0];
                const scope = url.searchParams.get('scope') || 'all'; // all, today, upcoming, overdue

                let dateFilter = '';
                if (scope === 'today') {
                    dateFilter = `AND (
                        (set1.first_reminder_due = '${today}' AND set1.email_sent_1=0)
                        OR (set1.second_reminder_due = '${today}' AND set1.email_sent_2=0 AND set1.email_sent_1=1)
                        OR (set1.final_reminder_due = '${today}' AND set1.email_sent_3=0 AND set1.email_sent_2=1)
                    )`;
                } else if (scope === 'overdue') {
                    dateFilter = `AND (
                        (set1.first_reminder_due < '${today}' AND set1.email_sent_1=0)
                        OR (set1.second_reminder_due < '${today}' AND set1.email_sent_2=0 AND set1.email_sent_1=1)
                        OR (set1.final_reminder_due < '${today}' AND set1.email_sent_3=0 AND set1.email_sent_2=1)
                    )`;
                } else if (scope === 'upcoming') {
                    dateFilter = `AND (
                        (set1.first_reminder_due BETWEEN '${today}' AND date('${today}', '+14 days') AND set1.email_sent_1=0)
                        OR (set1.second_reminder_due BETWEEN '${today}' AND date('${today}', '+14 days') AND set1.email_sent_2=0 AND set1.email_sent_1=1)
                        OR (set1.final_reminder_due BETWEEN '${today}' AND date('${today}', '+14 days') AND set1.email_sent_3=0 AND set1.email_sent_2=1)
                    )`;
                }

                const { results } = await DB.prepare(`
                    SELECT set1.*, s.sponsor_name, s.sponsor_level, s.primary_contact_email,
                        e.event_name, e.event_type, e.event_date, e.month_label
                    FROM sponsor_event_tracking set1
                    JOIN sponsors s ON set1.sponsor_id = s.id
                    JOIN events e ON set1.event_id = e.id
                    WHERE set1.completed = 0
                    AND set1.outreach_required = 1
                    ${dateFilter}
                    ORDER BY COALESCE(set1.first_reminder_due, set1.second_reminder_due, set1.final_reminder_due)
                `).all();
                return json({ reminders: results });
            }

            // Mark reminder sent
            m = matchPost(method, path, '/api/reminders/:id/sent');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const now = new Date().toISOString();
                const rec = await DB.prepare('SELECT * FROM sponsor_event_tracking WHERE id=?').bind(id).first();
                if (!rec) return json({ error: 'Not found' }, 404);

                let update = '';
                if (!rec.email_sent_1) {
                    update = `email_sent_1=1, email_sent_1_at='${now}', status='sent_waiting_response'`;
                } else if (!rec.email_sent_2) {
                    update = `email_sent_2=1, email_sent_2_at='${now}', status='sent_waiting_response'`;
                } else if (!rec.email_sent_3) {
                    update = `email_sent_3=1, email_sent_3_at='${now}', status='sent_waiting_response'`;
                }
                if (update) {
                    await DB.prepare(`UPDATE sponsor_event_tracking SET ${update}, updated_at=datetime('now'), updated_by=? WHERE id=?`)
                        .bind(body.sent_by || 'admin', id).run();
                }

                // Log in email_log
                if (body.email_to && body.subject) {
                    await DB.prepare(`INSERT INTO email_log (sponsor_id, event_id, template_id, email_to, subject_rendered, body_rendered, sent_manually, sent_at, sent_by)
                        VALUES (?,?,?,?,?,?,1,?,?)`)
                        .bind(rec.sponsor_id, rec.event_id, body.template_id || null, body.email_to, body.subject, body.body || '', now, body.sent_by || 'admin').run();
                }

                return json({ success: true });
            }

            // Mark responded
            m = matchPost(method, path, '/api/reminders/:id/responded');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const now = new Date().toISOString();
                await DB.prepare(`UPDATE sponsor_event_tracking SET responded=1, responded_at=?, response_status=?, status='responded', notes_from_sponsor=?, updated_at=datetime('now'), updated_by=? WHERE id=?`)
                    .bind(now, body.response_status || 'confirmed', body.notes || null, body.updated_by || 'admin', id).run();
                return json({ success: true });
            }

            // Snooze reminder
            m = matchPost(method, path, '/api/reminders/:id/snooze');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const days = body.days || 3;
                const rec = await DB.prepare('SELECT * FROM sponsor_event_tracking WHERE id=?').bind(id).first();
                if (!rec) return json({ error: 'Not found' }, 404);

                if (!rec.email_sent_1) {
                    await DB.prepare(`UPDATE sponsor_event_tracking SET first_reminder_due=date(first_reminder_due, '+' || ? || ' days'), updated_at=datetime('now') WHERE id=?`).bind(days, id).run();
                } else if (!rec.email_sent_2) {
                    await DB.prepare(`UPDATE sponsor_event_tracking SET second_reminder_due=date(second_reminder_due, '+' || ? || ' days'), updated_at=datetime('now') WHERE id=?`).bind(days, id).run();
                } else if (!rec.email_sent_3) {
                    await DB.prepare(`UPDATE sponsor_event_tracking SET final_reminder_due=date(final_reminder_due, '+' || ? || ' days'), updated_at=datetime('now') WHERE id=?`).bind(days, id).run();
                }
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // TEMPLATES
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/templates')) {
                const { results } = await DB.prepare('SELECT * FROM email_templates ORDER BY template_type, template_name').all();
                return json({ templates: results });
            }

            m = matchPut(method, path, '/api/templates/:id');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const fields = [];
                const vals = [];
                for (const key of ['template_name','template_type','event_type','sponsor_level','subject_template','body_template','is_active']) {
                    if (body[key] !== undefined) { fields.push(`${key}=?`); vals.push(body[key]); }
                }
                fields.push("updated_at=datetime('now')");
                vals.push(id);
                await DB.prepare(`UPDATE email_templates SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
                return json({ success: true });
            }

            if (matchPost(method, path, '/api/templates')) {
                const body = await request.json();
                await DB.prepare(`INSERT INTO email_templates (template_key, template_name, template_type, event_type, sponsor_level, subject_template, body_template, is_active) VALUES (?,?,?,?,?,?,?,1)`)
                    .bind(body.template_key, body.template_name, body.template_type, body.event_type || null, body.sponsor_level || null, body.subject_template, body.body_template).run();
                return json({ success: true });
            }

            // Template preview
            m = matchPost(method, path, '/api/templates/:id/preview');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const template = await DB.prepare('SELECT * FROM email_templates WHERE id=?').bind(id).first();
                if (!template) return json({ error: 'Template not found' }, 404);

                let subject = template.subject_template;
                let bodyText = template.body_template;
                const vars = body.variables || {};

                // Replace merge fields
                for (const [key, val] of Object.entries(vars)) {
                    const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                    subject = subject.replace(re, val);
                    bodyText = bodyText.replace(re, val);
                }

                return json({ subject, body: bodyText, template });
            }

            // ══════════════════════════════════════
            // SPONSOR NOTES
            // ══════════════════════════════════════
            m = matchPost(method, path, '/api/sponsors/:id/notes');
            if (m) {
                const sponsorId = parseInt(m.id);
                const body = await request.json();
                await DB.prepare('INSERT INTO sponsor_notes (sponsor_id, event_id, note_body, created_by) VALUES (?,?,?,?)')
                    .bind(sponsorId, body.event_id || null, body.note_body, body.created_by || 'admin').run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // SPONSOR BENEFITS
            // ══════════════════════════════════════
            m = matchGet(method, path, '/api/sponsors/:id/benefits');
            if (m) {
                const sponsorId = parseInt(m.id);
                const { results } = await DB.prepare('SELECT * FROM sponsor_benefits WHERE sponsor_id=? ORDER BY benefit_name').bind(sponsorId).all();
                return json({ benefits: results });
            }

            m = matchPut(method, path, '/api/benefits/:id');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const fields = [];
                const vals = [];
                for (const key of ['status','notes','date_completed','updated_by']) {
                    if (body[key] !== undefined) { fields.push(`${key}=?`); vals.push(body[key]); }
                }
                fields.push("updated_at=datetime('now')");
                vals.push(id);
                await DB.prepare(`UPDATE sponsor_benefits SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // RECURRING PLACEMENT CHECKS
            // ══════════════════════════════════════
            m = matchGet(method, path, '/api/sponsors/:id/placements');
            if (m) {
                const sponsorId = parseInt(m.id);
                const { results } = await DB.prepare('SELECT * FROM recurring_placement_checks WHERE sponsor_id=? ORDER BY placement_type').bind(sponsorId).all();
                return json({ placements: results });
            }

            m = matchPut(method, path, '/api/placements/:id');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const fields = [];
                const vals = [];
                for (const key of ['status','checked_at','checked_by','notes']) {
                    if (body[key] !== undefined) { fields.push(`${key}=?`); vals.push(body[key]); }
                }
                fields.push("updated_at=datetime('now')");
                vals.push(id);
                await DB.prepare(`UPDATE recurring_placement_checks SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // SPONSOR ASSETS
            // ══════════════════════════════════════
            m = matchGet(method, path, '/api/sponsors/:id/assets');
            if (m) {
                const sponsorId = parseInt(m.id);
                const { results } = await DB.prepare('SELECT sa.*, e.event_name FROM sponsor_assets sa LEFT JOIN events e ON sa.event_id=e.id WHERE sa.sponsor_id=? ORDER BY sa.created_at DESC').bind(sponsorId).all();
                return json({ assets: results });
            }

            m = matchPost(method, path, '/api/sponsors/:id/assets');
            if (m) {
                const sponsorId = parseInt(m.id);
                const body = await request.json();
                await DB.prepare(`INSERT INTO sponsor_assets (sponsor_id, event_id, asset_type, asset_url, clickthrough_url, notes) VALUES (?,?,?,?,?,?)`)
                    .bind(sponsorId, body.event_id || null, body.asset_type, body.asset_url || null, body.clickthrough_url || null, body.notes || null).run();
                return json({ success: true });
            }

            m = matchPut(method, path, '/api/assets/:id');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const fields = [];
                const vals = [];
                for (const key of ['asset_url','clickthrough_url','received','received_at','approved','approved_at','notes']) {
                    if (body[key] !== undefined) { fields.push(`${key}=?`); vals.push(body[key]); }
                }
                fields.push("updated_at=datetime('now')");
                vals.push(id);
                await DB.prepare(`UPDATE sponsor_assets SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // EMAIL LOG
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/email-log')) {
                const sponsorId = url.searchParams.get('sponsor_id');
                let query = `SELECT el.*, s.sponsor_name, e.event_name
                    FROM email_log el
                    JOIN sponsors s ON el.sponsor_id=s.id
                    LEFT JOIN events e ON el.event_id=e.id
                    WHERE 1=1`;
                const binds = [];
                if (sponsorId) { query += ' AND el.sponsor_id=?'; binds.push(parseInt(sponsorId)); }
                query += ' ORDER BY el.sent_at DESC LIMIT 100';
                const stmt = DB.prepare(query);
                const { results } = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
                return json({ logs: results });
            }

            if (matchPost(method, path, '/api/email-log')) {
                const body = await request.json();
                const now = new Date().toISOString();
                await DB.prepare(`INSERT INTO email_log (sponsor_id, event_id, template_id, email_to, subject_rendered, body_rendered, sent_manually, sent_at, sent_by, notes)
                    VALUES (?,?,?,?,?,?,1,?,?,?)`)
                    .bind(body.sponsor_id, body.event_id || null, body.template_id || null, body.email_to, body.subject || '', body.body || '', now, body.sent_by || 'admin', body.notes || null).run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // SETTINGS
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/settings')) {
                const { results } = await DB.prepare('SELECT * FROM settings ORDER BY setting_key').all();
                return json({ settings: results });
            }

            m = matchPut(method, path, '/api/settings/:key');
            if (m) {
                const key = m.key;
                const body = await request.json();
                await DB.prepare(`UPDATE settings SET setting_value_json=?, updated_at=datetime('now') WHERE setting_key=?`)
                    .bind(JSON.stringify(body.value), key).run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // UPDATE CLAIM STATUS (sponsor_event_tracking)
            // ══════════════════════════════════════
            m = matchPut(method, path, '/api/claims/:id');
            if (m) {
                const id = parseInt(m.id);
                const body = await request.json();
                const fields = [];
                const vals = [];
                for (const key of ['status','completed','completed_at','notes_internal','notes_from_sponsor','responded','responded_at','response_status','updated_by']) {
                    if (body[key] !== undefined) { fields.push(`${key}=?`); vals.push(body[key]); }
                }
                fields.push("updated_at=datetime('now')");
                vals.push(id);
                await DB.prepare(`UPDATE sponsor_event_tracking SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
                return json({ success: true });
            }

            // ══════════════════════════════════════
            // LEVEL BENEFITS (templates)
            // ══════════════════════════════════════
            if (matchGet(method, path, '/api/level-benefits')) {
                const level = url.searchParams.get('level');
                let query = 'SELECT * FROM sponsor_level_benefits WHERE active=1';
                const binds = [];
                if (level) { query += ' AND sponsor_level=?'; binds.push(level); }
                query += ' ORDER BY sponsor_level, sort_order';
                const stmt = DB.prepare(query);
                const { results } = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
                return json({ benefits: results });
            }

            return json({ error: 'Not Found' }, 404);

        } catch (err) {
            console.error('Worker error:', err);
            return json({ error: err.message, stack: err.stack }, 500);
        }
    }
};
