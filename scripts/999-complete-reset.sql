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
('temp-spoofer', 'Temp Spoofer', 'Universal', 'spoofer', '24h2 supported Undetected HWID Spoofer for PC Games. Bypass hardware bans instantly with our Undetected HWID Spoofer. Whether you''ve been flagged by Easy Anti-Cheat (EAC), BattlEye, Vanguard, or Faceit, our powerful HWID changer for games gives you a clean identity — and a second chance to play. Perfect for competitive gamers facing hardware bans, our spoofer resets your system identifiers in seconds and keeps you undetected in every match.', ARRAY['Session Spoof', 'Quick Setup', 'Light Weight', 'All Anti-Cheats', 'No Traces', 'Budget Option', 'One Click'], 'https://i.postimg.cc/LhFHjP58/temp.png', 'undetected', ARRAY['spoofer', 'hwid', 'temporary'], true, true),
('perm-spoofer', 'Perm Spoofer', 'Universal', 'spoofer', 'Permanent HWID spoofer that survives reboots. Full hardware masking.', ARRAY['Permanent Spoof', 'All Hardware IDs', 'Survives Reboot', 'Easy Setup', 'Auto Updates', '24/7 Support'], 'https://i.postimg.cc/RC6KQzqJ/perm.png', 'undetected', ARRAY['spoofer', 'hwid', 'permanent'], true, true),
('fortnite-public', 'Fortnite Public', 'Fortnite', 'cheat', 'Premium external cheat for Fortnite with advanced aimbot and ESP features. Undetected and kernel-level protection.', ARRAY['Silent Aim', 'Player ESP', 'Loot ESP', 'Aimbot FOV', 'Triggerbot', 'Stream Proof'], 'https://i.postimg.cc/9MSXFKjk/pub.png', 'undetected', ARRAY['fortnite', 'external', 'public'], true, true),
('fortnite-private', 'Fortnite Private', 'Fortnite', 'cheat', 'Premium external cheat for Fortnite with advanced aimbot and ESP features. Undetected and kernel-level protection.', ARRAY['Mouse Aim', 'Memory Aim', 'Aim FOV', 'Prediction', 'Visible Check', '2D Box', 'Corner Box', 'Filled Box', 'Skeleton', 'Snapline', 'Rank Display', 'Platform Display', 'Distance Display', 'Spectator Count', 'Username Display'], 'https://i.postimg.cc/zfxX43tc/priv.png', 'undetected', ARRAY['fortnite', 'external', 'private'], true, true);

-- =============================================
-- SEED VARIANTS
-- =============================================

-- Temp Spoofer
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 699, 1, true FROM products WHERE slug = 'temp-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '15 Day', 15, 1499, 2, true FROM products WHERE slug = 'temp-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '31 Day', 31, 2999, 3, true FROM products WHERE slug = 'temp-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '90 Day', 90, 7999, 4, true FROM products WHERE slug = 'temp-spoofer';

-- Perm Spoofer
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'One-Time', NULL, 2099, 1, true FROM products WHERE slug = 'perm-spoofer';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'Lifetime', NULL, 5299, 2, true FROM products WHERE slug = 'perm-spoofer';

-- Fortnite Public
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 599, 1, true FROM products WHERE slug = 'fortnite-public';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 3199, 2, true FROM products WHERE slug = 'fortnite-public';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '31 Day', 31, 5999, 3, true FROM products WHERE slug = 'fortnite-public';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'Lifetime', NULL, 14999, 4, true FROM products WHERE slug = 'fortnite-public';

-- Fortnite Private
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '1 Day', 1, 799, 1, true FROM products WHERE slug = 'fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '3 Day', 3, 1199, 2, true FROM products WHERE slug = 'fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '7 Day', 7, 1999, 3, true FROM products WHERE slug = 'fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, '31 Day', 31, 3999, 4, true FROM products WHERE slug = 'fortnite-private';
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order, active) 
SELECT id, 'Lifetime', NULL, 14999, 5, true FROM products WHERE slug = 'fortnite-private';

-- =============================================
-- SEED SITE SETTINGS
-- =============================================
INSERT INTO site_settings (key, value) VALUES
('payment_provider', '"stripe"'),
('site_name', '"Valor"'),
('site_url', '"https://valor.com"'),
('maintenance_mode', 'false')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
