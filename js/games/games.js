/**
 * games.js
 * Handles the games menu page functionality
 * - Display user stats
 * - Show game cards with personal stats
 * - Handle game navigation
 */

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    initGamesPage();
});

// Initialize games page
function initGamesPage() {
    // Check session validity
    if (!requireAuth()) return;

    const currentUser = getCurrentUser();
    
    // Create navbar
    createNavbar('games');
    
    // Load and display user stats
    loadUserStats(currentUser.id);
    
    // Load game-specific stats
    loadGameStats(currentUser.id);
    
    // Set up event listeners
    setupEventListeners();
}



// Load and display overall user stats
function loadUserStats(userId) {
    const stats = getUserStats(userId);
    
    // Update stat cards
    document.getElementById('totalGamesPlayed').textContent = stats.totalGamesPlayed || 0;
    document.getElementById('totalWins').textContent = stats.totalWins || 0;
    document.getElementById('highestScore').textContent = stats.highestScore || 0;
    document.getElementById('achievementCount').textContent = stats.achievementCount || 0;
}

// Get aggregated user stats across all games
function getUserStats(userId) {
    const stats = getAggregatedUserStats(userId);
    const gameStats = getUserAllGameStats(userId);
    
    // Count unlocked achievements based on actual criteria
    const achievementCount = countAchievements(gameStats, stats.totalGamesPlayed, stats.totalWins, stats.highestScore);
    
    return {
        totalGamesPlayed: stats.totalGamesPlayed,
        totalWins: stats.totalWins,
        highestScore: stats.highestScore,
        achievementCount
    };
}

/**
 * Load game-specific stats for game cards
 */
function loadGameStats(userId) {
    const gameStats = getUserAllGameStats(userId);
    
    if (!gameStats) return;
    
    // Update Game 1 stats
    if (gameStats.game1) {
        document.getElementById('game1Played').textContent = gameStats.game1.played || 0;
        document.getElementById('game1Best').textContent = gameStats.game1.highScore || 0;
    }
    
    // Update Game 2 stats
    if (gameStats.game2) {
        document.getElementById('game2Played').textContent = gameStats.game2.played || 0;
        document.getElementById('game2Best').textContent = gameStats.game2.highScore || 0;
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Play buttons
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(btn => {
        btn.addEventListener('click', handlePlayGame);
    });
}

/**
 * Handle play game button click
 */
function handlePlayGame(e) {
    const gameId = e.target.dataset.game;
    
    if (!gameId) return;
    
    // Navigate to game page
    window.location.href = `${gameId}.html`;
}