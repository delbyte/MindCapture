// Load categories when the page loads
document.addEventListener("DOMContentLoaded", loadCategories);

// Function to load categories into the dropdown
async function loadCategories() {
  try {
    const response = await fetch("http://127.0.0.1:8000/categories/");
    const result = await response.json();
    const categorySelect = document.getElementById("categorySelect");
    
    // Clear existing options (except the first one)
    while (categorySelect.options.length > 1) {
      categorySelect.remove(1);
    }
    
    // Add new options
    if (result.categories && result.categories.length > 0) {
      result.categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.text = category;
        categorySelect.appendChild(option);
      });
    } else {
      const option = document.createElement("option");
      option.text = "No categories available";
      option.disabled = true;
      categorySelect.appendChild(option);
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Function to add a note
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
    alert(`Note added!\nSummary: ${result.summary}\nCategory: ${result.category}`);
    document.getElementById("noteContent").value = "";
    
    // Refresh categories list as a new one might have been added
    loadCategories();
  } catch (error) {
    console.error("Error adding note:", error);
    alert("Error adding note.");
  }
});

// View all notes button
document.getElementById("viewAllNotesBtn").addEventListener("click", () => {
  window.location.href = "all_notes.html";
});

// View by category button
document.getElementById("viewByCategoryBtn").addEventListener("click", () => {
  const category = document.getElementById("categorySelect").value;
  if (!category) {
    alert("Please select a category.");
    return;
  }
  
  // Store the selected category in session storage
  sessionStorage.setItem("selectedCategory", category);
  window.location.href = "category_notes.html";
});