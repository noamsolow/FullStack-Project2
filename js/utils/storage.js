/**
 * storage.js
 * LocalStorage management functions for users, game stats, and leaderboards
 */

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get all users from localStorage
 * @returns {Array} Array of user objects
 */
function getAllUsers() {
    try {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

/**
 * Add a new user
 * @param {Object} userData - User data to add
 * @returns {boolean} Success status
 */
function addUser(userData) {
    try {
        const users = getAllUsers();
        
        // Check if user already exists
        const exists = users.some(u => 
            u.username === userData.username || 
            u.email === userData.email
        );
        
        if (exists) {
            console.warn('⚠️ User already exists');
            return false;
        }
        
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ User added:', userData.username);
        return true;
    } catch (error) {
        console.error('Error adding user:', error);
        return false;
    }
}

/**
 * Get user by username or email
 * @param {string} identifier - Username or email
 * @returns {Object|null} User object or null
 */
function getUser(identifier) {
    try {
        const users = getAllUsers();
        return users.find(u => 
            u.username === identifier || 
            u.email === identifier
        ) || null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Update user data
 * @param {string} userId - User ID
 * @param {Object} updates - Object with updates
 * @returns {boolean} Success status
 */
function updateUser(userId, updates) {
    try {
        const users = getAllUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            console.warn('⚠️ User not found');
            return false;
        }
        
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ User updated:', userId);
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
function deleteUser(userId) {
    try {
        const users = getAllUsers();
        const filtered = users.filter(u => u.id !== userId);
        
        if (filtered.length === users.length) {
            console.warn('⚠️ User not found');
            return false;
        }
        
        localStorage.setItem('users', JSON.stringify(filtered));
        console.log('✅ User deleted:', userId);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

// ============================================
// GAME STATS MANAGEMENT
// ============================================

/**
 * Get all game stats
 * @returns {Object} All game stats
 */
function getAllGameStats() {
    try {
        const stats = localStorage.getItem('gameStats');
        return stats ? JSON.parse(stats) : {};
    } catch (error) {
        console.error('Error getting all game stats:', error);
        return {};
    }
}

/**
 * Get game stats for a specific user and game
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID (e.g., 'game1', 'game2')
 * @returns {Object|null} Game stats or null
 */
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

/**
 * Get all stats for a specific user (all games)
 * @param {string} userId - User ID
 * @returns {Object} User's stats for all games
 */
function getUserAllGameStats(userId) {
    try {
        const allStats = getAllGameStats();
        return allStats[userId] || {};
    } catch (error) {
        console.error('Error getting user game stats:', error);
        return {};
    }
}

/**
 * Update game stats for a specific user and game
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @param {Object} newStats - New stats object
 * @returns {boolean} Success status
 */
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

/**
 * Initialize default game stats for a user
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @returns {Object} Default stats object
 */
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

// ============================================
// LEADERBOARD MANAGEMENT
// ============================================

/**
 * Update username in all leaderboard entries for a user
 * @param {string} userId - User ID
 * @param {string} newUsername - New username
 */
function updateLeaderboardUsername(userId, newUsername) {
    try {
        const allLeaderboards = getAllLeaderboards();
        let updated = false;
        
        for (const gameId in allLeaderboards) {
            allLeaderboards[gameId].forEach(entry => {
                if (entry.userId === userId) {
                    entry.username = newUsername;
                    updated = true;
                }
            });
        }
        
        if (updated) {
            localStorage.setItem('leaderboard', JSON.stringify(allLeaderboards));
            console.log('✅ Leaderboard usernames updated for user:', userId);
        }
    } catch (error) {
        console.error('Error updating leaderboard username:', error);
    }
}

/**
 * Get all leaderboards
 * @returns {Object} All leaderboards
 */
function getAllLeaderboards() {
    try {
        const leaderboards = localStorage.getItem('leaderboard');
        return leaderboards ? JSON.parse(leaderboards) : {};
    } catch (error) {
        console.error('Error getting all leaderboards:', error);
        return {};
    }
}

/**
 * Get leaderboard for a specific game
 * @param {string} gameId - Game ID
 * @returns {Array} Array of leaderboard entries
 */
function getLeaderboard(gameId) {
    try {
        const allLeaderboards = getAllLeaderboards();
        return allLeaderboards[gameId] || [];
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

/**
 * Update leaderboard with new entry
 * @param {string} gameId - Game ID
 * @param {Object} entry - Leaderboard entry {userId, username, score, date}
 * @returns {boolean} Success status
 */
function updateLeaderboard(gameId, entry) {
    try {
        const allLeaderboards = getAllLeaderboards();
        
        // Initialize game leaderboard if doesn't exist
        if (!allLeaderboards[gameId]) {
            allLeaderboards[gameId] = [];
        }
        
        // Add new entry
        allLeaderboards[gameId].push(entry);
        
        // Sort by score (descending) and keep only top 10
        allLeaderboards[gameId].sort((a, b) => b.score - a.score);
        allLeaderboards[gameId] = allLeaderboards[gameId].slice(0, 10);
        
        localStorage.setItem('leaderboard', JSON.stringify(allLeaderboards));
        console.log('✅ Leaderboard updated:', gameId, entry.score);
        return true;
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        return false;
    }
}

/**
 * Get user's rank in leaderboard
 * @param {string} gameId - Game ID
 * @param {string} userId - User ID
 * @returns {number} Rank (1-based) or -1 if not found
 */
function getUserRank(gameId, userId) {
    try {
        const leaderboard = getLeaderboard(gameId);
        const index = leaderboard.findIndex(entry => entry.userId === userId);
        return index === -1 ? -1 : index + 1;
    } catch (error) {
        console.error('Error getting user rank:', error);
        return -1;
    }
}

/**
 * Clear leaderboard for a specific game
 * @param {string} gameId - Game ID
 * @returns {boolean} Success status
 */
function clearLeaderboard(gameId) {
    try {
        const allLeaderboards = getAllLeaderboards();
        delete allLeaderboards[gameId];
        localStorage.setItem('leaderboard', JSON.stringify(allLeaderboards));
        console.log('✅ Leaderboard cleared:', gameId);
        return true;
    } catch (error) {
        console.error('Error clearing leaderboard:', error);
        return false;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all data from localStorage
 * WARNING: This will delete everything!
 */
function clearAllData() {
    if (confirm('⚠️ Are you sure you want to delete ALL data? This cannot be undone!')) {
        localStorage.clear();
        console.log('✅ All data cleared');
        return true;
    }
    return false;
}

/**
 * Export all data as JSON
 * @returns {Object} All localStorage data
 */
function exportData() {
    return {
        users: getAllUsers(),
        gameStats: getAllGameStats(),
        leaderboards: getAllLeaderboards(),
        currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null')
    };
}

/**
 * Import data from JSON object
 * @param {Object} data - Data object to import
 * @returns {boolean} Success status
 */
function importData(data) {
    try {
        if (data.users) {
            localStorage.setItem('users', JSON.stringify(data.users));
        }
        if (data.gameStats) {
            localStorage.setItem('gameStats', JSON.stringify(data.gameStats));
        }
        if (data.leaderboards) {
            localStorage.setItem('leaderboard', JSON.stringify(data.leaderboards));
        }
        if (data.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(data.currentUser));
        }
        console.log('✅ Data imported successfully');
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

/**
 * Get storage usage information
 * @returns {Object} Storage usage stats
 */
function getStorageInfo() {
    let totalSize = 0;
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
        }
    }
    
    return {
        totalSize: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        itemCount: localStorage.length,
        maxSize: '5-10 MB (browser dependent)'
    };
}

console.log('✅ storage.js loaded successfully');