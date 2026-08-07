import os

DB_HOST = "127.0.0.1"
DB_PORT = 5433
DB_NAME = "sport_ticketing"
DB_USER = "sport_admin"
DB_PASS = "admin"


REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))


JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key_123")
JWT_ALGORITHM = "HS256"

ES_HOST = os.getenv("ES_HOST", "http://localhost:9200")