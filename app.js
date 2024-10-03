// Define static salts
const STATIC_SALT_EMAIL = "staticSaltForEmail"; // Static salt for email
const STATIC_SALT_PASSWORD = "staticSaltForPassword"; // Static salt for password

// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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

// Hashing password function with static salt
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + STATIC_SALT_PASSWORD); // Use static password salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hashing email function with static salt
async function hashEmail(email) {
    const encoder = new TextEncoder();
    const data = encoder.encode(email + STATIC_SALT_EMAIL); // Use static email salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
    const hashedEmail = await hashEmail(value.value); // Use static salt for email

    // Check Firestore for existing hashed email
    const q = query(collection(db, "users"), where("email", "==", hashedEmail));
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

    // Hash the password with the static salt
    const hashedPassword = await hashPassword(password);

    // Hash the email with the static salt for consistency
    const email = sanitizeInput(document.getElementById("uEmail").value);
    if (!validateEmail(email)) {
        alert('Invalid email format!');
        return;
    }

    const hashedEmail = await hashEmail(email); // Static salt for email hashing

    const formData = {
        name: sanitizeInput(document.getElementById("uName").value),
        email: hashedEmail, // Hashed email stored
        password: hashedPassword, // Hashed password stored
        salt: STATIC_SALT_PASSWORD // Store the static salt for password hashing
    };

    try {
        // Create a user account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid; // Firebase user ID

        // Store user data in Firestore
        await addDoc(collection(db, "users"), {
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

    // Hash the login email with the same static salt used during registration
    const hashedLoginEmail = await hashEmail(loginEmail);

    // Query Firestore to find the user by hashed email
    const q = query(collection(db, "users"), where("email", "==", hashedLoginEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data(); // Get user data

        // Hash the login password with the same static salt
        const hashedLoginPass = await hashPassword(loginPass);
        if (hashedLoginPass === user.password) {
            console.log("You have successfully logged in");
            localStorage.setItem('loggedInUser', sanitizeInput(user.name)); // Store the username safely
            window.location.href = 'index.html'; // Redirect to home page
        } else {
            console.log("Invalid credentials");
        }
    } else {
        console.log("No users registered.");
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