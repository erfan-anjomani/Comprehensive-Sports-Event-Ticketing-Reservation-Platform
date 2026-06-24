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