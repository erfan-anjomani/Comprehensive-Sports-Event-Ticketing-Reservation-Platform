-- =====================================================================
-- Seed data for the sports ticket reservation system
-- =====================================================================

-- users
INSERT INTO users (first_name, last_name, email, phone, user_role, city,
                   password_hash, register_date, account_status)
VALUES
  ('Ali',      'Ahmadi',    'ali@test.com',        '09120000001', 'spectator', 'Tehran',  'hash', '2024-01-01 00:00:00', 'active'),
  ('Sara',     'Mohammadi', 'sara@test.com',       '09120000002', 'spectator', 'Isfahan', 'hash', NOW(),                 'active'),
  ('Reza',     'Hosseini',  'reza@test.com',       '09120000003', 'spectator', 'Tehran',  'hash', NOW(),                 'active'),
  ('Neda',     'Karimi',    'neda@test.com',       '09120000004', 'spectator', 'Tehran',  'hash', NOW(),                 'active'),
  ('Amir',     'Rezaei',    'amir@test.com',       '09120000005', 'spectator', 'Karaj',   'hash', NOW(),                 'active'),
  ('Maryam',   'Safari',    'maryam@test.com',     '09120000006', 'spectator', 'Shiraz',  'hash', NOW(),                 'active'),
  ('Pouya',    'Norouzi',   'pouya@test.com',      '09120000007', 'spectator', 'Tabriz',  'hash', NOW(),                 'active'),
  ('Zahra',    'Ebrahimi',  'zahra@test.com',      '09120000008', 'spectator', 'Tehran',  'hash', NOW(),                 'active'),
  ('Support1', 'Rad',       'support1@test.com',   '09120000009', 'support',   'Tehran',  'hash', NOW(),                 'active'),
  ('Support2', 'Naseri',    'support2@test.com',   '09120000010', 'support',   'Mashhad', 'hash', NOW(),                 'active'),
  ('John',     'Smith',     'usercancel@test.com', '09120000011', 'spectator', 'Tehran',  'hash', NOW(),                 'active'),
  ('Extra1',   'Extra',     'extra1@test.com',     '09120000012', 'spectator', 'Qom',     'hash', NOW(),                 'active'),
  ('Hasan',    'Rahimi',    'hasan@test.com',      '09120000013', 'spectator', 'Mashhad', 'hash', NOW(),                 'active'),
  ('Hadi',     'Rahmani',   'hadi@test.com',       '09120000014', 'spectator', 'Karaj',   'hash', NOW(),                 'active');

