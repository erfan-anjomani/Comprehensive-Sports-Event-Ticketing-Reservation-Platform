-- Stored Procedures

CREATE OR REPLACE FUNCTION get_user_purchases(
    p_contact VARCHAR(255)   -- email or phone
)
RETURNS TABLE(
    ticket_id BIGINT,
    sport sport_type,
    host_team VARCHAR(255),
    guest_team VARCHAR(255),
    match_date TIMESTAMP,
    match_location VARCHAR(100),
    ticket_price NUMERIC(10,2),
    category seat_type,
    purchase_time TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.id,
           t.sport,
           t.host_team,
           t.guest_team,
           t.match_date,
           t.match_location,
           t.ticket_price,
           COALESCE(fd.ticket_category, vd.ticket_category, bd.ticket_category),
           r.reservation_time AS purchase_time
    FROM reservations r
    JOIN tickets t ON r.ticket_id = t.id
    LEFT JOIN football_details fd ON fd.ticket_id = t.id
    LEFT JOIN volleyball_details vd ON vd.ticket_id = t.id
    LEFT JOIN basketball_details bd ON bd.ticket_id = t.id
    JOIN users u ON r.user_id = u.id
    WHERE (u.email = p_contact OR u.phone = p_contact)
      AND r.reservation_status = 'paid'
    ORDER BY r.reservation_time DESC;
END;
$$;


CREATE OR REPLACE FUNCTION get_cancelled_users_by_support(
    p_contact VARCHAR(255)   -- support email or phone
)
RETURNS TABLE(
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT u.first_name, u.last_name, u.email, u.phone
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    JOIN reports rep ON rep.reservation_id = r.id
    JOIN users support ON rep.reviewed_by = support.id
    WHERE (support.email = p_contact OR support.phone = p_contact)
      AND support.user_role = 'support'
      AND r.reservation_status = 'cancelled';
END;
$$;


CREATE OR REPLACE FUNCTION get_purchased_tickets_by_city(
    p_city VARCHAR(100)
)
RETURNS TABLE(
    ticket_id BIGINT,
    sport sport_type,
    host_team VARCHAR(255),
    guest_team VARCHAR(255),
    match_date TIMESTAMP,
    match_location VARCHAR(100),
    ticket_price NUMERIC(10,2),
    buyer_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.id,
           t.sport,
           t.host_team,
           t.guest_team,
           t.match_date,
           t.match_location,
           t.ticket_price,
           (u.first_name || ' ' || u.last_name)::TEXT AS buyer_name
    FROM tickets t
    JOIN reservations r ON r.ticket_id = t.id
    JOIN users u ON r.user_id = u.id
    WHERE r.reservation_status = 'paid'
      AND t.match_location ILIKE '%' || p_city || '%'
    ORDER BY t.match_date;
END;
$$;


CREATE OR REPLACE FUNCTION search_tickets(
    p_search VARCHAR(255)
)
RETURNS TABLE(
    ticket_id BIGINT,
    sport sport_type,
    host_team VARCHAR(255),
    guest_team VARCHAR(255),
    match_date TIMESTAMP,
    match_location VARCHAR(100),
    ticket_price NUMERIC(10,2),
    category seat_type
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.id,
           t.sport,
           t.host_team,
           t.guest_team,
           t.match_date,
           t.match_location,
           t.ticket_price,
           COALESCE(fd.ticket_category, vd.ticket_category, bd.ticket_category)
    FROM tickets t
    LEFT JOIN football_details fd ON fd.ticket_id = t.id
    LEFT JOIN volleyball_details vd ON vd.ticket_id = t.id
    LEFT JOIN basketball_details bd ON bd.ticket_id = t.id
    WHERE t.host_team ILIKE '%' || p_search || '%'
       OR t.guest_team ILIKE '%' || p_search || '%'
       OR t.match_location ILIKE '%' || p_search || '%'
       OR COALESCE(fd.ticket_category, vd.ticket_category, bd.ticket_category)::TEXT ILIKE '%' || p_search || '%'
       OR EXISTS (
           SELECT 1 FROM reservations r
           JOIN users u ON r.user_id = u.id
           WHERE r.ticket_id = t.id
             AND (u.first_name ILIKE '%' || p_search || '%'
                  OR u.last_name ILIKE '%' || p_search || '%')
       )
    ORDER BY t.match_date;
END;
$$;


CREATE OR REPLACE FUNCTION get_users_same_city(
    p_contact VARCHAR(255)
)
RETURNS TABLE(
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    city VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_city VARCHAR(100);
    v_user_id BIGINT;
BEGIN
    SELECT u.id, u.city INTO v_user_id, v_city
    FROM users u
    WHERE (u.email = p_contact OR u.phone = p_contact)
    LIMIT 1;

    IF v_city IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT u.first_name, u.last_name, u.email, u.phone, u.city
    FROM users u
    WHERE u.city = v_city
      AND u.id <> v_user_id;
END;
$$;


CREATE OR REPLACE FUNCTION get_top_purchasers(
    p_date TIMESTAMP,
    p_limit INTEGER
)
RETURNS TABLE(
    user_id BIGINT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    purchase_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id,
           u.first_name,
           u.last_name,
           u.email,
           u.phone,
           COUNT(r.id)::BIGINT AS purchase_count
    FROM users u
    JOIN reservations r ON u.id = r.user_id
    WHERE r.reservation_status = 'paid'
      AND r.reservation_time >= p_date
    GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone
    ORDER BY COUNT(r.id) DESC
    LIMIT p_limit;
END;
$$;


CREATE OR REPLACE FUNCTION get_cancelled_tickets_by_sport(
    p_sport sport_type
)
RETURNS TABLE(
    ticket_id BIGINT,
    host_team VARCHAR(255),
    guest_team VARCHAR(255),
    match_date TIMESTAMP,
    match_location VARCHAR(100),
    cancellation_time TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.id,
           t.host_team,
           t.guest_team,
           t.match_date,
           t.match_location,
           r.expiration_time AS cancellation_time
    FROM reservations r
    JOIN tickets t ON r.ticket_id = t.id
    WHERE r.reservation_status = 'cancelled'
      AND t.sport = p_sport
    ORDER BY t.match_date;
END;
$$;


CREATE OR REPLACE FUNCTION get_top_reporters_by_category(
    p_category report_category
)
RETURNS TABLE(
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    report_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.first_name,
           u.last_name,
           u.email,
           u.phone,
           sub.report_count
    FROM (
        SELECT rep.user_id,
               COUNT(*) AS report_count,
               DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS rnk
        FROM reports rep
        WHERE rep.category = p_category
        GROUP BY rep.user_id
    ) sub
    JOIN users u ON u.id = sub.user_id
    WHERE sub.rnk = 1
    ORDER BY sub.report_count DESC;
END;
$$;