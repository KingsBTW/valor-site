-- =============================================
-- FIX PRODUCT VARIANTS TABLE STRUCTURE
-- Run this to update the table to match the code expectations
-- =============================================

-- First, delete all existing variants (we'll re-seed them)
DELETE FROM product_variants;

-- Drop columns that don't match the expected structure
ALTER TABLE product_variants DROP COLUMN IF EXISTS price;
ALTER TABLE product_variants DROP COLUMN IF EXISTS original_price;
ALTER TABLE product_variants DROP COLUMN IF EXISTS features;
ALTER TABLE product_variants DROP COLUMN IF EXISTS stock;
ALTER TABLE product_variants DROP COLUMN IF EXISTS status;

-- Add the correct columns that the code expects
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_variants_sort_order ON product_variants(sort_order);
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(active);

-- Update RLS policies to work with active column instead of status
DROP POLICY IF EXISTS "Public can view active variants" ON product_variants;
CREATE POLICY "Public can view active variants" ON product_variants
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Service role has full access to variants" ON product_variants;
CREATE POLICY "Service role has full access to variants" ON product_variants
  FOR ALL USING (true);

-- =============================================
-- FIX PRODUCTS TABLE
-- =============================================

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS game TEXT DEFAULT 'Universal';
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Drop status column if it exists (we use active instead)
-- ALTER TABLE products DROP COLUMN IF EXISTS status;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_game ON products(game);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(popular);

-- Update products RLS policy
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Service role has full access to products" ON products;
CREATE POLICY "Service role has full access to products" ON products
  FOR ALL USING (true);
