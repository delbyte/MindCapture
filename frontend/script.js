// Function to add a note via the /add-note/ endpoint
document.getElementById("addNoteBtn").addEventListener("click", async () => {
    const content = document.getElementById("noteContent").value;
    if (!content) {
      alert("Please enter a note.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/add-note/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
      });
      const result = await response.json();
      console.log("Add Note Response:", result);
      alert(`Note added!\nSummary: ${result.summary}\nCategory: ${result.category}`);
      document.getElementById("noteContent").value = "";
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Error adding note.");
    }
  });
  
  // Function to fetch and display all notes
  document.getElementById("getNotesBtn").addEventListener("click", async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/notes/");
      const result = await response.json();
      const notesContainer = document.getElementById("notesContainer");
      notesContainer.innerHTML = ""; // Clear existing notes
  
      if (result.notes && result.notes.length > 0) {
        result.notes.forEach(note => {
          // Create a container div for the note
          const noteDiv = document.createElement("div");
          noteDiv.classList.add("note");
          noteDiv.style.border = "1px solid #ccc";
          noteDiv.style.padding = "10px";
          noteDiv.style.marginBottom = "10px";
          
          // Create elements for each field
          const idElem = document.createElement("p");
          idElem.innerHTML = `<strong>ID:</strong> ${note.id}`;
          
          const contentElem = document.createElement("p");
          contentElem.innerHTML = `<strong>Content:</strong> ${note.content}`;
          
          const summaryElem = document.createElement("p");
          summaryElem.innerHTML = `<strong>Summary:</strong> ${note.summary}`;
          
          const categoryElem = document.createElement("p");
          categoryElem.innerHTML = `<strong>Category:</strong> ${note.category}`;
          
          // Create a delete button
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.style.backgroundColor = "#e74c3c";
          deleteBtn.style.color = "#fff";
          deleteBtn.style.border = "none";
          deleteBtn.style.padding = "6px 10px";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.style.marginTop = "5px";
          
          deleteBtn.addEventListener("click", async () => {
            if (confirm(`Are you sure you want to delete note ID ${note.id}?`)) {
              try {
                const delResponse = await fetch(`http://127.0.0.1:8000/notes/${note.id}`, {
                  method: "DELETE"
                });
                const delResult = await delResponse.json();
                alert(delResult.message);
                // Refresh notes after deletion
                document.getElementById("getNotesBtn").click();
              } catch (error) {
                console.error("Error deleting note:", error);
                alert("Error deleting note.");
              }
            }
          });
          
          // Append all elements to the note container
          noteDiv.appendChild(idElem);
          noteDiv.appendChild(contentElem);
          noteDiv.appendChild(summaryElem);
          noteDiv.appendChild(categoryElem);
          noteDiv.appendChild(deleteBtn);
          
          // Append a horizontal rule
          const hr = document.createElement("hr");
          noteDiv.appendChild(hr);
          
          // Append the note container to the main container
          notesContainer.appendChild(noteDiv);
        });
      } else {
        notesContainer.textContent = "No notes found.";
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      alert("Error fetching notes.");
    }
  });
  