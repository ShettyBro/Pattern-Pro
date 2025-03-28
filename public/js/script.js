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
