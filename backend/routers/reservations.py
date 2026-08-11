from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from database import get_db, db_pool
from utils.security import get_current_user
import psycopg2.extras
import time
import datetime

router = APIRouter(prefix="/api", tags=["Reservations and Payments"])

class ReserveRequest(BaseModel):
    ticket_id: int
    quantity: int

class PaymentRequest(BaseModel):
    reservation_id: int
    amount: float
    method: str

class ReportRequest(BaseModel):
    category: str
    description: str

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
            SELECT r.*, t.host_team, t.guest_team, t.match_date, t.ticket_price 
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.id
            WHERE r.user_id = %s AND r.reservation_status = 'reserved'
            ORDER BY r.reservation_time DESC
        """, (user['id'],))
        return cursor.fetchall()
    finally:
        cursor.close()

@router.get("/reservations/history")
def get_reservations_history(user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT r.*, t.host_team, t.guest_team, t.ticket_price 
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.id
            WHERE r.user_id = %s 
            ORDER BY r.reservation_time DESC
        """, (user['id'],))
        return cursor.fetchall()
    finally:
        cursor.close()

@router.post("/payments")
def process_payment(req: PaymentRequest, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT reservation_status FROM reservations WHERE id = %s AND user_id = %s", (req.reservation_id, user['id']))
        res = cursor.fetchone()

        if not res or res['reservation_status'] != 'reserved':
            raise HTTPException(status_code=400, detail="The reservation is invalid or expired.")

        cursor.execute("""
            INSERT INTO payments (user_id, reservation_id, amount, method, payment_status)
            VALUES (%s, %s, %s, %s, 'success')
        """, (user['id'], req.reservation_id, req.amount, req.method))

        cursor.execute("UPDATE reservations SET reservation_status = 'paid' WHERE id = %s", (req.reservation_id,))
        conn.commit()
        return {"message": "Payment was successful"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

@router.get("/reservations/{reservation_id}/penalty")
def calculate_penalty(reservation_id: int, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT r.reservation_status, t.match_date, t.ticket_price 
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.id
            WHERE r.id = %s AND r.user_id = %s
        """, (reservation_id, user['id']))
        data = cursor.fetchone()

        if not data or data['reservation_status'] != 'paid':
            raise HTTPException(status_code=400, detail="This reservation cannot be canceled.")

        time_diff = data['match_date'] - datetime.datetime.now()
        penalty_percent = 20 if time_diff.total_seconds() < 86400 else 0  
        refund_amount = float(data['ticket_price']) * ((100 - penalty_percent) / 100)

        return {"penalty_percent": penalty_percent, "refund_amount": refund_amount}
    finally:
        cursor.close()

@router.post("/reservations/{reservation_id}/cancel")
def cancel_reservation(reservation_id: int, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("UPDATE reservations SET reservation_status = 'cancelled' WHERE id = %s AND user_id = %s RETURNING ticket_id", (reservation_id, user['id']))
        res = cursor.fetchone()
        if not res:
            raise HTTPException(status_code=400, detail="Error in cancel operation")

        cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity + 1 WHERE id = %s", (res['ticket_id'],))
        conn.commit()
        return {"message": "Ticket successfully cancelled and refund processed"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

@router.post("/tickets/{ticket_id}/report")
def submit_report(ticket_id: int, req: ReportRequest, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM reservations WHERE user_id = %s AND ticket_id = %s ORDER BY id DESC LIMIT 1", (user['id'], ticket_id))
        res = cursor.fetchone()
        if not res:
            raise HTTPException(status_code=400, detail="You have not purchased this ticket.")

        cursor.execute("""
            INSERT INTO reports (user_id, reservation_id, category, report_description)
            VALUES (%s, %s, %s, %s)
        """, (user['id'], res[0], req.category, req.description))
        conn.commit()
        return {"message": "Report successfully submitted."}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()