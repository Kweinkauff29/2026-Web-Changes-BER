-- 2026 Sponsors Admin Tracker — Seed Data

-- ═══════════════════════════════════════════
-- SPONSORS
-- ═══════════════════════════════════════════
INSERT INTO sponsors (sponsor_name, sponsor_level, primary_contact_email, active_2026) VALUES
('Law Office of Sam Saad', 'diamond', 'jsizemore@saadlegal.com', 1),
('WWMR', 'diamond', 'mmichetti@lawfirmnaples.com', 1),
('State Insurance USA', 'diamond', 'gail@stateinsuranceusa.com', 1),
('Chapman Insurance', 'diamond', 'jaden@cigflorida.com', 1),
('Movement Mortgage', 'diamond', 'travis.marchand@movement.com', 1),
('Cottrell Title', 'platinum', 'eric@cottrelltitle.com', 1),
('Housemaster', 'platinum', 'theresa.anders@housemaster.com', 1),
('Lane Insurance Group', 'gold', 'jason@laneinsurancegroup.com', 1),
('Premium Mortgage', 'gold', 'dwilliams@premiummortgage.com', 1),
('Hilton Moving & Storage', 'silver', 'rachel@hiltonmovers.com', 1),
('Lower', 'silver', 'jmick@lower.com', 1),
('Revolution Mortgage', 'silver', 'rbeckman@revolutionmortgage.com', 1);

-- ═══════════════════════════════════════════
-- SPONSOR LEVEL BENEFITS (Templates)
-- ═══════════════════════════════════════════

-- DIAMOND
INSERT INTO sponsor_level_benefits (sponsor_level, benefit_code, benefit_name, benefit_type, quantity, is_claimable, capacity_mode, sort_order) VALUES
('diamond', 'oh_solo', 'Solo Open House Weekend Sponsorship', 'event_claim', 1, 1, 'solo', 1),
('diamond', 'poker_run', 'Poker Run Sponsorship — Full House', 'event', 1, 0, NULL, 2),
('diamond', 'breakfast_tickets', 'Membership Breakfast Tickets', 'event', 2, 0, NULL, 3),
('diamond', 'sea_package', 'Sales Excellence Awards Package / Recognition', 'event', 1, 0, NULL, 4),
('diamond', 'safety_kits', 'Safety Kits Sponsor', 'inclusion', 1, 0, NULL, 5),
('diamond', 'installation', 'Installation Sponsor', 'event', 1, 0, NULL, 6),
('diamond', 'diversity_event', 'Diversity Event Contribution / Recognition', 'event', 1, 0, NULL, 7),
('diamond', 'lobby_logo', 'Logo in Front Lobby', 'recurring_placement', 1, 0, NULL, 8),
('diamond', 'mp_page_logo', 'Logo on MP Page', 'recurring_placement', 1, 0, NULL, 9),
('diamond', 'rr_ad_half', '1/2 Page Ad in Realtor Review', 'inclusion', 1, 0, NULL, 10),
('diamond', 'golf_sponsor', 'BER Golf Sponsor', 'event', 1, 0, NULL, 11),
('diamond', 'banner_logo', 'Logo on Banner', 'recurring_placement', 1, 0, NULL, 12),
('diamond', 'eblast_1mo', '1 Month E-Blast Ad', 'inclusion', 1, 0, NULL, 13),
('diamond', 'new_assoc_affiliate', '1 New Associate Affiliate', 'inclusion', 1, 0, NULL, 14),
('diamond', 'expo_table', 'Free Table at EXPO (if scheduled 2026)', 'inclusion', 1, 0, NULL, 15);

