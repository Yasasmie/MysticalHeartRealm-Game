// js/game-script.js

// --- IMAGE PATHS AND INITIAL VARIABLES ---
const heartImagePaths = [
  'Images/15.png', 'Images/16.png', 'Images/17.png', 'Images/18.png', 'Images/19.png'
];
const cardBackImage = 'Images/20.png';

let hintsRemaining = 3;
let extraHintsUsed = 0;
const maxExtraHints = 2;
let score = 0;
let displayedHeartIndex = Math.floor(Math.random() * 5);
let cardHeartIndices = [];
let cardFlipped = [false, false, false];

let totalRounds = 6;
let currentRound = 1;

// --- DIFFICULTY LEVEL HANDLING ---
const selectedLevel = localStorage.getItem('selectedLevel');
if (selectedLevel === "Beginner") totalRounds = 6;
else if (selectedLevel === "Intermediate") totalRounds = 8;
else if (selectedLevel === "Advance") totalRounds = 12;

// --- DISPLAY UPDATE ---
function updateDisplay() {
  document.getElementById('score').innerText = score;
  const roundsLeft = totalRounds - currentRound + 1;
  let roundsDisplay = document.getElementById('rounds-remaining');
  if (!roundsDisplay) {
    const scoreRow = document.querySelector('.score-row') || document.querySelector('.header-bar');
    roundsDisplay = document.createElement('span');
    roundsDisplay.id = 'rounds-remaining';
    roundsDisplay.style.marginLeft = '20px';
    roundsDisplay.style.color = 'white';
    if (scoreRow) {
      scoreRow.appendChild(document.createTextNode('Rounds Remaining: '));
      scoreRow.appendChild(roundsDisplay);
    }
  }
  roundsDisplay.innerText = roundsLeft > 0 ? roundsLeft : 0;
}

// --- END GAME REDIRECT ---
function endGame() {
  sessionStorage.setItem('finalScore', score);
  sessionStorage.setItem('gameLevel', selectedLevel);
  window.location.href = 'GameOver.html';
}

// --- MODAL DISPLAY LOGIC ---
function showModal(html) {
  const bg = document.getElementById('modal-bg');
  const content = document.getElementById('modal-content');
  if (!bg || !content) return;
  bg.style.display = 'flex';
  content.innerHTML = html;
}

function closeModal() {
  const bg = document.getElementById('modal-bg');
  if (bg) bg.style.display = 'none';
}

// Global delegated listener for any close buttons inside modal
document.addEventListener('click', (e) => {
  const target = e.target;

  // Any element with data-close-modal="true" will close the modal
  if (target.matches('[data-close-modal="true"]')) {
    e.preventDefault();
    closeModal();
  }
});

// --- SETUP THE NEXT ROUND ---
function setupRound() {
  if (currentRound > totalRounds) {
    endGame();
    return;
  }
  updateDisplay();

  displayedHeartIndex = Math.floor(Math.random() * 5);
  document.getElementById('displayed-heart').src = heartImagePaths[displayedHeartIndex];
  let matchPosition = Math.floor(Math.random() * 3);
  cardHeartIndices = [];

  for (let i = 0; i < 3; i++) {
    cardHeartIndices[i] = i === matchPosition ? displayedHeartIndex : Math.floor(Math.random() * 5);
    cardFlipped[i] = false;
    const cardImg = document.querySelectorAll('.card-img')[i];
    cardImg.src = cardBackImage;
    document.querySelectorAll('.card')[i].classList.remove('flipped');
  }
}

// --- HEART QUIZ MODAL FETCH AND DISPLAY ---
async function openHeartQuizModal() {
  showModal('<b>Loading quiz...</b>');

  try {
    const response = await fetch('https://marcconrad.com/uob/heart/api.php?out=json');
    const data = await response.json();

    if (!data.question) throw new Error('API did not return a quiz image.');

    const modalHtml = `
      <div>
        <h3>Guess the Value!</h3>
        <img src="${data.question}" alt="Heart Quiz" /><br>
        <input type="text" id="heart-quiz-answer" placeholder="Your answer" />
        <br>
        <button id="heart-quiz-submit-btn" data-solution="${data.solution}">Submit</button>
        <button data-close-modal="true">Cancel</button>
      </div>
    `;
    showModal(modalHtml);
  } catch (e) {
    const modalHtml = `
      <div>
        Failed to fetch heart quiz!<br>${e.message}
        <br><button data-close-modal="true">OK</button>
      </div>
    `;
    showModal(modalHtml);
  }
}

// --- SUBMIT QUIZ ANSWER HANDLER ---
function handleHeartQuizSubmit() {
  const input = document.getElementById('heart-quiz-answer');
  const btn = document.getElementById('heart-quiz-submit-btn');
  if (!input || !btn) return;

  const user = input.value.trim();
  const correct = String(btn.dataset.solution);

  if (user === "") {
    showModal(`
      <div>
        Please enter a guess!
        <br><button data-close-modal="true">OK</button>
      </div>
    `);
    return;
  }

  if (user === correct) {
    revealAllCardsFor1Sec();
    closeModal();
  } else {
    const modalHtml = `
      <div>
        Incorrect, the answer is <b>${correct}</b>!
        <br><button data-close-modal="true">OK</button>
      </div>
    `;
    showModal(modalHtml);
  }
}

