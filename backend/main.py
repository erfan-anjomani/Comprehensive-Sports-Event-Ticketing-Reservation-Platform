from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, tickets, reservations, admin
from database import db_pool, es_client
import psycopg2.extras

app = FastAPI(title="Sports Event Ticketing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def sync_elasticsearch():
    conn = None
    cursor = None
    
    try:
        if not es_client.ping():
            print("--- ElasticSearch is NOT connected ---")
            return
            
      
        if db_pool is None:
            print("--- Database pool is not initialized ---")
            return

        conn = db_pool.getconn()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT t.id, t.sport, t.host_team, t.guest_team, t.match_date, 
                   t.match_location, t.ticket_price, t.remaining_capacity,
                   COALESCE(fd.ticket_category, vd.ticket_category, bd.ticket_category) AS category,
                   COALESCE(fd.stadium_name, vd.arena_name, bd.arena_name) AS venue
            FROM tickets t
            LEFT JOIN football_details fd ON t.id = fd.ticket_id
            LEFT JOIN volleyball_details vd ON t.id = vd.ticket_id
            LEFT JOIN basketball_details bd ON t.id = bd.ticket_id
        """)
        tickets_data = cursor.fetchall()
        
        for t in tickets_data:
            t['match_date'] = t['match_date'].isoformat()
            t['ticket_price'] = float(t['ticket_price'])
            es_client.index(index="tickets", id=str(t["id"]), document=t)
            
        print("--- Successfully synced SQL Data to ElasticSearch! ---")
    except Exception as e:
        print(f"--- ElasticSearch Sync Error: {e} ---")
    finally:

        if cursor is not None:
            cursor.close()
        if conn is not None and db_pool is not None:
            db_pool.putconn(conn)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tickets.router)
app.include_router(reservations.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Sports Ticketing API - Phase 3 & 4"}