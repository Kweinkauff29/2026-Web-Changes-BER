/**
 * BER Contacts API - Cloudflare Worker
 * 
 * Endpoints:
 *   GET  /signups       - Get all signed-up contact keys with checker info
 *   POST /signups       - Add a contact key (body: { key: "...", checkedBy: "..." })
 *   DELETE /signups/:key - Remove a contact key
 */

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // In production, restrict to your domain
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // GET /signups - List all signed-up keys with checker info
            if (request.method === 'GET' && path === '/signups') {
                const { results } = await env.DB.prepare(
                    'SELECT contact_key, checked_by, created_at FROM signups'
                ).all();

                // Return as object with key -> { checkedBy, createdAt }
                const signups = {};
                results.forEach(row => {
                    signups[row.contact_key] = {
                        checkedBy: row.checked_by || '',
                        createdAt: row.created_at || ''
                    };
                });

                return new Response(JSON.stringify({ signups }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // POST /signups - Add/Update a signup or Sales Volume
            if (request.method === 'POST' && url.pathname === '/signups') {
                const { key, checkedBy, salesVolume } = await request.json(); // Accept salesVolume

                if (!key) return new Response('Missing key', { status: 400, headers: corsHeaders });

                // Timestamp
                const now = new Date().toISOString().replace('T', ' ').split('.')[0];

                // We need to handle partial updates.
                // If sending just `salesVolume`, we don't want to erase `checked_by`.
                // Use UPSERT logic carefully or checks.
                // Actually, easiest is:
                // 1. Check if exists. 2. Update specific fields.
                // Or: INSERT OR REPLACE but we need all previous values.

                // Better approach for speed:
                // Use ON CONFLICT DO UPDATE

                let stmt;
                if (salesVolume !== undefined && checkedBy === undefined) {
                    // Updating Volume Only (Edit Mode)
                    // If row doesn't exist, insert with volume. If exists, update volume.
                    stmt = env.DB.prepare(`
        INSERT INTO signups (contact_key, sales_volume, created_at) VALUES (?, ?, ?)
        ON CONFLICT(contact_key) DO UPDATE SET sales_volume=excluded.sales_volume
      `).bind(key, salesVolume, now);
                } else {
                    // Checking/Unchecking (Standard Mode)
                    // This is usually a full "Check".
                    stmt = env.DB.prepare(`
        INSERT INTO signups (contact_key, checked_by, created_at, sales_volume) VALUES (?, ?, ?, ?)
        ON CONFLICT(contact_key) DO UPDATE SET checked_by=excluded.checked_by, created_at=excluded.created_at
      `).bind(key, checkedBy || '', now, salesVolume || '');
                    // Note: If salesVolume passed here it overwrites. If not passed (undefined), we might overwrite with empty if we bind ''
                    // Wait, if I check a box, I don't send salesVolume. It might clear it?
                    // "salesVolume || ''" -> Yes it clears it.
                    // Fix: If I only check, use COALESCE or separate SQL.
                }

                // Refined Logic:
                // If `salesVolume` is provided, update it.
                // If `checkedBy` is provided, update it.

                if (salesVolume !== undefined) {
                    // Volume Update
                    await env.DB.prepare(`
        INSERT INTO signups (contact_key, sales_volume, created_at) VALUES (?, ?, ?)
        ON CONFLICT(contact_key) DO UPDATE SET sales_volume=excluded.sales_volume
      `).bind(key, salesVolume, now).run();
                }

                if (checkedBy !== undefined) {
                    // User Check Update
                    // We don't want to overwrite sales_volume with null
                    await env.DB.prepare(`
        INSERT INTO signups (contact_key, checked_by, created_at) VALUES (?, ?, ?)
        ON CONFLICT(contact_key) DO UPDATE SET checked_by=excluded.checked_by, created_at=excluded.created_at
      `).bind(key, checkedBy, now).run();
                }

                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // DELETE /signups/:key - Remove a key
            if (request.method === 'DELETE' && path.startsWith('/signups/')) {
                const key = decodeURIComponent(path.replace('/signups/', ''));

                if (!key) {
                    return new Response(JSON.stringify({ error: 'Missing key' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    });
                }

                await env.DB.prepare(
                    'DELETE FROM signups WHERE contact_key = ?'
                ).bind(key).run();

                return new Response(JSON.stringify({ success: true, key }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            // 404 for unknown routes
            return new Response(JSON.stringify({ error: 'Not Found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });

        } catch (err) {
            console.error('Worker error:', err);
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }
    },
};
