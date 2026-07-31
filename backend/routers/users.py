from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db, redis_client
from utils.security import get_current_user
import json
import psycopg2.extras

router = APIRouter(prefix="/api/users", tags=["Users"])

class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    city: str

@router.get("/profile")
def get_profile(user: dict = Depends(get_current_user), conn=Depends(get_db)):
    redis_key = f"user:{user['id']}"
    cached_profile = redis_client.get(redis_key)
    
    if cached_profile:
        return json.loads(cached_profile)
        
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT id, first_name, last_name, email, phone, city, user_role FROM users WHERE id = %s", (user['id'],))
        profile = cursor.fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
            
        redis_client.setex(redis_key, 3600, json.dumps(profile))
        return profile
    finally:
        cursor.close()

@router.put("/profile")
def update_profile(req: ProfileUpdate, user: dict = Depends(get_current_user), conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE users 
            SET first_name = %s, last_name = %s, email = %s, phone = %s, city = %s 
            WHERE id = %s
        """, (req.first_name, req.last_name, req.email, req.phone, req.city, user['id']))
        conn.commit()
        
        # Invalidate Cache
        redis_client.delete(f"user:{user['id']}")
        
        return {"message": "Profile updated successfully"}
    finally:
        cursor.close()