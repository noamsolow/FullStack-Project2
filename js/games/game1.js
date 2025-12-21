/**
 * game1.js - Dodge Master Game Logic
 * A game where player dodges falling objects
 */

// Game State
const gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    lives: 3,
    level: 1,
    difficulty: 'easy',
    playerX: 0,
    playerSpeed: 8,
    fallingObjects: [],
    animationId: null,
    spawnInterval: null,
    scoreInterval: null,
    currentUser: null
};

// Game Configuration
const gameConfig = {
    easy: { spawnRate: 1500, fallSpeed: 2, speedIncrease: 0.5 },
    medium: { spawnRate: 1000, fallSpeed: 3, speedIncrease: 0.8 },
    hard: { spawnRate: 700, fallSpeed: 4, speedIncrease: 1.2 }
};

// Falling object emojis
const objectEmojis = ['💣', '☄️', '🔥', '💀', '🌪️', '❌', '🧱'];

// DOM Elements
let gameCanvas, player, scoreEl, livesEl, levelEl, highScoreEl;
let startScreen, pauseScreen, gameOverScreen;
let startBtn, pauseBtn, resumeBtn, restartBtn, playAgainBtn;

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

/**
 * Initialize the game
 */
function initGame() {
    // Check session
    if (!checkSession()) {
        window.location.href = 'index.html';
        return;
    }

    gameState.currentUser = getCurrentUser();
    
    // Get DOM elements
    getDOMElements();
    
    // Display user info
    displayUserInfo();
    
    // Load user stats
    loadUserStats();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show start screen
    showStartScreen();
}

/**
 * Get all DOM elements
 */
function getDOMElements() {
    gameCanvas = document.getElementById('gameCanvas');
    player = document.getElementById('player');
    scoreEl = document.getElementById('score');
    livesEl = document.getElementById('lives');
    levelEl = document.getElementById('level');
    highScoreEl = document.getElementById('highScore');
    
    startScreen = document.getElementById('startScreen');
    pauseScreen = document.getElementById('pauseScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    resumeBtn = document.getElementById('resumeBtn');
    restartBtn = document.getElementById('restartBtn');
    playAgainBtn = document.getElementById('playAgainBtn');
}

/**
 * Display user info
 */
function displayUserInfo() {
    const playerNameEl = document.getElementById('playerName');
    if (playerNameEl && gameState.currentUser) {
        playerNameEl.textContent = gameState.currentUser.username;
    }
}

/**
 * Load user stats
 */
function loadUserStats() {
    const stats = getGameStats(gameState.currentUser.id, 'game1');
    
    if (stats) {
        highScoreEl.textContent = stats.highScore || 0;
        document.getElementById('gamesPlayed').textContent = stats.played || 0;
        document.getElementById('totalScore').textContent = stats.totalScore || 0;
        document.getElementById('bestStreak').textContent = stats.bestStreak || 0;
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Start button
    startBtn.addEventListener('click', startGame);
    
    // Difficulty buttons
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameState.difficulty = e.target.dataset.difficulty;
        });
    });
    
    // Pause/Resume buttons
    pauseBtn.addEventListener('click', pauseGame);
    resumeBtn.addEventListener('click', resumeGame);
    
    // Restart button
    restartBtn.addEventListener('click', () => {
        hidePauseScreen();
        resetGame();
        startGame();
    });
    
    // Play again button
    playAgainBtn.addEventListener('click', () => {
        hideGameOverScreen();
        resetGame();
        startGame();
    });
    
    // Back buttons
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'games.html';
    });
    
    document.getElementById('quitBtn').addEventListener('click', () => {
        window.location.href = 'games.html';
    });
    
    document.getElementById('backToMenuBtn').addEventListener('click', () => {
        window.location.href = 'games.html';
    });
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

/**
 * Handle keyboard input
 */
function handleKeyPress(e) {
    if (!gameState.isRunning || gameState.isPaused) {
        // Pause/unpause with P or ESC
        if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && gameState.isRunning) {
            if (gameState.isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }
        }
        return;
    }
    
    const canvasWidth = gameCanvas.offsetWidth;
    const playerWidth = player.offsetWidth;
    
    // Move player
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameState.playerX = Math.max(0, gameState.playerX - gameState.playerSpeed);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameState.playerX = Math.min(canvasWidth - playerWidth, gameState.playerX + gameState.playerSpeed);
    }
    
    // Update player position
    player.style.left = gameState.playerX + 'px';
}

