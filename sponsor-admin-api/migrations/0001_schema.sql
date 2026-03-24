-- 2026 Sponsors Admin Tracker — Core Schema

-- 1. Sponsors: Master sponsor records
CREATE TABLE IF NOT EXISTS sponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_name TEXT NOT NULL,
    sponsor_level TEXT NOT NULL CHECK(sponsor_level IN ('diamond','platinum','gold','silver','bronze')),
    primary_contact_email TEXT,
    primary_contact_name TEXT,
    active_2026 INTEGER NOT NULL DEFAULT 1,
    notes_general TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Sponsor Level Benefits: Template benefits per level (editable)
CREATE TABLE IF NOT EXISTS sponsor_level_benefits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_level TEXT NOT NULL,
    benefit_code TEXT NOT NULL,
    benefit_name TEXT NOT NULL,
    benefit_type TEXT NOT NULL DEFAULT 'inclusion',
    quantity INTEGER,
    is_claimable INTEGER NOT NULL DEFAULT 0,
    capacity_mode TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    UNIQUE(sponsor_level, benefit_code)
);

-- 3. Sponsor Benefits: Per-sponsor benefit tracking
CREATE TABLE IF NOT EXISTS sponsor_benefits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id INTEGER NOT NULL REFERENCES sponsors(id),
    benefit_code TEXT NOT NULL,
    benefit_name TEXT NOT NULL,
    benefit_type TEXT NOT NULL DEFAULT 'inclusion',
    included_by_level INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'not_started',
    event_id INTEGER,
    notes TEXT,
    date_completed TEXT,
    updated_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Events: All events and event-month instances
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_code TEXT NOT NULL UNIQUE,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date TEXT,
    start_time TEXT,
    end_time TEXT,
    month_label TEXT,
    year INTEGER NOT NULL DEFAULT 2026,
    capacity_mode TEXT NOT NULL DEFAULT 'unlimited',
    max_claims INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Sponsor Event Tracking: Sponsor participation per event
CREATE TABLE IF NOT EXISTS sponsor_event_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id INTEGER NOT NULL REFERENCES sponsors(id),
    event_id INTEGER NOT NULL REFERENCES events(id),
    benefit_code TEXT,
    status TEXT NOT NULL DEFAULT 'not_started',
    outreach_required INTEGER NOT NULL DEFAULT 1,
    outreach_due_date TEXT,
    first_reminder_due TEXT,
    second_reminder_due TEXT,
    final_reminder_due TEXT,
    email_sent_1 INTEGER NOT NULL DEFAULT 0,
    email_sent_1_at TEXT,
    email_sent_2 INTEGER NOT NULL DEFAULT 0,
    email_sent_2_at TEXT,
    email_sent_3 INTEGER NOT NULL DEFAULT 0,
    email_sent_3_at TEXT,
    responded INTEGER NOT NULL DEFAULT 0,
    responded_at TEXT,
    response_status TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    notes_internal TEXT,
    notes_from_sponsor TEXT,
    updated_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(sponsor_id, event_id)
);

-- 6. Sponsor Assets: Banner/link collection
CREATE TABLE IF NOT EXISTS sponsor_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id INTEGER NOT NULL REFERENCES sponsors(id),
    event_id INTEGER,
    asset_type TEXT NOT NULL,
    asset_url TEXT,
    clickthrough_url TEXT,
    received INTEGER NOT NULL DEFAULT 0,
    received_at TEXT,
    approved INTEGER NOT NULL DEFAULT 0,
    approved_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Sponsor Notes: Freeform notes
CREATE TABLE IF NOT EXISTS sponsor_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id INTEGER NOT NULL REFERENCES sponsors(id),
    event_id INTEGER,
    note_body TEXT NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Email Templates: Editable templates with merge fields
CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_key TEXT NOT NULL UNIQUE,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    event_type TEXT,
    sponsor_level TEXT,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Email Log: Sent email history
CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id INTEGER NOT NULL REFERENCES sponsors(id),
    event_id INTEGER,
    template_id INTEGER,
    email_to TEXT NOT NULL,
    subject_rendered TEXT,
    body_rendered TEXT,
    sent_manually INTEGER NOT NULL DEFAULT 1,
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    sent_by TEXT,
    response_recorded INTEGER NOT NULL DEFAULT 0,
    response_notes TEXT,
    notes TEXT
);

-- 10. Recurring Placement Checks
CREATE TABLE IF NOT EXISTS recurring_placement_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id INTEGER NOT NULL REFERENCES sponsors(id),
    placement_type TEXT NOT NULL,
    placement_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    checked_at TEXT,
    checked_by TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 11. Settings: Key-value config
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sponsors_level ON sponsors(sponsor_level);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(active_2026);
CREATE INDEX IF NOT EXISTS idx_sb_sponsor ON sponsor_benefits(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sb_status ON sponsor_benefits(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_set_sponsor ON sponsor_event_tracking(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_set_event ON sponsor_event_tracking(event_id);
CREATE INDEX IF NOT EXISTS idx_set_status ON sponsor_event_tracking(status);
CREATE INDEX IF NOT EXISTS idx_sa_sponsor ON sponsor_assets(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sn_sponsor ON sponsor_notes(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_el_sponsor ON email_log(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_rpc_sponsor ON recurring_placement_checks(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_rpc_status ON recurring_placement_checks(status);
