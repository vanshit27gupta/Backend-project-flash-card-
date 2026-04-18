const API_URL = 'http://localhost:5000/api/students';

// Function to fetch students from backend and display
async function fetchAndDisplayStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = '';

        students.forEach((student, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';

            // Check if photo is from dicebear or local server
            const photoSrc = student.photo.startsWith('http') ? student.photo : `http://localhost:5000${student.photo}`;

            cardDiv.innerHTML = `
                <div class="card-image">
                    <img src="${photoSrc}" alt="${student.name}'s Photo">
                </div>
                <div class="card-info">
                    <h3 class="student-name">${student.name}</h3>
                    <p class="student-id">ID: ${student.id}</p>
                    <p class="student-course">${student.course}</p>
                    <button onclick="deleteStudent(${index})" style="margin-top: 10px; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Delete</button>
                </div>
            `;
            cardContainer.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

// Function to handle form submission
const studentForm = document.getElementById('student-form');
studentForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('student-name').value;
    const id = document.getElementById('student-id-input').value;
    const course = document.getElementById('student-course-input').value;
    const photoFile = document.getElementById('student-photo-input').files[0];

    // Create FormData object to send file and data together
    const formData = new FormData();
    formData.append('name', name);
    formData.append('id', id);
    formData.append('course', course);
    formData.append('photo', photoFile);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            studentForm.reset();
            fetchAndDisplayStudents(); // Refresh UI
        } else {
            const error = await response.json();
            alert("Upload failed: " + error.message);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert("An error occurred during registration.");
    }
});

// Function to delete a student from backend
async function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        try {
            const response = await fetch(`${API_URL}/${index}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                fetchAndDisplayStudents(); // Refresh UI
            } else {
                const error = await response.json();
                alert("Delete failed: " + error.message);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

// Initialize on page load
window.onload = fetchAndDisplayStudents;
