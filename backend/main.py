from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from model import summarize_text, classify_text
from database import init_db, get_all_notes, get_db_connection, get_notes_by_category, get_all_categories
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import speech_recognition as sr
import tempfile
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
        logger.error(f"Error adding note: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Convert audio file using ffmpeg if available
def convert_audio_to_wav(input_file, output_file):
    try:
        import subprocess
        
        # Try to execute ffmpeg
        process = subprocess.Popen(
            ["ffmpeg", "-i", input_file, "-ar", "16000", "-ac", "1", output_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = process.communicate()
        
        # Check if conversion was successful
        if process.returncode == 0:
            logger.info("Audio conversion successful")
            return True
        else:
            logger.warning(f"FFmpeg conversion failed: {stderr.decode()}")
            return False
    except Exception as e:
        logger.warning(f"Error converting audio: {str(e)}")
        return False

# Improved audio transcription route
@app.post("/transcribe-audio/")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Log the incoming file details
        logger.info(f"Received audio file: {file.filename}, content_type: {file.content_type}")
        
        # Create temporary file to store the uploaded audio
        input_file = tempfile.NamedTemporaryFile(delete=False)
        wav_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        
        try:
            # Write the audio data to the temporary file
            contents = await file.read()
            with open(input_file.name, 'wb') as f:
                f.write(contents)
            
            logger.info(f"Saved uploaded file to {input_file.name}, size: {len(contents)} bytes")
            
            # Attempt to convert the file to WAV format if it's not already
            conversion_successful = convert_audio_to_wav(input_file.name, wav_file.name)
            
            # Use speech recognition to transcribe the audio
            recognizer = sr.Recognizer()
            
            # Adjust recognizer parameters
            recognizer.energy_threshold = 300  # Increase sensitivity
            recognizer.dynamic_energy_threshold = True
            recognizer.pause_threshold = 0.8  # Shorter pause detection
            
            # Process the audio file
            audio_file_to_use = wav_file.name if conversion_successful else input_file.name
            logger.info(f"Using file for recognition: {audio_file_to_use}")
            
            try:
                with sr.AudioFile(audio_file_to_use) as source:
                    # Adjust for ambient noise
                    recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    audio_data = recognizer.record(source)
                    logger.info("Audio recorded successfully")
                    
                    # Try different recognition engines if necessary
                    try:
                        logger.info("Attempting recognition with Google Speech Recognition")
                        text = recognizer.recognize_google(audio_data)
                        logger.info(f"Transcription successful: '{text}'")
                    except sr.UnknownValueError:
                        logger.warning("Google recognition failed, audio unclear")
                        raise HTTPException(status_code=400, detail="Speech unclear, please try again")
                    
                # Return just the transcribed text
                return {"transcribed_text": text}
            except Exception as e:
                logger.error(f"Error during speech recognition: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Recognition error: {str(e)}")
        
        finally:
            # Close and remove the temporary files
            try:
                if os.path.exists(input_file.name):
                    os.unlink(input_file.name)
                if os.path.exists(wav_file.name):
                    os.unlink(wav_file.name)
                logger.info("Temporary files cleaned up")
            except Exception as e:
                logger.warning(f"Error cleaning up temp files: {str(e)}")
            
    except sr.UnknownValueError:
        logger.warning("Speech recognition could not understand audio")
        raise HTTPException(status_code=400, detail="Speech recognition could not understand audio")
    except sr.RequestError as e:
        logger.error(f"Speech recognition service error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speech recognition service error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in transcribe_audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rest of the routes remain the same
@app.get("/notes/")
def get_notes():
    try:
        notes = get_all_notes()
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notes/category/{category}")
def get_notes_by_category_route(category: str):
    try:
        notes = get_notes_by_category(category)
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories/")
def get_categories():
    try:
        categories = get_all_categories()
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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