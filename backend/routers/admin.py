from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db, es_client
from utils.security import get_current_user
import psycopg2.extras

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

class TicketCreateRequest(BaseModel):
    sport: str
    host_team: str
    guest_team: str
    match_date: str
    match_location: str
    ticket_price: float
    capacity: int

# ۱. دریافت تمام رزروها برای مدیریت
@router.get("/reservations")
def get_all_reservations(user: dict = Depends(get_current_user), conn=Depends(get_db)):
    if user.get("role") != "support":
        raise HTTPException(status_code=403, detail="Access denied")
        
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT r.*, t.host_team, t.guest_team, t.sport, t.ticket_price
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.id
            ORDER BY r.reservation_time DESC
        """)
        return cursor.fetchall()
    finally:
        cursor.close()

# ۲. تغییر وضعیت رزرو
@router.put("/reservations/{reservation_id}")
def update_reservation_status(reservation_id: int, status: str, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    if user.get("role") != "support":
        raise HTTPException(status_code=403, detail="Access denied")
        
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE reservations SET reservation_status = %s WHERE id = %s", (status, reservation_id))
        conn.commit()
        return {"message": "Status updated successfully"}
    finally:
        cursor.close()

# ۳. ایجاد مسابقه/بلیط جدید
@router.post("/tickets")
def create_ticket(req: TicketCreateRequest, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    if user.get("role") != "support":
        raise HTTPException(status_code=403, detail="Access denied")
        
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # ---------------------------------------------------------
    # 🚀 ترفند اجباری: ساخت ستون دقیقاً در همان لحظه توسط پایتون
    # ---------------------------------------------------------
    try:
        cursor.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 100;")
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Column check bypassed:", e)
    # ---------------------------------------------------------

    try:
        # اصلاح فرمت تاریخ
        formatted_date = req.match_date.replace('T', ' ')
        if len(formatted_date) == 16:
            formatted_date += ':00'

        # ثبت اطلاعات در دیتابیس
        cursor.execute("""
            INSERT INTO tickets (sport, host_team, guest_team, match_date, match_location, ticket_price, capacity, remaining_capacity)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (req.sport, req.host_team, req.guest_team, formatted_date, req.match_location, req.ticket_price, req.capacity, req.capacity))
        
        new_ticket = cursor.fetchone()
        conn.commit()

        # ثبت در الستیک‌سرچ
        try:
            doc = dict(new_ticket)
            if hasattr(doc.get('match_date'), 'isoformat'):
                doc['match_date'] = doc['match_date'].isoformat()
            doc['ticket_price'] = float(doc['ticket_price'])
            es_client.index(index="tickets", id=str(doc["id"]), document=doc)
        except Exception as e:
            print(f"Failed to index to ES: {e}")

        return {"message": "Ticket created successfully", "ticket": new_ticket}
    except Exception as e:
        conn.rollback()
        print(f"Database Error on Create Ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# ۴. دریافت گزارش‌های کاربران
@router.get("/reports")
def get_user_reports(user: dict = Depends(get_current_user), conn=Depends(get_db)):
    if user.get("role") != "support":
        raise HTTPException(status_code=403, detail="Access denied")
        
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT * FROM reports ORDER BY id DESC")
        return cursor.fetchall()
    finally:
        cursor.close()