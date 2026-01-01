/**
 * Game 2: Hangman Challenge - FIXED VERSION
 * Fixes: Stats panel update & Play Again functionality
 */

// Words with categories for better gameplay
const WORDS = [
    // Programming Languages
    { word: "JAVASCRIPT", category: "Programming Language" },
    { word: "PYTHON", category: "Programming Language" },
    { word: "JAVA", category: "Programming Language" },
    { word: "JAVASCRIPT", category: "Programming Language" },
    { word: "CPLUSPLUS", category: "Programming Language" },
    { word: "CSHARP", category: "Programming Language" },
    
    // Web Technologies
    { word: "HTML", category: "Web Technology" },
    { word: "CSS", category: "Web Technology" },
    { word: "REACT", category: "Web Technology" },
    { word: "NODEJS", category: "Web Technology" },
    { word: "BOOTSTRAP", category: "Web Technology" },
    { word: "WEBPACK", category: "Web Technology" },
    
    // Computer Terms
    { word: "DATABASE", category: "Computer Term" },
    { word: "BROWSER", category: "Computer Term" },
    { word: "SERVER", category: "Computer Term" },
    { word: "CODING", category: "Computer Term" },
    { word: "ALGORITHM", category: "Computer Term" },
    { word: "FUNCTION", category: "Computer Term" },
    { word: "VARIABLE", category: "Computer Term" },
    { word: "KEYBOARD", category: "Computer Term" },
    { word: "MONITOR", category: "Computer Term" },
    { word: "SOFTWARE", category: "Computer Term" },
    { word: "HARDWARE", category: "Computer Term" },
    { word: "INTERNET", category: "Computer Term" },
    { word: "NETWORK", category: "Computer Term" },
    { word: "FIREWALL", category: "Computer Term" },
    { word: "ENCRYPTION", category: "Computer Term" },
    
    // Animals
    { word: "MONKEY", category: "Animal" },
    { word: "ELEPHANT", category: "Animal" },
    { word: "GIRAFFE", category: "Animal" },
    { word: "DOLPHIN", category: "Animal" },
    { word: "PENGUIN", category: "Animal" },
    { word: "TIGER", category: "Animal" },
    { word: "KANGAROO", category: "Animal" },
    { word: "OCTOPUS", category: "Animal" },
    { word: "BUTTERFLY", category: "Animal" },
    { word: "CROCODILE", category: "Animal" },
    
    // Countries
    { word: "AUSTRALIA", category: "Country" },
    { word: "BRAZIL", category: "Country" },
    { word: "CANADA", category: "Country" },
    { word: "GERMANY", category: "Country" },
    { word: "JAPAN", category: "Country" },
    { word: "MEXICO", category: "Country" },
    { word: "FRANCE", category: "Country" },
    { word: "ITALY", category: "Country" },
    { word: "ISRAEL", category: "Country" },
    
    // Food
    { word: "PIZZA", category: "Food" },
    { word: "HAMBURGER", category: "Food" },
    { word: "SPAGHETTI", category: "Food" },
    { word: "CHOCOLATE", category: "Food" },
    { word: "SANDWICH", category: "Food" },
    { word: "PANCAKE", category: "Food" },
    { word: "STRAWBERRY", category: "Food" },
    { word: "WATERMELON", category: "Food" },
    
    // Sports
    { word: "BASKETBALL", category: "Sport" },
    { word: "FOOTBALL", category: "Sport" },
    { word: "SWIMMING", category: "Sport" },
    { word: "TENNIS", category: "Sport" },
    { word: "VOLLEYBALL", category: "Sport" },
    { word: "BASEBALL", category: "Sport" },
    
    // Movies & Entertainment
    { word: "SUPERMAN", category: "Superhero" },
    { word: "BATMAN", category: "Superhero" },
    { word: "SPIDERMAN", category: "Superhero" },
    { word: "IRONMAN", category: "Superhero" },
    { word: "NETFLIX", category: "Entertainment" },
    { word: "YOUTUBE", category: "Entertainment" },
    
    // Science
    { word: "GRAVITY", category: "Science" },
    { word: "MOLECULE", category: "Science" },
    { word: "ELECTRON", category: "Science" },
    { word: "GALAXY", category: "Science" },
    { word: "OXYGEN", category: "Science" },
    { word: "HYDROGEN", category: "Science" }
];

const MAX_MISTAKES = 6;

let selectedWord = "";
let selectedCategory = "";
let guessedLetters = [];
let mistakes = 0;
let currentGameScore = 0; 
let currentUser = null;
let hintUsed = false;
let sessionStarted = false; // Track if this session counted toward "played"

document.addEventListener('DOMContentLoaded', () => {
    // Check session first
    if (!requireAuth()) return;

    currentUser = getCurrentUser();
    if (currentUser && document.getElementById('playerName')) {
        document.getElementById('playerName').textContent = currentUser.username;
    }

    // Load initial stats
    loadUserStats();

    // Event listeners
    document.getElementById('resetBtn').addEventListener('click', fullReset);
    document.getElementById('hintBtn').addEventListener('click', handleHint);
    
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', playAgain);
    }

    initGame();
});

/**
 * Full reset (New Game button)
 */
function fullReset() {
    currentGameScore = 0;
    sessionStarted = false; // Reset session tracking
    initGame();
}

