from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import summarize_text, classify_text
from database import init_db, get_all_notes, get_db_connection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ideally, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the database
init_db()

# Request model for incoming notes
class NoteRequest(BaseModel):
    content: str

# Endpoint to add a note
@app.post("/add-note/")
def add_note(note: NoteRequest):
    try:
        summary = summarize_text(note.content)
        category = classify_text(note.content)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notes (content, summary, category) VALUES (?, ?, ?)",
            (note.content, summary, category)
        )
        conn.commit()
        conn.close()

        return {"message": "Note added successfully", "summary": summary, "category": category}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to retrieve all notes
@app.get("/notes/")
def get_notes():
    try:
        notes = get_all_notes()
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Request model for note deletion
class DeleteNoteRequest(BaseModel):
    id: int

# Endpoint to delete a note by ID
@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Check if note exists
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
