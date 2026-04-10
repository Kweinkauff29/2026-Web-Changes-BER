/**
 * CCRE Checklist Dashboard - Cloudflare Worker
 * Member Experience Onboarding System
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
}

function htmlResponse(html) {
    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Generate a random public token
function generateToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 24; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

// Expand workflow template into dated tasks for a member
async function expandWorkflow(db, memberId, memberType, startDate) {
    let templateKey = 'realtor_onboarding';
    if (memberType === 'affiliate') templateKey = 'affiliate_onboarding';
    else if (memberType === 'broker') templateKey = 'broker_onboarding';
    
    const { results: steps } = await db.prepare(
        'SELECT * FROM workflow_templates WHERE template_key = ? AND is_active = 1 ORDER BY sort_order'
    ).bind(templateKey).all();

    const base = new Date(startDate);
    for (const step of steps) {
        const due = new Date(base);
        due.setDate(due.getDate() + step.day_offset);
        const dueStr = due.toISOString().split('T')[0];

        await db.prepare(`
            INSERT OR IGNORE INTO member_tasks (member_id, step_key, title, description, due_date, owner, state)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `).bind(memberId, step.step_key, step.title, step.description, dueStr, step.default_owner).run();
    }
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // ── MEMBER PUBLIC API ──
            if (request.method === 'GET' && path.startsWith('/api/member/')) {
                const token = path.replace('/api/member/', '');
                const member = await env.DB.prepare('SELECT * FROM members WHERE public_token = ?').bind(token).first();
                if (!member) return jsonResponse({ error: 'Not found' }, 404);

                const { results: tasks } = await env.DB.prepare(
                    'SELECT id, step_key, title, description, due_date, completed_at, state FROM member_tasks WHERE member_id = ? ORDER BY due_date, id'
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

            // ── MEMBER CHECKLIST PAGE ──
            if (request.method === 'GET' && path.startsWith('/checklist/')) {
                const token = path.replace('/checklist/', '');
                const { memberPageHTML } = await import('./pages/member.js');
                return htmlResponse(memberPageHTML(token));
            }

            // ── ADMIN PAGE ──
            if (request.method === 'GET' && path === '/admin') {
                const { adminPageHTML } = await import('./pages/admin.js');
                return htmlResponse(adminPageHTML());
            }

            // ── ADMIN API: List members ──
            if (request.method === 'GET' && path === '/api/admin/members') {
                const status = url.searchParams.get('status');
                const type = url.searchParams.get('type');
                const search = url.searchParams.get('q');

                let query = `SELECT m.*, 
                    (SELECT COUNT(*) FROM member_tasks WHERE member_id = m.id AND state = 'complete') as completed_tasks,
                    (SELECT COUNT(*) FROM member_tasks WHERE member_id = m.id) as total_tasks,
                    (SELECT COUNT(*) FROM member_tasks WHERE member_id = m.id AND state = 'pending' AND due_date < date('now')) as overdue_tasks
                    FROM members m WHERE 1=1`;
                const bindings = [];

                if (status) { query += ' AND m.status = ?'; bindings.push(status); }
                if (type) { query += ' AND m.member_type = ?'; bindings.push(type); }
                if (search) { query += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ?)'; bindings.push(`%${search}%`, `%${search}%`, `%${search}%`); }
                query += ' ORDER BY m.created_at DESC';

                const stmt = env.DB.prepare(query);
                const { results } = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
                return jsonResponse({ members: results });
            }

            // ── ADMIN API: Member detail ──
            if (request.method === 'GET' && path.match(/^\/api\/admin\/members\/\d+$/)) {
                const id = parseInt(path.split('/').pop());
                const member = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).first();
                if (!member) return jsonResponse({ error: 'Not found' }, 404);

                const { results: tasks } = await env.DB.prepare(
                    'SELECT * FROM member_tasks WHERE member_id = ? ORDER BY due_date, id'
                ).bind(id).all();
                const { results: touchpoints } = await env.DB.prepare(
                    'SELECT * FROM touchpoints WHERE member_id = ? ORDER BY occurred_at DESC'
                ).bind(id).all();
                const { results: notes } = await env.DB.prepare(
                    'SELECT * FROM member_notes WHERE member_id = ? ORDER BY created_at DESC'
                ).bind(id).all();

                return jsonResponse({ member, tasks, touchpoints, notes });
            }

            if (request.method === 'DELETE' && path.match(/^\/api\/admin\/members\/\d+$/)) {
                const id = parseInt(path.split('/').pop());
                
                // Use a transaction or sequential deletes to clean up
                await env.DB.prepare('DELETE FROM member_tasks WHERE member_id = ?').bind(id).run();
                await env.DB.prepare('DELETE FROM member_notes WHERE member_id = ?').bind(id).run();
                await env.DB.prepare('DELETE FROM touchpoints WHERE member_id = ?').bind(id).run();
                await env.DB.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
                
                return jsonResponse({ success: true });
            }

            // ── ADMIN API: Global Calendar ──
            if (request.method === 'GET' && path === '/api/admin/calendar') {
                const { results: events } = await env.DB.prepare(`
                    SELECT t.*, m.first_name, m.last_name, m.member_type 
                    FROM member_tasks t
                    JOIN members m ON t.member_id = m.id
                    WHERE t.state != 'skipped'
                    ORDER BY t.due_date ASC
                `).all();
                return jsonResponse({ events });
            }

            // ── ADMIN API: Today's Tasks ──
            if (request.method === 'GET' && path === '/api/admin/today') {
                const today = new Date().toISOString().split('T')[0];
                const { results: tasks } = await env.DB.prepare(`
                    SELECT t.*, m.first_name, m.last_name 
                    FROM member_tasks t
                    JOIN members m ON t.member_id = m.id
                    WHERE t.due_date = ? AND t.state = 'pending'
                `).bind(today).all();
                return jsonResponse({ tasks });
            }

            // ── ADMIN API: Template Management ──
            if (request.method === 'GET' && path === '/api/admin/templates') {
                const { results: templates } = await env.DB.prepare('SELECT * FROM workflow_templates WHERE is_active = 1 ORDER BY member_type, sort_order').all();
                return jsonResponse({ templates });
            }

            // Create new template step
            if (request.method === 'POST' && path === '/api/admin/templates') {
                const body = await request.json();
                const { member_type, title, day_offset, description } = body;
                const templateKey = member_type + '_onboarding';
                const stepKey = 'step_' + Date.now();
                
                // Get max sort_order for this type
                const maxOrder = await env.DB.prepare('SELECT MAX(sort_order) as m FROM workflow_templates WHERE member_type = ?')
                    .bind(member_type).first();
                const nextOrder = (maxOrder?.m || 0) + 1;

                await env.DB.prepare(`
                    INSERT INTO workflow_templates (template_key, member_type, step_key, title, description, day_offset, sort_order)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).bind(templateKey, member_type, stepKey, title || 'New Step', description || '', day_offset || 0, nextOrder).run();
                
                return jsonResponse({ success: true });
            }

            // Delete template step
            if (request.method === 'DELETE' && path.match(/^\/api\/admin\/templates\/\d+$/)) {
                const id = parseInt(path.split('/').pop());
                await env.DB.prepare('DELETE FROM workflow_templates WHERE id = ?').bind(id).run();
                return jsonResponse({ success: true });
            }

            // Update template step (including sort_order)
            if (request.method === 'POST' && path.match(/^\/api\/admin\/templates\/\d+$/)) {
                const id = parseInt(path.split('/').pop());
                const body = await request.json();
                const updates = [];
                const binds = [];

                if (body.title !== undefined) { updates.push('title = ?'); binds.push(body.title); }
                if (body.description !== undefined) { updates.push('description = ?'); binds.push(body.description); }
                if (body.day_offset !== undefined) { updates.push('day_offset = ?'); binds.push(body.day_offset); }
                if (body.sort_order !== undefined) { updates.push('sort_order = ?'); binds.push(body.sort_order); }
                
                if (updates.length > 0) {
                    updates.push('updated_at = datetime(\'now\')');
                    const query = `UPDATE workflow_templates SET ${updates.join(', ')} WHERE id = ?`;
                    binds.push(id);
                    await env.DB.prepare(query).bind(...binds).run();
                }
                
                return jsonResponse({ success: true });
            }

            // ── ADMIN API: Reschedule Task ──
            if (request.method === 'POST' && path.match(/^\/api\/admin\/tasks\/\d+\/reschedule$/)) {
                const parts = path.split('/');
                const id = parseInt(parts[parts.length - 2]);
                const { due_date } = await request.json();
                await env.DB.prepare('UPDATE member_tasks SET due_date = ?, updated_at = datetime(\'now\') WHERE id = ?')
                    .bind(due_date, id).run();
                return jsonResponse({ success: true });
            }

            // ── ADMIN API: Add Note ──
            if (request.method === 'POST' && path.match(/^\/api\/admin\/members\/\d+\/notes$/)) {
                const member_id = parseInt(path.split('/').pop());
                const { body, author } = await request.json();
                await env.DB.prepare('INSERT INTO member_notes (member_id, body, author) VALUES (?, ?, ?)')
                    .bind(member_id, body, author || 'Admin').run();
                return jsonResponse({ success: true });
            }

            // ── ADMIN API: Create member ──
            if (request.method === 'POST' && path === '/api/admin/members') {
                const body = await request.json();
                const token = generateToken();
                const now = new Date().toISOString();
                const startDate = body.start_date || now.split('T')[0];

                const result = await env.DB.prepare(`
                    INSERT INTO members (growthzone_contact_id, public_token, first_name, last_name, email, phone, organization, member_type, status, start_date, assigned_owner, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
                `).bind(
                    body.growthzone_contact_id || null, token,
                    body.first_name || '', body.last_name || '',
                    body.email || null, body.phone || null, body.organization || null,
                    body.member_type || 'realtor', startDate,
                    body.assigned_owner || null, now, now
                ).run();

                const memberId = result.meta.last_row_id;
                await expandWorkflow(env.DB, memberId, body.member_type || 'realtor', startDate);

                return jsonResponse({ success: true, id: memberId, public_token: token });
            }

            // ── ADMIN API: Update task ──
            if (request.method === 'POST' && path.match(/^\/api\/admin\/tasks\/\d+$/)) {
                const taskId = parseInt(path.split('/').pop());
                const body = await request.json();
                const now = new Date().toISOString();

                const updates = [];
                const binds = [];

                if (body.state !== undefined) { updates.push('state = ?'); binds.push(body.state); }
                if (body.state === 'complete') { updates.push('completed_at = ?'); binds.push(now); }
                if (body.due_date !== undefined) { updates.push('due_date = ?'); binds.push(body.due_date); }
                if (body.notes_summary !== undefined) { updates.push('notes_summary = ?'); binds.push(body.notes_summary); }
                if (body.owner !== undefined) { updates.push('owner = ?'); binds.push(body.owner); }
                updates.push('updated_at = ?'); binds.push(now);
                binds.push(taskId);

                await env.DB.prepare(`UPDATE member_tasks SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
                return jsonResponse({ success: true });
            }

            // ── ADMIN API: Log touchpoint ──
            if (request.method === 'POST' && path === '/api/admin/touchpoints') {
                const body = await request.json();
                await env.DB.prepare(`
                    INSERT INTO touchpoints (member_id, task_id, category, occurred_at, outcome, staff_user, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    body.member_id, body.task_id || null,
                    body.category, body.occurred_at || new Date().toISOString(),
                    body.outcome || null, body.staff_user || null, body.note || null
                ).run();
                return jsonResponse({ success: true });
            }

            // ── ADMIN API: Get touchpoints (reporting) ──
            if (request.method === 'GET' && path === '/api/admin/touchpoints') {
                const month = url.searchParams.get('month'); // YYYY-MM
                let query = 'SELECT t.*, m.first_name, m.last_name FROM touchpoints t JOIN members m ON t.member_id = m.id';
                const binds = [];

                if (month) {
                    query += " WHERE t.occurred_at LIKE ?";
                    binds.push(month + '%');
                }
                query += ' ORDER BY t.occurred_at DESC';

                const stmt = env.DB.prepare(query);
                const { results } = binds.length > 0 ? await stmt.bind(...binds).all() : await stmt.all();

                // Aggregate by category
                const summary = {};
                results.forEach(tp => {
                    summary[tp.category] = (summary[tp.category] || 0) + 1;
                });

                return jsonResponse({ touchpoints: results, summary, total: results.length });
            }

            // ── ADMIN API: Add note ──
            if (request.method === 'POST' && path === '/api/admin/notes') {
                const body = await request.json();
                await env.DB.prepare(`
                    INSERT INTO member_notes (member_id, note_type, body, author)
                    VALUES (?, ?, ?, ?)
                `).bind(body.member_id, body.note_type || 'general', body.body, body.author || null).run();
                return jsonResponse({ success: true });
            }

            // ── ADMIN API: Dashboard stats ──
            if (request.method === 'GET' && path === '/api/admin/stats') {
                const totalMembers = await env.DB.prepare('SELECT COUNT(*) as c FROM members').first();
                const activeMembers = await env.DB.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'active'").first();
                const overdueTasks = await env.DB.prepare("SELECT COUNT(*) as c FROM member_tasks WHERE state = 'pending' AND due_date < date('now')").first();
                const dueTodayTasks = await env.DB.prepare("SELECT COUNT(*) as c FROM member_tasks WHERE state = 'pending' AND due_date = date('now')").first();
                const realtorCount = await env.DB.prepare("SELECT COUNT(*) as c FROM members WHERE member_type = 'realtor'").first();
                const affiliateCount = await env.DB.prepare("SELECT COUNT(*) as c FROM members WHERE member_type = 'affiliate'").first();
                const brokerCount = await env.DB.prepare("SELECT COUNT(*) as c FROM members WHERE member_type = 'broker'").first();

                return jsonResponse({
                    totalMembers: totalMembers.c,
                    activeMembers: activeMembers.c,
                    overdueTasks: overdueTasks.c,
                    dueTodayTasks: dueTodayTasks.c,
                    realtorCount: realtorCount.c,
                    affiliateCount: affiliateCount.c,
                    brokerCount: brokerCount.c
                });
            }

            // ── ADMIN API: Executive Engagement Stats ──
            if (request.method === 'GET' && path === '/api/admin/engagement-report') {
                const results = await env.DB.prepare(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN engagement_score >= 80 THEN 1 ELSE 0 END) as raving_fans,
                        SUM(CASE WHEN engagement_score >= 60 AND engagement_score < 80 THEN 1 ELSE 0 END) as engaged,
                        SUM(CASE WHEN engagement_score >= 40 AND engagement_score < 60 THEN 1 ELSE 0 END) as passive,
                        SUM(CASE WHEN engagement_score < 40 THEN 1 ELSE 0 END) as at_risk
                    FROM members
                `).first();

                // Monthly metrics (simplified for current data)
                const monthStart = new Date();
                monthStart.setDate(1);
                const monthStr = monthStart.toISOString().split('T')[0];

                const monthly = await env.DB.prepare(`
                    SELECT 
                        COUNT(*) as new_members,
                        SUM(CASE WHEN member_type = 'realtor' THEN 1 ELSE 0 END) as realtors,
                        SUM(CASE WHEN member_type = 'affiliate' THEN 1 ELSE 0 END) as affiliates,
                        SUM(CASE WHEN member_type = 'broker' THEN 1 ELSE 0 END) as brokers
                    FROM members 
                    WHERE created_at >= ?
                `).bind(monthStr).first();

                return jsonResponse({
                    momentum: results,
                    monthly: monthly
                });
            }

            // ── ADMIN API: Staff Scorecard ──
            if (request.method === 'GET' && path === '/api/admin/staff-scorecards') {
                const { results: scorecards } = await env.DB.prepare(`
                    SELECT 
                        staff_user,
                        category,
                        COUNT(*) as total_touchpoints,
                        COUNT(DISTINCT member_id) as members_reached
                    FROM touchpoints
                    GROUP BY staff_user, category
                `).all();
                return jsonResponse({ scorecards });
            }

            // ── ADMIN API: Log Engagement Action ──
            if (request.method === 'POST' && path.match(/^\/api\/admin\/members\/\d+\/actions$/)) {
                const memberId = parseInt(path.split('/').pop());
                const { action_type, points, metadata } = await request.json();
                
                await env.DB.prepare('INSERT INTO member_engagement_actions (member_id, action_type, points, metadata_json) VALUES (?, ?, ?, ?)')
                    .bind(memberId, action_type, points, JSON.stringify(metadata || {})).run();
                
                // Update member total score
                await env.DB.prepare(`
                    UPDATE members SET 
                        engagement_score = engagement_score + ?,
                        engagement_level = CASE 
                            WHEN engagement_score + ? >= 80 THEN 'Raving Fan'
                            WHEN engagement_score + ? >= 60 THEN 'Engaged'
                            WHEN engagement_score + ? >= 40 THEN 'Passive'
                            ELSE 'At Risk'
                        END,
                        updated_at = datetime('now')
                    WHERE id = ?
                `).bind(points, points, points, points, memberId).run();

                return jsonResponse({ success: true });
            }

            // ── GZ SYNC ──
            if (request.method === 'POST' && path === '/api/internal/sync') {
                return await performGZSync(env);
            }

            return jsonResponse({ error: 'Not Found' }, 404);

        } catch (err) {
            console.error('Worker error:', err);
            return jsonResponse({ error: err.message }, 500);
        }
    },

    async scheduled(event, env, ctx) {
        console.log('Cron triggered: GrowthZone sync');
        ctx.waitUntil(performGZSync(env));
    }
};

async function performGZSync(env) {
    if (!env.GROWTHZONE_API_KEY || !env.GROWTHZONE_BASE_URL) {
        return jsonResponse({ error: 'GrowthZone credentials not configured.' }, 500);
    }

    const SYNC_START_DATE = '2026-03-16';

    try {
        // Fetch active memberships from GrowthZone with expanded Contact info
        const syncUrl = `${env.GROWTHZONE_BASE_URL}/api/memberships/all?$top=500&$expand=Contact&$orderby=MembershipId desc`;
        
        const response = await fetch(syncUrl, {
            headers: {
                'Authorization': `ApiKey ${env.GROWTHZONE_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`GZ API Error: ${response.status} ${response.statusText}`, await response.text());
            return jsonResponse({ error: `GZ API Error: ${response.status} ${response.statusText}` }, 500);
        }

        const data = await response.json();
        const results = data.Results || data.results || [];

        // (Cleaned up for production)

        let imported = 0;
        let skipped = 0;

        for (const membership of results) {
            // Filter by active status in code since OData filter might be ignored
            if (membership.MembershipStatusTypeId !== 2) continue;

            const typeStr = (membership.Type || "").toUpperCase();
            const nameStr = (membership.Name || "");
            const contactId = membership.ContactId;
            const startDate = membership.StartDate ? membership.StartDate.split('T')[0] : new Date().toISOString().split('T')[0];

            // 0. Filter by configured sync start date
            if (startDate < SYNC_START_DATE) {
                continue;
            }

            // 1. Determine Member Type
            let memberType = null;
            if (typeStr.includes('REALTOR') || typeStr.includes('MLS')) {
                memberType = 'realtor';
            } else if (typeStr.includes('AFFILIATE')) {
                memberType = 'affiliate';
            }

            if (!memberType) {
                continue;
            }

            // 2. Check if already in DB
            const existing = await env.DB.prepare('SELECT id, email, phone FROM members WHERE growthzone_contact_id = ?').bind(contactId).first();
            
            // 3. ENRICH DATA (from expanded Contact property or fetch if needed)
            let email = existing ? existing.email : null;
            let phone = existing ? existing.phone : null;

            const contact = membership.Contact;
            if (contact) {
                email = email || contact.Email || contact.EmailAddress || contact.PrimaryEmail || null;
                phone = phone || contact.Phone || contact.PhoneNumber || contact.PrimaryPhone || null;
            }

            // Fallback enrichment if expand failed to provide data or for existing members missing it
            if (!email || !phone) {
                try {
                    // Try direct ID fetch first
                    const contactUrl = `${env.GROWTHZONE_BASE_URL}/api/contacts/${contactId}`;
                    let contactRes = await fetch(contactUrl, {
                        headers: { 'Authorization': `ApiKey ${env.GROWTHZONE_API_KEY}`, 'Accept': 'application/json' }
                    });
                    
                    let cData = null;
                    if (contactRes.ok) {
                        cData = await contactRes.json();
                    } else if (contactRes.status === 404) {
                        // TRY FILTER FALLBACK if direct ID fetch 404s
                        const filterUrl = `${env.GROWTHZONE_BASE_URL}/api/contacts?$filter=ContactId eq ${contactId}`;
                        const filterRes = await fetch(filterUrl, {
                            headers: { 'Authorization': `ApiKey ${env.GROWTHZONE_API_KEY}`, 'Accept': 'application/json' }
                        });
                        if (filterRes.ok) {
                            const fData = await filterRes.json();
                            const results = fData.Results || fData.results || [];
                            if (results.length > 0) cData = results[0];
                        }
                    }

                    if (cData) {
                        email = email || cData.Email || cData.EmailAddress || cData.PrimaryEmail || null;
                        phone = phone || cData.Phone || cData.PhoneNumber || cData.PrimaryPhone || null;
                    }
                } catch (ce) {
                    // Fail silently
                }
            }

            // Sync update if existing and we have new data
            if (existing && (email !== existing.email || phone !== existing.phone)) {
                await env.DB.prepare('UPDATE members SET email = ?, phone = ?, updated_at = datetime(\'now\') WHERE id = ?')
                    .bind(email, phone, existing.id).run();
            }

            if (existing) {
                skipped++;
                continue;
            }

            // 4. Name Parsing
            let firstName = '';
            let lastName = '';
            const parts = nameStr.trim().split(/\s+/);
            if (parts.length > 1) {
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            } else {
                firstName = nameStr;
            }

            // 5. Insert & Expand Workflow
            const token = generateToken();
            const now = new Date().toISOString();
            
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
        console.error('Sync Error:', e);
        return jsonResponse({ error: e.message }, 500);
    }
}
