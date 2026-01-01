/**
 * leaderboardManagement.js
 * LocalStorage management functions for leaderboards
 */

// ============================================
// LEADERBOARD MANAGEMENT
// ============================================

// Get all leaderboards
function getAllLeaderboards() {
    try {
        const leaderboards = localStorage.getItem('leaderboard');
        return leaderboards ? JSON.parse(leaderboards) : {};
    } catch (error) {
        console.error('Error getting all leaderboards:', error);
        return {};
    }
}

// Get leaderboard for a specific game
function getLeaderboard(gameId) {
    try {
        const allLeaderboards = getAllLeaderboards();
        return allLeaderboards[gameId] || [];
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

// Update leaderboard with new entry
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

// Get user rank in a specific game's leaderboard
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

// Update usernames in leaderboards when user changes username
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

