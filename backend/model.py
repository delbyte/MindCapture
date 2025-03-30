import torch
from transformers import BartForConditionalGeneration, BartTokenizer, pipeline

# Summarization: Load the BART model and tokenizer for summarization
summarization_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
summarization_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")

# Classification: Use the zero-shot classification pipeline with BART-MNLI
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def summarize_text(text):
    # If the text is too short, just return it.
    if len(text.split()) < 50:
        return text
    inputs = summarization_tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = summarization_model.generate(
        **inputs,
        max_length=200,
        min_length=50,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )
    return summarization_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def classify_text(text):
    # Define candidate labels for classification; adjust as needed.
    candidate_labels = ["depression", "motivation", "inspiration", "life", "love"]
    result = classifier(text, candidate_labels)
    return result["labels"][0]
