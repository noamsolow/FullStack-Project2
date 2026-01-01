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

