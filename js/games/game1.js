
// game1.js - Code Runner Game Logic
// A CodeMonkey-style coding puzzle game where players write code to move a monkey
//
///

// Game State
const gameState = {
    isRunning: false,
    isExecuting: false,
    currentLevel: 0,
    difficulty: 'easy',
    score: 0,
    totalMoves: 0,
    currentUser: null,
    monkey: {
        x: 0,
        y: 0,
        direction: 'right' // up, down, left, right
    },
    bananas: [],
    collectedBananas: 0,
    grid: [],
    gridSize: 6,
    executionQueue: [],
    executionTimeout: null,
    sessionStarted: false, // Track if this play session has been counted
    levelsCompletedThisSession: 0 // Track levels beaten in this session
};

// Level configurations for each difficulty
const levels = {
    easy: [
        {
            name: "First Steps",
            gridSize: 5,
            start: { x: 0, y: 2, direction: 'right' },
            bananas: [{ x: 4, y: 2 }],
            walls: [],
            water: [],
            optimalMoves: 5,
            hint: "Use move() four times to reach the banana, then grab() to collect it!"
        },
        {
            name: "Turn Right",
            gridSize: 5,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [{ x: 2, y: 2 }],
            walls: [],
            water: [],
            optimalMoves: 4,
            hint: "Move right twice, turn right, then move down twice"
        },
        {
            name: "L Shape",
            gridSize: 5,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [{ x: 3, y: 3 }],
            walls: [],
            water: [],
            optimalMoves: 7,
            hint: "Try: move() 3 times, turnRight(), move() 3 times"
        },
        {
            name: "Multiple Bananas",
            gridSize: 5,
            start: { x: 0, y: 2, direction: 'right' },
            bananas: [{ x: 2, y: 2 }, { x: 4, y: 2 }],
            walls: [],
            water: [],
            optimalMoves: 8,
            hint: "Move to the first banana, grab() it, then continue to the second!"
        },
        {
            name: "Square Path",
            gridSize: 5,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [{ x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }],
            walls: [],
            water: [],
            optimalMoves: 18,
            hint: "Walk around the edge of the grid and grab() each banana!"
        }
    ],
    medium: [
        {
            name: "Avoid the Wall",
            gridSize: 6,
            start: { x: 0, y: 2, direction: 'right' },
            bananas: [{ x: 5, y: 2 }],
            walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }],
            water: [],
            optimalMoves: 10,
            hint: "Go around the walls - up or down!"
        },
        {
            name: "Maze Lite",
            gridSize: 6,
            start: { x: 0, y: 0, direction: 'down' },
            bananas: [{ x: 5, y: 5 }],
            walls: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }],
            water: [],
            optimalMoves: 14,
            hint: "Navigate around the walls to reach the bottom right"
        },
        {
            name: "Water Crossing",
            gridSize: 6,
            start: { x: 0, y: 2, direction: 'right' },
            bananas: [{ x: 5, y: 2 }],
            walls: [],
            water: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
            optimalMoves: 10,
            hint: "Monkeys can't swim! Find another way around."
        },
        {
            name: "Collector",
            gridSize: 6,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [{ x: 2, y: 0 }, { x: 4, y: 2 }, { x: 2, y: 4 }],
            walls: [{ x: 3, y: 1 }, { x: 1, y: 3 }],
            water: [],
            optimalMoves: 19,
            hint: "Plan your route and use grab() at each banana location!"
        },
        {
            name: "Repeat Challenge",
            gridSize: 6,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [{ x: 5, y: 5 }],
            walls: [],
            water: [],
            optimalMoves: 12,
            hint: "Use repeat(5) { move(); } to save typing!"
        }
    ],
    hard: [
        {
            name: "The Labyrinth",
            gridSize: 7,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [{ x: 6, y: 6 }],
            walls: [
                { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
                { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
                { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
                { x: 2, y: 4 }, { x: 4, y: 2 }
            ],
            water: [{ x: 2, y: 6 }, { x: 4, y: 6 }],
            optimalMoves: 18,
            hint: "Navigate carefully through the maze!"
        },
        {
            name: "Island Hopping",
            gridSize: 7,
            start: { x: 0, y: 3, direction: 'right' },
            bananas: [{ x: 6, y: 3 }],
            walls: [],
            water: [
                { x: 2, y: 0 },{ x: 2, y: 1 },{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
                { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 },{ x: 4, y: 5 }, { x: 4, y: 6 }
            ],
            optimalMoves: 14,
            hint: "Find the safe path between the water!"
        },
        {
            name: "Banana Hunt",
            gridSize: 7,
            start: { x: 3, y: 3, direction: 'up' },
            bananas: [
                { x: 0, y: 0 }, { x: 6, y: 0 },
                { x: 0, y: 6 }, { x: 6, y: 6 }
            ],
            walls: [
                { x: 2, y: 2 }, { x: 2, y: 4 },
                { x: 4, y: 2 }, { x: 4, y: 4 }
            ],
            water: [],
            optimalMoves: 32,
            hint: "Visit all four corners and grab() each banana!"
        },
        {
            name: "The Fortress",
            gridSize: 7,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [{ x: 3, y: 3 }],
            walls: [
                 { x: 2, y: 0 },{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },{ x: 2, y: 5 }, 
                { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 },{ x: 4, y: 5 },
                { x: 3, y: 5 }
            ],
            water: [],
            optimalMoves: 12,
            hint: "Find the entrance to the fortress!"
        },
        {
            name: "Ultimate Challenge",
            gridSize: 8,
            start: { x: 0, y: 0, direction: 'right' },
            bananas: [
                { x: 7, y: 0 }, { x: 7, y: 7 }, { x: 0, y: 7 }, { x: 4, y: 4 }
            ],
            walls: [
                { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },
                { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },
                { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 2, y: 7 },
                { x: 5, y: 5 }, { x: 5, y: 6 }
            ],
            water: [
                { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 5 }
            ],
            optimalMoves: 39,
            hint: "Plan your route carefully and grab() all bananas!"
        }
    ]
};

// DOM Elements
let gameGrid, codeEditor, consoleOutput;
let startScreen, levelCompleteScreen, gameCompleteScreen, failScreen;

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

/**
 * Initialize the game
 */
function initGame() {
    // Check session
    if (!requireAuth()) return;

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

// Get and cache DOM elements
function getDOMElements() {
    gameGrid = document.getElementById('gameGrid');
    codeEditor = document.getElementById('codeEditor');
    consoleOutput = document.getElementById('consoleOutput');
    
    startScreen = document.getElementById('startScreen');
    levelCompleteScreen = document.getElementById('levelCompleteScreen');
    gameCompleteScreen = document.getElementById('gameCompleteScreen');
    failScreen = document.getElementById('failScreen');
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
    const userId = gameState.currentUser.id;
    const stats = getGameStats(userId, 'game1');
    
    if (stats) {
        document.getElementById('highScore').textContent = stats.highScore || 0;
        document.getElementById('gamesPlayed').textContent = stats.played || 0;
        document.getElementById('totalScore').textContent = stats.totalScore || 0;
        document.getElementById('levelsBeat').textContent = stats.levelsBeat || stats.bestStreak || 0;
    } else {
        document.getElementById('highScore').textContent = 0;
        document.getElementById('gamesPlayed').textContent = 0;
        document.getElementById('totalScore').textContent = 0;
        document.getElementById('levelsBeat').textContent = 0;
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Start button
    document.getElementById('startBtn').addEventListener('click', startGame);
    
    // Difficulty buttons
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('.difficulty-btn');
            difficultyBtns.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            gameState.difficulty = target.dataset.difficulty;
        });
    });
    
    // Run code button
    document.getElementById('runCodeBtn').addEventListener('click', runCode);
    
    // Stop code button
    document.getElementById('stopCodeBtn').addEventListener('click', stopExecution);
    
    // Reset code button
    document.getElementById('resetCodeBtn').addEventListener('click', resetCode);
    
    // Hint button
    document.getElementById('hintBtn').addEventListener('click', showHint);
    
    // Next level button
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    
    // Replay level button
    document.getElementById('replayLevelBtn').addEventListener('click', replayLevel);
    
    // Play again button
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        gameState.currentLevel = 0;
        gameState.score = 0;
        hideAllOverlays();
        showStartScreen();
    });
    
    // Change difficulty button
    document.getElementById('changeDifficultyBtn').addEventListener('click', () => {
        gameState.currentLevel = 0;
        gameState.score = 0;
        hideAllOverlays();
        showStartScreen();
    });
    
    // Try again button
    document.getElementById('tryAgainBtn').addEventListener('click', () => {
        hideAllOverlays();
        resetLevel();
    });
    
    // Show hint button (in fail screen)
    document.getElementById('showHintBtn').addEventListener('click', () => {
        hideAllOverlays();
        showHint();
    });
    
    // Back buttons
    document.getElementById('backBtn').addEventListener('click', () => {
        // Save stats if user played any levels
        if (gameState.score > 0) {
            saveGameStats();
        }
        window.location.href = 'games.html';
    });
    
    document.getElementById('backToMenuBtn').addEventListener('click', () => {
        // Save stats if user played any levels
        if (gameState.score > 0) {
            saveGameStats();
        }
        window.location.href = 'games.html';
    });
}

