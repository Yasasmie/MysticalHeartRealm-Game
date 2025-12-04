import { auth, db } from './firebase-config.js'; 
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js"; 

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
}

async function saveUsername(uid, username) {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { 
        username: username,
        highScore: 0 
    }, { merge: true }); 
}

document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!username || !password) {
        alert("Username and password cannot be empty.");
        return;
    }

    if (!isValidPassword(password)) {
        alert("Password must be at least 8 characters long and include letters, numbers, and special characters.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const email = username + "@example.com";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUsername(userCredential.user.uid, username);
        alert("Registration successful! Please login.");
        window.location.href = 'Login.html'; 
    } catch (error) {
        alert("Registration failed: " + error.message);
    }
});