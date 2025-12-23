-- =============================================
-- COMPLETE DATABASE RESET AND FIX
-- This will drop and recreate everything correctly
-- =============================================

-- Drop all existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS emails_sent CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS license_keys CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CREATE PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  game TEXT DEFAULT 'Universal',
  category TEXT DEFAULT 'general',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  status TEXT DEFAULT 'undetected',
  tags TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE PRODUCT VARIANTS TABLE
-- =============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE LICENSE KEYS TABLE
-- =============================================
CREATE TABLE license_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired', 'revoked')),
  assigned_to_order UUID,
  assigned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE ORDERS TABLE
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  license_key_id UUID REFERENCES license_keys(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  payment_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- =============================================
-- CREATE COUPONS TABLE
-- =============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_order_cents INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE SITE SETTINGS TABLE
-- =============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE SUPPORT TICKETS TABLE
-- =============================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE EMAILS SENT TABLE
-- =============================================
CREATE TABLE emails_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE INDEXES
-- =============================================
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_popular ON products(popular);
CREATE INDEX idx_products_game ON products(game);

CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_active ON product_variants(active);
CREATE INDEX idx_variants_sort_order ON product_variants(sort_order);

CREATE INDEX idx_license_keys_variant_id ON license_keys(variant_id);
CREATE INDEX idx_license_keys_status ON license_keys(status);

CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE RLS POLICIES
-- =============================================

-- Products - public can view active
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Service role full access to products" ON products
  FOR ALL USING (true);

-- Variants - public can view active
CREATE POLICY "Public can view active variants" ON product_variants
  FOR SELECT USING (active = true);

CREATE POLICY "Service role full access to variants" ON product_variants
  FOR ALL USING (true);

-- License keys - service role only
CREATE POLICY "Service role full access to license_keys" ON license_keys
  FOR ALL USING (true);

-- Orders - service role only
CREATE POLICY "Service role full access to orders" ON orders
  FOR ALL USING (true);

-- Coupons - public can view active
CREATE POLICY "Public can view active coupons" ON coupons
  FOR SELECT USING (active = true);

CREATE POLICY "Service role full access to coupons" ON coupons
  FOR ALL USING (true);

-- Site settings - service role only
CREATE POLICY "Service role full access to site_settings" ON site_settings
  FOR ALL USING (true);

-- Support tickets - service role only
CREATE POLICY "Service role full access to support_tickets" ON support_tickets
  FOR ALL USING (true);

-- Emails sent - service role only
CREATE POLICY "Service role full access to emails_sent" ON emails_sent
  FOR ALL USING (true);

-- Categories - public can view active
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (active = true);

CREATE POLICY "Service role full access to categories" ON categories
  FOR ALL USING (true);

-- =============================================
-- SEED PRODUCTS
-- =============================================
INSERT INTO products (slug, name, game, category, description, features, image_url, status, tags, popular, active) VALUES
('disconnect-fortnite-external', 'Disconnect - Fortnite External', 'Fortnite', 'cheat', 'Premium external cheat for Fortnite with advanced features and undetected status.', ARRAY['Aimbot', 'Player ESP', 'Loot ESP', 'Radar', 'Stream Safe', 'Auto Update'], 'https://i.postimg.cc/TwRcw5QZ/disconnect-fn.webp', 'undetected', ARRAY['fortnite', 'external', 'premium'], true, true),
('exodus-fortnite-external', 'Exodus - Fortnite External', 'Fortnite', 'cheat', 'High-performance external Fortnite cheat with smooth aimbot and advanced ESP features.', ARRAY['Smooth Aimbot', 'Player ESP', 'Loot ESP', 'Memory Safe', 'Auto Update', 'Stream Proof'], 'https://i.postimg.cc/Zqm87yk5/exodus-fn.webp', 'undetected', ARRAY['fortnite', 'external', 'aimbot'], true, true),
('ultimate-fortnite-external', 'Ultimate - Fortnite External', 'Fortnite', 'cheat', 'Ultimate external cheat package for Fortnite with all features included.', ARRAY['Full Feature Set', 'Aimbot', 'ESP', 'Misc Features', 'Priority Support', 'Regular Updates'], 'https://i.postimg.cc/kGL8x2Nv/ULTIMATE.webp', 'undetected', ARRAY['fortnite', 'external', 'premium'], true, true),
('venom-fortnite-external', 'Venom - Fortnite External', 'Fortnite', 'cheat', 'Powerful external Fortnite cheat with advanced targeting and ESP capabilities.', ARRAY['Advanced Aimbot', 'Full ESP', 'Radar Hack', 'Stream Proof', 'Regular Updates', 'Anti-Screenshot'], 'https://i.postimg.cc/W1LgzJ1r/venom-fn.webp', 'undetected', ARRAY['fortnite', 'external', 'advanced'], false, true),
('warp-fortnite-private', 'Warp - Fortnite Private', 'Fortnite', 'cheat', 'Private Fortnite cheat with exclusive features and maximum security. Limited slots available.', ARRAY['Private Build', 'Exclusive Features', 'VIP Support', 'Limited Slots', 'Maximum Security', 'Priority Updates'], 'https://i.postimg.cc/XJJymfQR/fortnite-private.webp', 'undetected', ARRAY['fortnite', 'private', 'exclusive'], true, true),
('exodus-temp-spoofer', 'Exodus - Temp Spoofer', 'Universal', 'spoofer', 'Temporary HWID spoofer for Fortnite. Session-based hardware masking for safe gameplay.', ARRAY['Session Spoof', 'Quick Setup', 'Light Weight', 'All Anti-Cheats', 'No Traces', 'Budget Option'], 'https://i.postimg.cc/B6Y2nYjt/EXODUS-TEMP.webp', 'undetected', ARRAY['spoofer', 'hwid', 'temporary'], true, true),
('verse-perm-spoofer', 'Verse - Perm Spoofer', 'Universal', 'spoofer', 'Permanent HWID spoofer that survives reboots. Full hardware masking for maximum protection.', ARRAY['Permanent Spoof', 'All Hardware IDs', 'Survives Reboot', 'Easy Setup', 'Auto Updates', '24/7 Support'], 'https://i.postimg.cc/mrT9NfMb/VERSE-PERM.webp', 'undetected', ARRAY['spoofer', 'hwid', 'permanent'], false, true);

-- =============================================
-- SEED VARIANTS
-- =============================================

-- Disconnect
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 899, 1, true FROM products WHERE slug = 'disconnect-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 1799, 2, true FROM products WHERE slug = 'disconnect-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 3499, 3, true FROM products WHERE slug = 'disconnect-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '30 Day', 30, 6499, 4, true FROM products WHERE slug = 'disconnect-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'Lifetime', NULL, 29999, 5, true FROM products WHERE slug = 'disconnect-fortnite-external';

-- Exodus
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 399, 1, true FROM products WHERE slug = 'exodus-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 799, 2, true FROM products WHERE slug = 'exodus-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 1999, 3, true FROM products WHERE slug = 'exodus-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '30 Day', 30, 3999, 4, true FROM products WHERE slug = 'exodus-fortnite-external';

-- Exodus Temp
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 299, 1, true FROM products WHERE slug = 'exodus-temp-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 599, 2, true FROM products WHERE slug = 'exodus-temp-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 999, 3, true FROM products WHERE slug = 'exodus-temp-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '29 Day', 29, 1999, 4, true FROM products WHERE slug = 'exodus-temp-spoofer';

-- Ultimate
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 599, 1, true FROM products WHERE slug = 'ultimate-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 1499, 2, true FROM products WHERE slug = 'ultimate-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 2499, 3, true FROM products WHERE slug = 'ultimate-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '30 Day', 30, 4999, 4, true FROM products WHERE slug = 'ultimate-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'Lifetime', NULL, 19999, 5, true FROM products WHERE slug = 'ultimate-fortnite-external';

-- Venom
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 699, 1, true FROM products WHERE slug = 'venom-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 1499, 2, true FROM products WHERE slug = 'venom-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 2999, 3, true FROM products WHERE slug = 'venom-fortnite-external';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '30 Day', 30, 5999, 4, true FROM products WHERE slug = 'venom-fortnite-external';

-- Verse
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'One Time Use', NULL, 2399, 1, true FROM products WHERE slug = 'verse-perm-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'Lifetime', NULL, 7099, 2, true FROM products WHERE slug = 'verse-perm-spoofer';

-- Warp
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 799, 1, true FROM products WHERE slug = 'warp-fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 1199, 2, true FROM products WHERE slug = 'warp-fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 1999, 3, true FROM products WHERE slug = 'warp-fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '31 Day', 31, 3999, 4, true FROM products WHERE slug = 'warp-fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'Lifetime', NULL, 14999, 5, true FROM products WHERE slug = 'warp-fortnite-private';

-- =============================================
-- SEED SITE SETTINGS
-- =============================================
INSERT INTO site_settings (key, value) VALUES
('payment_provider', '"stripe"'),
('site_name', '"Warp Cheats"'),
('site_url', '"https://warpcheats.com"'),
('maintenance_mode', 'false')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
