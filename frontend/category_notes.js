// Fetch and display notes by category when the page loads
document.addEventListener("DOMContentLoaded", loadNotesByCategory);

async function loadNotesByCategory() {
  const notesContainer = document.getElementById("notesContainer");
  const loadingText = document.getElementById("loadingText");
  const categoryTitle = document.getElementById("categoryTitle");
  
  // Get the selected category from session storage
  const category = sessionStorage.getItem("selectedCategory");
  
  if (!category) {
    window.location.href = "index.html";
    return;
  }
  
  // Set the category title
  categoryTitle.textContent = category;
  
  try {
    const response = await fetch(`http://127.0.0.1:8000/notes/category/${category}`);
    const result = await response.json();
    
    // Clear loading text
    notesContainer.removeChild(loadingText);
    
    if (result.notes && result.notes.length > 0) {
      result.notes.forEach(note => {
        // Create a note element
        const noteElement = createNoteElement(note);
        notesContainer.appendChild(noteElement);
      });
    } else {
      const noNotesMsg = document.createElement("p");
      noNotesMsg.textContent = `No notes found in category: ${category}`;
      notesContainer.appendChild(noNotesMsg);
    }
  } catch (error) {
    console.error("Error loading notes:", error);
    loadingText.textContent = "Error loading notes. Please try again.";
  }
}

// Function to create a note element (duplicated for simplicity)
function createNoteElement(note) {
  const noteDiv = document.createElement("div");
  noteDiv.classList.add("note");
  
  // Create elements for each field
  const contentElem = document.createElement("p");
  contentElem.innerHTML = `<strong>Content:</strong> ${note.content}`;
  
  const summaryElem = document.createElement("p");
  summaryElem.innerHTML = `<strong>Summary:</strong> ${note.summary}`;
  
  const categoryElem = document.createElement("p");
  categoryElem.innerHTML = `<strong>Category:</strong> ${note.category}`;
  
  const timestampElem = document.createElement("p");
  timestampElem.classList.add("timestamp");
  timestampElem.innerHTML = `<strong>Created:</strong> ${note.created_at || "Unknown"}`;
  
  // Create a delete button
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
  
  // Append all elements to the note container
  noteDiv.appendChild(contentElem);
  noteDiv.appendChild(summaryElem);
  noteDiv.appendChild(categoryElem);
  noteDiv.appendChild(timestampElem);
  noteDiv.appendChild(deleteBtn);
  
  return noteDiv;
}