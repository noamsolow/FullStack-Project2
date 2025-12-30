/**
 * gamesMenu.js
 * Handles the games menu page functionality
 * - Display user stats
 * - Show game cards with personal stats
 * - Handle game navigation
 */

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    initGamesPage();
});

/**
 * Initialize the games page
 */
function initGamesPage() {
    // Check session validity
    if (!checkSession()) {
        window.location.href = 'login.html';
        return;
    }

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

/**
 * Display username in navbar
 */
function displayUsername(user) {
    const usernameEl = document.getElementById('username');
    if (usernameEl && user) {
        usernameEl.textContent = user.username;
    }
}

/**
 * Load and display user overall stats
 */
function loadUserStats(userId) {
    const stats = getUserStats(userId);
    
    // Update stat cards
    document.getElementById('totalGamesPlayed').textContent = stats.totalGamesPlayed || 0;
    document.getElementById('totalWins').textContent = stats.totalWins || 0;
    document.getElementById('highestScore').textContent = stats.highestScore || 0;
    document.getElementById('achievementCount').textContent = stats.achievementCount || 0;
}

/**
 * Get user overall stats from all games
 */
function getUserStats(userId) {
    const gameStats = getGameStats(userId);
    
    if (!gameStats) {
        return {
            totalGamesPlayed: 0,
            totalWins: 0,
            highestScore: 0,
            achievementCount: 0
        };
    }
    
    let totalGamesPlayed = 0;
    let totalWins = 0;
    let highestScore = 0;
    
    // Aggregate stats from all games
    for (const gameId in gameStats) {
        const game = gameStats[gameId];
        totalGamesPlayed += game.played || 0;
        totalWins += game.won || 0;
        highestScore = Math.max(highestScore, game.highScore || 0);
    }
    
    // Count unlocked achievements based on actual criteria
    const achievementCount = countAchievements(gameStats, totalGamesPlayed, totalWins, highestScore);
    
    return {
        totalGamesPlayed,
        totalWins,
        highestScore,
        achievementCount
    };
}

/**
 * Count unlocked achievements based on game stats
 */
function countAchievements(gameStats, totalGamesPlayed, totalWins, highestScore) {
    let count = 0;
    
    // First Victory - Win your first game
    if (totalWins >= 1) count++;
    
    // Code Master - Complete all levels in Code Runner
    if (gameStats.game1 && (gameStats.game1.levelsBeat >= 5 || gameStats.game1.bestStreak >= 5)) count++;
    
    // Champion - Score over 1000 points
    if (highestScore >= 1000) count++;
    
    // Dedicated Player - Play 10 games
    if (totalGamesPlayed >= 10) count++;
    
    // Perfectionist - Complete a game without losing a life (tracked separately)
    // Check if any game has a perfect game flag
    for (const gameId in gameStats) {
        if (gameStats[gameId].perfectGame) {
            count++;
            break;
        }
    }
    
    // On Fire - Win 5 games in a row (tracked separately)
    for (const gameId in gameStats) {
        if (gameStats[gameId].winStreak >= 5) {
            count++;
            break;
        }
    }
    
    return count;
}

/**
 * Load game-specific stats for game cards
 */
function loadGameStats(userId) {
    const gameStats = getGameStats(userId);
    
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
 * Load and display leaderboard for a specific game
 */
function loadLeaderboard(gameId) {
    const leaderboard = getLeaderboard(gameId);
    const tbody = document.getElementById('leaderboardBody');
    
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (!leaderboard || leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No scores yet. Be the first to play!</td></tr>';
        return;
    }
    
    // Sort by score descending and take top 5
    const topScores = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    
    // Create rows
    topScores.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        // Add highlight for current user
        const currentUser = getCurrentUser();
        if (currentUser && entry.userId === currentUser.id) {
            row.classList.add('current-user');
        }
        
        // Rank with medal for top 3
        let rankDisplay = index + 1;
        if (index === 0) rankDisplay = '🥇';
        else if (index === 1) rankDisplay = '🥈';
        else if (index === 2) rankDisplay = '🥉';
        
        // Format date
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString();
        
        row.innerHTML = `
            <td>${rankDisplay}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
            <td>${dateStr}</td>
        `;
        
        tbody.appendChild(row);
    });
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

/**
 * Helper function to get game stats from localStorage
 * This will be implemented in storage.js
 */
function getGameStats(userId) {
    const stats = localStorage.getItem('gameStats');
    if (!stats) return null;
    
    const allStats = JSON.parse(stats);
    return allStats[userId] || null;
}

/**
 * Helper function to get leaderboard from localStorage
 * This will be implemented in storage.js
 */
function getLeaderboard(gameId) {
    const leaderboard = localStorage.getItem('leaderboard');
    if (!leaderboard) return [];
    
    const allLeaderboards = JSON.parse(leaderboard);
    return allLeaderboards[gameId] || [];
}