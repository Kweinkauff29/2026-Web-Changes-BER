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
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            }

            // POST /signups - Add a key with checker info
            if (request.method === 'POST' && path === '/signups') {
                const body = await request.json();
                const key = body.key;
                const checkedBy = body.checkedBy || '';

                if (!key) {
                    return new Response(JSON.stringify({ error: 'Missing key' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    });
                }

                // Insert or replace to update checker info
                await env.DB.prepare(
                    'INSERT OR REPLACE INTO signups (contact_key, checked_by, created_at) VALUES (?, ?, datetime("now"))'
                ).bind(key, checkedBy).run();

                return new Response(JSON.stringify({ success: true, key, checkedBy }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
