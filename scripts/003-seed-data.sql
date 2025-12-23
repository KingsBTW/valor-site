-- =============================================
-- VALOR - SAMPLE DATA (OPTIONAL)
-- Only run this if you want sample coupons
-- =============================================

-- Insert a sample coupon
INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, status) VALUES
('WELCOME10', 'Welcome discount - 10% off first purchase', 'percentage', 10, 100, 'active'),
('VALOR20', 'Special 20% discount', 'percentage', 20, 50, 'active')
ON CONFLICT (code) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
('maintenance_mode', '{"enabled": false, "message": "Site is under maintenance"}'::jsonb),
('announcement', '{"enabled": false, "message": "", "type": "info"}'::jsonb)
ON CONFLICT (key) DO NOTHING;


