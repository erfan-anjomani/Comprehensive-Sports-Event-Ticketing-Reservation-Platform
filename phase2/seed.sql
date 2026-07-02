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

-- tickets
INSERT INTO tickets (sport, host_team, guest_team, match_date,
                     match_location, ticket_price, remaining_capacity)
VALUES
  ('football',  'Real Madrid',          'Barcelona',      '2025-06-15 20:00:00', 'Madrid',        100.00, 100),
  ('football',  'Manchester United',    'Liverpool',      '2025-06-16 18:00:00', 'Manchester',    120.00,  80),
  ('football',  'AC Milan',             'Inter Milan',    '2025-06-17 21:00:00', 'Milan',          90.00, 150),
  ('football',  'Bayern Munich',        'Dortmund',       CURRENT_DATE - INTERVAL '1 day' + TIME '18:00:00', 'Munich', 110.00, 200),
  ('football',  'Persepolis',           'Esteghlal',      CURRENT_DATE - INTERVAL '1 day' + TIME '17:00:00', 'Tehran',  50.00, 200),
  ('football',  'Paris Saint-Germain',  'Lyon',           '2025-07-05 20:00:00', 'Paris',          95.00, 150),
  ('football',  'Karaj FC',             'Qom United',     '2025-07-10 19:00:00', 'Karaj',          60.00, 150),
  ('volleyball','Iran',                 'Poland',         '2025-07-01 17:00:00', 'Tehran',         50.00, 200),
  ('volleyball','Brazil',               'Italy',          '2025-07-02 20:00:00', 'Rio',            60.00, 180),
  ('volleyball','USA',                  'France',         '2025-07-03 19:00:00', 'Paris',          70.00, 150),
  ('volleyball','Shiraz Stars',         'Tabriz Titans',  '2025-07-15 18:00:00', 'Shiraz',         55.00, 150),
  ('basketball','Los Angeles Lakers',   'Boston Celtics', '2025-06-20 19:00:00', 'Los Angeles',    80.00, 200),
  ('basketball','Chicago Bulls',        'Miami Heat',     '2025-06-21 18:30:00', 'Chicago',        75.00, 180),
  ('basketball','Golden State Warriors','Brooklyn Nets',  '2025-06-22 20:00:00', 'San Francisco',  90.00, 190);


-- football_details
INSERT INTO football_details (ticket_id, league_name, stadium_name,
                              row_number, seat_number, ticket_category, facilities)
VALUES
  ((SELECT id FROM tickets WHERE host_team='Real Madrid' AND match_date='2025-06-15 20:00:00'),
   'La Liga', 'Santiago Bernabéu', 1, 10, 'vip',     'Parking, Catering'),
  ((SELECT id FROM tickets WHERE host_team='Manchester United' AND match_date='2025-06-16 18:00:00'),
   'Premier League', 'Old Trafford', 2, 20, 'special', 'VIP lounge'),
  ((SELECT id FROM tickets WHERE host_team='AC Milan' AND match_date='2025-06-17 21:00:00'),
   'Serie A', 'San Siro', 1, 15, 'regular', 'Snacks'),
  ((SELECT id FROM tickets WHERE host_team='Bayern Munich' AND match_date=CURRENT_DATE - INTERVAL '1 day' + TIME '18:00:00'),
   'Bundesliga', 'Allianz Arena', 3, 25, 'special', 'Covered seating'),
  ((SELECT id FROM tickets WHERE host_team='Persepolis' AND match_date=CURRENT_DATE - INTERVAL '1 day' + TIME '17:00:00'),
   'Persian Gulf Pro League', 'Azadi', 4, 30, 'vip', 'Premium parking'),
  ((SELECT id FROM tickets WHERE host_team='Paris Saint-Germain' AND match_date='2025-07-05 20:00:00'),
   'Ligue 1', 'Parc des Princes', 2, 18, 'vip', 'VIP lounge'),
  ((SELECT id FROM tickets WHERE host_team='Karaj FC' AND match_date='2025-07-10 19:00:00'),
   'Friendly Cup', 'Karaj Stadium', 5, 35, 'regular', 'Family friendly');

-- volleyball_details
INSERT INTO volleyball_details (ticket_id, league_name, arena_name,
                                row_number, seat_number, ticket_category, facilities)
