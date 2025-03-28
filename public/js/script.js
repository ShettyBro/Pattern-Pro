// show model
function showModal(message, redirectUrl = null) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    if (modalMessage) {
        modalMessage.textContent = message;
    }
    modal.style.display = 'block';

    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 3000);
    }
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Add event listener to close the modal when the user clicks on <span> (x)
const closeSpan = document.getElementsByClassName('close')[0];
if (closeSpan) {
    closeSpan.addEventListener('click', closeModal);
}

// Close the modal when clicking outside of the modal
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Update your logout functionality in script.js
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear all auth-related data
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiration');
            localStorage.removeItem('selectedMovieId'); // Clear any selected movie

            // Replace the current history state
            window.history.replaceState(null, '', 'index.html');
            
            // Clear browser history and redirect
            window.location.replace('index.html');
            
            showModal('Successfully logged out. Thank you!');
        });
    }
});


// Handle Logout
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear all auth-related data
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiration');
            localStorage.removeItem('selectedMovieId'); // Clear any selected movie

            // Set page to prevent cache on logout
            window.location.replace('index.html'); // Redirect to login page

            // Show logout confirmation modal
            showModal('Successfully logged out. Thank you!');
        });
    }
});

// Prevent back navigation to protected pages after logout
window.addEventListener('popstate', function(event) {
    const protectedPaths = ['/home.html', '/player.html', '/about.html','/kannada.html','/telugu.html','/tamil.html','/hindi.html','/english.html'];
    const currentPath = window.location.pathname;

    // Check if trying to access protected page without valid token
    const token = localStorage.getItem('authToken');
    const expirationTime = localStorage.getItem('tokenExpiration');

    if (protectedPaths.some(path => currentPath.includes(path))) {
        if (!token || (expirationTime && Date.now() > expirationTime)) {
            window.location.replace('home.html'); // Redirect to login
        }
    }
});

//this meta tag to your HTML files to prevent caching of protected pages
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.match(/(assignment|dashboard|english|hindi|kannada|maths|science|social|grading-portal|feedback-form|manage-classroom|teacher-dashboard)\.html/)) {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Cache-Control');
        meta.setAttribute('content', 'no-cache, no-store, must-revalidate');
        document.head.appendChild(meta);
    }
});



//student register
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('student-register-form');
    const successModal = document.getElementById('modal'); // Correct modal ID
    const modalMessage = document.getElementById('modal-message');
    const closeModal = document.getElementById('close-modal'); // Added ID to HTML
    const registerButton = document.getElementById('registerButton'); // Ensure it exists in HTML

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';

        const fullName = document.getElementById('s-name').value.trim();
        const rollNumber = document.getElementById('s-rollno').value.trim();
        const studentClass = document.getElementById('s-class').value.trim();
        const division = document.getElementById('s-division').value.trim();
        const phoneNumber = document.getElementById('s-phone').value.trim();
        const password = document.getElementById('s-password').value;
        const confirmPassword = document.getElementById('s-confirm-password').value;
        const schoolName = document.getElementById('s-school').value.trim();

        if (!fullName || !rollNumber || !studentClass || !division || !phoneNumber || !password || !schoolName) {
            alert("All fields are required!");
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            return;
        }

        const hashedPassword = await hashPassword(password);

        try {
            const response = await fetch('https://classflow.sudeepbro.me/.netlify/functions/register-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName, rollNumber, studentClass, division, phoneNumber, schoolName, password: hashedPassword
                })
            });

            const result = await response.json();

            if (response.ok) {
                modalMessage.textContent = 'Registration successful! Redirecting to login...';
                successModal.style.display = 'block';

                setTimeout(() => {
                    successModal.style.display = 'none';
                    window.location.href = 'login-student.html';
                }, 3000);

                registerForm.reset();
            } else {
                modalMessage.textContent = `Registration failed: ${result.message}`;
                successModal.style.display = 'block';
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            modalMessage.textContent = 'Server Down Contact Developer or Try Again Later';
            successModal.style.display = 'block';
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
        }
    });

    closeModal.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
});

