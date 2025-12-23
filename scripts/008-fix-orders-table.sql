-- =============================================
-- FIX ORDERS TABLE STRUCTURE
-- Add missing metadata column
-- =============================================

-- Add metadata column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Also ensure all other required columns exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_cents INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS license_key_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Drop old columns that don't match
ALTER TABLE orders DROP COLUMN IF EXISTS customer_name;
ALTER TABLE orders DROP COLUMN IF EXISTS product_name;
ALTER TABLE orders DROP COLUMN IF EXISTS variant_name;
ALTER TABLE orders DROP COLUMN IF EXISTS amount;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_intent_id;
ALTER TABLE orders DROP COLUMN IF EXISTS stripe_session_id;
ALTER TABLE orders DROP COLUMN IF EXISTS license_key;
ALTER TABLE orders DROP COLUMN IF EXISTS coupon_code;
ALTER TABLE orders DROP COLUMN IF EXISTS discount_amount;

-- Make order_number unique if not already
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_order_number_key'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session ON orders(stripe_checkout_session_id);

-- Update RLS policies for orders
DROP POLICY IF EXISTS "Service role has full access to orders" ON orders;
CREATE POLICY "Service role has full access to orders" ON orders
  FOR ALL USING (true);
