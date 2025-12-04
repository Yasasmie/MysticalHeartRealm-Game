// js/leaderboard.js
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const leaderboardBody = document.getElementById('leaderboard-body');

async function fetchLeaderboard() {
  leaderboardBody.innerHTML = '<tr><td colspan="4">Fetching top scores...</td></tr>';

  try {
    const q = query(collection(db, "users"), orderBy("highScore", "desc"), limit(100));
    const querySnapshot = await getDocs(q);

    let htmlContent = '';
    let rank = 1;

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const username = data.username || 'Anonymous';
      const score = new Intl.NumberFormat().format(data.highScore || 0);
      const level = data.level || '-';

      if (data.highScore > 0) {
        htmlContent += `
          <tr>
            <td>#${rank}</td>
            <td>${username}</td>
            <td>${score}</td>
            <td>${level}</td>
          </tr>
        `;
        rank++;
      }
    });

    if (htmlContent === '') {
      leaderboardBody.innerHTML = '<tr><td colspan="4">No high scores recorded yet. Play a game to set one!</td></tr>';
    } else {
      leaderboardBody.innerHTML = htmlContent;
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    leaderboardBody.innerHTML = '<tr><td colspan="4">Failed to load leaderboard. Check console for details.</td></tr>';
  }
}

document.addEventListener("DOMContentLoaded", fetchLeaderboard);
