from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from typing import Optional
from database import get_db, redis_client
import json
import psycopg2.extras

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
    away_team: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    city: Optional[str] = None,
    venue: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "date",
    conn=Depends(get_db)
):
    # ساخت کلید ردیس بر اساس query string
    query_string = request.url.query
    redis_key = f"search:{query_string}" if query_string else "search:all"
    
    cached_search = redis_client.get(redis_key)
    if cached_search:
        return json.loads(cached_search)

    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # کوئری پایه با Join زدن جداول جزئیات مسابقات
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

        if sport:
            sql += " AND t.sport = %s"
            params.append(sport)
        if home_team:
            sql += " AND t.host_team ILIKE %s"
            params.append(f"%{home_team}%")
        if away_team:
            sql += " AND t.guest_team ILIKE %s"
            params.append(f"%{away_team}%")
        if date_from:
            sql += " AND t.match_date >= %s"
            params.append(date_from)
        if date_to:
            sql += " AND t.match_date <= %s"
            params.append(date_to)
        if city:
            sql += " AND t.match_location ILIKE %s"
            params.append(f"%{city}%")
        if venue:
            sql += " AND COALESCE(fd.stadium_name, vd.arena_name, bd.arena_name) ILIKE %s"
            params.append(f"%{venue}%")
        if category:
            sql += " AND COALESCE(fd.ticket_category, vd.ticket_category, bd.ticket_category) = %s"
            params.append(category)
        if min_price:
            sql += " AND t.ticket_price >= %s"
            params.append(min_price)
        if max_price:
            sql += " AND t.ticket_price <= %s"
            params.append(max_price)

        if sort_by == "price":
            sql += " ORDER BY t.ticket_price ASC"
        else:
            sql += " ORDER BY t.match_date ASC"

        cursor.execute(sql, tuple(params))
        results = cursor.fetchall()

        # کش کردن نتیجه برای ۵ دقیقه (۳۰۰ ثانیه)
        redis_client.setex(redis_key, 300, json.dumps(jsonable_encoder(results)))
        return results
    finally:
        cursor.close()