-- PLATINUM
INSERT INTO sponsor_level_benefits (sponsor_level, benefit_code, benefit_name, benefit_type, quantity, is_claimable, capacity_mode, sort_order) VALUES
('platinum', 'oh_joint', 'Joint Open House Weekend Sponsorship', 'event_claim', 1, 1, 'shared', 1),
('platinum', 'poker_run', 'Poker Run Sponsorship — Full House', 'event', 1, 0, NULL, 2),
('platinum', 'breakfast_tickets', 'Membership Breakfast Tickets', 'event', 2, 0, NULL, 3),
('platinum', 'sea_package', 'Sales Excellence Awards Package / Recognition', 'event', 1, 0, NULL, 4),
('platinum', 'diversity_event', 'Diversity Event Contribution / Recognition', 'event', 1, 0, NULL, 5),
('platinum', 'safety_kits', 'Safety Kits Sponsor', 'inclusion', 1, 0, NULL, 6),
('platinum', 'installation', 'Installation Sponsor', 'event', 1, 0, NULL, 7),
('platinum', 'lobby_logo', 'Logo in Front Lobby', 'recurring_placement', 1, 0, NULL, 8),
('platinum', 'mp_page_logo', 'Logo on MP Page', 'recurring_placement', 1, 0, NULL, 9),
('platinum', 'rr_ad_quarter', '1/4 Page Ad in Realtor Review', 'inclusion', 1, 0, NULL, 10),
('platinum', 'golf_sponsor_manned', 'BER Golf Sponsor — Manned', 'event', 1, 0, NULL, 11),
('platinum', 'banner_logo', 'Logo on Banner', 'recurring_placement', 1, 0, NULL, 12),
('platinum', 'eblast_2wk', '2-Week E-Blast Ad', 'inclusion', 1, 0, NULL, 13),
('platinum', 'new_assoc_affiliate', '1 New Associate Affiliate', 'inclusion', 1, 0, NULL, 14);

-- GOLD
INSERT INTO sponsor_level_benefits (sponsor_level, benefit_code, benefit_name, benefit_type, quantity, is_claimable, capacity_mode, sort_order) VALUES
('gold', 'oh_joint', 'Joint Open House Weekend Sponsorship', 'event_claim', 1, 1, 'shared', 1),
('gold', 'poker_run', 'Poker Run Sponsorship — Full House', 'event', 1, 0, NULL, 2),
('gold', 'breakfast_tickets', 'Membership Breakfast Tickets', 'event', 2, 0, NULL, 3),
('gold', 'sea_package', 'Sales Excellence Awards Package / Recognition', 'event', 1, 0, NULL, 4),
('gold', 'diversity_event', 'Diversity Event Contribution / Recognition', 'event', 1, 0, NULL, 5),
('gold', 'safety_kits', 'Safety Kits Sponsor', 'inclusion', 1, 0, NULL, 6),
('gold', 'installation', 'Installation Sponsor', 'event', 1, 0, NULL, 7),
('gold', 'lobby_loop_logo', 'Logo in Front Lobby Loop', 'recurring_placement', 1, 0, NULL, 8),
('gold', 'mp_page_logo', 'Logo on MP Page', 'recurring_placement', 1, 0, NULL, 9),
('gold', 'golf_sponsor_unmanned', 'BER Golf Sponsor — Unmanned', 'event', 1, 0, NULL, 10),
('gold', 'rr_ad_eighth', '1/8 Page Ad in Realtor Review', 'inclusion', 1, 0, NULL, 11),
('gold', 'eblast_1wk', '1-Week E-Blast Ad', 'inclusion', 1, 0, NULL, 12),
('gold', 'banner_logo', 'Logo on Banner', 'recurring_placement', 1, 0, NULL, 13);

-- SILVER
INSERT INTO sponsor_level_benefits (sponsor_level, benefit_code, benefit_name, benefit_type, quantity, is_claimable, capacity_mode, sort_order) VALUES
('silver', 'breakfast_tickets', 'Membership Breakfast Tickets', 'event', 1, 0, NULL, 1),
('silver', 'name_recognition', 'Name Recognition at All Events', 'inclusion', 1, 0, NULL, 2),
('silver', 'mp_page_logo', 'Logo on MP Page', 'recurring_placement', 1, 0, NULL, 3),
('silver', 'installation_recognition', 'Installation Recognition', 'event', 1, 0, NULL, 4),
('silver', 'sea_recognition', 'SEA Recognition', 'event', 1, 0, NULL, 5),
('silver', 'golf_sponsor_unmanned', 'BER Golf Sponsor — Unmanned', 'event', 1, 0, NULL, 6),
('silver', 'lobby_loop_logo', 'Logo on Front Lobby Loop', 'recurring_placement', 1, 0, NULL, 7),
('silver', 'magazine_recognition', 'Name/Logo Recognition in All Magazines', 'recurring_placement', 1, 0, NULL, 8),
('silver', 'banner_name', 'Name on Banner', 'recurring_placement', 1, 0, NULL, 9);

