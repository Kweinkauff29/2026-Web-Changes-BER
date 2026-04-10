-- Migration: BER Engagement Operating System
-- Enhances schema for KPI tracking, scoring, and Broker support

-- 1. Enhance Members table
ALTER TABLE members ADD COLUMN engagement_score INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN engagement_level TEXT DEFAULT 'Passive';
ALTER TABLE members ADD COLUMN risk_status TEXT DEFAULT '🟢';
ALTER TABLE members ADD COLUMN is_transfer INTEGER DEFAULT 0;

-- 2. Staff Roles table
CREATE TABLE IF NOT EXISTS staff_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT NOT NULL UNIQUE,
    description TEXT,
    owned_metric TEXT
);

-- Seed initial staff roles
INSERT OR IGNORE INTO staff_roles (role_name, description, owned_metric) VALUES
('Experience Director', 'Owns 100-Day Journey & Calls', 'Retention + Engagement Growth'),
('Education Manager', 'Owns Class & Event Participation', '% New Members Attending Events'),
('Marketing Comm', 'Owns Recognition & Spotlighting', 'New Member Feature Rate'),
('Tech Support', 'Owns Platform Adoption', 'MLS Login within 30 days');

-- 3. Engagement Actions table
CREATE TABLE IF NOT EXISTS member_engagement_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    action_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    metadata_json TEXT,
    occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Seed Broker Onboarding Track (8 steps, based on Realtor path initially)
INSERT OR IGNORE INTO workflow_templates (template_key, member_type, step_key, title, description, day_offset, touchpoint_type, default_owner, sort_order) VALUES
('broker_onboarding', 'broker', 'day0_welcome', 'Welcome Email & Record Setup', 'Send welcome email, expose member checklist page.', 0, 'system_welcome', 'system', 1),
('broker_onboarding', 'broker', 'day1_intro', 'Broker Introduction Call', 'Personal intro call to establish high-level relationship.', 1, 'welcome_call', 'member_experience', 2),
('broker_onboarding', 'broker', 'day7_roi', 'Broker ROI & Tools Review', 'Review high-level benefits and office growth tools.', 7, 'follow_up', 'member_experience', 3),
('broker_onboarding', 'broker', 'day14_mls', 'MLS Compliance & Access', 'Ensure broker understands compliance and office access controls.', 14, 'follow_up', 'member_experience', 4),
('broker_onboarding', 'broker', 'day30_checkin', '30-Day Leadership Connection', 'Leadership-level check-in on office satisfaction.', 30, 'check_in', 'member_experience', 5),
('broker_onboarding', 'broker', 'day60_engage', 'Committee / Board Opportunity', 'Discuss involvement in leadership pathways.', 60, 'engagement', 'member_experience', 6),
('broker_onboarding', 'broker', 'day90_review', '90-Day Office Review', 'Review recruitment/retention metrics for their office.', 90, 'ambassador', 'member_experience', 7),
('broker_onboarding', 'broker', 'day100_raving', '100-Day Milestone', 'Celebrate transition to Raving Fan status.', 100, 'ambassador', 'member_experience', 8);
