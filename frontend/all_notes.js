// Fetch and display all notes when the page loads
document.addEventListener("DOMContentLoaded", loadAllNotes);

async function loadAllNotes() {
  const notesContainer = document.getElementById("notesContainer");
  const loadingText = document.getElementById("loadingText");

  try {
    const response = await fetch("http://127.0.0.1:8000/notes/");
    const result = await response.json();

    // Clear loading text
    notesContainer.removeChild(loadingText);

    if (result.notes && result.notes.length > 0) {
      result.notes.forEach(note => {
        // Create a note element with card layout
        const noteElement = createNoteElement(note);
        notesContainer.appendChild(noteElement);
      });
    } else {
      const noNotesMsg = document.createElement("p");
      noNotesMsg.textContent = "No notes found.";
      notesContainer.appendChild(noNotesMsg);
    }
  } catch (error) {
    console.error("Error loading notes:", error);
    loadingText.textContent = "Error loading notes. Please try again.";
  }
}

// Function to create a note element
function createNoteElement(note) {
  const noteDiv = document.createElement("div");
  noteDiv.classList.add(".note-card"); // Add 'note-card' class for styling

  // Create title, content, summary, and category
  const titleElem = document.createElement("h3");
  titleElem.classList.add("note-title");
  titleElem.textContent = note.title || "Untitled Note"; // Display title or fallback to 'Untitled Note'

  const contentElem = document.createElement("p");
  contentElem.classList.add("note-text");
  contentElem.innerHTML = `<strong>Content:</strong> ${note.content}`;

  const summaryElem = document.createElement("p");
  summaryElem.classList.add("note-text");
  summaryElem.innerHTML = `<strong>Summary:</strong> ${note.summary}`;

  const categoryElem = document.createElement("p");
  categoryElem.classList.add("note-category");
  categoryElem.innerHTML = `<strong>Category:</strong> ${note.category || "No category"}`;

  const timestampElem = document.createElement("p");
  timestampElem.classList.add("timestamp");
  timestampElem.innerHTML = `<strong>Created:</strong> ${note.created_at || "Unknown"}`;

  // Create actions container for edit and delete buttons
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("note-actions");

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", async () => {
    if (confirm(`Are you sure you want to delete this note?`)) {
      try {
        const delResponse = await fetch(`http://127.0.0.1:8000/notes/${note.id}`, {
          method: "DELETE"
        });
        const delResult = await delResponse.json();
        alert(delResult.message);
        // Remove the note from the DOM
        noteDiv.remove();
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Error deleting note.");
      }
    }
  });

  // Append all elements to the actions container
  actionsDiv.appendChild(deleteBtn);

  // Append all elements to the note container
  noteDiv.appendChild(titleElem);
  noteDiv.appendChild(contentElem);
  noteDiv.appendChild(summaryElem);
  noteDiv.appendChild(categoryElem);
  noteDiv.appendChild(timestampElem);
  noteDiv.appendChild(actionsDiv);

  // Add space between cards
  noteDiv.style.marginBottom = "20px";  // Adds space between individual note cards
  
  return noteDiv;
}
