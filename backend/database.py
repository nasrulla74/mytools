import sqlite3
import os

DB_PATH = "local_storage.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS websites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            link TEXT NOT NULL,
            icon TEXT,
            description TEXT,
            category TEXT DEFAULT 'General'
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS servers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_name TEXT NOT NULL,
            provider TEXT,
            provider_link TEXT,
            client TEXT,
            server_ip TEXT,
            description TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT NOT NULL,
            category TEXT,
            client TEXT,
            status TEXT DEFAULT 'Pending',
            date_created TEXT,
            date_completed TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            tags TEXT,
            ref_link TEXT,
            images TEXT,
            date_created TEXT
        )
    ''')
    # Check if category column exists for existing DBs
    cursor.execute("PRAGMA table_info(websites)")
    columns = [column[1] for column in cursor.fetchall()]
    if 'category' not in columns:
        cursor.execute("ALTER TABLE websites ADD COLUMN category TEXT DEFAULT 'General'")
    
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