-- BRONZE
INSERT INTO sponsor_level_benefits (sponsor_level, benefit_code, benefit_name, benefit_type, quantity, is_claimable, capacity_mode, sort_order) VALUES
('bronze', 'breakfast_tickets', 'Membership Breakfast Tickets', 'event', 1, 0, NULL, 1),
('bronze', 'sea_recognition', 'SEA Recognition', 'event', 1, 0, NULL, 2),
('bronze', 'name_recognition', 'Name Recognition at All Events', 'inclusion', 1, 0, NULL, 3),
('bronze', 'mp_page_logo', 'Logo on MP Page', 'recurring_placement', 1, 0, NULL, 4),
('bronze', 'lobby_loop_logo', 'Logo on Front Lobby Loop', 'recurring_placement', 1, 0, NULL, 5),
('bronze', 'magazine_recognition', 'Name/Logo Recognition in All Magazines', 'recurring_placement', 1, 0, NULL, 6),
('bronze', 'banner_name', 'Name on Banner', 'recurring_placement', 1, 0, NULL, 7);

-- ═══════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════

-- Sales Excellence Awards (completed)
INSERT INTO events (event_code, event_name, event_type, event_date, year, capacity_mode, is_active, notes) VALUES
('sea_2026', 'Sales Excellence Awards 2026', 'sea', '2026-01-15', 2026, 'unlimited', 1, 'Already completed — historical tracking only');

-- Membership Breakfasts
INSERT INTO events (event_code, event_name, event_type, event_date, year, capacity_mode) VALUES
('breakfast_jun_2026', 'Membership Breakfast — June', 'breakfast', '2026-06-12', 2026, 'unlimited'),
('breakfast_sep_2026', 'Membership Breakfast — September', 'breakfast', '2026-09-11', 2026, 'unlimited'),
('breakfast_dec_2026', 'Membership Breakfast — December', 'breakfast', '2026-12-11', 2026, 'unlimited');

-- Installation
INSERT INTO events (event_code, event_name, event_type, event_date, year, capacity_mode) VALUES
('installation_2026', 'Installation 2026', 'installation', '2026-11-19', 2026, 'unlimited');

-- Poker Run (TBD)
INSERT INTO events (event_code, event_name, event_type, event_date, year, capacity_mode, notes) VALUES
('poker_run_2026', 'Poker Run 2026', 'poker_run', NULL, 2026, 'unlimited', 'Date TBD — typically September or October');

-- Golf
INSERT INTO events (event_code, event_name, event_type, event_date, year, capacity_mode, notes) VALUES
('golf_2026', 'BER Golf 2026', 'golf', NULL, 2026, 'unlimited', 'Date TBD');

-- Open House Weekends
INSERT INTO events (event_code, event_name, event_type, event_date, month_label, year, capacity_mode, max_claims, notes) VALUES
('oh_mar_2026', 'Open House Weekend — March', 'open_house', '2026-03-01', 'March 2026', 2026, 'solo', 1, 'Already claimed by State Insurance USA'),
('oh_apr_2026', 'Open House Weekend — April', 'open_house', '2026-04-01', 'April 2026', 2026, 'solo', 1, NULL),
('oh_may_2026', 'Open House Weekend — May', 'open_house', '2026-05-01', 'May 2026', 2026, 'solo', 1, NULL),
('oh_jul_2026', 'Open House Weekend — July', 'open_house', '2026-07-01', 'July 2026', 2026, 'solo', 1, NULL),
('oh_sep_2026', 'Open House Weekend — September', 'open_house', '2026-09-01', 'September 2026', 2026, 'solo', 1, NULL),
('oh_oct_2026', 'Open House Weekend — October', 'open_house', '2026-10-01', 'October 2026', 2026, 'solo', 1, NULL),
('oh_nov_2026', 'Open House Weekend — November', 'open_house', '2026-11-01', 'November 2026', 2026, 'solo', 1, NULL);

-- ═══════════════════════════════════════════
-- SPONSOR BENEFITS (auto from level templates)
-- ═══════════════════════════════════════════
-- We insert per-sponsor benefits based on their level
INSERT INTO sponsor_benefits (sponsor_id, benefit_code, benefit_name, benefit_type, included_by_level, status)
SELECT s.id, slb.benefit_code, slb.benefit_name, slb.benefit_type, 1,
    CASE WHEN slb.benefit_code IN ('sea_package','sea_recognition') THEN 'completed' ELSE 'not_started' END
