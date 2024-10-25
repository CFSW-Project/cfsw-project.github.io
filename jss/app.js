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
        email: email // Store the plain email
    };

    try {
        // Create a user account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid; // Firebase user ID

        // Store user data in Firestore using userId as document ID
        await setDoc(doc(db, "users", userId), {
            userId: userId,
            ...formData
            // Do NOT store the password in Firestore
        });

        document.getElementById("registerForm").reset();
        document.getElementById("thankYou").style.display = "block";
        document.getElementById("registerForm").style.display = "none";
    } catch (e) {
        let errorMessage;
        switch (e.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already in use. Please try another.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled. Please check your Firebase console.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters.';
                break;
            default:
                errorMessage = 'Registration failed. Please try again.';
        }
        alert(errorMessage);
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
        let errorMessage;
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No user found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            default:
                errorMessage = 'Login failed. Please try again.';
        }
        alert(errorMessage);
        console.error("Error during login: ", error.code); // Log the error code
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