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
                    award_pref, award_pref_by, award_pref_at,
                    headshot_url, headshot_by, headshot_at,
                    confirmed_volume, confirmed_volume_by, confirmed_volume_at,
                    actual_award_level, actual_award_level_by, actual_award_level_at,
                    not_attending, not_attending_by, not_attending_at,
                    first_name, last_name, organization, email, role, pri_phone, city, state,
                    is_deleted, deleted_by, deleted_at,
                    notes
			 FROM signups`
                ).all();

                const signups = {};
                results.forEach(row => {
                    signups[row.contact_key] = {
                        checkedBy: row.checked_by,
                        createdAt: row.created_at,
                        salesVolume: row.sales_volume,
                        numbersConfirmed: row.numbers_confirmed, // 0 or 1
                        numbersConfirmedBy: row.numbers_confirmed_by,
                        numbersConfirmedAt: row.numbers_confirmed_at,
                        eventRegistered: row.event_registered,
                        eventRegisteredBy: row.event_registered_by,
                        eventRegisteredAt: row.event_registered_at,
                        awardPref: row.award_pref,
                        awardPrefBy: row.award_pref_by,
                        awardPrefAt: row.award_pref_at,
                        headshotUrl: row.headshot_url,
                        headshotBy: row.headshot_by,
                        headshotAt: row.headshot_at,
                        confirmedVolume: row.confirmed_volume,
                        confirmedVolumeBy: row.confirmed_volume_by,
                        confirmedVolumeAt: row.confirmed_volume_at,
                        actualAwardLevel: row.actual_award_level,
                        actualAwardLevelBy: row.actual_award_level_by,
                        actualAwardLevelAt: row.actual_award_level_at,
                        notAttending: row.not_attending,
                        notAttendingBy: row.not_attending_by,
                        notAttendingAt: row.not_attending_at,

                        // Full Contact Details
                        firstName: row.first_name,
                        lastName: row.last_name,
                        organization: row.organization,
                        email: row.email,
                        role: row.role,
                        priPhone: row.pri_phone,
                        city: row.city,
                        state: row.state,

                        // Soft Delete
                        isDeleted: row.is_deleted === 1,

                        // Notes
                        notes: row.notes
                    };
                });

                return new Response(JSON.stringify({ signups }), { headers: corsHeaders });
            }

            if (request.method === 'POST' && url.pathname === '/signups') {
                const {
                    key, checkedBy, salesVolume, numbersConfirmed, eventRegistered, awardPref,
                    headshotUrl, confirmedVolume, actualAwardLevel, notAttending,
                    headshotBy, confirmedVolumeBy, actualAwardLevelBy, notAttendingBy,
                    checkedState, // Legacy
                    updatedBy, // Generic fallback

                    // New Contact Fields
                    firstName, lastName, organization, email, role, priPhone, city, state,

                    // Notes
                    notes
                } = await request.json();

                if (!key) return new Response('Missing key', { status: 400, headers: corsHeaders });

                // Check existence
                const exists = await env.DB.prepare('SELECT contact_key, is_deleted FROM signups WHERE contact_key = ?').bind(key).first();

                if (!exists) {
                    // INSERT
                    await env.DB.prepare(
                        `INSERT INTO signups(
                        contact_key, checked_by, created_at, sales_volume,
                        numbers_confirmed, event_registered, award_pref,
                        headshot_url, confirmed_volume, actual_award_level, not_attending,
                        first_name, last_name, organization, email, role, pri_phone, city, state, notes
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    ).bind(
                        key, checkedBy || null, new Date().toISOString(), salesVolume || null,
                        numbersConfirmed ? 1 : 0, eventRegistered ? 1 : 0, awardPref || null,
                        headshotUrl || null, confirmedVolume || null, actualAwardLevel || null, notAttending ? 1 : 0,
                        firstName || null, lastName || null, organization || null, email || null, role || null, priPhone || null, city || null, state || null, notes || null
                    ).run();
                } else {
                    // UPDATE - Build Query Dynamically
                    let updateFields = [];
                    let bindings = [];

                    if (checkedBy !== undefined) { updateFields.push('checked_by = ?'); bindings.push(checkedBy); }
                    if (salesVolume !== undefined) { updateFields.push('sales_volume = ?'); bindings.push(salesVolume); }

                    // Tracking + attribution
                    if (numbersConfirmed !== undefined) {
                        updateFields.push('numbers_confirmed = ?'); bindings.push(numbersConfirmed ? 1 : 0);
                        updateFields.push('numbers_confirmed_by = ?'); bindings.push(updatedBy);
                        updateFields.push('numbers_confirmed_at = ?'); bindings.push(new Date().toISOString());
                    }
                    if (eventRegistered !== undefined) {
                        updateFields.push('event_registered = ?'); bindings.push(eventRegistered ? 1 : 0);
                        updateFields.push('event_registered_by = ?'); bindings.push(updatedBy);
                        updateFields.push('event_registered_at = ?'); bindings.push(new Date().toISOString());
                    }
                    if (awardPref !== undefined) {
                        updateFields.push('award_pref = ?'); bindings.push(awardPref);
                        updateFields.push('award_pref_by = ?'); bindings.push(updatedBy);
                        updateFields.push('award_pref_at = ?'); bindings.push(new Date().toISOString());
                    }
                    if (headshotUrl !== undefined) {
                        updateFields.push('headshot_url = ?'); bindings.push(headshotUrl);
                        updateFields.push('headshot_by = ?'); bindings.push(headshotBy || updatedBy);
                        updateFields.push('headshot_at = ?'); bindings.push(new Date().toISOString());
                    }
                    if (confirmedVolume !== undefined) {
                        updateFields.push('confirmed_volume = ?'); bindings.push(confirmedVolume);
                        updateFields.push('confirmed_volume_by = ?'); bindings.push(confirmedVolumeBy || updatedBy);
                        updateFields.push('confirmed_volume_at = ?'); bindings.push(new Date().toISOString());
                    }
                    if (actualAwardLevel !== undefined) {
                        updateFields.push('actual_award_level = ?'); bindings.push(actualAwardLevel);
                        updateFields.push('actual_award_level_by = ?'); bindings.push(actualAwardLevelBy || updatedBy);
                        updateFields.push('actual_award_level_at = ?'); bindings.push(new Date().toISOString());
                    }
                    if (notAttending !== undefined) {
                        updateFields.push('not_attending = ?'); bindings.push(notAttending ? 1 : 0);
                        updateFields.push('not_attending_by = ?'); bindings.push(notAttendingBy || updatedBy);
                        updateFields.push('not_attending_at = ?'); bindings.push(new Date().toISOString());
                    }

                    // Contact Details
                    if (firstName !== undefined) { updateFields.push('first_name = ?'); bindings.push(firstName); }
                    if (lastName !== undefined) { updateFields.push('last_name = ?'); bindings.push(lastName); }
                    if (organization !== undefined) { updateFields.push('organization = ?'); bindings.push(organization); }
                    if (email !== undefined) { updateFields.push('email = ?'); bindings.push(email); }
                    if (role !== undefined) { updateFields.push('role = ?'); bindings.push(role); }
                    if (priPhone !== undefined) { updateFields.push('pri_phone = ?'); bindings.push(priPhone); }
                    if (city !== undefined) { updateFields.push('city = ?'); bindings.push(city); }
                    if (state !== undefined) { updateFields.push('state = ?'); bindings.push(state); }

                    // Notes
                    if (notes !== undefined) { updateFields.push('notes = ?'); bindings.push(notes); }

                    // Un-delete if updating
                    if (exists.is_deleted === 1) {
                        updateFields.push('is_deleted = 0');
                        updateFields.push('deleted_by = NULL');
                        updateFields.push('deleted_at = NULL');
                    }

                    if (updateFields.length > 0) {
                        bindings.push(key);
                        await env.DB.prepare(`UPDATE signups SET ${updateFields.join(', ')} WHERE contact_key = ? `)
                            .bind(...bindings).run();
                    }
                }

                return new Response('Saved', { headers: corsHeaders });
            }


            // DELETE /signups/:key - SOFT Delete
            if (request.method === 'DELETE' && path.startsWith('/signups/')) {
                const key = decodeURIComponent(path.replace('/signups/', ''));

                if (!key) {
                    return new Response(JSON.stringify({ error: 'Missing key' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    });
                }

                // Get user from header or query if we want to track deleted_by? 
                // For now, simple soft delete.
                const now = new Date().toISOString();

                // Check if row exists, if so soft delete, if not insert as deleted
                await env.DB.prepare(`
                    INSERT INTO signups(contact_key, is_deleted, deleted_at) VALUES(?, 1, ?)
                    ON CONFLICT(contact_key) DO UPDATE SET is_deleted = 1, deleted_at = excluded.deleted_at
                    `).bind(key, now).run();

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
