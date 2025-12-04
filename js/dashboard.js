// js/dashboard.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// --- Cookie Utility Functions ---
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  const soundtrack = document.getElementById("dashboard-soundtrack");
  const soundIcon = document.getElementById("sound-icon");
  const ICON_UNMUTE = "./Images/10.png";
  const ICON_MUTE = "./Images/11.png";

  function setIconPaused() {
    if (!soundIcon) return;
    soundIcon.src = ICON_MUTE;
    soundIcon.alt = "Volume Off";
  }

  function setIconPlaying() {
    if (!soundIcon) return;
    soundIcon.src = ICON_UNMUTE;
    soundIcon.alt = "Volume On";
  }

  function initializeAudioState() {
    if (!soundtrack) return;
    soundtrack.volume = 0.3;
    const audioSetting = getCookie("audio_setting");

    if (audioSetting === "muted") {
      soundtrack.pause();
      setIconPaused();
    } else {
      soundtrack
        .play()
        .then(() => {
          setIconPlaying();
        })
        .catch(() => {
          setIconPaused();
        });
    }
  }

  initializeAudioState();

  if (soundIcon && soundtrack) {
    soundIcon.addEventListener("click", () => {
      if (soundtrack.paused) {
        soundtrack.play();
        setIconPlaying();
        setCookie("audio_setting", "playing", 365);
      } else {
        soundtrack.pause();
        setIconPaused();
        setCookie("audio_setting", "muted", 365);
      }
    });
  }

  const playBtn = document.getElementById("play-btn");
  if (playBtn)
    playBtn.addEventListener("click", () => {
      window.location.href = "Instruction.html";
    });

  const creditsBtn = document.getElementById("credits-btn");
  if (creditsBtn)
    creditsBtn.addEventListener("click", () => {
      window.location.href = "Credits.html";
    });

  const leaderboardBtn = document.getElementById("leaderboard-btn");
  if (leaderboardBtn)
    leaderboardBtn.addEventListener("click", () => {
      window.location.href = "Leaderboard.html";
    });

  const achievementsBtn = document.getElementById("achievements-btn");
  if (achievementsBtn)
    achievementsBtn.addEventListener("click", () => {
      window.location.href = "Profile.html";
    });

  const quietBtn = document.getElementById("quiet-btn");
  if (quietBtn && soundtrack) {
    quietBtn.addEventListener("click", () => {
      if (!soundtrack.paused) soundtrack.pause();
      setCookie("audio_setting", "muted", 365);

      try {
        window.close();
        setTimeout(() => {
          if (!window.closed) window.location.href = "Login.html";
        }, 100);
      } catch (e) {
        window.location.href = "Login.html";
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "Login.html";
  });
});
