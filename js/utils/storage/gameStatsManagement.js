/**
 * gameStatsManagement.js
 * LocalStorage management functions for game statistics
 */

// ============================================
// GAME STATS MANAGEMENT
// ============================================

// Get all game stats
function getAllGameStats() {
    try {
        const stats = localStorage.getItem('gameStats');
        return stats ? JSON.parse(stats) : {};
    } catch (error) {
        console.error('Error getting all game stats:', error);
        return {};
    }
}

// Get stats for a specific user and game
function getGameStats(userId, gameId) {
    try {
        const allStats = getAllGameStats();
        
        if (allStats[userId] && allStats[userId][gameId]) {
            return allStats[userId][gameId];
        }
        
        return null;
    } catch (error) {
        console.error('Error getting game stats:', error);
        return null;
    }
}

// Get all game stats for a specific user
function getUserAllGameStats(userId) {
    try {
        const allStats = getAllGameStats();
        return allStats[userId] || {};
    } catch (error) {
        console.error('Error getting user game stats:', error);
        return {};
    }
}

// Update stats for a specific user and game
function updateGameStats(userId, gameId, newStats) {
    try {
        const allStats = getAllGameStats();
        
        // Initialize user stats if doesn't exist
        if (!allStats[userId]) {
            allStats[userId] = {};
        }
        
        // Update specific game stats
        allStats[userId][gameId] = newStats;
        
        localStorage.setItem('gameStats', JSON.stringify(allStats));
        console.log('✅ Game stats updated:', userId, gameId);
        return true;
    } catch (error) {
        console.error('Error updating game stats:', error);
        return false;
    }
}
// Initialize default stats for a user and game
function initializeGameStats(userId, gameId) {
    const defaultStats = {
        played: 0,
        won: 0,
        highScore: 0,
        totalScore: 0,
        bestStreak: 0,
        lastPlayed: null,
        achievements: []
    };
    
    updateGameStats(userId, gameId, defaultStats);
    return defaultStats;
}

// Get aggregated stats across all games for a user
function getAggregatedUserStats(userId) {
    const gameStats = getUserAllGameStats(userId);
    
    let totalGamesPlayed = 0;
    let totalWins = 0;
    let highestScore = 0;
    let totalScore = 0;
    
    for (const gameId in gameStats) {
        const game = gameStats[gameId];
        totalGamesPlayed += game.played || 0;
        totalWins += game.won || 0;
        highestScore = Math.max(highestScore, game.highScore || 0);
        totalScore += game.totalScore || 0;
    }
    
    return { totalGamesPlayed, totalWins, highestScore, totalScore };
}

// Count unlocked achievements based on game stats
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
    
    // Perfectionist - Complete a game without losing a life
    for (const gameId in gameStats) {
        if (gameStats[gameId].perfectGame) {
            count++;
            break;
        }
    }
    
    // On Fire - Win 5 games in a row
    for (const gameId in gameStats) {
        if (gameStats[gameId].winStreak >= 5) {
            count++;
            break;
        }
    }
    
    return count;
}
