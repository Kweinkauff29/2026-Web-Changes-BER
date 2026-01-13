/**
 * BER Contacts API - Cloudflare Worker
 * 
 * Endpoints:
 *   GET  /signups       - Get all signed-up contact keys with checker info
 *   POST /signups       - Add a contact key (body: { key: "...", checkedBy: "..." })
 *   DELETE /signups/:key - Remove a contact key
 *   
 *   GET  /metrics       - Get all market metrics data
 *   GET  /metrics/:type - Get specific metric type data
 *   POST /metrics       - Add/update a metric value
 *   GET  /metrics/export - Generate Excel file download
 */

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Metric type constants
const METRIC_TYPES = [
    'closed_sales',
    'new_listings',
    'active_inventory',
    'median_sales_price',
    'days_on_market',
    'pending_inventory',
    'months_supply',
    'price_increases',
    'price_decreases',
    'sold_dollar_volume'
];

// Month names for display
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Helper: Calculate percentage changes
function calculateChanges(data, metricType, year, month) {
    // Get current value
    const currentValue = data[metricType]?.[year]?.[month];
    if (currentValue === undefined) return null;

    const result = {
        value: currentValue,
        pct_chg_mom: 0,
        pct_chg_yoy: 0,
        pct_chg_ytd: 0
    };

    // Month over Month change
    if (month === 1) {
        // January: compare to December of previous year
        const prevValue = data[metricType]?.[year - 1]?.[12];
        if (prevValue !== undefined && prevValue !== 0) {
            result.pct_chg_mom = ((currentValue - prevValue) / prevValue) * 100;
        }
    } else {
        const prevValue = data[metricType]?.[year]?.[month - 1];
        if (prevValue !== undefined && prevValue !== 0) {
            result.pct_chg_mom = ((currentValue - prevValue) / prevValue) * 100;
        }
    }

    // Year over Year change
    const lastYearValue = data[metricType]?.[year - 1]?.[month];
    if (lastYearValue !== undefined && lastYearValue !== 0) {
        result.pct_chg_yoy = ((currentValue - lastYearValue) / lastYearValue) * 100;
    }

    // YTD change (compare to January of same year)
    const januaryValue = data[metricType]?.[year]?.[1];
    if (januaryValue !== undefined && januaryValue !== 0) {
        result.pct_chg_ytd = ((currentValue - januaryValue) / januaryValue) * 100;
    }

    return result;
}

// Helper: Build structured data from DB results
function buildMetricsData(results) {
    const data = {};

    // Initialize all metric types
    METRIC_TYPES.forEach(type => {
        data[type] = {};
    });

    // Populate with actual data
    results.forEach(row => {
        const { metric_type, year, month, value } = row;
        if (!data[metric_type]) data[metric_type] = {};
        if (!data[metric_type][year]) data[metric_type][year] = {};
        data[metric_type][year][month] = value;
    });

    return data;
}

