from fastapi import FastAPI
from routers import auth, users, tickets, reservations, admin 
app = FastAPI(title="Sports Event Ticketing API", version="1.0.0")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tickets.router)
app.include_router(reservations.router) 
app.include_router(admin.router)     

@app.get("/")
def root():
    return {"message": "Welcome to the Sports Ticketing"}