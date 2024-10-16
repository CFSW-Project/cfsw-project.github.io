// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCllMWtTo0FvtyvBoEXAYZW68bSGReR954",
    authDomain: "appugugu-46214.firebaseapp.com",
    projectId: "appugugu-46214",
    storageBucket: "appugugu-46214.appspot.com",
    messagingSenderId: "501388947238",
    appId: "1:501388947238:web:93cce68b2eea3f98061be7",
    measurementId: "G-F033J9FD9K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Simple input sanitization to prevent XSS
function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
    return re.test(String(email).toLowerCase());
}

// Check if the email already exists in Firestore
async function emailExist(value) {
    const email = sanitizeInput(value.value); // Sanitize input before processing

    // Check Firestore for existing email
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        value.setCustomValidity('Email exists. Try another.');
    } else {
        value.setCustomValidity("");
    }
}

// Show and hide elements
function showHide(show, hide) {
    const showEle = document.getElementById(show);
    const hideEle = document.getElementById(hide);
    showEle.style.display = "block";
    hideEle.style.display = "none";
}

// Attach the showHide function to the window object to make it globally accessible
window.showHide = showHide;

// Validate and store user data in Firestore
async function validateForm() {
    const password = document.getElementById("uPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Ensure passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Sanitize and validate the email
    const email = sanitizeInput(document.getElementById("uEmail").value);
    if (!validateEmail(email)) {
        alert('Invalid email format!');
        return;
    }

    const formData = {
        name: sanitizeInput(document.getElementById("uName").value),
        email: email, // Store the plain email
        password: password // Store the plain password for Firebase
    };

    try {
        // Create a user account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid; // Firebase user ID

        // Store user data in Firestore using userId as document ID
        await setDoc(doc(db, "users", userId), {
            userId: userId,
            ...formData
        });

        document.getElementById("registerForm").reset();
        document.getElementById("thankYou").style.display = "block";
        document.getElementById("registerForm").style.display = "none";
    } catch (e) {
        console.error("Error during registration: ", e);
        alert("Error during registration: " + e.message);
    }
}

// Handling form submission for registration
const form = document.getElementById("registerForm");
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    await validateForm();
});

// Login user securely
async function loginUser() {
    const loginEmail = sanitizeInput(document.getElementById("uemailId").value);
    const loginPass = document.getElementById("ePassword").value;

    // Attempt to log in with Firebase Authentication
    try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPass);
        console.log("You have successfully logged in");

        // Optionally, retrieve user information
        const user = userCredential.user; // Get the user object
        localStorage.setItem('loggedInUser', sanitizeInput(user.displayName || user.email)); // Store the username safely
        window.location.href = 'index.html'; // Redirect to home page
    } catch (error) {
        console.error("Error during login: ", error.code, error.message); // Log the error message
        alert("Invalid email or password.");
    }
}

// Attach the loginUser function to the window object to make it globally accessible
window.loginUser = loginUser;

// Handling login form submission
const loginForm = document.getElementById("logIn");
loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    await loginUser();
});

// Attach emailExist function to window object
window.emailExist = emailExist;

// Attach verifyPassword function to window object
window.verifyPassword = function(input) {
    if (input.value !== document.getElementById("uPassword").value) {
        input.setCustomValidity("Password must match.");
    } else {
        input.setCustomValidity("");
    }
};