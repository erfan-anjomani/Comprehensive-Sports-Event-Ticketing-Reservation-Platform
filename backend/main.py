from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, tickets, reservations, admin

app = FastAPI(title="Sports Event Ticketing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # آدرس فرانت‌اند
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tickets.router)
app.include_router(reservations.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Sports Ticketing"}