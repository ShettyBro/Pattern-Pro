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

// Register function
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('student-register-form');

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

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
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const hashedPassword = await hashPassword(password);

        console.log("Submitting Data:", {
            fullName, rollNumber, studentClass, division, phoneNumber, schoolName, password: hashedPassword
        });

        try {
            const response = await fetch('https://classflow.sudeepbro.me/.netlify/functions/register-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName, rollNumber, studentClass, division, phoneNumber, schoolName, password: hashedPassword
                })
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (response.ok) {
                alert(result.message);
                registerForm.reset();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to register. Please try again.");
        }
    });
});


// student Login function
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");
    
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
          alert("Login successful!");
          localStorage.setItem("token", data.token); // Store token in localStorage
          window.location.href = "dashboard.html"; // Redirect to dashboard
        } else {
          alert(data.message || "Invalid credentials, please try again.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Something went wrong. Please try again later.");
      }
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
                alert("Login successful! Redirecting...");
                localStorage.setItem("token", result.token); 
                window.location.href = "dashboard.html"; // Redirect to dashboard
            } else {
                alert(result.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Something went wrong. Please try again later.");
        }
    });
});

// upload assignements
  document.getElementById("assignmentForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("studentName", document.getElementById("studentName").value);
    formData.append("rollNumber", document.getElementById("rollNumber").value);
    formData.append("assignmentTitle", document.getElementById("assignmentTitle").value);
    formData.append("assignmentDesc", document.getElementById("assignmentDesc").value);
    formData.append("submissionDateTime", document.getElementById("submissionDateTime").value);
    formData.append("fileType", document.getElementById("fileType").value);
    formData.append("assignmentFile", document.getElementById("assignmentFile").files[0]);

    document.getElementById("submitText").innerText = "Uploading...";
    
    try {
      const response = await fetch("/.netlify/functions/uploadAssignment", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error:", error);
      alert("Submission failed! Try again.");
    } finally {
      document.getElementById("submitText").innerText = "Submit Assignment";
    }
  });
