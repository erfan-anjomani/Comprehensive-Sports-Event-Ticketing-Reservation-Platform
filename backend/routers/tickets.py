from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from typing import Optional
from database import get_db, redis_client
import json
import psycopg2.extras
from database import es_client

router = APIRouter(prefix="/api", tags=["Tickets and Venues"])

@router.get("/venues")
def get_venues(conn=Depends(get_db)):
    redis_key = "venues:list"
    cached_venues = redis_client.get(redis_key)
    
    if cached_venues:
        return json.loads(cached_venues)
        
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT DISTINCT t.match_location AS city,
            COALESCE(fd.stadium_name, vd.arena_name, bd.arena_name) AS venue
            FROM tickets t
            LEFT JOIN football_details fd ON t.id = fd.ticket_id
            LEFT JOIN volleyball_details vd ON t.id = vd.ticket_id
            LEFT JOIN basketball_details bd ON t.id = bd.ticket_id
            WHERE t.match_location IS NOT NULL
        """)
        venues = cursor.fetchall()
        
        redis_client.setex(redis_key, 3600, json.dumps(jsonable_encoder(venues)))
        return venues
    finally:
        cursor.close()

@router.get("/tickets/search")
def search_tickets(
    request: Request,
    sport: Optional[str] = None,
    home_team: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "date",
    conn=Depends(get_db)
):
    query_string = request.url.query
    redis_key = f"search:{query_string}" if query_string else "search:all"
    
    cached_search = redis_client.get(redis_key)
    if cached_search:
        return json.loads(cached_search)

   
    try:
        if es_client.ping():
            must_queries = []
            if sport: must_queries.append({"match": {"sport": sport}})
            if home_team: must_queries.append({"match": {"host_team": home_team}})
            if city: must_queries.append({"match": {"match_location": city}})
            
            range_query = {}
            if min_price is not None: range_query["gte"] = min_price
            if max_price is not None: range_query["lte"] = max_price
            if range_query:
                must_queries.append({"range": {"ticket_price": range_query}})

            sort_query = [{"ticket_price": "asc"}] if sort_by == "price" else [{"match_date": "asc"}]

            es_query = {
                "query": {"bool": {"must": must_queries}} if must_queries else {"match_all": {}},
                "sort": sort_query,
                "size": 50
            }
            
            res = es_client.search(index="tickets", body=es_query)
            es_results = [hit["_source"] for hit in res["hits"]["hits"]]
            
            redis_client.setex(redis_key, 300, json.dumps(es_results))
            return es_results
    except Exception as e:
        print(f"ES Search Failed, falling back to SQL: {e}")

    # 2. Fallback به SQL در صورت قطعی الستیک‌سرچ
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        sql = """
            SELECT t.id, t.sport, t.host_team, t.guest_team, t.match_date, 
                   t.match_location, t.ticket_price, t.remaining_capacity,
                   COALESCE(fd.ticket_category, vd.ticket_category, bd.ticket_category) AS category,
                   COALESCE(fd.stadium_name, vd.arena_name, bd.arena_name) AS venue
            FROM tickets t
            LEFT JOIN football_details fd ON t.id = fd.ticket_id
            LEFT JOIN volleyball_details vd ON t.id = vd.ticket_id
            LEFT JOIN basketball_details bd ON t.id = bd.ticket_id
            WHERE 1=1
        """
        params = []
        if sport: sql += " AND t.sport = %s"; params.append(sport)
        if home_team: sql += " AND t.host_team ILIKE %s"; params.append(f"%{home_team}%")
        if city: sql += " AND t.match_location ILIKE %s"; params.append(f"%{city}%")
        if min_price: sql += " AND t.ticket_price >= %s"; params.append(min_price)
        if max_price: sql += " AND t.ticket_price <= %s"; params.append(max_price)

        sql += " ORDER BY t.ticket_price ASC" if sort_by == "price" else " ORDER BY t.match_date ASC"

        cursor.execute(sql, tuple(params))
        results = cursor.fetchall()
        redis_client.setex(redis_key, 300, json.dumps(jsonable_encoder(results)))
        return results
    finally:
        cursor.close()

@router.get("/tickets/{ticket_id}")
def get_ticket_details(ticket_id: int, conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        sql = """
            SELECT t.*,
                   COALESCE(fd.ticket_category, vd.ticket_category, bd.ticket_category) AS category,
                   COALESCE(fd.stadium_name, vd.arena_name, bd.arena_name) AS venue,
                   COALESCE(fd.facilities, vd.facilities, bd.facilities) AS facilities,
                   COALESCE(fd.league_name, vd.league_name, bd.league_name) AS league_name,
                   COALESCE(fd.row_number, vd.row_number, bd.row_number) AS row_number,
                   COALESCE(fd.seat_number, vd.seat_number, bd.seat_number) AS seat_number
            FROM tickets t
            LEFT JOIN football_details fd ON t.id = fd.ticket_id
            LEFT JOIN volleyball_details vd ON t.id = vd.ticket_id
            LEFT JOIN basketball_details bd ON t.id = bd.ticket_id
            WHERE t.id = %s
        """
        cursor.execute(sql, (ticket_id,))
        ticket = cursor.fetchone()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
            
        return ticket
    finally:
        cursor.close()