import torch
from transformers import BartForConditionalGeneration, BartTokenizer
import json

# Load the BART model and tokenizer for summarization
summarization_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
summarization_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")

# Load the BART model and tokenizer for classification
classification_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large")
classification_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large")

def summarize_text(text):
    inputs = summarization_tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = summarization_model.generate(**inputs, max_length=200, min_length=50, length_penalty=2.0, num_beams=4, early_stopping=True)
    return summarization_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def classify_text(text):
    inputs = classification_tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    category_ids = classification_model.generate(**inputs, max_length=10, num_beams=4, early_stopping=True)
    return classification_tokenizer.decode(category_ids[0], skip_special_tokens=True)

def save_note_with_category(note_text, notes_file="backend/data/notes.json"):
    summary = summarize_text(note_text)
    category = classify_text(note_text)
    
    # Load existing notes
    try:
        with open("backend/data/notes.json", "r", encoding="utf-8") as f:
            notes_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        notes_data = {}
    
    # Check if category already exists
    if category in notes_data:
        notes_data[category].append({"summary": summary, "text": note_text})
    else:
        notes_data[category] = [{"summary": summary, "text": note_text}]
    
    # Save back to file
    with open("backend/data/notes.json", "w", encoding="utf-8") as f:
        json.dump(notes_data, f, indent=4)
    
    return {"summary": summary, "category": category}