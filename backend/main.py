from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import summarize_text, classify_text
from database import init_db, get_all_notes, get_db_connection, get_notes_by_category, get_all_categories
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the database
init_db()

# Request model for incoming notes
class NoteRequest(BaseModel):
    content: str

# Route to add a note
@app.post("/add-note/")
def add_note(note: NoteRequest):
    try:
        summary = summarize_text(note.content)
        category = classify_text(note.content)
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notes (content, summary, category, created_at) VALUES (?, ?, ?, ?)",
            (note.content, summary, category, current_time)
        )
        conn.commit()
        conn.close()

        return {"message": "Note added successfully", "summary": summary, "category": category}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to retrieve all notes
@app.get("/notes/")
def get_notes():
    try:
        notes = get_all_notes()
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to retrieve notes by category
@app.get("/notes/category/{category}")
def get_notes_by_category_route(category: str):
    try:
        notes = get_notes_by_category(category)
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to get all categories
@app.get("/categories/")
def get_categories():
    try:
        categories = get_all_categories()
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to delete a note by ID
@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Check if the note exists
        cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Note not found")
        # Delete the note
        cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        conn.commit()
        conn.close()
        return {"message": f"Note {note_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)