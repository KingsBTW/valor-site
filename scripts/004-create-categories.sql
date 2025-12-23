-- Create categories table for game filtering
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Insert default game categories based on common cheats
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Fortnite', 'fortnite', 1),
  ('Valorant', 'valorant', 2),
  ('Apex Legends', 'apex-legends', 3),
  ('Rust', 'rust', 4),
  ('Call of Duty', 'call-of-duty', 5),
  ('Rainbow Six Siege', 'rainbow-six-siege', 6),
  ('PUBG', 'pubg', 7),
  ('EFT', 'eft', 8),
  ('Delta Force', 'delta-force', 9),
  ('Marvel Rivals', 'marvel-rivals', 10),
  ('HWID Spoofer', 'hwid-spoofer', 11),
  ('Accounts', 'accounts', 12)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active categories
CREATE POLICY "Anyone can read active categories" ON categories
  FOR SELECT USING (active = true);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access on categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');
