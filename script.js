function readMore(button) {
            const content = button.previousElementSibling;
            content.classList.toggle('show-more');
            
        }
        
        
        function tryItYourself(button) {
    // Show or hide the "Try it Yourself" section
    const tryItSection = button.nextElementSibling;
    if (tryItSection.style.display === "none" || !tryItSection.style.display) {
        tryItSection.style.display = "grid";
    } else {
        tryItSection.style.display = "none";
    }
}

function runCode(button) {
    // Get the code from the textarea
    const codeEditor = button.previousElementSibling;
    const code = codeEditor.value;
    
    // Get the iframe and write the code into it
    const iframe = button.nextElementSibling;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write('<style>' + code + '</style><div class="example">Example Text</div>');
    iframeDoc.close();
}















        // Retrieve the logged-in username from localStorage
        const loggedInUser = localStorage.getItem('loggedInUser');
        const usernameDisplay = document.getElementById('username-display');

        if (loggedInUser) {
            usernameDisplay.textContent = `Logged in as: ${loggedInUser}`; // Corrected this line
        } else {
            // If no user is logged in, redirect back to login page
            window.location.href = 'index2.html';  // Change to your login page URL
        }

        // Handle logout
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', function() {
            // Remove the logged-in user from localStorage
            localStorage.removeItem('loggedInUser');
            // Redirect to the login page
            window.location.href = 'index2.html';  // Change to your login page URL
        });
        