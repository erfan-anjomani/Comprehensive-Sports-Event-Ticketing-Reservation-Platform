
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from utils.security import get_current_user
import psycopg2.extras

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

def check_support_role(user: dict = Depends(get_current_user)):
    if user['role'] != 'support':
        raise HTTPException(status_code=403, detail="Unauthorized access (backup only)")
    return user

@router.get("/reservations")
def admin_get_reservations(status: str = None, user: dict = Depends(check_support_role), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        sql = "SELECT  FROM reservations"
        params = []
        if status:
            sql += " WHERE reservation_status = %s"
            params.append(status)
        cursor.execute(sql, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()

@router.put("/reservations/{reservation_id}")
def admin_update_reservation(reservation_id: int, status: str, user: dict = Depends(check_support_role), conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE reservations SET reservation_status = %s WHERE id = %s", (status, reservation_id))
        conn.commit()
        return {"message": f"Reservation status changed to {status}"}
    finally:
        cursor.close()

@router.get("/reports")
def admin_get_reports(status: str = None, user: dict = Depends(check_support_role), conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        sql = "SELECT  FROM reports"
        params = []
        if status:
            sql += " WHERE report_status = %s"
            params.append(status)
        cursor.execute(sql, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()

@router.put("/reports/{report_id}")
def admin_review_report(report_id: int, user: dict = Depends(check_support_role), conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE reports SET report_status = 'reviewed' WHERE id = %s", (report_id,))
        conn.commit()
        return {"message": "The status of the report has changed to review."}
    finally:
        cursor.close()
