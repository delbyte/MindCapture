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

// Voice recording functionality
document.getElementById("recordBtn").addEventListener("click", startRecording);

let mediaRecorder;
let audioChunks = [];
const recordingStatus = document.getElementById("recordingStatus");

function startRecording() {
  const recordBtn = document.getElementById("recordBtn");
  
  // Check if browser supports getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser doesn't support audio recording.");
    return;
  }
  
  // Already recording - stop it
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mic-icon"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg> Record Note`;
    recordBtn.classList.remove("recording");
    recordingStatus.classList.add("hidden");
    return;
  }
  
  // Request microphone access
  navigator.mediaDevices.getUserMedia({ 
    audio: {
      channelCount: 1,          // Use mono audio
      sampleRate: 16000,        // Common rate for speech recognition
      echoCancellation: true,   // Reduce echo
      noiseSuppression: true    // Reduce background noise
    } 
  })
    .then(stream => {
      // Show recording UI
      recordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mic-icon"><rect x="6" y="6" width="12" height="12"></rect></svg> Stop Recording`;
      recordBtn.classList.add("recording");
      recordingStatus.classList.remove("hidden");
      
      // Clear previous recording
      audioChunks = [];
      
      // Create media recorder with appropriate mime type
      let options = {};
      // Try to use webm audio format which is widely supported
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }
      
      mediaRecorder = new MediaRecorder(stream, options);
      
      // Start recording
      mediaRecorder.start();
      console.log("Recording started with MIME type:", mediaRecorder.mimeType);
      
      // Save audio chunks when data is available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          console.log("Audio chunk added, size:", event.data.size);
        }
      };
      
      // When recording stops
      mediaRecorder.onstop = () => {
        console.log("Recording stopped");
        
        // Change button back to normal
        recordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mic-icon"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg> Record Note`;
        recordBtn.classList.remove("recording");
        recordingStatus.classList.add("hidden");
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Create blob from audio chunks with the correct MIME type
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        console.log("Audio blob created, size:", audioBlob.size, "type:", audioBlob.mimeType);
        
        if (audioBlob.size === 0) {
          console.error("Audio blob is empty");
          alert("No audio was recorded. Please try again and speak clearly.");
          return;
        }
        
        // Create form data to send to server
        const formData = new FormData();
        const fileExt = mediaRecorder.mimeType.includes('webm') ? '.webm' : '.ogg';
        formData.append("file", audioBlob, "recording" + fileExt);
        
        // Show processing indicator
        recordingStatus.innerHTML = '<div class="recording-indicator"></div><span>Transcribing...</span>';
        recordingStatus.classList.remove("hidden");
        
        console.log("Sending audio to server");
        // Send audio to server for transcription
        fetch("http://127.0.0.1:8000/transcribe-audio/", {
          method: "POST",
          body: formData
        })
        .then(response => {
          console.log("Server response received, status:", response.status);
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`Server error: ${response.status}, Details: ${text}`);
            });
          }
          return response.json();
        })
        .then(result => {
          console.log("Transcription result:", result);
          recordingStatus.classList.add("hidden");
          
          if (result.transcribed_text) {
            // Simply put the transcribed text in the textarea
            document.getElementById("noteContent").value = result.transcribed_text;
          } else {
            alert("Could not transcribe audio. Please try again.");
          }
        })
        .catch(error => {
          recordingStatus.classList.add("hidden");
          console.error("Error processing audio:", error);
          alert("Error processing audio. Please try again.");
        });
      };
    })
    .catch(error => {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please ensure you've granted permission.");
    });
}

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