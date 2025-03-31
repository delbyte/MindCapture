import sqlite3
import os
from config import DB_PATH
from datetime import datetime

# Ensure the data folder exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def init_db():
    """Initialize the database and create the notes table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            summary TEXT NOT NULL,
            category TEXT NOT NULL,
            created_at TEXT NOT NULL
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
    cursor.execute("SELECT id, content, summary, category, created_at FROM notes ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "content": row[1], "summary": row[2], "category": row[3], "created_at": row[4]} for row in rows]

def get_notes_by_category(category: str):
    """Fetch notes that match a given category (case-insensitive)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, content, summary, category, created_at FROM notes WHERE lower(category)=? ORDER BY created_at DESC", (category.lower(),))
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "content": row[1], "summary": row[2], "category": row[3], "created_at": row[4]} for row in rows]

def get_all_categories():
    """Return a list of unique categories from the notes."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT category FROM notes")
    rows = cursor.fetchall()
    conn.close()
    return [row[0] for row in rows]