// Start the game
function startGame() {
    hideStartScreen();
    gameState.isRunning = true;
    gameState.currentLevel = 0;
    gameState.score = 0;
    gameState.totalMoves = 0;
    gameState.sessionStarted = false; // Reset session tracking
    gameState.levelsCompletedThisSession = 0; // Reset levels completed
    
    loadLevel(gameState.currentLevel);
    updateUI();
}

// Load a specific level
function loadLevel(levelIndex) {
    const levelSet = levels[gameState.difficulty];
    
    if (levelIndex >= levelSet.length) {
        // All levels complete
        gameComplete();
        return;
    }
    
    const level = levelSet[levelIndex];
    gameState.gridSize = level.gridSize;
    
    // Reset monkey position
    gameState.monkey = {
        x: level.start.x,
        y: level.start.y,
        direction: level.start.direction
    };
    
    // Copy bananas array
    gameState.bananas = level.bananas.map(b => ({ ...b }));
    gameState.collectedBananas = 0;
    
    // Build grid
    buildGrid(level);
    
    // Clear code editor and console
    codeEditor.value = '';
    clearConsole();
    
    // Update level display
    document.getElementById('currentLevel').textContent = levelIndex + 1;
    
    logToConsole(`Level ${levelIndex + 1}: ${level.name}`, 'info');
    logToConsole(`Collect ${gameState.bananas.length} banana(s)!`, 'info');
}