// Helper: Add calculations to data
function addCalculations(data) {
    const result = {};

    METRIC_TYPES.forEach(metricType => {
        result[metricType] = {
            years: data[metricType] || {},
            calculations: {}
        };

        // Calculate for each year and month with data
        Object.keys(data[metricType] || {}).forEach(year => {
            result[metricType].calculations[year] = {};
            Object.keys(data[metricType][year] || {}).forEach(month => {
                const calc = calculateChanges(data, metricType, parseInt(year), parseInt(month));
                if (calc) {
                    result[metricType].calculations[year][month] = calc;
                }
            });
        });
    });

    return result;
}

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // ==================== MARKET METRICS ENDPOINTS ====================

            // GET /metrics - Get all metrics data with calculations
            if (request.method === 'GET' && path === '/metrics') {
                const { results } = await env.DB.prepare(
                    'SELECT metric_type, year, month, value FROM market_metrics ORDER BY metric_type, year, month'
                ).all();

                const rawData = buildMetricsData(results);
                const dataWithCalcs = addCalculations(rawData);

                return new Response(JSON.stringify({
                    success: true,
                    data: dataWithCalcs,
                    metricTypes: METRIC_TYPES,
                    months: MONTHS
                }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // GET /metrics/export - Generate Excel-compatible CSV
            if (request.method === 'GET' && path === '/metrics/export') {
                const { results } = await env.DB.prepare(
                    'SELECT metric_type, year, month, value FROM market_metrics ORDER BY metric_type, year, month'
                ).all();

                const rawData = buildMetricsData(results);

                // Get all years from data
                const years = new Set();
                Object.values(rawData).forEach(metricData => {
                    Object.keys(metricData).forEach(year => years.add(parseInt(year)));
                });
                const sortedYears = Array.from(years).sort();

                // Build CSV content
                let csv = '';

                METRIC_TYPES.forEach(metricType => {
                    // Metric header
                    const displayName = metricType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    csv += `\n${displayName}\n`;

                    // Column headers
                    csv += 'Month,' + sortedYears.join(',') + ',% chg MoM,% chg YoY,% Change YTD\n';

                    // Data rows for each month
                    for (let month = 1; month <= 12; month++) {
                        const row = [MONTHS[month - 1]];

                        // Add value for each year
                        sortedYears.forEach(year => {
                            const value = rawData[metricType]?.[year]?.[month];
                            row.push(value !== undefined ? value : '');
                        });

                        // Calculate changes for current year
                        const currentYear = sortedYears[sortedYears.length - 1];
                        const calc = calculateChanges(rawData, metricType, currentYear, month);

                        if (calc) {
                            row.push((calc.pct_chg_mom).toFixed(2) + '%');
                            row.push((calc.pct_chg_yoy).toFixed(2) + '%');
                            row.push((calc.pct_chg_ytd).toFixed(2) + '%');
                        } else {
                            row.push('', '', '');
                        }

                        csv += row.join(',') + '\n';
                    }
                });

                return new Response(csv, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename="BER_Market_Reports.csv"',
                        ...corsHeaders
                    }
                });
            }

            // GET /metrics/:type - Get specific metric data
            if (request.method === 'GET' && path.startsWith('/metrics/') && path !== '/metrics/export') {
                const metricType = path.replace('/metrics/', '');

                if (!METRIC_TYPES.includes(metricType)) {
                    return new Response(JSON.stringify({ error: 'Invalid metric type' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                }

                const { results } = await env.DB.prepare(
                    'SELECT year, month, value FROM market_metrics WHERE metric_type = ? ORDER BY year, month'
                ).bind(metricType).all();

                const data = {};
                results.forEach(row => {
                    if (!data[row.year]) data[row.year] = {};
                    data[row.year][row.month] = row.value;
                });

                return new Response(JSON.stringify({
                    success: true,
                    metricType,
                    data
                }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // POST /metrics - Add/update metric value (single or batch)
            if (request.method === 'POST' && path === '/metrics') {
                const body = await request.json();

                // Support batch updates
                const updates = Array.isArray(body) ? body : [body];
                const results = [];

                for (const update of updates) {
                    const { metric_type, year, month, value } = update;

                    // Validation
                    if (!metric_type || !METRIC_TYPES.includes(metric_type)) {
                        results.push({ error: 'Invalid metric_type', update });
                        continue;
                    }
                    if (!year || year < 2000 || year > 2100) {
                        results.push({ error: 'Invalid year', update });
                        continue;
                    }
                    if (!month || month < 1 || month > 12) {
                        results.push({ error: 'Invalid month', update });
                        continue;
                    }
                    if (value === undefined || value === null) {
                        results.push({ error: 'Value required', update });
                        continue;
                    }

                    const now = new Date().toISOString();

                    await env.DB.prepare(`
                        INSERT INTO market_metrics (metric_type, year, month, value, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(metric_type, year, month) DO UPDATE SET 
                            value = excluded.value,
                            updated_at = excluded.updated_at
                    `).bind(metric_type, year, month, value, now, now).run();

                    results.push({ success: true, metric_type, year, month, value });
                }

                return new Response(JSON.stringify({
                    success: true,
                    results
                }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // ==================== ORIGINAL SIGNUPS ENDPOINTS ====================

            // GET /signups - List all signed-up keys with checker info and tracking data
            if (request.method === 'GET' && path === '/signups') {
                const { results } = await env.DB.prepare(
                    `SELECT contact_key, checked_by, created_at, sales_volume,
                            numbers_confirmed, numbers_confirmed_by, numbers_confirmed_at,
                            event_registered, event_registered_by, event_registered_at,
                            award_pref, award_pref_by, award_pref_at
                     FROM signups`
                ).all();

                // Return as object with key -> { checkedBy, createdAt, ... }
                const signups = {};
                results.forEach(row => {
                    signups[row.contact_key] = {
                        checkedBy: row.checked_by || '',
                        createdAt: row.created_at || '',
                        salesVolume: row.sales_volume || '',
                        numbersConfirmed: row.numbers_confirmed === 1,
                        numbersConfirmedBy: row.numbers_confirmed_by || '',
                        numbersConfirmedAt: row.numbers_confirmed_at || '',
                        eventRegistered: row.event_registered === 1,
                        eventRegisteredBy: row.event_registered_by || '',
                        eventRegisteredAt: row.event_registered_at || '',
                        awardPref: row.award_pref || '',
                        awardPrefBy: row.award_pref_by || '',
                        awardPrefAt: row.award_pref_at || ''
                    };
                });

                return new Response(JSON.stringify({ signups }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // POST /signups - Add/Update a signup, Sales Volume, or tracking fields
            if (request.method === 'POST' && url.pathname === '/signups') {
                const { key, checkedBy, salesVolume, numbersConfirmed, eventRegistered, awardPref, updatedBy } = await request.json();

                if (!key) return new Response('Missing key', { status: 400, headers: corsHeaders });

                const now = new Date().toISOString().replace('T', ' ').split('.')[0];

                // Handle sales volume update
                if (salesVolume !== undefined) {
                    await env.DB.prepare(`
                        INSERT INTO signups (contact_key, sales_volume, created_at) VALUES (?, ?, ?)
                        ON CONFLICT(contact_key) DO UPDATE SET sales_volume=excluded.sales_volume
                    `).bind(key, salesVolume, now).run();
                }

                // Handle checkedBy update
                if (checkedBy !== undefined) {
                    await env.DB.prepare(`
                        INSERT INTO signups (contact_key, checked_by, created_at) VALUES (?, ?, ?)
                        ON CONFLICT(contact_key) DO UPDATE SET checked_by=excluded.checked_by, created_at=excluded.created_at
                    `).bind(key, checkedBy, now).run();
                }

                // Handle numbers confirmed update
                if (numbersConfirmed !== undefined) {
                    await env.DB.prepare(`
                        INSERT INTO signups (contact_key, numbers_confirmed, numbers_confirmed_by, numbers_confirmed_at, created_at) 
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(contact_key) DO UPDATE SET 
                            numbers_confirmed=excluded.numbers_confirmed,
                            numbers_confirmed_by=excluded.numbers_confirmed_by,
                            numbers_confirmed_at=excluded.numbers_confirmed_at
                    `).bind(key, numbersConfirmed ? 1 : 0, updatedBy || '', now, now).run();
                }

                // Handle event registered update
                if (eventRegistered !== undefined) {
                    await env.DB.prepare(`
                        INSERT INTO signups (contact_key, event_registered, event_registered_by, event_registered_at, created_at) 
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(contact_key) DO UPDATE SET 
                            event_registered=excluded.event_registered,
                            event_registered_by=excluded.event_registered_by,
                            event_registered_at=excluded.event_registered_at
                    `).bind(key, eventRegistered ? 1 : 0, updatedBy || '', now, now).run();
                }

                // Handle award preference update
                if (awardPref !== undefined) {
                    await env.DB.prepare(`
                        INSERT INTO signups (contact_key, award_pref, award_pref_by, award_pref_at, created_at) 
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(contact_key) DO UPDATE SET 
                            award_pref=excluded.award_pref,
                            award_pref_by=excluded.award_pref_by,
                            award_pref_at=excluded.award_pref_at
                    `).bind(key, awardPref, updatedBy || '', now, now).run();
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
