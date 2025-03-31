// Fetch and display all notes when the page loads
document.addEventListener("DOMContentLoaded", loadAllNotes)

async function loadAllNotes() {
  const notesContainer = document.getElementById("notesContainer")
  const loadingText = document.getElementById("loadingText")

  try {
    const response = await fetch("http://127.0.0.1:8000/notes/")
    const result = await response.json()

    // Clear loading text
    notesContainer.removeChild(loadingText)

    if (result.notes && result.notes.length > 0) {
      result.notes.forEach((note) => {
        // Create a note element
        const noteElement = createNoteElement(note)
        notesContainer.appendChild(noteElement)
      })
    } else {
      const noNotesMsg = document.createElement("p")
      noNotesMsg.textContent = "No notes found."
      notesContainer.appendChild(noNotesMsg)
    }
  } catch (error) {
    console.error("Error loading notes:", error)
    loadingText.textContent = "Error loading notes. Please try again."
  }
}

// Update the createNoteElement function to use a card-styled display
function createNoteElement(note) {
  const noteDiv = document.createElement("div")
  noteDiv.classList.add("note-card")
  noteDiv.style.marginBottom = "20px" // Space between notes

  // Create elements for each field
  const contentElem = document.createElement("p")
  contentElem.innerHTML = `<strong>Content:</strong> ${note.content}`
  contentElem.classList.add("note-text")

  const summaryElem = document.createElement("p")
  summaryElem.innerHTML = `<strong>Summary:</strong> ${note.summary}`
  summaryElem.classList.add("note-text")

  const categoryElem = document.createElement("p")
  categoryElem.innerHTML = `<strong>Category:</strong> ${note.category}`
  categoryElem.classList.add("note-text")

  const timestampElem = document.createElement("p")
  timestampElem.classList.add("timestamp")
  timestampElem.innerHTML = `<strong>Created:</strong> ${note.created_at || "Unknown"}`
  timestampElem.classList.add("note-text")

  // Create a delete button
  const deleteBtn = document.createElement("button")
  deleteBtn.textContent = "Delete"
  deleteBtn.classList.add("delete-btn")

  // Create a button container for better styling
  const buttonContainer = document.createElement("div")
  buttonContainer.classList.add("note-actions")
  buttonContainer.appendChild(deleteBtn)

  deleteBtn.addEventListener("click", async () => {
    if (confirm(`Are you sure you want to delete this note?`)) {
      try {
        const delResponse = await fetch(`http://127.0.0.1:8000/notes/${note.id}`, {
          method: "DELETE",
        })
        const delResult = await delResponse.json()
        alert(delResult.message)
        // Remove the note from the DOM
        noteDiv.remove()
      } catch (error) {
        console.error("Error deleting note:", error)
        alert("Error deleting note.")
      }
    }
  })

  // Append all elements to the note container
  noteDiv.appendChild(contentElem)
  noteDiv.appendChild(summaryElem)
  noteDiv.appendChild(categoryElem)
  noteDiv.appendChild(timestampElem)
  noteDiv.appendChild(buttonContainer)

  return noteDiv
}