// Build the game grid
function buildGrid(level) {
    gameGrid.innerHTML = '';
    gameGrid.style.gridTemplateColumns = `repeat(${level.gridSize}, 1fr)`;
    gameGrid.style.gridTemplateRows = `repeat(${level.gridSize}, 1fr)`;
    
    gameState.grid = [];
    
    for (let y = 0; y < level.gridSize; y++) {
        const row = [];
        for (let x = 0; x < level.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell path';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Check if wall
            if (level.walls.some(w => w.x === x && w.y === y)) {
                cell.className = 'grid-cell wall';
                cell.textContent = '🧱';
            }
            // Check if water
            else if (level.water.some(w => w.x === x && w.y === y)) {
                cell.className = 'grid-cell water';
                cell.textContent = '🌊';
            }
            // Check if start position
            else if (level.start.x === x && level.start.y === y) {
                cell.classList.add('start');
            }
            
            // Add banana if present
            if (level.bananas.some(b => b.x === x && b.y === y)) {
                const banana = document.createElement('span');
                banana.className = 'banana';
                banana.textContent = '🍌';
                cell.appendChild(banana);
            }
            
            gameGrid.appendChild(cell);
            row.push(cell);
        }
        gameState.grid.push(row);
    }
    
    // Place monkey
    placeMonkey();
}

// Place the monkey on the grid
function placeMonkey() {
    // Remove existing monkey
    const existingMonkey = document.querySelector('.monkey');
    if (existingMonkey) {
        existingMonkey.remove();
    }
    
    const { x, y, direction } = gameState.monkey;
    const cell = gameState.grid[y][x];
    
    const monkey = document.createElement('span');
    monkey.className = `monkey facing-${direction}`;
    monkey.textContent = '🐵';
    cell.appendChild(monkey);
}

