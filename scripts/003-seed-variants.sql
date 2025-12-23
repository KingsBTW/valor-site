-- =============================================
-- WARP CHEATS - PRODUCT VARIANTS WITH EXACT PRICING
-- =============================================

-- Disconnect - Fortnite External
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '1 Day', 1, 899, 1 FROM products WHERE slug = 'disconnect-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '3 Day', 3, 1799, 2 FROM products WHERE slug = 'disconnect-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '7 Day', 7, 3499, 3 FROM products WHERE slug = 'disconnect-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '30 Day', 30, 6499, 4 FROM products WHERE slug = 'disconnect-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, 'Lifetime', NULL, 29999, 5 FROM products WHERE slug = 'disconnect-fortnite-external' ON CONFLICT DO NOTHING;

-- Exodus - Fortnite External
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '1 Day', 1, 399, 1 FROM products WHERE slug = 'exodus-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '3 Day', 3, 799, 2 FROM products WHERE slug = 'exodus-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '7 Day', 7, 1999, 3 FROM products WHERE slug = 'exodus-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '30 Day', 30, 3999, 4 FROM products WHERE slug = 'exodus-fortnite-external' ON CONFLICT DO NOTHING;

-- Exodus - Temp Spoofer
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '1 Day', 1, 299, 1 FROM products WHERE slug = 'exodus-temp-spoofer' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '3 Day', 3, 599, 2 FROM products WHERE slug = 'exodus-temp-spoofer' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '7 Day', 7, 999, 3 FROM products WHERE slug = 'exodus-temp-spoofer' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '29 Day', 29, 1999, 4 FROM products WHERE slug = 'exodus-temp-spoofer' ON CONFLICT DO NOTHING;

-- Ultimate - Fortnite External
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '1 Day', 1, 599, 1 FROM products WHERE slug = 'ultimate-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '3 Day', 3, 1499, 2 FROM products WHERE slug = 'ultimate-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '7 Day', 7, 2499, 3 FROM products WHERE slug = 'ultimate-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '30 Day', 30, 4999, 4 FROM products WHERE slug = 'ultimate-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, 'Lifetime', NULL, 19999, 5 FROM products WHERE slug = 'ultimate-fortnite-external' ON CONFLICT DO NOTHING;

-- Venom - Fortnite External
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '1 Day', 1, 699, 1 FROM products WHERE slug = 'venom-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '3 Day', 3, 1499, 2 FROM products WHERE slug = 'venom-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '7 Day', 7, 2999, 3 FROM products WHERE slug = 'venom-fortnite-external' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '30 Day', 30, 5999, 4 FROM products WHERE slug = 'venom-fortnite-external' ON CONFLICT DO NOTHING;

-- Verse - Perm Spoofer
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, 'One Time Use', NULL, 2399, 1 FROM products WHERE slug = 'verse-perm-spoofer' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, 'Lifetime', NULL, 7099, 2 FROM products WHERE slug = 'verse-perm-spoofer' ON CONFLICT DO NOTHING;

-- Warp - Fortnite Private
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '1 Day', 1, 799, 1 FROM products WHERE slug = 'warp-fortnite-private' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '3 Day', 3, 1199, 2 FROM products WHERE slug = 'warp-fortnite-private' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '7 Day', 7, 1999, 3 FROM products WHERE slug = 'warp-fortnite-private' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, '31 Day', 31, 3999, 4 FROM products WHERE slug = 'warp-fortnite-private' ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, name, duration_days, price_cents, sort_order) 
SELECT id, 'Lifetime', NULL, 14999, 5 FROM products WHERE slug = 'warp-fortnite-private' ON CONFLICT DO NOTHING;