/**
 * Play Again (from overlay) - keeps score streak
 */
function playAgain() {
    document.getElementById('gameOverlay').classList.add('hidden');
    initGame();
}

/**
 * Initialize new word
 */
function initGame() {
    if (!requireAuth()) return;
    // Select random word object
    const wordObj = WORDS[Math.floor(Math.random() * WORDS.length)];
    selectedWord = wordObj.word;
    selectedCategory = wordObj.category;
    
    guessedLetters = [];
    mistakes = 0;
    hintUsed = false;
    
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) hintBtn.disabled = false;

    // Reset visual elements
    document.querySelectorAll('.body-part').forEach(part => part.classList.add('hidden'));
    
    // Update category display
    const categoryText = document.getElementById('categoryText');
    if (categoryText) categoryText.textContent = selectedCategory;
    
    updateWordDisplay();
    createKeyboard();
    updateUIStats();
}

/**
 * Create keyboard
 */
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

/**
 * Handle hint button
 */
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

/**
 * Handle letter guess
 */
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

/**
 * Update word display
 */
function updateWordDisplay() {
    const display = selectedWord.split("").map(l => guessedLetters.includes(l) ? l : "_").join(" ");
    const wordDisplayEl = document.getElementById('wordDisplay');
    if (wordDisplayEl) {
        wordDisplayEl.textContent = display;
    }
}

/**
 * Show next body part
 */
function showNextPart() {
    const parts = ["head", "body", "left-arm", "right-arm", "left-leg", "right-leg"];
    if (mistakes > 0 && mistakes <= parts.length) {
        const element = document.getElementById(parts[mistakes - 1]);
        if (element) element.classList.remove('hidden');
    }
}

/**
 * Update UI stats - FIXED VERSION
 */
function updateUIStats() {
    // Update current game info
    const mistakesElem = document.getElementById('mistakesLeft');
    const scoreElem = document.getElementById('score');
    if (mistakesElem) mistakesElem.textContent = MAX_MISTAKES - mistakes;
    if (scoreElem) scoreElem.textContent = currentGameScore;
    
    // Load and display saved stats
    loadUserStats();
}

/**
 * Load user stats from storage - NEW FUNCTION
 */
function loadUserStats() {
    if (!currentUser) return;
    
    const stats = getGameStats(currentUser.id, 'game2');
    
    if (stats) {
        // Update top panel
        document.getElementById('highScore').textContent = stats.highScore || 0;
        
        // Update bottom stats panel
        document.getElementById('gamesPlayed').textContent = stats.played || 0;
        document.getElementById('totalWins').textContent = stats.won || 0;
        document.getElementById('totalStatsScore').textContent = stats.highScore || 0;
    } else {
        // Initialize if no stats exist
        document.getElementById('highScore').textContent = 0;
        document.getElementById('gamesPlayed').textContent = 0;
        document.getElementById('totalWins').textContent = 0;
        document.getElementById('totalStatsScore').textContent = 0;
    }
}

/**
 * Check win condition
 */
function checkWin() {
    const isWin = selectedWord.split("").every(l => guessedLetters.includes(l));
    if (isWin) {
        currentGameScore += 100;
        updateUIStats();
        saveGameResult(true);
        showEndScreen("🏆 You Won!", `Great job! The word was: ${selectedWord}`);
    }
}

/**
 * Check loss condition
 */
function checkLoss() {
    if (mistakes >= MAX_MISTAKES) {
        saveGameResult(false);
        showEndScreen("❌ Game Over", `The word was: ${selectedWord}`);
        currentGameScore = 0; // Reset score after loss
    }
}

/**
 * Save game result - Uses storage utility functions
 */
function saveGameResult(isWin) {
    if (!currentUser) return;
    
    // Get existing stats using utility function
    let stats = getGameStats(currentUser.id, 'game2');
    
    // Initialize if no stats exist
    if (!stats) {
        stats = initializeGameStats(currentUser.id, 'game2');
    }
    
    // Only increment played count once per session
    if (!sessionStarted) {
        stats.played++;
        sessionStarted = true;
    }
    
    stats.lastPlayed = new Date().toISOString();
    
    if (isWin) {
        stats.won++;
        if (currentGameScore > stats.highScore) {
            stats.highScore = currentGameScore;
        }
        // Track best streak
        if (stats.bestStreak === undefined) stats.bestStreak = 0;
        stats.bestStreak = Math.max(stats.bestStreak, 1);
    }
    
    stats.totalScore = Math.max(stats.totalScore || 0, currentGameScore);
    
    // Save updated stats using utility function
    updateGameStats(currentUser.id, 'game2', stats);
    
    // Update leaderboard if new high score using utility function
    if (isWin && currentGameScore > 0) {
        addOrUpdateLeaderboardEntry('game2', {
            userId: currentUser.id,
            username: currentUser.username,
            score: currentGameScore,
            date: new Date().toISOString()
        });
    }
    
    // Refresh displayed stats
    loadUserStats();
    
    console.log('✅ Game stats saved:', stats);
}

/**
 * Show end screen overlay
 */
function showEndScreen(title, message) {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').textContent = message;
    document.getElementById('gameOverlay').classList.remove('hidden');
}