// Run the user's code
function runCode() {
    if (gameState.isExecuting) return;
    
    const code = codeEditor.value.trim();
    
    if (!code) {
        logToConsole('Please write some code first!', 'error');
        return;
    }
    
    // Reset level state
    resetLevel();
    
    gameState.isExecuting = true;
    gameState.totalMoves = 0;
    document.getElementById('runCodeBtn').disabled = true;
    document.getElementById('stopCodeBtn').disabled = false;
    
    clearConsole();
    logToConsole('Running code...', 'info');
    
    // Parse and execute the code
    try {
        const commands = parseCode(code);
        executeCommands(commands);
    } catch (error) {
        logToConsole(`Error: ${error.message}`, 'error');
        gameState.isExecuting = false;
        document.getElementById('runCodeBtn').disabled = false;
        document.getElementById('stopCodeBtn').disabled = true;
    }
}

// Parse user code into commands
function parseCode(code) {
    const commands = [];
    
    // Remove comments
    code = code.replace(/\/\/.*$/gm, '');
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Handle repeat loops
    const repeatRegex = /repeat\s*\(\s*(\d+)\s*\)\s*\{([^}]*)\}/g;
    let expandedCode = code;
    
    let match;
    while ((match = repeatRegex.exec(code)) !== null) {
        const times = parseInt(match[1]);
        const innerCode = match[2];
        const expanded = (innerCode + '\n').repeat(times);
        expandedCode = expandedCode.replace(match[0], expanded);
    }
    
    // Parse individual commands
    const lines = expandedCode.split(/[;\n]+/);
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.match(/^move\s*\(\s*\)$/)) {
            commands.push({ type: 'move' });
        } else if (trimmed.match(/^turnLeft\s*\(\s*\)$/)) {
            commands.push({ type: 'turnLeft' });
        } else if (trimmed.match(/^turnRight\s*\(\s*\)$/)) {
            commands.push({ type: 'turnRight' });
        } else if (trimmed.match(/^grab\s*\(\s*\)$/)) {
            commands.push({ type: 'grab' });
        } else if (trimmed && !trimmed.match(/^[\{\}]$/)) {
            throw new Error(`Unknown command: "${trimmed}"`);
        }
    }
    
    return commands;
}

// Execute parsed commands sequentially
function executeCommands(commands) {
    if (commands.length === 0) {
        checkWinCondition();
        return;
    }
    
    gameState.executionQueue = [...commands];
    executeNextCommand();
}

// Execute the next command in the queue
function executeNextCommand() {
    if (!gameState.isExecuting || gameState.executionQueue.length === 0) {
        gameState.isExecuting = false;
        document.getElementById('runCodeBtn').disabled = false;
        document.getElementById('stopCodeBtn').disabled = true;
        checkWinCondition();
        return;
    }
    
    const command = gameState.executionQueue.shift();
    let success = true;
    let message = '';
    
    switch (command.type) {
        case 'move':
            const moveResult = moveMonkey();
            success = moveResult.success;
            message = moveResult.message;
            break;
        case 'turnLeft':
            turnMonkey('left');
            message = 'Turned left';
            break;
        case 'turnRight':
            turnMonkey('right');
            message = 'Turned right';
            break;
        case 'grab':
            const grabResult = grabBanana();
            success = grabResult.success;
            message = grabResult.message;
            break;
    }
    
    gameState.totalMoves++;
    updateUI();
    
    if (message) {
        logToConsole(message, success ? 'success' : 'error');
    }
    
    if (!success) {
        gameState.isExecuting = false;
        document.getElementById('runCodeBtn').disabled = false;
        document.getElementById('stopCodeBtn').disabled = true;
        showFailScreen(message);
        return;
    }
    
    // Check if we collected a banana by stepping on it
    checkBananaCollection();
    
    // Continue to next command after delay
    gameState.executionTimeout = setTimeout(executeNextCommand, 400);
}

