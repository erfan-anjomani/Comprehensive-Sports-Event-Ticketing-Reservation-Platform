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