FROM sponsors s
JOIN sponsor_level_benefits slb ON s.sponsor_level = slb.sponsor_level
WHERE s.active_2026 = 1;

-- ═══════════════════════════════════════════
-- OPEN HOUSE CLAIM: State Insurance USA → March 2026
-- ═══════════════════════════════════════════
INSERT INTO sponsor_event_tracking (sponsor_id, event_id, benefit_code, status, outreach_required, completed, completed_at, notes_internal)
SELECT s.id, e.id, 'oh_solo', 'claimed', 0, 0, NULL, 'Pre-confirmed March 2026 claim'
FROM sponsors s, events e
WHERE s.sponsor_name = 'State Insurance USA' AND e.event_code = 'oh_mar_2026';

-- ═══════════════════════════════════════════
-- BREAKFAST EVENT TRACKING (eligible sponsors)
-- ═══════════════════════════════════════════
-- Diamond/Platinum/Gold get 2 tickets, Silver gets 1
INSERT INTO sponsor_event_tracking (sponsor_id, event_id, benefit_code, status, outreach_required, first_reminder_due, second_reminder_due, final_reminder_due)
SELECT s.id, e.id, 'breakfast_tickets', 'not_started', 1,
    date(e.event_date, '-45 days'),
    date(e.event_date, '-21 days'),
    date(e.event_date, '-7 days')
FROM sponsors s, events e
WHERE e.event_type = 'breakfast' AND s.active_2026 = 1;

-- ═══════════════════════════════════════════
-- INSTALLATION EVENT TRACKING
-- ═══════════════════════════════════════════
INSERT INTO sponsor_event_tracking (sponsor_id, event_id, benefit_code, status, outreach_required, first_reminder_due, second_reminder_due, final_reminder_due)
SELECT s.id, e.id,
    CASE WHEN s.sponsor_level IN ('diamond','platinum','gold') THEN 'installation'
         ELSE 'installation_recognition' END,
    'not_started', 1,
    date(e.event_date, '-45 days'),
    date(e.event_date, '-21 days'),
    date(e.event_date, '-7 days')
FROM sponsors s, events e
WHERE e.event_code = 'installation_2026' AND s.active_2026 = 1;

-- ═══════════════════════════════════════════
-- RECURRING PLACEMENT CHECKS
-- ═══════════════════════════════════════════
-- Banner placements (Diamond/Platinum/Gold get logo, Silver gets name)
INSERT INTO recurring_placement_checks (sponsor_id, placement_type, placement_label, status)
SELECT s.id, 'banner', 'Logo/Name on Annual Banner', 'pending'
FROM sponsors s WHERE s.active_2026 = 1;

-- Magazine placements (Silver/Bronze explicit, others as applicable)
INSERT INTO recurring_placement_checks (sponsor_id, placement_type, placement_label, status)
SELECT s.id, 'magazine', 'Logo/Name in Magazine', 'pending'
FROM sponsors s WHERE s.active_2026 = 1;

-- MP Page placements (all levels)
INSERT INTO recurring_placement_checks (sponsor_id, placement_type, placement_label, status)
SELECT s.id, 'mp_page', 'Logo/Name on MP Page', 'pending'
FROM sponsors s WHERE s.active_2026 = 1;

-- Front Lobby / Loop placements
INSERT INTO recurring_placement_checks (sponsor_id, placement_type, placement_label, status)
SELECT s.id, 'lobby',
    CASE WHEN s.sponsor_level IN ('diamond','platinum') THEN 'Logo in Front Lobby'
         ELSE 'Logo on Front Lobby Loop' END,
    'pending'
FROM sponsors s WHERE s.active_2026 = 1;

-- ═══════════════════════════════════════════
-- EMAIL TEMPLATES
-- ═══════════════════════════════════════════
INSERT INTO email_templates (template_key, template_name, template_type, event_type, subject_template, body_template) VALUES
('oh_claim_outreach', 'Open House Claim Outreach', 'outreach', 'open_house',
 'Open House Weekend Sponsorship — {{month_label}}',
 'Hi {{sponsor_name}},\n\nAs a {{sponsor_level}} sponsor, you are entitled to an Open House Weekend sponsorship slot. We have {{month_label}} available.\n\nWould you like to claim this month?\n\nPlease reply to confirm.\n\nThank you!'),