// Delegated listener for heart quiz submit button
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'heart-quiz-submit-btn') {
    e.preventDefault();
    handleHeartQuizSubmit();
  }
});

// --- REVEAL ALL CARDS FOR 0.5 SEC ---
function revealAllCardsFor1Sec() {
  cardFlipped = [true, true, true];
  document.querySelectorAll('.card').forEach((card, i) => {
    card.querySelector('.card-img').src = heartImagePaths[cardHeartIndices[i]];
    card.classList.add('flipped');
  });

  setTimeout(() => {
    cardFlipped = [false, false, false];
    document.querySelectorAll('.card').forEach((card, i) => {
      card.querySelector('.card-img').src = cardBackImage;
      card.classList.remove('flipped');
    });
  }, 500);
}

// --- HTML ENTITY DECODER (for trivia) ---
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// --- SUBMIT TRIVIA ANSWER HANDLER ---
function submitTriviaAnswer(selected, correct) {
  if (selected === correct) {
    revealAllCardsFor1Sec();
    closeModal();
  } else {
    const modalHtml = `
      <div>
        Incorrect, the answer is <b>${correct}</b>!
        <br><button data-close-modal="true">OK</button>
      </div>
    `;
    showModal(modalHtml);
  }
}

// --- FETCH EXTRA HINT TRIVIA (for extra hints) ---
async function fetchExtraHintTrivia() {
  showModal('<b>Loading extra hint trivia...</b>');

  try {
    const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
    const data = await response.json();

    if (!data.results || data.results.length === 0) throw new Error('No trivia received.');

    const trivia = data.results[0];
    const question = decodeHtml(trivia.question);
    const correctAnswer = decodeHtml(trivia.correct_answer);
    const incorrectAnswers = trivia.incorrect_answers.map(decodeHtml);

    const answers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);

    const answersHtml = answers.map(ans =>
      `<button class="trivia-answer" data-answer="${ans}">${ans}</button>`
    ).join('<br>');

    const modalHtml = `
      <div>
        <h3>Extra Hint Trivia</h3>
        <p>${question}</p>
        ${answersHtml}
        <br><button data-close-modal="true">Cancel</button>
      </div>
    `;

    showModal(modalHtml);

    // Attach listeners after content is set
    document.querySelectorAll('.trivia-answer').forEach(button => {
      button.onclick = () => submitTriviaAnswer(button.dataset.answer, correctAnswer);
    });
  } catch (e) {
    const modalHtml = `
      <div>
        Failed to fetch trivia question!<br>${e.message}
        <br><button data-close-modal="true">OK</button>
      </div>
    `;
    showModal(modalHtml);
  }
}

// --- INITIAL GAME SETUP & EVENTS ---
document.addEventListener("DOMContentLoaded", () => {
  setupRound();
  document.getElementById('hint-count').innerText = hintsRemaining;

  document.getElementById('hint-btn').onclick = async function () {
    if (hintsRemaining > 0) {
      hintsRemaining--;
      document.getElementById('hint-count').innerText = hintsRemaining;
      openHeartQuizModal();
    } else {
      const isExtraHintAvailable = extraHintsUsed < maxExtraHints;
      const disabledAttr = isExtraHintAvailable ? '' : 'disabled';
      const extraHintMsg = isExtraHintAvailable ? '' : '<p><i>(You have used all your extra hints.)</i></p>';

      const modalHtml = `
        <div>
          <p>No hints remaining!</p>
          ${extraHintMsg}
          <button id="modal-extra-hint-btn" ${disabledAttr}>Get Extra Hint</button>
          <br><br>
          <button data-close-modal="true">Cancel</button>
        </div>
      `;
      showModal(modalHtml);

      if (isExtraHintAvailable) {
        document.getElementById('modal-extra-hint-btn').onclick = async function () {
          extraHintsUsed++;
          closeModal();
          await fetchExtraHintTrivia();
        };
      }
    }
  };

  document.querySelectorAll('.card').forEach((card, i) => {
    card.onclick = function () {
      if (!cardFlipped[i]) {
        cardFlipped[i] = true;
        card.querySelector('.card-img').src = heartImagePaths[cardHeartIndices[i]];
        card.classList.add('flipped');

        if (cardHeartIndices[i] === displayedHeartIndex) {
          showModal('Correct Match! +10 points<br><br><button data-close-modal="true">OK</button>');
          score += 10;
        } else {
          showModal('Wrong Match!<br>No points earned.<br><br><button data-close-modal="true">OK</button>');
        }

        currentRound++;
        updateDisplay();

        const gameEnded = currentRound > totalRounds;

        if (gameEnded) {
          setTimeout(() => {
            closeModal();
            endGame();
          }, 2000);
        } else {
          setTimeout(() => {
            closeModal();
            setupRound();
          }, 2000);
        }
      }
    };
  });
});