/**
 * Start the game
 */
function startGame() {
    hideStartScreen();
    gameState.isRunning = true;
    pauseBtn.disabled = false;
    
    // Initialize player position
    const canvasWidth = gameCanvas.offsetWidth;
    const playerWidth = player.offsetWidth;
    gameState.playerX = (canvasWidth - playerWidth) / 2;
    player.style.left = gameState.playerX + 'px';
    
    // Start spawning objects
    const config = gameConfig[gameState.difficulty];
    gameState.spawnInterval = setInterval(spawnFallingObject, config.spawnRate);
    
    // Start score timer (10 points per second)
    gameState.scoreInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.score += 10;
            updateScore();
        }
    }, 1000);
    
    // Start game loop
    gameLoop();
}

/**
 * Spawn a falling object
 */
function spawnFallingObject() {
    if (gameState.isPaused) return;
    
    const canvasWidth = gameCanvas.offsetWidth;
    const objectSize = 40;
    const randomX = Math.random() * (canvasWidth - objectSize);
    const randomEmoji = objectEmojis[Math.floor(Math.random() * objectEmojis.length)];
    
    const obj = document.createElement('div');
    obj.className = 'falling-object';
    obj.textContent = randomEmoji;
    obj.style.left = randomX + 'px';
    obj.style.top = '-40px';
    
    gameCanvas.appendChild(obj);
    
    const config = gameConfig[gameState.difficulty];
    const speed = config.fallSpeed + (gameState.level - 1) * config.speedIncrease;
    
    gameState.fallingObjects.push({
        element: obj,
        x: randomX,
        y: -40,
        speed: speed
    });
}

/**
 * Main game loop
 */
function gameLoop() {
    if (!gameState.isRunning) return;
    
    if (!gameState.isPaused) {
        updateFallingObjects();
        checkCollisions();
        checkLevelUp();
    }
    
    gameState.animationId = requestAnimationFrame(gameLoop);
}

/**
 * Update falling objects positions
 */
function updateFallingObjects() {
    const canvasHeight = gameCanvas.offsetHeight;
    
    for (let i = gameState.fallingObjects.length - 1; i >= 0; i--) {
        const obj = gameState.fallingObjects[i];
        obj.y += obj.speed;
        obj.element.style.top = obj.y + 'px';
        
        // Remove if out of bounds
        if (obj.y > canvasHeight) {
            obj.element.remove();
            gameState.fallingObjects.splice(i, 1);
        }
    }
}

/**
 * Check for collisions
 */
function checkCollisions() {
    const playerRect = player.getBoundingClientRect();
    
    for (let i = gameState.fallingObjects.length - 1; i >= 0; i--) {
        const obj = gameState.fallingObjects[i];
        const objRect = obj.element.getBoundingClientRect();
        
        if (isColliding(playerRect, objRect)) {
            // Hit detected
            handleHit(obj, i);
        }
    }
}

/**
 * Check if two rectangles collide
 */
function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

/**
 * Handle collision
 */
function handleHit(obj, index) {
    // Remove object
    obj.element.remove();
    gameState.fallingObjects.splice(index, 1);
    
    // Reduce life
    gameState.lives--;
    updateLives();
    
    // Flash player red
    player.style.filter = 'brightness(2) saturate(2)';
    setTimeout(() => {
        player.style.filter = 'none';
    }, 200);
    
    // Check game over
    if (gameState.lives <= 0) {
        gameOver();
    }
}

/**
 * Check if level should increase
 */
function checkLevelUp() {
    const newLevel = Math.floor(gameState.score / 500) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        updateLevel();
        showLevelUpNotification();
    }
}

/**
 * Show level up notification
 */
