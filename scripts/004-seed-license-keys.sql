-- Seed some sample license keys for testing
-- In production, you would add real license keys via the admin panel

-- Helper function to generate random license keys
CREATE OR REPLACE FUNCTION generate_license_key() RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(
    SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4) || '-' ||
    SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4) || '-' ||
    SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4) || '-' ||
    SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)
  );
END;
$$ LANGUAGE plpgsql;

-- Add 5 license keys per variant for testing
DO $$
DECLARE
  v RECORD;
  i INTEGER;
BEGIN
  FOR v IN SELECT pv.id FROM product_variants pv LOOP
    FOR i IN 1..5 LOOP
      INSERT INTO license_keys (variant_id, license_key, status)
      VALUES (v.id, generate_license_key(), 'unused')
      ON CONFLICT (license_key) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
