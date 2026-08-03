from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from database import get_db, db_pool
from utils.security import get_current_user
import psycopg2.extras
import time

router = APIRouter(prefix="/api", tags=["Reservations and Payments"])

class ReserveRequest(BaseModel):
    ticket_id: int
    quantity: int

def auto_cancel_job(reservation_ids: list):
    
    time.sleep(600)  # wait for 10 min
    conn = db_pool.getconn()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            UPDATE reservations SET reservation_status = 'cancelled'
            WHERE id = ANY(%s) AND reservation_status = 'reserved'
            RETURNING ticket_id
        """, (reservation_ids,))
        cancelled_tickets = cursor.fetchall()

        for t in cancelled_tickets:
            cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity + 1 WHERE id = %s", (t['ticket_id'],))

        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error in auto_cancel_job: {e}")
    finally:
        cursor.close()
        db_pool.putconn(conn)

@router.post("/reservations")
def create_reservation(req: ReserveRequest, bg_tasks: BackgroundTasks, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT remaining_capacity FROM tickets WHERE id = %s FOR UPDATE", (req.ticket_id,))
        ticket = cursor.fetchone()

        if not ticket or ticket['remaining_capacity'] < req.quantity:
            raise HTTPException(status_code=400, detail="Not enough capacity")

        cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity - %s WHERE id = %s", (req.quantity, req.ticket_id))

        reservation_ids = []
        for _ in range(req.quantity):
            cursor.execute("""
                INSERT INTO reservations (user_id, ticket_id, reservation_time, reservation_status, expiration_time)
                VALUES (%s, %s, NOW(), 'reserved', NOW() + INTERVAL '10 minutes') 
                RETURNING id
            """, (user['id'], req.ticket_id))
            reservation_ids.append(cursor.fetchone()['id'])

        conn.commit()

        bg_tasks.add_task(auto_cancel_job, reservation_ids)

        return {"message": "Reservation was successful", "reservation_ids": reservation_ids}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

@router.get("/reservations/active")
def get_active_reservations(user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT r.*, t.host_team, t.guest_team, t.match_date 
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.id
            WHERE r.user_id = %s AND r.reservation_status = 'reserved'
        """, (user['id'],))
        return cursor.fetchall()
    finally:
        cursor.close()

@router.get("/reservations/history")
def get_reservations_history(user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT * FROM reservations WHERE user_id = %s ORDER BY reservation_time DESC", (user['id'],))
        return cursor.fetchall()
    finally:
        cursor.close()