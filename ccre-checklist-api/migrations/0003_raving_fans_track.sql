-- Migration: Raving Fans 100-Day Onboarding Track
-- This replaces the original onboarding milestones with the new 100-day strategy.

-- Clear existing templates to avoid duplicates/conflicts
DELETE FROM workflow_templates;

-- REALTOR® Members (100 days)
INSERT INTO workflow_templates (template_key, member_type, step_key, title, description, day_offset, touchpoint_type, default_owner, sort_order) VALUES
('realtor_onboarding', 'realtor', 'day0_welcome', 'Welcome Email & Record Setup', 'Send welcome email, expose member checklist page.', 0, 'system_welcome', 'system', 1),
('realtor_onboarding', 'realtor', 'day7_requirements', 'Mandatory Requirements Check', 'Verify member has completed initial mandatory requirements.', 7, 'follow_up', 'member_experience', 2),
('realtor_onboarding', 'realtor', 'day14_mls_login', 'MLS Login Consistency', 'Verify member is logging into MLS consistently.', 14, 'follow_up', 'member_experience', 3),
('realtor_onboarding', 'realtor', 'day30_tools', 'Business Tools Setup', 'Set up key business tools and ensure proper configuration.', 30, 'check_in', 'member_experience', 4),
('realtor_onboarding', 'realtor', 'day45_events', 'BER Events / Classes Check', 'Verify attendance of at least 2 BER events/classes.', 45, 'engagement', 'member_experience', 5),
('realtor_onboarding', 'realtor', 'day60_committee', 'Committee / Engagement Pathway', 'Member joined a committee or engagement pathway.', 60, 'engagement', 'member_experience', 6),
('realtor_onboarding', 'realtor', 'day75_staff_check', 'Staff Relationship Check', 'Member personally knows BER staff members.', 75, 'follow_up', 'member_experience', 7),
('realtor_onboarding', 'realtor', 'day100_review', '100-Day Final Review', 'Final review of onboarding success milestones.', 100, 'ambassador', 'member_experience', 8);

-- Affiliate Members (100 days)
INSERT INTO workflow_templates (template_key, member_type, step_key, title, description, day_offset, touchpoint_type, default_owner, sort_order) VALUES
('affiliate_onboarding', 'affiliate', 'day0_welcome', 'Welcome Email & Record Setup', 'Send affiliate welcome email, expose member checklist page.', 0, 'system_welcome', 'system', 1),
('affiliate_onboarding', 'affiliate', 'day7_roi', 'ROI of Membership', 'Verify understanding of ROI of membership.', 7, 'follow_up', 'member_experience', 2),
('affiliate_onboarding', 'affiliate', 'day14_relationships', 'REALTOR® Relationships', 'Built relationships with REALTORS®.', 14, 'follow_up', 'member_experience', 3),
('affiliate_onboarding', 'affiliate', 'day30_networking', 'Networking Opportunities', 'Attended networking opportunities.', 30, 'check_in', 'member_experience', 4),
('affiliate_onboarding', 'affiliate', 'day45_visibility', 'Visibility Introduction', 'Been visibly introduced to membership.', 45, 'engagement', 'member_experience', 5),
('affiliate_onboarding', 'affiliate', 'day60_lanes', 'Engagement Lane Identification', 'Identified at least one engagement lane.', 60, 'engagement', 'member_experience', 6),
('affiliate_onboarding', 'affiliate', 'day75_check', 'Ongoing Relationship Check', 'Review progress on relationship building.', 75, 'follow_up', 'member_experience', 7),
('affiliate_onboarding', 'affiliate', 'day100_review', '100-Day Final Review', 'Final review of onboarding success milestones.', 100, 'ambassador', 'member_experience', 8);
