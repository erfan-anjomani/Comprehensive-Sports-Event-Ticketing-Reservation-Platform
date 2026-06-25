--user table:
CREATE TYPE user_type AS ENUM ('spectator','support');

CREATE TYPE account_status AS ENUM ('active','inactive');             

CREATE TABLE users (
     id BIGSERIAL NOT NULL PRIMARY KEY,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255),
     phone VARCHAR(20),
	user_role user_type NOT NULL DEFAULT ('spectator'),
	city VARCHAR(100) NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     register_date TIMESTAMP NOT NULL DEFAULT NOW(),
     account_condition account_status NOT NULL DEFAULT('active'),


     CONSTRAINT check_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
)

--index:
CREATE INDEX idx_user_city ON users(city);
CREATE INDEX idx_user_role ON users(user_role);

CREATE UNIQUE INDEX idx_user_email 
ON users(email) 
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX idx_user_phone
ON users(phone)
WHERE phone IS NOT NULL;


--ticket
CREATE TYPE sport_type AS ENUM ('football','volleyball', 'basketball');

CREATE TYPE seat_type AS ENUM (
    'regular',
    'special',
    'vip'
);

CREATE TABLE tickets (
     id BIGSERIAL NOT NULL PRIMARY KEY,
	sport sport_type NOT NULL,
	host_team VARCHAR(255) NOT NULL,
     guest_team VARCHAR(255) NOT NULL,
     match_date TIMESTAMP NOT NULL,
	match_location VARCHAR(100) NOT NULL,
     ticket_price NUMERIC(10,2) NOT NULL CHECK(ticket_price >= 0),
     remaining_capacity INTEGER NOT NULL CHECK(remaining_capacity >= 0),
     seat seat_type NOT NULL DEFAULT('regular'),


     CONSTRAINT 
     match_check CHECK (host_team <> guest_team)
)

--indexes
CREATE INDEX idx_ticket_match_date
ON tickets(match_date);

CREATE INDEX idx_ticket_sport
ON tickets(sport);


--Reservations
CREATE TYPE reservation_status_enum AS ENUM (
    'reserved',
    'paid',
    'cancelled'
);
CREATE TABLE reservations (
     id BIGSERIAL NOT NULL PRIMARY KEY,
     user_id BIGINT NOT NULL REFERENCES users (id),
     ticket_id BIGINT NOT NULL REFERENCES tickets (id),
     reservation_time TIMESTAMP NOT NULL ,
     reservation_status reservation_status_enum NOT NULL DEFAULT ('reserved'),
     expiration_time TIMESTAMP NOT NULL

     CONSTRAINT reservation_time_check
     CHECK(expiration_time > reservation_time)
)    

--indexes
CREATE INDEX idx_reservation_user
ON reservations(user_id);

CREATE INDEX idx_reservation_expiration
ON reservations(expiration_time);

CREATE INDEX idx_reservation_status
ON reservations(reservation_status);


--Payment
CREATE TYPE payment_method AS ENUM (
    'card',
    'wallet',
    'crypto'
);

CREATE TYPE payment_status_enum AS ENUM (
    'success',
    'pending',
    'failed'
);

CREATE TABLE payments (
     id BIGSERIAL NOT NULL PRIMARY KEY,
     user_id BIGINT NOT NULL REFERENCES users (id),
     reservation_id BIGINT NOT NULL REFERENCES reservations (id),
     amount NUMERIC(10,2) NOT NULL CHECK(amount >= 0),
     method payment_method NOT NULL,
     payment_status payment_status_enum NOT NULL DEFAULT ('pending'),
     payment_time TIMESTAMP NOT NULL DEFAULT NOW()
)  


--indexes
CREATE INDEX idx_reservation_id
ON payments(reservation_id);

CREATE INDEX idx_payment_status
ON payments(payment_status);


--Reports
CREATE TYPE report_category AS ENUM (
    'payment_issue',
    'schedule_change',
    'seat_issue',
    'unexpected_cancellation',
    'other'
);

CREATE TYPE report_status_enum AS ENUM (
    'pending',
    'reviewed'
);

CREATE TABLE reports (
     id BIGSERIAL NOT NULL PRIMARY KEY,
     user_id BIGINT NOT NULL REFERENCES users (id),
     reservation_id BIGINT NOT NULL REFERENCES reservations (id),
     category report_category NOT NULL,
     report_description TEXT NOT NULL,
     report_status report_status_enum NOT NULL DEFAULT('pending'),
     created_at TIMESTAMP NOT NULL DEFAULT NOW()
)

--indexes
CREATE INDEX idx_user_report
ON reports(user_id);

CREATE INDEX idx_report_status
ON reports(report_status);

CREATE INDEX idx_created
ON reports(created_at);
