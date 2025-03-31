# README.md

## 📝 MindCapture

**A completely local AI-Powered Note-Taking App for Real-Time Summarization and Categorization**

![GitHub Stars](https://img.shields.io/github/stars/delbyte/local-ai-notes?style=social)
![GitHub License](https://img.shields.io/github/license/delbyte/local-ai-notes)
![GitHub Last Commit](https://img.shields.io/github/last-commit/delbyte/local-ai-notes)

## 🚀 Project Overview

**MindCapture** is a **completely local** AI-powered note-taking application designed to help users capture, summarize, and categorize notes in real-time. By leveraging advanced AI technology, users can efficiently manage their notes, quickly extract key information, and automatically organize content based on its theme.

## 🌟 Key Features

1. **Real-Time Summarization**  
   - Automatically extracts key information from your notes as you type.
   - Supports multiple summary formats (e.g., bullet points, paragraph summaries).

2. **Smart Categorization**  
   - AI automatically identifies topics and categorizes notes accordingly.
   - Supports custom categorization rules defined by the user.

3. **Tag Management**  
   - Automatically generates or manually adds tags for quick retrieval.
   - Supports tag filtering and combined queries.

4. **Local Storage**  
   - All notes are stored locally to ensure privacy and security.
   - Optional encryption for sensitive data.

5. **Cross-Platform Support**  
   - Works on Windows, macOS, and Linux.
   - Provides both desktop and command-line interfaces.

## 🛠️ Technology Stack

- **Backend**: Python and FastAPI
- **Frontend**: HTML, CSS, JavaScript
- **GUI Framework**: Pure CSS
- **Data Storage**: SQLite
- **Additional Tools**: FastAPI (API service), BART MNLI (local AI model)

## 📦 Installation & Usage

### Installing Dependencies

```bash
# Clone the repository
git clone https://github.com/delbyte/local-ai-notes.git
cd local-ai-notes

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Install FFmpeg and add it to PATH
```

### Launching the Application

```bash
# Start the backend (in the backend path)
source venv/Scripts/activate
uvicorn main:app --reload

# Start the frontend (in the frontend path)
python -m http.server 3001
```

## 📊 Example

### Input Note Content

```plaintext
How the Speech Recognition Works When the user clicks the "Record Note" button: The browser requests microphone access A red recording indicator appears The button changes to "Stop Recording" When the user clicks "Stop Recording": The recording stops The audio is sent to the backend A "Processing..." indicator appears The backend: Receives the audio file Saves it temporarily Uses Google's speech recognition service to transcribe it Processes the transcribed text (summary, classification) Adds it to the database Returns the results to the frontend The frontend: Shows the transcribed text in the textarea Alerts the user with the results Updates the categories list
```

### Auto-Generated Summary

- Summary: Google's speech recognition service transcribes text. The results are displayed in a textarea. The service saves the transcribed text temporarily. It also updates the categories list and the user can search for a specific word or phrase by clicking on the word's title.

### Auto-Generated Classification

- Category: idea

## 🤝 Contribution Guidelines

Contributions are welcome! Follow these steps to contribute:

1. Fork this repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add some feature"`
4. Push your branch: `git push origin feature/your-feature`
5. Submit a Pull Request.

## 📄 License

This project is open-source under the [MIT License](LICENSE). Please adhere to the terms when using this software.

## 📬 Contact

For questions or suggestions, feel free to reach out:

- GitHub: [@delbyte](https://github.com/delbyte)
- Email: blazed0utcodes@gmail.com

---
