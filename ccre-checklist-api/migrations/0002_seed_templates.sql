-- Seed: REALTOR onboarding path (8 steps)
INSERT OR IGNORE INTO workflow_templates (template_key, member_type, step_key, title, description, day_offset, touchpoint_type, default_owner, sort_order) VALUES
('realtor_onboarding', 'realtor', 'day0_welcome', 'Welcome Email & Record Setup', 'Create record, send welcome email, expose member checklist page.', 0, 'system_welcome', 'system', 1),
('realtor_onboarding', 'realtor', 'day1_call', 'Welcome Call', 'Welcome call attempt and note outcome.', 1, 'welcome_call', 'member_experience', 2),
('realtor_onboarding', 'realtor', 'day3_orientation', 'Orientation / Benefits Email', 'Send orientation / benefits email with key resources.', 3, 'follow_up', 'member_experience', 3),
('realtor_onboarding', 'realtor', 'day7_profile', 'Profile Check & Setup Help', 'Check profile completeness and answer any setup questions.', 7, 'follow_up', 'member_experience', 4),
('realtor_onboarding', 'realtor', 'day14_engage', 'Event / Committee Invitation', 'Invite to upcoming class, event, or committee touchpoint.', 14, 'engagement', 'member_experience', 5),
('realtor_onboarding', 'realtor', 'day30_checkin', '30-Day Check-In', '30-day check-in call or email.', 30, 'check_in', 'member_experience', 6),
('realtor_onboarding', 'realtor', 'day60_adopt', '60-Day Engagement Outreach', 'Encourage tool adoption, event attendance, or committee involvement.', 60, 'engagement', 'member_experience', 7),
('realtor_onboarding', 'realtor', 'day90_review', '90-Day Review', '90-day review and ambassador / peer introduction where appropriate.', 90, 'ambassador', 'member_experience', 8);

-- Seed: Affiliate onboarding path (6 steps)
INSERT OR IGNORE INTO workflow_templates (template_key, member_type, step_key, title, description, day_offset, touchpoint_type, default_owner, sort_order) VALUES
('affiliate_onboarding', 'affiliate', 'day0_welcome', 'Welcome Email & Record Setup', 'Create record, send affiliate welcome email, expose member checklist page.', 0, 'system_welcome', 'system', 1),
('affiliate_onboarding', 'affiliate', 'day2_call', 'Welcome Call', 'Welcome call introducing benefits, visibility, and event opportunities.', 2, 'welcome_call', 'member_experience', 2),
('affiliate_onboarding', 'affiliate', 'day7_guide', 'Sponsorship / Networking Guide', 'Send sponsorship / networking / directory guidance.', 7, 'follow_up', 'member_experience', 3),
('affiliate_onboarding', 'affiliate', 'day21_engage', 'Networking Event Invitation', 'Invite to a networking event or relevant committee touchpoint.', 21, 'engagement', 'member_experience', 4),
('affiliate_onboarding', 'affiliate', 'day45_checkin', '45-Day Check-In', 'Check in on goals, event participation, and questions.', 45, 'check_in', 'member_experience', 5),
('affiliate_onboarding', 'affiliate', 'day90_review', '90-Day Review', 'Review engagement and recommend next-year visibility opportunities.', 90, 'ambassador', 'member_experience', 6);

-- Initialize sync state
INSERT OR IGNORE INTO sync_state (source_name, status) VALUES ('growthzone', 'idle');