function showLevelUpNotification() {
    const notification = document.createElement('div');
    notification.className = 'level-notification';
    notification.textContent = `Level ${gameState.level}!`;
    gameCanvas.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

/**
 * Pause game
 */
function pauseGame() {
    gameState.isPaused = true;
    showPauseScreen();
}

/**
 * Resume game
 */
function resumeGame() {
    gameState.isPaused = false;
    hidePauseScreen();
}

/**
 * Game over
 */
function gameOver() {
    gameState.isRunning = false;
    pauseBtn.disabled = true;
    
    // Stop intervals
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.scoreInterval);
    cancelAnimationFrame(gameState.animationId);
    
    // Save stats
    saveGameStats();
    
    // Show game over screen
    showGameOverScreen();
}

/**
 * Save game statistics
 */
function saveGameStats() {
    const userId = gameState.currentUser.id;
    const stats = getGameStats(userId, 'game1') || {
        played: 0,
        won: 0,
        highScore: 0,
        totalScore: 0,
        bestStreak: 0,
        lastPlayed: null
    };
    
    // Update stats
    stats.played++;
    stats.totalScore += gameState.score;
    stats.lastPlayed = new Date().toISOString();
    
    if (gameState.score > stats.highScore) {
        stats.highScore = gameState.score;
        document.getElementById('highScoreMsg').textContent = '🎉 New High Score!';
    } else {
        document.getElementById('highScoreMsg').textContent = '';
    }
    
    if (gameState.level > stats.bestStreak) {
        stats.bestStreak = gameState.level;
    }
    
    // Save to localStorage
    updateGameStats(userId, 'game1', stats);
    
    // Update leaderboard
    updateLeaderboard('game1', {
        userId: userId,
        username: gameState.currentUser.username,
        score: gameState.score,
        date: new Date().toISOString()
    });
}

/**
 * Reset game state
 */
function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.isPaused = false;
    gameState.fallingObjects = [];
    
    // Clear all falling objects
    const objects = document.querySelectorAll('.falling-object');
    objects.forEach(obj => obj.remove());
    
    // Update UI
    updateScore();
    updateLives();
    updateLevel();
}

/**
 * Update score display
 */
function updateScore() {
    scoreEl.textContent = gameState.score;
}

/**
 * Update lives display
 */
function updateLives() {
    const hearts = '❤️'.repeat(gameState.lives);
    const emptyHearts = '🖤'.repeat(3 - gameState.lives);
    livesEl.textContent = hearts + emptyHearts;
}

/**
 * Update level display
 */
function updateLevel() {
    levelEl.textContent = gameState.level;
}

/**
 * UI Screen functions
 */
function showStartScreen() {
    startScreen.classList.remove('hidden');
}

function hideStartScreen() {
    startScreen.classList.add('hidden');
}

function showPauseScreen() {
    pauseScreen.classList.remove('hidden');
}

function hidePauseScreen() {
    pauseScreen.classList.add('hidden');
}

function showGameOverScreen() {
    document.getElementById('finalScore').textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
}

function hideGameOverScreen() {
    gameOverScreen.classList.add('hidden');
}

/**
 * Helper functions - these will be implemented in storage.js by Yuval
 */
function getGameStats(userId, gameId) {
    const stats = localStorage.getItem('gameStats');
    if (!stats) return null;
    
    const allStats = JSON.parse(stats);
    return allStats[userId] && allStats[userId][gameId] ? allStats[userId][gameId] : null;
}

function updateGameStats(userId, gameId, newStats) {
    let allStats = localStorage.getItem('gameStats');
    allStats = allStats ? JSON.parse(allStats) : {};
    
    if (!allStats[userId]) {
        allStats[userId] = {};
    }
    
    allStats[userId][gameId] = newStats;
    localStorage.setItem('gameStats', JSON.stringify(allStats));
}

function updateLeaderboard(gameId, entry) {
    let leaderboard = localStorage.getItem('leaderboard');
    leaderboard = leaderboard ? JSON.parse(leaderboard) : {};
    
    if (!leaderboard[gameId]) {
        leaderboard[gameId] = [];
    }
    
    leaderboard[gameId].push(entry);
    
    // Keep only top 10
    leaderboard[gameId].sort((a, b) => b.score - a.score);
    leaderboard[gameId] = leaderboard[gameId].slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}