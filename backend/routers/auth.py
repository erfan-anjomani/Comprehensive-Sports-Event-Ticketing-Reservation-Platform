from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from database import get_db, redis_client
from utils.security import hash_password, create_jwt_token
import random
import psycopg2.extras

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: str # EmailStr can be used if configured
    phone: str
    password: str
    city: str

class LoginRequest(BaseModel):
    contact: str  # email or phone

class VerifyOTPRequest(BaseModel):
    contact: str
    otp: str

@router.post("/signup")
def signup(req: SignupRequest, conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s OR phone = %s", (req.email, req.phone))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User already exists")
        
        hashed_pwd = hash_password(req.password)
        cursor.execute("""
            INSERT INTO users (first_name, last_name, email, phone, city, password_hash)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, user_role
        """, (req.first_name, req.last_name, req.email, req.phone, req.city, hashed_pwd))
        
        user = cursor.fetchone()
        conn.commit()
        token = create_jwt_token(user['id'], user['user_role'])
        return {"message": "Signup successful", "token": token}
    finally:
        cursor.close()

@router.post("/login-otp")
def login_otp(req: LoginRequest, conn=Depends(get_db)):
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s OR phone = %s", (req.contact, req.contact))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        otp = str(random.randint(100000, 999999))
        redis_key = f"otp:{req.contact}"
        redis_client.setex(redis_key, 300, otp)
        
        print(f"--- OTP FOR {req.contact} is: {otp} ---")
        return {"message": "OTP sent successfully (check console)"}
    finally:
        cursor.close()

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, conn=Depends(get_db)):
    redis_key = f"otp:{req.contact}"
    stored_otp = redis_client.get(redis_key)
    
    if not stored_otp or stored_otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT id, user_role FROM users WHERE email = %s OR phone = %s", (req.contact, req.contact))
        user = cursor.fetchone()
        redis_client.delete(redis_key)
        
        token = create_jwt_token(user['id'], user['user_role'])
        return {"token": token, "user_id": user['id'], "role": user['user_role']}
    finally:
        cursor.close()