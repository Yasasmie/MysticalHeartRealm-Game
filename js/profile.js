import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const usernameDisplay = document.getElementById('profile-username');
const scoreHistoryList = document.getElementById('score-history');

/**
 * Fetches and displays the user's score history from Firestore.
 * Highlights the highest score achieved.
 * @param {string} userId The Firebase User ID (UID).
 */
async function fetchScoreHistory(userId) {
  scoreHistoryList.innerHTML = '<li>Fetching records...</li>';

  try {
    // 1. Get all scores ordered by date (most recent first)
    const scoresCollectionRef = collection(db, "users", userId, "scores");
    const q = query(scoresCollectionRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    let scores = [];
    let maxScore = 0;

    // 2. Iterate to collect all scores and find the absolute maximum score
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const currentScore = data.score || 0;
      scores.push(data);
      if (currentScore > maxScore) {
        maxScore = currentScore;
      }
    });

    if (scores.length === 0) {
      scoreHistoryList.innerHTML = '<li>No game records found. Play a game!</li>';
      return;
    }

    // 3. Map scores to list items, applying a highlight class if it matches the maxScore
    scoreHistoryList.innerHTML = scores.map(data => {
      const currentScore = data.score || 0;
      // Check if this score is the highest score
      const isHighScore = currentScore === maxScore && maxScore > 0;
      const scoreDisplay = new Intl.NumberFormat().format(currentScore);

      let dateDisplay;
      if (data.date && data.date.toDate) {
        dateDisplay = data.date.toDate().toLocaleString();
      } else {
        dateDisplay = 'N/A';
      }
      
      const highlightClass = isHighScore ? 'score-highlight' : '';

      return `
        <li class="${highlightClass}">
          <span>Score: ${scoreDisplay} | Level: ${data.level || '-'}</span>
          <span class="score-date">${dateDisplay} ${isHighScore ? '🏆' : ''}</span>
        </li>
      `;
    }).join('');

  } catch (error) {
    console.error("Error fetching score history:", error);
    scoreHistoryList.innerHTML = '<li>⚠️ Failed to load history. Check console for error details.</li>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Authentication State Listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, display username and fetch scores
      const username = user.email.split('@')[0];
      usernameDisplay.innerText = username;
      fetchScoreHistory(user.uid);
    } else {
      // User is signed out, redirect to login
      window.location.href = 'Login.html';
    }
  }, (error) => {
    console.error("Auth state error:", error);
    window.location.href = 'Login.html';
  });

  // Logout Button Handler
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = 'Login.html';
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  });
});