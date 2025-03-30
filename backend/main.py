from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import sqlite3

# Initialize FastAPI
app = FastAPI()

# Load AI summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Database setup
DB_PATH = "notes.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            summary TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Request model
class NoteRequest(BaseModel):
    content: str

# Routes
@app.post("/add-note/")
def add_note(note: NoteRequest):
    summary = summarizer(note.content, max_length=100, min_length=25, do_sample=False)[0]['summary_text']

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (content, summary) VALUES (?, ?)", (note.content, summary))
    conn.commit()
    conn.close()

    return {"message": "Note added successfully", "summary": summary}

@app.get("/notes/")
def get_notes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, content, summary FROM notes")
    notes = [{"id": row[0], "content": row[1], "summary": row[2]} for row in cursor.fetchall()]
    conn.close()

    return {"notes": notes}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