VALUES
  ((SELECT id FROM tickets WHERE host_team='Iran' AND match_date='2025-07-01 17:00:00'),
   'Volleyball Nations League', 'Azadi Arena', 1, 5, 'regular', 'Courtside'),
  ((SELECT id FROM tickets WHERE host_team='Brazil' AND match_date='2025-07-02 20:00:00'),
   'FIVB World League', 'Maracanãzinho', 2, 10, 'special', 'VIP Access'),
  ((SELECT id FROM tickets WHERE host_team='USA' AND match_date='2025-07-03 19:00:00'),
   'International Friendly', 'Paris Arena', 3, 15, 'vip', 'Exclusive lounge'),
  ((SELECT id FROM tickets WHERE host_team='Shiraz Stars' AND match_date='2025-07-15 18:00:00'),
   'Iran Volleyball Cup', 'Shiraz Arena', 1, 12, 'regular', 'Parking, Snacks');

-- basketball_details
INSERT INTO basketball_details (ticket_id, league_name, arena_name,
                                row_number, seat_number, ticket_category, facilities)
VALUES
  ((SELECT id FROM tickets WHERE host_team='Los Angeles Lakers' AND match_date='2025-06-20 19:00:00'),
   'NBA', 'Staples Center', 1, 1, 'vip', 'VIP lounge, Parking'),
  ((SELECT id FROM tickets WHERE host_team='Chicago Bulls' AND match_date='2025-06-21 18:30:00'),
   'NBA', 'United Center', 2, 2, 'special', 'Food service'),
  ((SELECT id FROM tickets WHERE host_team='Golden State Warriors' AND match_date='2025-06-22 20:00:00'),
   'NBA', 'Chase Center', 3, 3, 'regular', 'Fan gifts');