// Move the monkey forward
function moveMonkey() {
    const { x, y, direction } = gameState.monkey;
    let newX = x, newY = y;
    
    switch (direction) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
    }
    
    // Check bounds
    if (newX < 0 || newX >= gameState.gridSize || newY < 0 || newY >= gameState.gridSize) {
        return { success: false, message: 'Cannot move - hit the boundary!' };
    }
    
    const level = levels[gameState.difficulty][gameState.currentLevel];
    
    // Check for walls
    if (level.walls.some(w => w.x === newX && w.y === newY)) {
        return { success: false, message: 'Cannot move - there\'s a wall!' };
    }
    
    // Check for water
    if (level.water.some(w => w.x === newX && w.y === newY)) {
        return { success: false, message: 'Cannot move - monkeys can\'t swim!' };
    }
    
    // Move successful
    gameState.monkey.x = newX;
    gameState.monkey.y = newY;
    placeMonkey();
    
    return { success: true, message: `Moved ${direction}` };
}

// Turn the monkey left or right
function turnMonkey(turnDirection) {
    const directions = ['up', 'right', 'down', 'left'];
    let currentIndex = directions.indexOf(gameState.monkey.direction);
    
    if (turnDirection === 'right') {
        currentIndex = (currentIndex + 1) % 4;
    } else {
        currentIndex = (currentIndex - 1 + 4) % 4;
    }
    
    gameState.monkey.direction = directions[currentIndex];
    placeMonkey();
}

// Grab a banana at the monkey's current position
function grabBanana() {
    const { x, y } = gameState.monkey;
    const bananaIndex = gameState.bananas.findIndex(b => b.x === x && b.y === y);
    
    if (bananaIndex === -1) {
        return { success: true, message: 'No banana here to grab!' };
    }
    
    // Remove banana from state and grid
    gameState.bananas.splice(bananaIndex, 1);
    gameState.collectedBananas++;
    
    const cell = gameState.grid[y][x];
    const bananaEl = cell.querySelector('.banana');
    if (bananaEl) {
        bananaEl.remove();
    }
    
    return { success: true, message: '🍌 Got a banana!' };
}



// Check if monkey stepped on a banana (auto-collect)
function checkBananaCollection() {
    const { x, y } = gameState.monkey;
    const bananaIndex = gameState.bananas.findIndex(b => b.x === x && b.y === y);
    
    // Banana exists but we don't auto-collect - player must use grab()
    // This function is just a placeholder for potential future auto-collect feature
}

// Check win condition
function checkWinCondition() {
    const level = levels[gameState.difficulty][gameState.currentLevel];
    const totalBananas = level.bananas.length;
    
    if (gameState.collectedBananas >= totalBananas) {
        // Level complete!
        levelComplete();
    } else {
        logToConsole(`Collected ${gameState.collectedBananas}/${totalBananas} bananas. Try again!`, 'info');
    }
}

// Level complete
function levelComplete() {
    const level = levels[gameState.difficulty][gameState.currentLevel];
    
    // Calculate score
    const baseScore = 100;
    const efficiencyBonus = Math.max(0, (level.optimalMoves * 2 - gameState.totalMoves) * 10);
    const levelScore = baseScore + efficiencyBonus;
    
    gameState.score += levelScore;
    gameState.levelsCompletedThisSession++; // Track levels completed
    
    // Calculate stars
    let stars = 1;
    if (gameState.totalMoves <= level.optimalMoves * 1.5) stars = 2;
    if (gameState.totalMoves <= level.optimalMoves) stars = 3;
    
    // Update UI
    document.getElementById('levelScore').textContent = levelScore;
    document.getElementById('levelMoves').textContent = gameState.totalMoves;
    document.getElementById('efficiencyBonus').textContent = efficiencyBonus;
    
    // Show stars
    const starRating = document.getElementById('starRating');
    starRating.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = 'star' + (i < stars ? ' filled' : '');
        star.textContent = '⭐';
        star.style.animationDelay = `${i * 0.2}s`;
        starRating.appendChild(star);
    }
    
    // Save stats after EACH level completion
    saveGameStats();
    
    showLevelCompleteScreen();
    updateUI();
}

// Game complete
function gameComplete() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('levelsCompleted').textContent = levels[gameState.difficulty].length;
    
    // Save stats
    saveGameStats();
    
    showGameCompleteScreen();
}

