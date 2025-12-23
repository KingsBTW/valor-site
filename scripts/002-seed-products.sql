-- Warp Cheats Products - Real Product Catalog
-- Fortnite External Cheats
INSERT INTO products (slug, name, game, category, description, features, image_url, status, tags, popular) VALUES
('disconnect-fortnite-external', 'Disconnect - Fortnite External', 'Fortnite', 'cheat', 'Premium external cheat for Fortnite with advanced features and undetected status.', ARRAY['Aimbot', 'Player ESP', 'Loot ESP', 'Radar', 'Stream Safe', 'Auto Update'], 'https://i.postimg.cc/TwRcw5QZ/disconnect-fn.webp', 'undetected', ARRAY['fortnite', 'external', 'premium'], true),
('exodus-fortnite-external', 'Exodus - Fortnite External', 'Fortnite', 'cheat', 'High-performance external Fortnite cheat with smooth aimbot and advanced ESP features.', ARRAY['Smooth Aimbot', 'Player ESP', 'Loot ESP', 'Memory Safe', 'Auto Update', 'Stream Proof'], 'https://i.postimg.cc/Zqm87yk5/exodus-fn.webp', 'undetected', ARRAY['fortnite', 'external', 'aimbot'], true),
('ultimate-fortnite-external', 'Ultimate - Fortnite External', 'Fortnite', 'cheat', 'Ultimate external cheat package for Fortnite with all features included.', ARRAY['Full Feature Set', 'Aimbot', 'ESP', 'Misc Features', 'Priority Support', 'Regular Updates'], 'https://i.postimg.cc/kGL8x2Nv/ULTIMATE.webp', 'undetected', ARRAY['fortnite', 'external', 'premium'], true),
('venom-fortnite-external', 'Venom - Fortnite External', 'Fortnite', 'cheat', 'Powerful external Fortnite cheat with advanced targeting and ESP capabilities.', ARRAY['Advanced Aimbot', 'Full ESP', 'Radar Hack', 'Stream Proof', 'Regular Updates', 'Anti-Screenshot'], 'https://i.postimg.cc/W1LgzJ1r/venom-fn.webp', 'undetected', ARRAY['fortnite', 'external', 'advanced'], false),
('warp-fortnite-private', 'Warp - Fortnite Private', 'Fortnite', 'cheat', 'Private Fortnite cheat with exclusive features and maximum security. Limited slots available.', ARRAY['Private Build', 'Exclusive Features', 'VIP Support', 'Limited Slots', 'Maximum Security', 'Priority Updates'], 'https://i.postimg.cc/XJJymfQR/fortnite-private.webp', 'undetected', ARRAY['fortnite', 'private', 'exclusive'], true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  game = EXCLUDED.game,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  popular = EXCLUDED.popular;

-- Spoofer Products
INSERT INTO products (slug, name, game, category, description, features, image_url, status, tags, popular) VALUES
('exodus-temp-spoofer', 'Exodus - Temp Spoofer', 'Universal', 'spoofer', 'Temporary HWID spoofer for Fortnite. Session-based hardware masking for safe gameplay.', ARRAY['Session Spoof', 'Quick Setup', 'Light Weight', 'All Anti-Cheats', 'No Traces', 'Budget Option'], 'https://i.postimg.cc/B6Y2nYjt/EXODUS-TEMP.webp', 'undetected', ARRAY['spoofer', 'hwid', 'temporary'], true),
('verse-perm-spoofer', 'Verse - Perm Spoofer', 'Universal', 'spoofer', 'Permanent HWID spoofer that survives reboots. Full hardware masking for maximum protection.', ARRAY['Permanent Spoof', 'All Hardware IDs', 'Survives Reboot', 'Easy Setup', 'Auto Updates', '24/7 Support'], 'https://i.postimg.cc/mrT9NfMb/VERSE-PERM.webp', 'undetected', ARRAY['spoofer', 'hwid', 'permanent'], false)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  game = EXCLUDED.game,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  popular = EXCLUDED.popular;
