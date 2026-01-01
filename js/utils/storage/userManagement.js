/**
 * userManagement.js
 * LocalStorage management functions for user data
 */

// ============================================
// USER MANAGEMENT
// ============================================

/// Get all users
function getAllUsers() {
    try {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

// Add new user
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

// Get user by username or email
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

// Update user data
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

// Delete user
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

// Clear user's game statistics
function clearUserStats(userId) {
    try {
        const allStats = JSON.parse(localStorage.getItem('gameStats') || '{}');
        delete allStats[userId];
        localStorage.setItem('gameStats', JSON.stringify(allStats));
        console.log('✅ User stats cleared:', userId);
        return true;
    } catch (error) {
        console.error('Error clearing user stats:', error);
        return false;
    }
}

// Delete all user data (account, stats, leaderboard entries)
function deleteAllUserData(userId) {
    try {
        // Delete user account
        deleteUser(userId);
        
        // Clear user stats
        clearUserStats(userId);
        
        // Remove user's leaderboard entries
        const allLeaderboards = JSON.parse(localStorage.getItem('leaderboard') || '{}');
        for (const gameId in allLeaderboards) {
            allLeaderboards[gameId] = allLeaderboards[gameId].filter(entry => entry.userId !== userId);
        }
        localStorage.setItem('leaderboard', JSON.stringify(allLeaderboards));
        
        console.log('✅ All user data deleted:', userId);
        return true;
    } catch (error) {
        console.error('Error deleting all user data:', error);
        return false;
    }
}

// Export user's personal data as JSON (for profile export button)
function exportUserData(userId) {
    try {
        // Get all data
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const allGameStats = JSON.parse(localStorage.getItem('gameStats') || '{}');
        const allLeaderboards = JSON.parse(localStorage.getItem('leaderboard') || '{}');
        
        // Find current user's data only
        const userData = allUsers.find(u => u.id === userId);
        
        // Get only this user's game stats
        const userGameStats = allGameStats[userId] || {};
        
        // Get only this user's leaderboard entries
        const userLeaderboardEntries = {};
        for (const gameId in allLeaderboards) {
            const userEntries = allLeaderboards[gameId].filter(entry => entry.userId === userId);
            if (userEntries.length > 0) {
                userLeaderboardEntries[gameId] = userEntries;
            }
        }
        
        return {
            exportDate: new Date().toISOString(),
            user: userData ? {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                registeredAt: userData.registeredAt,
                lastLogin: userData.lastLogin
            } : null,
            gameStats: userGameStats,
            leaderboardEntries: userLeaderboardEntries
        };
    } catch (error) {
        console.error('Error exporting user data:', error);
        return null;
    }
}