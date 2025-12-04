// js/login.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    const email = username + "@example.com";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'Dashboard.html';
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
});
