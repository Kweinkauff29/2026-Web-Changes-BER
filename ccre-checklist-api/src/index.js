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
    const templateKey = memberType === 'affiliate' ? 'affiliate_onboarding' : 'realtor_onboarding';
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
                    'SELECT * FROM member_tasks WHERE member_id = ? ORDER BY due_date, sort_order, id'
                ).bind(id).all();
                const { results: touchpoints } = await env.DB.prepare(
                    'SELECT * FROM touchpoints WHERE member_id = ? ORDER BY occurred_at DESC'
                ).bind(id).all();
                const { results: notes } = await env.DB.prepare(
                    'SELECT * FROM member_notes WHERE member_id = ? ORDER BY created_at DESC'
                ).bind(id).all();

                return jsonResponse({ member, tasks, touchpoints, notes });
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

                return jsonResponse({
                    totalMembers: totalMembers.c,
                    activeMembers: activeMembers.c,
                    overdueTasks: overdueTasks.c,
                    dueTodayTasks: dueTodayTasks.c,
                    realtorCount: realtorCount.c,
                    affiliateCount: affiliateCount.c
                });
            }

            // ── GZ SYNC ──
            if (request.method === 'POST' && path === '/api/internal/sync') {
                if (!env.GROWTHZONE_API_KEY || !env.GROWTHZONE_BASE_URL) {
                    return jsonResponse({ error: 'GrowthZone credentials not configured in environment.' }, 500);
                }

                try {
                    // Fetch contacts from GrowthZone. Current tenant API has limited fields.
                    const response = await fetch(`${env.GROWTHZONE_BASE_URL}/api/contacts?$top=100`, {
                        headers: {
                            'Authorization': `ApiKey ${env.GROWTHZONE_API_KEY}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        return jsonResponse({ error: `GZ API Error: ${response.status} ${response.statusText}`, details: await response.text() }, 500);
                    }

                    const data = await response.json();
                    let imported = 0;
                    let skipped = 0;

                    // Process results
                    for (const contact of data.Results || []) {
                        // In this API version, we only see limited fields.
                        // SystemContactTypeId: 1 = Individual, 2 = Business
                        // MembershipStatusTypeId: 2 = Active
                        
                        // We only want active individuals for the Realtor checklist (as a fallback)
                        if (contact.MembershipStatusTypeId !== 2 || contact.SystemContactTypeId !== 1) {
                            continue; // Skip non-members or businesses for now
                        }

                        // Defaulting to realtor due to lack of detailed Membership expand in this GZ API endpoint
                        let memberType = 'realtor'; 
                        
                        // We use the current date as the sync date because CreatedDate is not exposed in this schema
                        const startDate = new Date().toISOString().split('T')[0];
                        
                        // Check if already in DB
                        const existing = await env.DB.prepare('SELECT id FROM members WHERE growthzone_contact_id = ?').bind(contact.ContactId).first();
                        
                        // Parse names (ContactName usually has full name for individuals)
                        let firstName = '';
                        let lastName = '';
                        if (contact.ContactName) {
                            const parts = contact.ContactName.split(' ');
                            firstName = parts[0] || '';
                            lastName = parts.slice(1).join(' ') || '';
                        }
                        
                        if (!existing && firstName) {
                            // Insert new member
                            const token = generateToken();
                            const now = new Date().toISOString();
                            const result = await env.DB.prepare(`
                                INSERT INTO members (growthzone_contact_id, public_token, first_name, last_name, email, phone, organization, member_type, status, start_date, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
                            `).bind(
                                contact.ContactId, token,
                                firstName, lastName,
                                contact.EmailAddress || null, 
                                contact.Phone || null, 
                                null, // Organization not reliably in this payload for individuals
                                memberType, startDate, now, now
                            ).run();
                            
                            const memberId = result.meta.last_row_id;
                            await expandWorkflow(env.DB, memberId, memberType, startDate);
                            imported++;
                        } else {
                            skipped++;
                        }
                    }

                    return jsonResponse({ success: true, message: `GrowthZone sync complete. Imported ${imported}, skipped ${skipped} existing active contacts.` });
                } catch (e) {
                    return jsonResponse({ error: e.message }, 500);
                }
            }

            return jsonResponse({ error: 'Not Found' }, 404);

        } catch (err) {
            console.error('Worker error:', err);
            return jsonResponse({ error: err.message }, 500);
        }
    },

    async scheduled(event, env, ctx) {
        // GrowthZone sync stub — will implement when credentials are available
        console.log('Cron triggered: GrowthZone sync stub');
    }
};
