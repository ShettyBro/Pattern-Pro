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
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // 

        
        const registerButton = document.getElementById('registerButton');
        registerButton.disabled = true; // Disable the button
        registerButton.textContent = 'Registering...'; 

    
        const fullName = document.getElementById('fullName').value.trim();
        const rollNumber = document.getElementById('rollNumber').value.trim();
        const studentClass = document.getElementById('studentClass').value.trim();
        const division = document.getElementById('division').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('password').value;

    
        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        const passwordError = document.getElementById('passwordError');

        if (!passwordRegex.test(password)) {
            passwordError.innerHTML = "<span style='color: red;'>Invalid Password <br> * Min 8 characters <br> * At least 1 special symbol (!@#$%^&*).</span>";
            registerButton.disabled = false; 
            registerButton.textContent = 'Register'; 
            return;
        } else {
            passwordError.innerHTML = ""; 
        }

        try {
            const response = await fetch('https://classflow.sudeepbro.me/.netlify/functions/register-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, rollNumber, studentClass, division, phoneNumber, password })
            });

            if (response.ok) {
                showModal('Registration successful! Redirecting to login...', 'login.html');
            } else {
                showModal('Registration failed: Roll number already exists or invalid details.');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            showModal('Server Down. Contact Developer or Try Again Later');
        } finally {
            // Re-enable the button after the request is complete
            registerButton.disabled = false; // Re-enable button
            registerButton.textContent = 'Register'; // Reset button text
        }
    });
}
