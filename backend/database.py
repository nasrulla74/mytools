import os
import psycopg2
from psycopg2.extras import RealDictCursor
import time

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://myuser:mypassword@db:5432/mytools")

def get_db_connection():
    # Retry logic for DB connection (useful in docker-compose)
    for _ in range(5):
        try:
            conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
            return conn
        except Exception as e:
            print(f"Database connection failed, retrying... {e}")
            time.sleep(2)
    raise Exception("Could not connect to the database")

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # websites table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS websites (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            link TEXT NOT NULL,
            icon TEXT,
            description TEXT,
            category TEXT DEFAULT 'General'
        )
    ''')
    
    # servers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS servers (
            id SERIAL PRIMARY KEY,
            server_name TEXT NOT NULL,
            provider TEXT,
            provider_link TEXT,
            client TEXT,
            server_ip TEXT,
            description TEXT
        )
    ''')
    
    # tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            task_name TEXT NOT NULL,
            category TEXT,
            client TEXT,
            status TEXT DEFAULT 'Pending',
            date_created TEXT,
            date_completed TEXT
        )
    ''')
    
    # notes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            tags TEXT,
            ref_link TEXT,
            images TEXT,
            date_created TEXT
        )
    ''')
    
    conn.commit()
    cursor.close()
    conn.close()