-- reservations
INSERT INTO reservations (user_id, ticket_id, reservation_time, reservation_status, expiration_time)
VALUES
  -- Ali Ahmadi: two paid reservations
  ((SELECT id FROM users WHERE email='ali@test.com'),
   (SELECT id FROM tickets WHERE host_team='Real Madrid' AND match_date='2025-06-15 20:00:00'),
   '2025-06-10 12:00:00', 'paid', '2025-06-10 12:10:00'),
  ((SELECT id FROM users WHERE email='ali@test.com'),
   (SELECT id FROM tickets WHERE host_team='Chicago Bulls' AND match_date='2025-06-21 18:30:00'),
   '2025-06-19 15:00:00', 'paid', '2025-06-19 15:10:00'),

  -- Reza Hosseini: high-value purchases across different months
  ((SELECT id FROM users WHERE email='reza@test.com'),
   (SELECT id FROM tickets WHERE host_team='Los Angeles Lakers' AND match_date='2025-06-20 19:00:00'),
   NOW() - INTERVAL '3 day', 'paid', (NOW() - INTERVAL '3 day') + INTERVAL '15 minutes'),
  ((SELECT id FROM users WHERE email='reza@test.com'),
   (SELECT id FROM tickets WHERE host_team='Real Madrid' AND match_date='2025-06-15 20:00:00'),
   '2025-05-10 10:00:00', 'paid', '2025-05-10 10:15:00'),
  ((SELECT id FROM users WHERE email='reza@test.com'),
   (SELECT id FROM tickets WHERE host_team='AC Milan' AND match_date='2025-06-17 21:00:00'),
   '2025-06-05 11:00:00', 'paid', '2025-06-05 11:15:00'),
  ((SELECT id FROM users WHERE email='reza@test.com'),
   (SELECT id FROM tickets WHERE host_team='Paris Saint-Germain' AND match_date='2025-07-05 20:00:00'),
   '2025-07-01 09:00:00', 'paid', '2025-07-01 09:15:00'),

  -- Neda Karimi: exactly two football purchases
  ((SELECT id FROM users WHERE email='neda@test.com'),
   (SELECT id FROM tickets WHERE host_team='Manchester United' AND match_date='2025-06-16 18:00:00'),
   '2025-06-01 14:00:00', 'paid', '2025-06-01 14:10:00'),
  ((SELECT id FROM users WHERE email='neda@test.com'),
   (SELECT id FROM tickets WHERE host_team='Karaj FC' AND match_date='2025-07-10 19:00:00'),
   '2025-07-05 16:00:00', 'paid', '2025-07-05 16:15:00'),

  -- Amir Rezaei: one reservation per sport
  ((SELECT id FROM users WHERE email='amir@test.com'),
   (SELECT id FROM tickets WHERE host_team='Real Madrid' AND match_date='2025-06-15 20:00:00'),
   '2025-06-12 13:00:00', 'paid', '2025-06-12 13:15:00'),
  ((SELECT id FROM users WHERE email='amir@test.com'),
   (SELECT id FROM tickets WHERE host_team='Iran' AND match_date='2025-07-01 17:00:00'),
   '2025-06-20 14:00:00', 'paid', '2025-06-20 14:15:00'),
  ((SELECT id FROM users WHERE email='amir@test.com'),
   (SELECT id FROM tickets WHERE host_team='Los Angeles Lakers' AND match_date='2025-06-20 19:00:00'),
   '2025-06-18 11:00:00', 'paid', '2025-06-18 11:15:00'),

  -- Maryam Safari: one purchase in Shiraz and one in Tehran
  ((SELECT id FROM users WHERE email='maryam@test.com'),
   (SELECT id FROM tickets WHERE host_team='Shiraz Stars' AND match_date='2025-07-15 18:00:00'),
   '2025-07-05 10:00:00', 'paid', '2025-07-05 10:15:00'),
  ((SELECT id FROM users WHERE email='maryam@test.com'),
   (SELECT id FROM tickets WHERE host_team='Iran' AND match_date='2025-07-01 17:00:00'),
   '2025-06-25 12:00:00', 'paid', '2025-06-25 12:10:00'),

  -- Pouya Norouzi: multiple paid reservations, several within last 7 days
  ((SELECT id FROM users WHERE email='pouya@test.com'),
   (SELECT id FROM tickets WHERE host_team='Los Angeles Lakers' AND match_date='2025-06-20 19:00:00'),
   NOW() - INTERVAL '5 day', 'paid', (NOW() - INTERVAL '5 day') + INTERVAL '15 minutes'),
  ((SELECT id FROM users WHERE email='pouya@test.com'),
   (SELECT id FROM tickets WHERE host_team='Chicago Bulls' AND match_date='2025-06-21 18:30:00'),
   NOW() - INTERVAL '3 day', 'paid', (NOW() - INTERVAL '3 day') + INTERVAL '15 minutes'),
  ((SELECT id FROM users WHERE email='pouya@test.com'),
   (SELECT id FROM tickets WHERE host_team='Real Madrid' AND match_date='2025-06-15 20:00:00'),
   '2025-06-05 09:00:00', 'paid', '2025-06-05 09:10:00'),
  ((SELECT id FROM users WHERE email='pouya@test.com'),
   (SELECT id FROM tickets WHERE host_team='Brazil' AND match_date='2025-07-02 20:00:00'),
   '2025-07-01 10:00:00', 'paid', '2025-07-01 10:15:00'),

  -- Zahra Ebrahimi: heavy buyer with several reservations in last 7 days
  ((SELECT id FROM users WHERE email='zahra@test.com'),
   (SELECT id FROM tickets WHERE host_team='Los Angeles Lakers' AND match_date='2025-06-20 19:00:00'),
   NOW() - INTERVAL '2 day', 'paid', (NOW() - INTERVAL '2 day') + INTERVAL '15 minutes'),
  ((SELECT id FROM users WHERE email='zahra@test.com'),
   (SELECT id FROM tickets WHERE host_team='Chicago Bulls' AND match_date='2025-06-21 18:30:00'),
   NOW() - INTERVAL '4 day', 'paid', (NOW() - INTERVAL '4 day') + INTERVAL '15 minutes'),
  ((SELECT id FROM users WHERE email='zahra@test.com'),
   (SELECT id FROM tickets WHERE host_team='Golden State Warriors' AND match_date='2025-06-22 20:00:00'),
   NOW() - INTERVAL '6 day', 'paid', (NOW() - INTERVAL '6 day') + INTERVAL '15 minutes'),
  ((SELECT id FROM users WHERE email='zahra@test.com'),
   (SELECT id FROM tickets WHERE host_team='AC Milan' AND match_date='2025-06-17 21:00:00'),
   '2025-06-10 10:00:00', 'paid', '2025-06-10 10:15:00'),
  ((SELECT id FROM users WHERE email='zahra@test.com'),
   (SELECT id FROM tickets WHERE host_team='Persepolis' AND match_date=CURRENT_DATE - INTERVAL '1 day' + TIME '17:00:00'),
   '2025-06-25 16:00:00', 'paid', '2025-06-25 16:10:00'),

  -- Support1 Rad: mixture of cancelled, reserved and paid
  ((SELECT id FROM users WHERE email='support1@test.com'),
   (SELECT id FROM tickets WHERE host_team='Manchester United' AND match_date='2025-06-16 18:00:00'),
   '2025-06-05 08:00:00', 'cancelled', '2025-06-05 08:15:00'),
  ((SELECT id FROM users WHERE email='support1@test.com'),
   (SELECT id FROM tickets WHERE host_team='Iran' AND match_date='2025-07-01 17:00:00'),
   '2025-06-15 09:00:00', 'cancelled', '2025-06-15 09:15:00'),
  ((SELECT id FROM users WHERE email='support1@test.com'),
   (SELECT id FROM tickets WHERE host_team='Brazil' AND match_date='2025-07-02 20:00:00'),
   '2025-06-20 09:30:00', 'cancelled', '2025-06-20 09:45:00'),
  ((SELECT id FROM users WHERE email='support1@test.com'),
   (SELECT id FROM tickets WHERE host_team='Los Angeles Lakers' AND match_date='2025-06-20 19:00:00'),
   '2025-06-01 12:00:00', 'paid', '2025-06-01 12:15:00'),
  ((SELECT id FROM users WHERE email='support1@test.com'),
   (SELECT id FROM tickets WHERE host_team='Real Madrid' AND match_date='2025-06-15 20:00:00'),
   '2025-06-02 14:00:00', 'reserved', '2025-06-02 14:15:00'),

  -- Support2 Naseri: one paid and one cancelled
  ((SELECT id FROM users WHERE email='support2@test.com'),
   (SELECT id FROM tickets WHERE host_team='Chicago Bulls' AND match_date='2025-06-21 18:30:00'),
   '2025-06-02 15:00:00', 'paid', '2025-06-02 15:15:00'),
  ((SELECT id FROM users WHERE email='support2@test.com'),
   (SELECT id FROM tickets WHERE host_team='Manchester United' AND match_date='2025-06-16 18:00:00'),
   '2025-06-03 15:00:00', 'cancelled', '2025-06-03 15:15:00'),

  -- John Smith (to be renamed Reddington): most cancellations, plus one paid
  ((SELECT id FROM users WHERE email='usercancel@test.com'),
   (SELECT id FROM tickets WHERE host_team='Real Madrid' AND match_date='2025-06-15 20:00:00'),
   '2025-06-05 13:00:00', 'cancelled', '2025-06-05 13:10:00'),
  ((SELECT id FROM users WHERE email='usercancel@test.com'),
   (SELECT id FROM tickets WHERE host_team='Los Angeles Lakers' AND match_date='2025-06-20 19:00:00'),
   '2025-06-10 14:00:00', 'cancelled', '2025-06-10 14:10:00'),
  ((SELECT id FROM users WHERE email='usercancel@test.com'),
   (SELECT id FROM tickets WHERE host_team='AC Milan' AND match_date='2025-06-17 21:00:00'),
   '2025-06-15 14:30:00', 'cancelled', '2025-06-15 14:45:00'),
  ((SELECT id FROM users WHERE email='usercancel@test.com'),
   (SELECT id FROM tickets WHERE host_team='Chicago Bulls' AND match_date='2025-06-21 18:30:00'),
   '2025-06-20 16:00:00', 'cancelled', '2025-06-20 16:15:00'),
  ((SELECT id FROM users WHERE email='usercancel@test.com'),
   (SELECT id FROM tickets WHERE host_team='Golden State Warriors' AND match_date='2025-06-22 20:00:00'),
   '2025-06-25 17:00:00', 'paid', '2025-06-25 17:15:00'),

  -- Extra1 Extra: one reserved and one paid (today)
  ((SELECT id FROM users WHERE email='extra1@test.com'),
   (SELECT id FROM tickets WHERE host_team='Bayern Munich' AND match_date=CURRENT_DATE - INTERVAL '1 day' + TIME '18:00:00'),
   '2025-06-10 09:00:00', 'reserved', '2025-06-10 09:15:00'),
  ((SELECT id FROM users WHERE email='extra1@test.com'),
   (SELECT id FROM tickets WHERE host_team='Persepolis' AND match_date=CURRENT_DATE - INTERVAL '1 day' + TIME '17:00:00'),
   CURRENT_DATE + TIME '10:00:00', 'paid', CURRENT_DATE + TIME '10:15:00'),

  -- Hasan Rahimi: most recent ticket purchase
  ((SELECT id FROM users WHERE email='hasan@test.com'),
   (SELECT id FROM tickets WHERE host_team='Golden State Warriors' AND match_date='2025-06-22 20:00:00'),
   NOW(), 'paid', NOW() + INTERVAL '15 minutes'),

  -- Hadi Rahmani: a purchase in Karaj
  ((SELECT id FROM users WHERE email='hadi@test.com'),
   (SELECT id FROM tickets WHERE host_team='Karaj FC' AND match_date='2025-07-10 19:00:00'),
   '2025-07-02 14:00:00', 'paid', '2025-07-02 14:10:00');
