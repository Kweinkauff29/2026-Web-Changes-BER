-- CCRE Member Experience Checklist Dashboard - Core Schema

-- Members: One row per tracked person
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    growthzone_contact_id TEXT UNIQUE,
    public_token TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    organization TEXT,
    member_type TEXT NOT NULL DEFAULT 'realtor',  -- 'realtor' or 'affiliate'
    status TEXT NOT NULL DEFAULT 'new',           -- new, active, complete, archived
    start_date TEXT,                               -- ISO date anchoring the workflow
    assigned_owner TEXT,
    gz_last_synced_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Workflow Templates: Reusable step definitions by member type
CREATE TABLE IF NOT EXISTS workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_key TEXT NOT NULL,       -- e.g. 'realtor_onboarding'
    member_type TEXT NOT NULL,        -- 'realtor' or 'affiliate'
    step_key TEXT NOT NULL,           -- e.g. 'welcome_email', 'day7_check'
    title TEXT NOT NULL,
    description TEXT,
    day_offset INTEGER NOT NULL DEFAULT 0,
    touchpoint_type TEXT,             -- suggested touchpoint category
    default_owner TEXT,               -- 'system', 'staff', 'member_experience'
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    UNIQUE(template_key, step_key)
);

-- Member Tasks: Expanded dated tasks for each person
CREATE TABLE IF NOT EXISTS member_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    step_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,                     -- ISO date
    completed_at TEXT,
    state TEXT NOT NULL DEFAULT 'pending',  -- pending, complete, skipped, overdue
    owner TEXT,
    notes_summary TEXT,
    is_custom INTEGER NOT NULL DEFAULT 0,  -- 1 if admin-added (not from template)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Touchpoints: Logged human outreach that counts toward reporting
CREATE TABLE IF NOT EXISTS touchpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    task_id INTEGER REFERENCES member_tasks(id),
    category TEXT NOT NULL,            -- welcome_call, check_in, ambassador, engagement, follow_up
    occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
    outcome TEXT,
    staff_user TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Member Notes: Freeform notes not limited to touchpoints
CREATE TABLE IF NOT EXISTS member_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    note_type TEXT DEFAULT 'general',  -- general, insight, system
    body TEXT NOT NULL,
    author TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sync State: Stores last successful GrowthZone sync checkpoint
CREATE TABLE IF NOT EXISTS sync_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name TEXT NOT NULL UNIQUE DEFAULT 'growthzone',
    last_synced_utc TEXT,
    cursor_or_page_marker TEXT,
    status TEXT DEFAULT 'idle',        -- idle, running, error
    error_message TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(member_type);
CREATE INDEX IF NOT EXISTS idx_members_token ON members(public_token);
CREATE INDEX IF NOT EXISTS idx_tasks_member ON member_tasks(member_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON member_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_state ON member_tasks(state);
CREATE INDEX IF NOT EXISTS idx_touchpoints_member ON touchpoints(member_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_category ON touchpoints(category);
CREATE INDEX IF NOT EXISTS idx_touchpoints_date ON touchpoints(occurred_at);
