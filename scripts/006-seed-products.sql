-- Insert categories first
INSERT INTO categories (name, slug, sort_order, active) VALUES
  ('Fortnite', 'fortnite', 1, true),
  ('Valorant', 'valorant', 2, true),
  ('Apex Legends', 'apex-legends', 3, true),
  ('Call of Duty', 'call-of-duty', 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, game, category, description, image_url, status, popular, tags, features) VALUES
  (
    'Fortnite Ultimate',
    'fortnite-ultimate',
    'Fortnite',
    'Fortnite',
    'Premium external cheat for Fortnite with advanced aimbot and ESP features. Undetected and auto-update.',
    '/placeholder.svg?height=400&width=400',
    'active',
    true,
    ARRAY['Aimbot', 'ESP', 'Undetected'],
    ARRAY['Advanced bypass', 'Auto-update', '24/7 support']
  ),
  (
    'Valorant Premium',
    'valorant-premium',
    'Valorant',
    'Valorant',
    'Professional-grade Valorant enhancement tool. Trusted by thousands of players.',
    '/placeholder.svg?height=400&width=400',
    'active',
    true,
    ARRAY['Vision', 'Aim assist', 'Radar'],
    ARRAY['Instant delivery', 'Lifetime support', 'Free updates']
  ),
  (
    'Apex Legends Pro',
    'apex-legends-pro',
    'Apex Legends',
    'Apex Legends',
    'Advanced Apex Legends software with next-gen detection avoidance.',
    '/placeholder.svg?height=400&width=400',
    'active',
    true,
    ARRAY['Wallhack', 'Triggerbot', 'Spoofer'],
    ARRAY['Premium support', 'Regular updates', 'Refund guarantee']
  ),
  (
    'Call of Duty Black Ops 6 Internal',
    'call-of-duty-bo6-internal',
    'Call of Duty',
    'Call of Duty',
    'Next-generation internal cheat for COD BO6. Cutting-edge stealth technology.',
    '/placeholder.svg?height=400&width=400',
    'active',
    false,
    ARRAY['Aimbot', 'ESP', 'Internal'],
    ARRAY['Undetected', 'High performance', 'Expert support']
  ),
  (
    'Valorant Vision Pro',
    'valorant-vision-pro',
    'Valorant',
    'Valorant',
    'Vision enhancement software for competitive Valorant play.',
    '/placeholder.svg?height=400&width=400',
    'active',
    false,
    ARRAY['Vision enhancement', 'HUD customization'],
    ARRAY['Easy setup', 'Low latency', 'Frequent updates']
  ),
  (
    'Fortnite Build Master',
    'fortnite-build-master',
    'Fortnite',
    'Fortnite',
    'Building assistance software to improve your building skills.',
    '/placeholder.svg?height=400&width=400',
    'active',
    false,
    ARRAY['Build assist', 'Prediction', 'Training mode'],
    ARRAY['Skill improvement', 'Tutorial included', 'Community support']
  )
ON CONFLICT (slug) DO NOTHING;

-- Get product IDs for inserting variants
WITH product_ids AS (
  SELECT id, slug FROM products WHERE slug IN (
    'fortnite-ultimate',
    'valorant-premium',
    'apex-legends-pro',
    'call-of-duty-bo6-internal',
    'valorant-vision-pro',
    'fortnite-build-master'
  )
)

-- Insert product variants
INSERT INTO product_variants (product_id, name, price_cents, duration_days, sort_order, active) VALUES
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-ultimate'), '1 Day', 499, 1, 1, true),
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-ultimate'), '1 Week', 1399, 7, 2, true),
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-ultimate'), '1 Month', 2999, 30, 3, true),
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-ultimate'), 'Lifetime', 5399, 36500, 4, true),
  
  ((SELECT id FROM product_ids WHERE slug = 'valorant-premium'), '1 Day', 399, 1, 1, true),
  ((SELECT id FROM product_ids WHERE slug = 'valorant-premium'), '1 Week', 999, 7, 2, true),
  ((SELECT id FROM product_ids WHERE slug = 'valorant-premium'), '1 Month', 2299, 30, 3, true),
  ((SELECT id FROM product_ids WHERE slug = 'valorant-premium'), 'Lifetime', 4499, 36500, 4, true),
  
  ((SELECT id FROM product_ids WHERE slug = 'apex-legends-pro'), '1 Day', 599, 1, 1, true),
  ((SELECT id FROM product_ids WHERE slug = 'apex-legends-pro'), '1 Week', 1599, 7, 2, true),
  ((SELECT id FROM product_ids WHERE slug = 'apex-legends-pro'), '1 Month', 3599, 30, 3, true),
  ((SELECT id FROM product_ids WHERE slug = 'apex-legends-pro'), 'Lifetime', 6999, 36500, 4, true),
  
  ((SELECT id FROM product_ids WHERE slug = 'call-of-duty-bo6-internal'), '1 Day', 799, 1, 1, true),
  ((SELECT id FROM product_ids WHERE slug = 'call-of-duty-bo6-internal'), '1 Week', 1999, 7, 2, true),
  ((SELECT id FROM product_ids WHERE slug = 'call-of-duty-bo6-internal'), '1 Month', 4299, 30, 3, true),
  ((SELECT id FROM product_ids WHERE slug = 'call-of-duty-bo6-internal'), 'Lifetime', 7999, 36500, 4, true),
  
  ((SELECT id FROM product_ids WHERE slug = 'valorant-vision-pro'), '1 Day', 299, 1, 1, true),
  ((SELECT id FROM product_ids WHERE slug = 'valorant-vision-pro'), '1 Week', 799, 7, 2, true),
  ((SELECT id FROM product_ids WHERE slug = 'valorant-vision-pro'), '1 Month', 1799, 30, 3, true),
  ((SELECT id FROM product_ids WHERE slug = 'valorant-vision-pro'), 'Lifetime', 3499, 36500, 4, true),
  
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-build-master'), '1 Day', 199, 1, 1, true),
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-build-master'), '1 Week', 499, 7, 2, true),
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-build-master'), '1 Month', 999, 30, 3, true),
  ((SELECT id FROM product_ids WHERE slug = 'fortnite-build-master'), 'Lifetime', 1999, 36500, 4, true)
ON CONFLICT DO NOTHING;