('oh_asset_request', 'Open House Banner/Link Request', 'asset_request', 'open_house',
 'Action Needed: Banner & Clickthrough Link for {{month_label}} Open House',
 'Hi {{sponsor_name}},\n\nThank you for claiming the {{month_label}} Open House Weekend sponsorship!\n\nWe need the following to set up your campaign:\n1. Banner creative (image file or URL)\n2. Clickthrough URL (where the banner should link)\n\nPlease send these at your earliest convenience.\n\nThank you!'),

('oh_missing_asset', 'Open House Missing Asset Reminder', 'follow_up', 'open_house',
 'Reminder: Missing Assets for {{month_label}} Open House Weekend',
 'Hi {{sponsor_name}},\n\nWe are still waiting on your banner creative and/or clickthrough link for the {{month_label}} Open House Weekend.\n\nCould you please send these soon so we can finalize your campaign?\n\nThank you!'),

('breakfast_reminder', 'Breakfast Reminder', 'reminder', 'breakfast',
 'Reminder: Membership Breakfast — {{event_date}}',
 'Hi {{sponsor_name}},\n\nThis is a reminder that the Membership Breakfast is coming up on {{event_date}}.\n\nAs a {{sponsor_level}} sponsor, you have tickets reserved. Please confirm your attendance.\n\nThank you!'),

('breakfast_confirmation', 'Breakfast Confirmation', 'confirmation', 'breakfast',
 'Confirmed: Membership Breakfast — {{event_date}}',
 'Hi {{sponsor_name}},\n\nThank you for confirming your attendance at the Membership Breakfast on {{event_date}}.\n\nWe look forward to seeing you there!\n\nBest regards'),

('installation_reminder', 'Installation Reminder', 'reminder', 'installation',
 'Reminder: Installation Ceremony — {{event_date}}',
 'Hi {{sponsor_name}},\n\nThis is a reminder about the upcoming Installation ceremony on {{event_date}}.\n\nAs a {{sponsor_level}} sponsor, your participation and recognition are valued.\n\nPlease confirm your attendance.\n\nThank you!'),

('installation_followup', 'Installation Follow-Up', 'follow_up', 'installation',
 'Follow Up: Installation Ceremony — {{event_date}}',
 'Hi {{sponsor_name}},\n\nWe wanted to follow up regarding the Installation ceremony on {{event_date}}.\n\nPlease let us know if you have any questions or need any information.\n\nThank you!'),

('poker_run_outreach', 'Poker Run Outreach', 'outreach', 'poker_run',
 'Poker Run 2026 — Sponsor Information',
 'Hi {{sponsor_name}},\n\nThe Poker Run event is coming up! As a {{sponsor_level}} sponsor, you are included as a Full House sponsor.\n\nMore details will follow as the date is confirmed. Stay tuned!\n\nThank you!'),

('general_followup', 'General Sponsor Follow-Up', 'follow_up', NULL,
 'Following Up — {{sponsor_name}} Sponsorship',
 'Hi {{sponsor_name}},\n\nWe wanted to check in regarding your {{sponsor_level}} sponsorship for 2026.\n\n{{notes}}\n\nPlease let us know if you have any questions.\n\nThank you!'),

('missing_logo', 'Missing Logo / Asset Reminder', 'asset_request', NULL,
 'Action Needed: Missing Logo/Asset — {{sponsor_name}}',
 'Hi {{sponsor_name}},\n\nWe are updating our materials and need your current logo or asset for {{benefit_name}}.\n\nCould you please send a high-resolution version at your earliest convenience?\n\nThank you!'),

('general_confirmation', 'General Confirmation Request', 'outreach', NULL,
 'Confirmation Needed — {{sponsor_name}}',
 'Hi {{sponsor_name}},\n\nWe need your confirmation regarding {{benefit_name}}.\n\nPlease reply to this email or contact us directly.\n\nThank you!');

-- ═══════════════════════════════════════════
-- SETTINGS
-- ═══════════════════════════════════════════
INSERT INTO settings (setting_key, setting_value_json) VALUES
('reminder_intervals', '{"first": 45, "second": 21, "final": 7}'),
('open_house_months', '["March 2026","April 2026","May 2026","July 2026","September 2026","October 2026","November 2026"]'),
('status_labels', '["not_started","pending_outreach","reminder_due","sent_waiting_response","responded","claimed","waiting_assets","ready","completed","waived","not_applicable","overdue"]'),
('admin_email', '"admin@berealtors.org"'),
('organization_name', '"Bonita Estero REALTORS"');
