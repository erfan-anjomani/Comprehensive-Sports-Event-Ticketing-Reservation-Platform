import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "sport_ticketing")
DB_USER = os.getenv("DB_USER", "sport_admin")
DB_PASS = os.getenv("DB_PASS", "admin")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key_123")
JWT_ALGORITHM = "HS256"