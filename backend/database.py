import sqlite3
from config import DB_PATH

def init_db():
    """Initialize the database and create the notes table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            summary TEXT NOT NULL,
            category TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def get_db_connection():
    """Return a connection to the database."""
    return sqlite3.connect(DB_PATH)

def get_all_notes():
    """Fetch all notes from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, content, summary, category FROM notes")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "content": row[1], "summary": row[2], "category": row[3]} for row in rows]
