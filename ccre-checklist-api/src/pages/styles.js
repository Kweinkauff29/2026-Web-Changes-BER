/**
 * Shared Swiss-Tech CSS used by both member and admin pages
 */
export function swissTechCSS() {
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
        .modal { background: var(--canvas); border: 2px solid var(--ink); width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; padding: 28px; position: relative; }
        .modal-close { position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--ink); }
    `;
}
