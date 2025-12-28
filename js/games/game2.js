/**
 * Game 2: Hangman Challenge - FIXED VERSION
 * Fixes: Stats panel update & Play Again functionality
 */

const WORDS = ["JAVASCRIPT", "HTML", "CSS", "DATABASE", "PYTHON", "REACT", "NODEJS", "BROWSER", "SERVER", "CODING"];
const MAX_MISTAKES = 6;

let selectedWord = "";
let guessedLetters = [];
let mistakes = 0;
let currentGameScore = 0; 
let currentUser = null;
let hintUsed = false;
let sessionStarted = false; // Track if this session counted toward "played"

document.addEventListener('DOMContentLoaded', () => {
    // Check session first
    if (!checkSession()) {
        window.location.href = 'index.html';
        return;
    }

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
    selectedWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    guessedLetters = [];
    mistakes = 0;
    hintUsed = false;
    
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) hintBtn.disabled = false;

    // Reset visual elements
    document.querySelectorAll('.body-part').forEach(part => part.classList.add('hidden'));
    
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
 * Save game result - FIXED VERSION
 */
function saveGameResult(isWin) {
    if (!currentUser) return;
    
    // Get existing stats
    let allStats = localStorage.getItem('gameStats');
    allStats = allStats ? JSON.parse(allStats) : {};
    
    if (!allStats[currentUser.id]) {
        allStats[currentUser.id] = {};
    }
    
    let stats = allStats[currentUser.id]['game2'] || {
        played: 0,
        won: 0,
        highScore: 0,
        totalScore: 0,
        bestStreak: 0,
        lastPlayed: null,
        achievements: []
    };
    
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
    
    // Save updated stats
    allStats[currentUser.id]['game2'] = stats;
    localStorage.setItem('gameStats', JSON.stringify(allStats));
    
    // Update leaderboard if new high score
    if (isWin && currentGameScore > 0) {
        updateLeaderboard('game2', {
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

/**
 * Helper to update leaderboard
 */
function updateLeaderboard(gameId, entry) {
    let leaderboard = localStorage.getItem('leaderboard');
    leaderboard = leaderboard ? JSON.parse(leaderboard) : {};
    
    if (!leaderboard[gameId]) {
        leaderboard[gameId] = [];
    }
    
    // Check if user already has entry
    const existingIndex = leaderboard[gameId].findIndex(e => e.userId === entry.userId);
    
    if (existingIndex !== -1) {
        // Update only if new score is higher
        if (entry.score > leaderboard[gameId][existingIndex].score) {
            leaderboard[gameId][existingIndex] = entry;
        }
    } else {
        leaderboard[gameId].push(entry);
    }
    
    // Sort and keep top 10
    leaderboard[gameId].sort((a, b) => b.score - a.score);
    leaderboard[gameId] = leaderboard[gameId].slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}