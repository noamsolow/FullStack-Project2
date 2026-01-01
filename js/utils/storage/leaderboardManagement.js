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

// Get leaderboard for a specific game (sorted by score descending)
function getLeaderboard(gameId) {
    try {
        const allLeaderboards = getAllLeaderboards();
        const gameLeaderboard = allLeaderboards[gameId] || [];
        // Sort by score descending
        return gameLeaderboard.sort((a, b) => b.score - a.score);
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

// Add or update a leaderboard entry (updates only if new score is higher)
function addOrUpdateLeaderboardEntry(gameId, entry) {
    try {
        const allLeaderboards = getAllLeaderboards();
        
        if (!allLeaderboards[gameId]) {
            allLeaderboards[gameId] = [];
        }
        
        // Check if user already has an entry
        const existingIndex = allLeaderboards[gameId].findIndex(e => e.userId === entry.userId);
        
        if (existingIndex !== -1) {
            // Update only if new score is higher
            if (entry.score > allLeaderboards[gameId][existingIndex].score) {
                allLeaderboards[gameId][existingIndex] = entry;
            }
        } else {
            allLeaderboards[gameId].push(entry);
        }
        
        // Sort by score descending and keep top 10
        allLeaderboards[gameId].sort((a, b) => b.score - a.score);
        allLeaderboards[gameId] = allLeaderboards[gameId].slice(0, 10);
        
        localStorage.setItem('leaderboard', JSON.stringify(allLeaderboards));
        console.log('✅ Leaderboard entry added/updated:', gameId);
        return true;
    } catch (error) {
        console.error('Error adding/updating leaderboard entry:', error);
        return false;
    }
}

