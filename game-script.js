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
if(selectedLevel === "Beginner") totalRounds = 6;
else if(selectedLevel === "Intermediate") totalRounds = 8;
else if(selectedLevel === "Advance") totalRounds = 12;

// --- DISPLAY UPDATE ---
function updateDisplay() {
    document.getElementById('score').innerText = score;
    const roundsLeft = totalRounds - currentRound + 1;
    let roundsDisplay = document.getElementById('rounds-remaining');
    if (!roundsDisplay) {
        const scoreRow = document.querySelector('.score-row');
        roundsDisplay = document.createElement('span');
        roundsDisplay.id = 'rounds-remaining';
        roundsDisplay.style.marginLeft = '20px';
        roundsDisplay.style.color = 'white';
        scoreRow.appendChild(document.createTextNode('Rounds Remaining: '));
        scoreRow.appendChild(roundsDisplay);
    }
    roundsDisplay.innerText = roundsLeft > 0 ? roundsLeft : 0;
}

// --- END GAME REDIRECT ---
function endGame() {
    sessionStorage.setItem('finalScore', score);
    sessionStorage.setItem('gameLevel', selectedLevel);
    window.location.href = 'GameOver.html';
}

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

// --- INITIAL GAME SETUP ---
setupRound();
document.getElementById('hint-count').innerText = hintsRemaining;

// --- HINT BUTTON EVENT HANDLER ---
document.getElementById('hint-btn').onclick = async function () {
    if (hintsRemaining > 0) {
        hintsRemaining--;
        document.getElementById('hint-count').innerText = hintsRemaining;
        openHeartQuizModal();
    } else {
        // Show modal for extra hint trivia (limit extra hint usage)
        const isExtraHintAvailable = extraHintsUsed < maxExtraHints;
        const disabledAttr = isExtraHintAvailable ? '' : 'disabled';
        const extraHintMsg = isExtraHintAvailable ? '' : '<p><i>(You have used all your extra hints.)</i></p>';

        const modalHtml = `
            <div>
                <p>No hints remaining!</p>
                ${extraHintMsg}
                <button id="modal-extra-hint-btn" ${disabledAttr}>Get Extra Hint</button>
                <br><br>
                <button onclick="closeModal()">Cancel</button>
            </div>
        `;
        showModal(modalHtml);

        if (isExtraHintAvailable) {
            document.getElementById('modal-extra-hint-btn').onclick = async function() {
                extraHintsUsed++;
                closeModal();
                await fetchExtraHintTrivia();
            };
        }
    }
};

// --- MODAL DISPLAY LOGIC ---
function showModal(html) {
    document.getElementById('modal-bg').style.display = 'flex';
    document.getElementById('modal-content').innerHTML = html;
}

function closeModal() {
    document.getElementById('modal-bg').style.display = 'none';
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
                <button onclick="submitHeartQuiz('${data.solution}')">Submit</button>
                <button onclick="closeModal()">Cancel</button>
            </div>
        `;
        showModal(modalHtml);
    } catch (e) {
        showModal("Failed to fetch heart quiz!<br>" + e.message);
    }
}

// --- SUBMIT QUIZ ANSWER HANDLER ---
window.submitHeartQuiz = function(correct) {
    const user = document.getElementById('heart-quiz-answer').value.trim();

    if (user === "") {
        showModal("Please enter a guess!");
        return;
    }

    if (user === String(correct)) {
        revealAllCardsFor1Sec();
        closeModal();
    } else {
        showModal(`Incorrect, the answer is <b>${correct}</b>!<br><button onclick="closeModal()">OK</button>`);
    }
}

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

// --- CARD CLICK EVENT HANDLER ---
document.querySelectorAll('.card').forEach((card, i) => {
    card.onclick = function () {
        if (!cardFlipped[i]) {
            cardFlipped[i] = true;
            card.querySelector('.card-img').src = heartImagePaths[cardHeartIndices[i]];
            card.classList.add('flipped');

            if (cardHeartIndices[i] === displayedHeartIndex) {
                score += 10;
                showModal('Correct Match! +10 points<br><br>');
            } else {
                showModal('Wrong Match!<br>No points earned.<br><br>');
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
    }
});

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

        let answersHtml = answers.map(ans => 
            `<button class="trivia-answer" data-answer="${ans}">${ans}</button>`).join('<br>');

        const modalHtml = `
            <div>
                <h3>Extra Hint Trivia</h3>
                <p>${question}</p>
                ${answersHtml}
                <br><button onclick="closeModal()">Cancel</button>
            </div>
        `;

        showModal(modalHtml);

        document.querySelectorAll('.trivia-answer').forEach(button => {
            button.onclick = () => submitTriviaAnswer(button.dataset.answer, correctAnswer);
        });
    } catch (e) {
        showModal("Failed to fetch trivia question!<br>" + e.message);
    }
}

// --- HTML ENTITY DECODER (for trivia) ---
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// --- SUBMIT TRIVIA ANSWER HANDLER ---
function submitTriviaAnswer(selected, correct) {
    if (selected === correct) {
        revealAllCardsFor1Sec();
        closeModal();
    } else {
        showModal(`Incorrect, the answer is <b>${correct}</b>!<br><button onclick="closeModal()">OK</button>`);
    }
}
