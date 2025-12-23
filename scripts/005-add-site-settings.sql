-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('payment_provider', '"stripe"'),
  ('cardsetup_store_url', '"https://warpcheats.com"'),
  ('site_name', '"Warp Cheats"'),
  ('site_url', '"https://warpcheats.com"'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;
