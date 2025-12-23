-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- Run this after creating tables
-- =============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PUBLIC READ POLICIES (for storefront)
-- =============================================

-- Anyone can read active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Anyone can read active variants
CREATE POLICY "Public can view active variants" ON product_variants
  FOR SELECT USING (status = 'active');

-- Anyone can read active coupons (for validation)
CREATE POLICY "Public can view active coupons" ON coupons
  FOR SELECT USING (status = 'active');

-- =============================================
-- SERVICE ROLE FULL ACCESS (for server-side)
-- =============================================

-- Products - full access for service role
CREATE POLICY "Service role has full access to products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Variants - full access for service role
CREATE POLICY "Service role has full access to variants" ON product_variants
  FOR ALL USING (auth.role() = 'service_role');

-- License keys - full access for service role only
CREATE POLICY "Service role has full access to license_keys" ON license_keys
  FOR ALL USING (auth.role() = 'service_role');

-- Orders - full access for service role
CREATE POLICY "Service role has full access to orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Coupons - full access for service role
CREATE POLICY "Service role has full access to coupons" ON coupons
  FOR ALL USING (auth.role() = 'service_role');

-- Site settings - full access for service role
CREATE POLICY "Service role has full access to site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Support tickets - full access for service role
CREATE POLICY "Service role has full access to support_tickets" ON support_tickets
  FOR ALL USING (auth.role() = 'service_role');
