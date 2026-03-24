/**
 * Shared Swiss-Tech CSS — Sponsor Admin variant
 * Matches the existing ccre-checklist-api design system
 */
export function swissTechCSS() {
    return `
        :root {
            --canvas: #ffffff; --panel: #fafafa; --ink: #111827; --border: #111827;
            --blue: #0284c7; --gold: #ca8a04; --green: #16a34a; --red: #dc2626;
            --purple: #7c3aed; --orange: #ea580c; --teal: #0d9488;
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
        .stat-block.accent-purple .stat-val { color: var(--purple); }
        .stat-block.accent-orange .stat-val { color: var(--orange); }
        .stat-block.accent-teal .stat-val { color: var(--teal); }

        /* Badge */
        .badge { display:inline-block; font-family:var(--mono); font-size:10px; text-transform:uppercase; letter-spacing:1px; padding:3px 10px; border:1px solid; border-radius:2px; font-weight:700; }
        .badge-diamond { color: var(--purple); border-color: var(--purple); background: rgba(124,58,237,0.06); }
        .badge-platinum { color: var(--blue); border-color: var(--blue); background: rgba(2,132,199,0.06); }
        .badge-gold { color: var(--gold); border-color: var(--gold); background: rgba(202,138,4,0.06); }
        .badge-silver { color: #6b7280; border-color: #9ca3af; background: rgba(156,163,175,0.08); }
        .badge-bronze { color: var(--orange); border-color: var(--orange); background: rgba(234,88,12,0.06); }

        /* Status badges */
        .badge-completed { color: var(--green); border-color: var(--green); background: rgba(22,163,74,0.06); }
        .badge-pending { color: var(--gold); border-color: var(--gold); background: rgba(202,138,4,0.06); }
        .badge-overdue { color: var(--red); border-color: var(--red); background: rgba(220,38,38,0.06); }
        .badge-claimed { color: var(--teal); border-color: var(--teal); background: rgba(13,148,136,0.06); }
        .badge-waiting { color: var(--orange); border-color: var(--orange); background: rgba(234,88,12,0.06); }
        .badge-open { color: var(--green); border-color: var(--green); background: rgba(22,163,74,0.06); }
        .badge-sent { color: var(--blue); border-color: var(--blue); background: rgba(2,132,199,0.06); }

        /* Buttons */
        .btn { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 18px; border: 1px solid var(--ink); background: var(--canvas); cursor: pointer; transition: all 0.15s; border-radius: 2px; }
        .btn:hover { background: var(--ink); color: var(--canvas); }
        .btn-primary { background: var(--blue); color: white; border-color: var(--blue); }
        .btn-primary:hover { background: #0369a1; }
        .btn-success { background: var(--green); color: white; border-color: var(--green); }
        .btn-success:hover { background: #15803d; }
        .btn-danger { background: var(--red); color: white; border-color: var(--red); }
        .btn-danger:hover { background: #b91c1c; }
        .btn-sm { padding: 4px 10px; font-size: 10px; }
        .btn-xs { padding: 2px 6px; font-size: 9px; }
        .btn-group { display: flex; gap: 4px; }

        /* Table */
        .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .data-table th { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px; text-align: left; border: 1px solid var(--ink); background: var(--panel); white-space: nowrap; }
        .data-table td { padding: 10px 12px; border: 1px solid #d1d5db; vertical-align: top; }
        .data-table tr:hover td { background: #f3f4f6; }
        .data-table tr.clickable { cursor: pointer; }

        /* Forms */
        .form-group { margin-bottom: 14px; }
        .form-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; display: block; margin-bottom: 4px; }
        .form-input, .form-select, .form-textarea { width: 100%; padding: 8px 10px; border: 1px solid var(--ink); font-family: var(--sans); font-size: 13px; background: var(--canvas); border-radius: 2px; }
        .form-textarea { min-height: 80px; resize: vertical; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; z-index: 1000; }
        .modal-overlay.active { display: flex; }
        .modal { background: var(--canvas); border: 2px solid var(--ink); width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; padding: 28px; position: relative; }
        .modal-close { position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--ink); }

        /* Progress Bar */
        .progress-bar { height: 6px; background: #e5e7eb; border: 1px solid #d1d5db; border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s; }
        .progress-fill.green { background: var(--green); }
        .progress-fill.blue { background: var(--blue); }
        .progress-fill.gold { background: var(--gold); }

        /* Checklist Item */
        .check-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.1s; }
        .check-item:hover { background: #f9fafb; }
        .check-item .check-box { width: 18px; height: 18px; border: 1.5px solid var(--ink); border-radius: 2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; }
        .check-item .check-box.checked { background: var(--green); border-color: var(--green); color: white; }
        .check-item .check-label { flex: 1; font-size: 13px; }
        .check-item .check-status { font-family: var(--mono); font-size: 10px; text-transform: uppercase; }

        /* Tabs */
        .tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid var(--ink); }
        .tab { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 16px; cursor: pointer; background: var(--panel); border: 1px solid var(--ink); border-bottom: none; margin-right: -1px; margin-bottom: -2px; transition: all 0.15s; }
        .tab.active { background: var(--canvas); border-bottom: 2px solid var(--canvas); font-weight: 700; }
        .tab:hover:not(.active) { background: #f3f4f6; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }

        /* Claim Grid */
        .claim-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin: 16px 0; }
        .claim-card { border: 1px solid var(--ink); padding: 14px; position: relative; }
        .claim-card .claim-month { font-family: var(--mono); font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
        .claim-card .claim-sponsor { font-size: 12px; margin-bottom: 4px; }
        .claim-card.claimed { border-left: 3px solid var(--teal); }
        .claim-card.open { border-left: 3px solid var(--green); }
        .claim-card.completed { border-left: 3px solid var(--green); opacity: 0.7; }
        .claim-card.waiting { border-left: 3px solid var(--orange); }

        /* Timeline */
        .timeline-item { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .timeline-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--blue); margin-top: 5px; flex-shrink: 0; }
        .timeline-dot.completed { background: var(--green); border-color: var(--green); }
        .timeline-dot.sent { background: var(--blue); border-color: var(--blue); }
        .timeline-dot.overdue { background: var(--red); border-color: var(--red); }

        /* Empty State */
        .empty-state { text-align: center; padding: 40px; color: #9ca3af; font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }

        /* Toast */
        .toast { position: fixed; bottom: 24px; right: 24px; background: var(--ink); color: white; padding: 12px 20px; font-family: var(--mono); font-size: 12px; border-radius: 2px; z-index: 2000; transform: translateY(80px); opacity: 0; transition: all 0.3s; }
        .toast.show { transform: translateY(0); opacity: 1; }

        /* Section Divider */
        .section-title { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
    `;
}
