import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import redis
import config
from elasticsearch import Elasticsearch
db_pool = None
try:
    db_pool = psycopg2.pool.SimpleConnectionPool(
        1, 20,
        host=config.DB_HOST,
        database=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASS,
        port=config.DB_PORT
    )
except Exception as e:
    print("Database connection failed:", e)

# Redis Client
redis_client = redis.Redis(
    host=config.REDIS_HOST, 
    port=config.REDIS_PORT, 
    decode_responses=True
)

es_client = Elasticsearch(config.ES_HOST)

def get_db():
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)