// Proceed to next level
function nextLevel() {
    hideAllOverlays();
    gameState.currentLevel++;
    loadLevel(gameState.currentLevel);
    updateUI();
}

// Replay current level
function replayLevel() {
    hideAllOverlays();
    resetLevel();
}

// Reset current level
function resetLevel() {
    const level = levels[gameState.difficulty][gameState.currentLevel];
    
    // Reset monkey position
    gameState.monkey = {
        x: level.start.x,
        y: level.start.y,
        direction: level.start.direction
    };
    
    // Reset bananas
    gameState.bananas = level.bananas.map(b => ({ ...b }));
    gameState.collectedBananas = 0;
    
    // Rebuild grid
    buildGrid(level);
}

// Reset code editor
function resetCode() {
    codeEditor.value = '';
    clearConsole();
    logToConsole('Code cleared. Ready to write!', 'info');
}

// Show hint
function showHint() {
    const level = levels[gameState.difficulty][gameState.currentLevel];
    logToConsole(`💡 Hint: ${level.hint}`, 'info');
}

// Stop code execution
function stopExecution() {
    gameState.isExecuting = false;
    gameState.executionQueue = [];
    
    if (gameState.executionTimeout) {
        clearTimeout(gameState.executionTimeout);
    }
    
    document.getElementById('runCodeBtn').disabled = false;
    document.getElementById('stopCodeBtn').disabled = true;
    
    logToConsole('Execution stopped.', 'info');
}

// Check if monkey is on a banana to collect it
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('movesUsed').textContent = gameState.totalMoves;
}

// Log messages to console output
function logToConsole(message, type = 'info') {
    const line = document.createElement('div');
    line.className = type;
    line.textContent = `> ${message}`;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
    consoleOutput.innerHTML = '';
}

// Overlay management
function showStartScreen() {
    startScreen.classList.remove('hidden');
}

function hideStartScreen() {
    startScreen.classList.add('hidden');
}

function showLevelCompleteScreen() {
    levelCompleteScreen.classList.remove('hidden');
}

function showGameCompleteScreen() {
    gameCompleteScreen.classList.remove('hidden');
}

function showFailScreen(message) {
    document.getElementById('failMessage').textContent = message;
    failScreen.classList.remove('hidden');
}

function hideAllOverlays() {
    startScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    gameCompleteScreen.classList.add('hidden');
    failScreen.classList.add('hidden');
}

// Save game statistics
function saveGameStats() {
    const userId = gameState.currentUser.id;
    
    // Get existing stats using storage function
    const existingStats = getGameStats(userId, 'game1') || {
        played: 0,
        won: 0,
        highScore: 0,
        totalScore: 0,
        bestStreak: 0,
        levelsBeat: 0,
        lastPlayed: null,
        achievements: []
    };
    
    // Only increment played count once per session
    if (!gameState.sessionStarted) {
        existingStats.played++;
        gameState.sessionStarted = true;
    }
    
    existingStats.totalScore = Math.max(existingStats.totalScore, gameState.score);
    existingStats.lastPlayed = new Date().toISOString();
    
    // This counts as a win if they completed all levels
    const totalLevels = levels[gameState.difficulty].length;
    if (gameState.currentLevel >= totalLevels - 1) {
        existingStats.won++;
    }
    
    if (gameState.score > existingStats.highScore) {
        existingStats.highScore = gameState.score;
    }
    
    // Update levels beat - increment by 1 for each level completion
    if (!existingStats.totalLevelsCompleted) {
        existingStats.totalLevelsCompleted = 0;
    }
    existingStats.totalLevelsCompleted += 1;
    existingStats.levelsBeat = existingStats.totalLevelsCompleted;
    existingStats.bestStreak = existingStats.totalLevelsCompleted;
    
    // Save using storage function
    updateGameStats(userId, 'game1', existingStats);
    
    // Update leaderboard using storage function
    addOrUpdateLeaderboardEntry('game1', {
        userId: userId,
        username: gameState.currentUser.username,
        score: gameState.score,
        difficulty: gameState.difficulty,
        date: new Date().toISOString()
    });
    
    // Update displayed stats
    loadUserStats();
}
