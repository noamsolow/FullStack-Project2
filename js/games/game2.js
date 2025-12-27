/**
 * Game 2: Hangman Challenge
 * לוגיקה סופית ומתוקנת - כפתור Play Again וניקוד
 */

const WORDS = ["JAVASCRIPT", "HTML", "CSS", "DATABASE", "PYTHON", "REACT", "NODEJS", "BROWSER", "SERVER", "CODING"];
const MAX_MISTAKES = 6;

let selectedWord = "";
let guessedLetters = [];
let mistakes = 0;
let currentGameScore = 0; 
let currentUser = null;
let hintUsed = false;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = getCurrentUser();
    if (currentUser && document.getElementById('playerName')) {
        document.getElementById('playerName').textContent = currentUser.username;
    }

    // מאזינים לכפתורי המסך
    document.getElementById('resetBtn').addEventListener('click', fullReset);
    document.getElementById('hintBtn').addEventListener('click', handleHint);
    
    // מאזין לכפתור בתוך ה-Overlay (מסך סיום)
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', initGame);
    }

    initGame();
});

/**
 * איפוס מלא (עבור כפתור New Game)
 */
function fullReset() {
    currentGameScore = 0;
    initGame();
}

/**
 * אתחול מילה חדשה (שומר על הניקוד אם לא הפסדנו)
 */
function initGame() {
    selectedWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    guessedLetters = [];
    mistakes = 0;
    hintUsed = false;
    
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) hintBtn.disabled = false;

    // איפוס ויזואלי
    document.querySelectorAll('.body-part').forEach(part => part.classList.add('hidden'));
    document.getElementById('gameOverlay').classList.add('hidden');
    
    updateWordDisplay();
    createKeyboard();
    updateUIStats();
}

function createKeyboard() {
    const keyboardContainer = document.getElementById('keyboard');
    if (!keyboardContainer) return;
    
    keyboardContainer.innerHTML = '';
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.classList.add('key-btn');
        button.id = `key-${letter}`;
        button.addEventListener('click', () => handleGuess(letter));
        keyboardContainer.appendChild(button);
    });
}

function handleHint() {
    if (hintUsed) return;
    const remainingLetters = selectedWord.split('').filter(l => !guessedLetters.includes(l));
    if (remainingLetters.length > 0) {
        const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
        hintUsed = true;
        document.getElementById('hintBtn').disabled = true;
        handleGuess(randomLetter);
    }
}

function handleGuess(letter) {
    if (guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    const btn = document.getElementById(`key-${letter}`);
    if (btn) btn.disabled = true;

    if (selectedWord.includes(letter)) {
        updateWordDisplay();
        checkWin();
    } else {
        mistakes++;
        showNextPart();
        updateUIStats();
        checkLoss();
    }
}

function updateWordDisplay() {
    const display = selectedWord.split("").map(l => guessedLetters.includes(l) ? l : "_").join(" ");
    document.getElementById('wordDisplay').textContent = display;
}

function showNextPart() {
    const parts = ["head", "body", "left-arm", "right-arm", "left-leg", "right-leg"];
    const element = document.getElementById(parts[mistakes - 1]);
    if (element) element.classList.remove('hidden');
}

/**
 * עדכון הנתונים בתצוגה (כולל הפאנל התחתון)
 */
function updateUIStats() {
    // עדכון נתוני הסבב הנוכחי
    const mistakesElem = document.getElementById('mistakesLeft');
    const scoreElem = document.getElementById('score');
    if (mistakesElem) mistakesElem.textContent = MAX_MISTAKES - mistakes;
    if (scoreElem) scoreElem.textContent = currentGameScore;
    
    // עדכון סטטיסטיקות מצטברות מה-Storage
    if (currentUser) {
        const stats = getGameStats(currentUser.id, 'game2');
        if (stats) {
            // פאנל עליון
            document.getElementById('highScore').textContent = stats.highScore || 0;
            
            // פאנל סטטיסטיקות תחתון
            document.getElementById('gamesPlayed').textContent = stats.played || 0;
            document.getElementById('totalWins').textContent = stats.won || 0;
            document.getElementById('totalStatsScore').textContent = stats.highScore || 0;
        }
    }
}

function checkWin() {
    const isWin = selectedWord.split("").every(l => guessedLetters.includes(l));
    if (isWin) {
        currentGameScore += 100;
        updateUIStats();
        saveGameResult(true);
        showEndScreen("🏆 You Won!", `Great job! The word was: ${selectedWord}`);
    }
}

function checkLoss() {
    if (mistakes >= MAX_MISTAKES) {
        currentGameScore = 0; 
        updateUIStats();
        saveGameResult(false);
        showEndScreen("❌ Game Over", `The word was: ${selectedWord}`);
    }
}

function saveGameResult(isWin) {
    if (!currentUser) return;
    let stats = getGameStats(currentUser.id, 'game2') || initializeGameStats(currentUser.id, 'game2');
    
    stats.played++;
    if (isWin) {
        stats.won++;
        if (currentGameScore > (stats.highScore || 0)) {
            stats.highScore = currentGameScore;
            updateLeaderboard('game2', {
                userId: currentUser.id,
                username: currentUser.username,
                score: currentGameScore,
                date: new Date().toISOString()
            });
        }
    }
    updateGameStats(currentUser.id, 'game2', stats);
}

function showEndScreen(title, message) {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').textContent = message;
    document.getElementById('gameOverlay').classList.remove('hidden');
}