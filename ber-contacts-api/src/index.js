/**
 * BER Contacts API - Cloudflare Worker
 * 
 * Endpoints:
 *   GET  /signups       - Get all signed-up contact keys
 *   POST /signups       - Add a contact key (body: { key: "..." })
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
            // GET /signups - List all signed-up keys
            if (request.method === 'GET' && path === '/signups') {
                const { results } = await env.DB.prepare(
                    'SELECT contact_key FROM signups'
                ).all();

                const keys = results.map(row => row.contact_key);

                return new Response(JSON.stringify({ signups: keys }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            }

            // POST /signups - Add a key
            if (request.method === 'POST' && path === '/signups') {
                const body = await request.json();
                const key = body.key;

                if (!key) {
                    return new Response(JSON.stringify({ error: 'Missing key' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    });
                }

                // Upsert - insert or ignore if exists
                await env.DB.prepare(
                    'INSERT OR IGNORE INTO signups (contact_key) VALUES (?)'
                ).bind(key).run();

                return new Response(JSON.stringify({ success: true, key }), {
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