// student login
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");
    const successModal = document.getElementById("success-modal");
    const modalMessage = document.getElementById("modal-message");
    const closeModal = document.getElementById("close-modal");
    
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent page reload

        const rollno = document.getElementById("s-login-id").value.trim();
        const password = document.getElementById("s-password").value.trim();

        if (!rollno || !password) {
            alert("Please enter both Roll Number and Password.");
            return;
        }

        try {
            const response = await fetch("https://classflow.sudeepbro.me/.netlify/functions/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rollno, password }),
            });

            const data = await response.json();

            if (response.ok) {
                modalMessage.textContent = "Login successful!";
                successModal.style.display = "block";
                localStorage.setItem("token", data.token); // Store token in localStorage
                setTimeout(() => {
                    successModal.style.display = "none";
                    window.location.href = "dashboard.html"; // Redirect to dashboard
                }, 3000);
            } else {
                alert(data.message || "Invalid credentials, please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again later.");
        }
    });

    closeModal.addEventListener("click", () => {
        successModal.style.display = "none";
    });
});

  
// teachers register
document.addEventListener("DOMContentLoaded", function () {
    const teacherRegisterForm = document.getElementById("teacher-register-form");
    const modal = document.getElementById("messageModal");
    const modalMessage = document.getElementById("modal-message");
    const closeModal = document.querySelector(".close");

    // Function to show modal with a message
    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = "block";
    }

    // Close modal when clicking '×' or outside modal
    closeModal.onclick = () => (modal.style.display = "none");
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    teacherRegisterForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("t-name").value.trim();
        const teacherId = document.getElementById("t-id").value.trim();
        const email = document.getElementById("t-email").value.trim();
        const phoneNumber = document.getElementById("t-phone").value.trim();
        const schoolName = document.getElementById("t-school").value.trim();
        const password = document.getElementById("t-password").value.trim();
        const confirmPassword = document.getElementById("t-confirm-password").value.trim();

        if (password !== confirmPassword) {
            showModal("Passwords do not match!");
            return;
        }

        const teacherData = {
            fullName,
            teacherId,
            email,
            phoneNumber,
            schoolName,
            password
        };

        try {
            const response = await fetch("https://your-api-endpoint/register-teacher", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(teacherData)
            });

            const result = await response.json();

            if (response.status === 201) {
                showModal("Registration successful! Redirecting...");
                setTimeout(() => {
                    window.location.href = "./login-teacher.html"; // Redirect to login
                }, 2000);
            } else {
                showModal(result.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            showModal("An error occurred while registering.");
        }
    });
});

// teacher login
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("teacher-login-form");
    const successModal = document.getElementById("success-modal");
    const modalMessage = document.getElementById("modal-message");
    const closeModal = document.getElementById("close-modal");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form submission reload

        const email = document.getElementById("t-email").value.trim();
        const password = document.getElementById("t-password").value.trim();

        if (!email || !password) {
            alert("Please enter both Email and Password.");
            return;
        }

        const apiUrl = "https://classflow.sudeepbro.me/.netlify/functions/login-teachers"; 

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                modalMessage.textContent = "Login successful!";
                successModal.style.display = "block";
                localStorage.setItem("token", result.token);
                setTimeout(() => {
                    successModal.style.display = "none";
                    window.location.href = "teacher-dashboard.html";
                }, 3000);
            } else {
                alert(result.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Something went wrong. Please try again later.");
        }
    });

    closeModal.addEventListener("click", () => {
        successModal.style.display = "none";
    });
});


// upload assignements
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("assignmentForm");
    const fileInput = document.getElementById("assignmentFile");
    const fileInfo = document.querySelector(".file-info");
  
    fileInput.addEventListener("change", function () {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileInfo.textContent = `Selected file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      }
    });
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
  
      // Get form values
      const studentName = document.getElementById("studentName").value.trim();
      const rollNumber = document.getElementById("rollNumber").value.trim();
      const assignmentTitle = document.getElementById("assignmentTitle").value.trim();
      const assignmentDesc = document.getElementById("assignmentDesc").value.trim();
      const submissionDateTime = document.getElementById("submissionDateTime").value.trim();
      const fileType = document.getElementById("fileType").value;
  
      if (!fileInput.files.length) {
        alert("Please select a file to upload.");
        return;
      }
  
      const file = fileInput.files[0];
  
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async function () {
        const base64String = reader.result.split(",")[1]; // Remove prefix data
  
        // Prepare request payload
        const formData = {
          studentName,
          rollNumber,
          assignmentTitle,
          assignmentDesc,
          submissionDateTime,
          fileType,
          fileData: base64String,
        };
  
        try {
          const response = await fetch("https://classflow.sudeepbro.me/.netlify/functions/assignment-up", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
  
          const result = await response.json();
          if (response.ok) {
            alert("Assignment submitted successfully!");
            console.log("File URL:", result.fileUrl);
          } else {
            throw new Error(result.error || "Submission failed.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while uploading the assignment.");
        }
      };
  
      reader.onerror = function (error) {
        console.error("File reading error:", error);
        alert("Failed to read the file.");
      };
    });
  });
  
