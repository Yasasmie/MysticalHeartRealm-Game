// js/gameover.js
import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const finalScore = parseInt(sessionStorage.getItem('finalScore') || '0', 10);
  const gameLevel = sessionStorage.getItem('gameLevel') || 'Unknown';

  document.getElementById('final-score').innerText = new Intl.NumberFormat().format(finalScore);
  document.getElementById('game-level').innerText = gameLevel;

  sessionStorage.removeItem('finalScore');
  sessionStorage.removeItem('gameLevel');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const currentUsername = user.email.split('@')[0];

      try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const existingHighScore = existingData.highScore || 0;

          if (finalScore > existingHighScore) {
            await setDoc(userRef, {
              highScore: finalScore,
              level: gameLevel,
              username: currentUsername
            }, { merge: true });
            console.log("High score updated successfully!");
          }
        } else {
          await setDoc(userRef, {
            highScore: finalScore,
            level: gameLevel,
            username: currentUsername
          });
          console.log("New user high score created!");
        }

        const scoresCollectionRef = collection(userRef, "scores");

        await addDoc(scoresCollectionRef, {
          score: finalScore,
          level: gameLevel,
          date: serverTimestamp()
        });
        console.log("Game session history recorded successfully!");
      } catch (error) {
        console.error("Error saving score to Firebase:", error);
      }
    } else {
      console.log("User not logged in. High score not saved.");
    }
  });
});
