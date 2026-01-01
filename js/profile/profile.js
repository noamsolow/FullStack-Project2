/**
 * profile.js
 * User profile page functionality
 */

let currentUser = null;

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});

// Initialize profile page
function initProfilePage() {
    // Check session
    if (!requireAuth()) return;

    currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.replace('login-signup.html');
        return;
    }

    // Create navbar
    createNavbar('profile');

    // Load all profile data
    loadUserProfile();
    loadOverallStats();
    loadGameSpecificStats();
    loadAchievements();
    loadRecentActivity();

    // Setup event listeners
    setupEventListeners();
}

// Load user profile information
function loadUserProfile() {
    // Set username and email
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email || 'No email provided';

    // Set avatar initial
    const initial = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('avatarInitial').textContent = initial;

    // Set member since date
    if (currentUser.registeredAt) {
        const memberDate = new Date(currentUser.registeredAt);
        document.getElementById('memberSince').textContent = memberDate.toLocaleDateString();
    } else {
        document.getElementById('memberSince').textContent = 'Unknown';
    }

    // Set last login date
    if (currentUser.lastLogin) {
        const loginDate = new Date(currentUser.lastLogin);
        document.getElementById('lastLogin').textContent = formatDate(loginDate);
    } else if (currentUser.loginTime) {
        const loginDate = new Date(currentUser.loginTime);
        document.getElementById('lastLogin').textContent = formatDate(loginDate);
    } else {
        document.getElementById('lastLogin').textContent = 'Just now';
    }
}

//
function loadOverallStats() {
    const allGameStats = getUserAllGameStats(currentUser.id);
    const stats = getAggregatedUserStats(currentUser.id);

    // Count unlocked achievements based on actual criteria
    const totalAchievements = countUnlockedAchievements(allGameStats);

    // Update UI
    document.getElementById('totalGamesPlayed').textContent = stats.totalGamesPlayed;
    document.getElementById('totalWins').textContent = stats.totalWins;
    document.getElementById('totalScore').textContent = stats.totalScore.toLocaleString();
    document.getElementById('achievementCount').textContent = totalAchievements;
}

// Count unlocked achievements based on criteria
function countUnlockedAchievements(allGameStats) {
    const achievementTitles = [
        'First Victory',
        'Code Master',
        'Champion',
        'Dedicated Player',
        'Perfectionist',
        'On Fire'
    ];
    
    let count = 0;
    for (const title of achievementTitles) {
        if (shouldUnlockAchievement(title, allGameStats)) {
            count++;
        }
    }
    return count;
}

// Load stats for specific games
function loadGameSpecificStats() {
    // Load Game 1 stats
    loadGameStats('game1', {
        played: 'game1Played',
        won: 'game1Won',
        highScore: 'game1HighScore',
        totalScore: 'game1TotalScore',
        bestStreak: 'game1BestStreak',
        lastPlayed: 'game1LastPlayed'
    });

    // Load Game 2 stats
    loadGameStats('game2', {
        played: 'game2Played',
        won: 'game2Won',
        highScore: 'game2HighScore',
        totalScore: 'game2TotalScore',
        bestStreak: 'game2BestStreak',
        lastPlayed: 'game2LastPlayed'
    });
}

/**
 * Load stats for a specific game
 */
function loadGameStats(gameId, elementIds) {
    const stats = getGameStats(currentUser.id, gameId);

    if (stats) {
        document.getElementById(elementIds.played).textContent = stats.played || 0;
        document.getElementById(elementIds.won).textContent = stats.won || 0;
        document.getElementById(elementIds.highScore).textContent = (stats.highScore || 0).toLocaleString();
        document.getElementById(elementIds.totalScore).textContent = (stats.totalScore || 0).toLocaleString();
        document.getElementById(elementIds.bestStreak).textContent = stats.bestStreak || 0;
        
        if (stats.lastPlayed) {
            const lastPlayedDate = new Date(stats.lastPlayed);
            document.getElementById(elementIds.lastPlayed).textContent = formatDate(lastPlayedDate);
        } else {
            document.getElementById(elementIds.lastPlayed).textContent = 'Never';
        }
    } else {
        // Set all to 0/Never
        document.getElementById(elementIds.played).textContent = '0';
        document.getElementById(elementIds.won).textContent = '0';
        document.getElementById(elementIds.highScore).textContent = '0';
        document.getElementById(elementIds.totalScore).textContent = '0';
        document.getElementById(elementIds.bestStreak).textContent = '0';
        document.getElementById(elementIds.lastPlayed).textContent = 'Never';
    }
}

// Load achievements
function loadAchievements() {
    const allGameStats = getUserAllGameStats(currentUser.id);
    const unlockedAchievements = [];

    // Collect all unlocked achievements
    for (const gameId in allGameStats) {
        const gameStats = allGameStats[gameId];
        if (gameStats.achievements) {
            unlockedAchievements.push(...gameStats.achievements);
        }
    }

    // Check achievements and unlock them
    const achievements = document.querySelectorAll('.achievement-badge');
    
    achievements.forEach(badge => {
        const title = badge.querySelector('h4').textContent;
        
        // Check if achievement should be unlocked
        if (shouldUnlockAchievement(title, allGameStats)) {
            badge.classList.remove('locked');
            badge.classList.add('unlocked');
        }
    });
}

/**
 * Check if an achievement should be unlocked
 */
function shouldUnlockAchievement(achievementTitle, allGameStats) {
    const stats = calculateOverallStats(allGameStats);

    switch (achievementTitle) {
        case 'First Victory':
            return stats.totalWins >= 1;
        case 'Code Master':
            // Complete all 5 levels in Code Runner (any difficulty)
            return allGameStats.game1 && (allGameStats.game1.levelsBeat >= 5 || allGameStats.game1.bestStreak >= 5);
        case 'Champion':
            return stats.highestScore >= 1000;
        case 'Dedicated Player':
            return stats.totalGamesPlayed >= 10;
        case 'Perfectionist':
            // This would need to be tracked separately in game logic
            return false; // Placeholder
        case 'On Fire':
            // This would need win streak tracking
            return false; // Placeholder
        default:
            return false;
    }
}

/**
 * Calculate overall stats from all games
 */
function calculateOverallStats(allGameStats) {
    return getAggregatedUserStats(currentUser.id);
}

/**
 * Load recent activity
 */
function loadRecentActivity() {
    const allGameStats = getUserAllGameStats(currentUser.id);
    const activities = [];

    // Collect recent activities from all games
    for (const gameId in allGameStats) {
        const gameStats = allGameStats[gameId];
        if (gameStats.lastPlayed) {
            activities.push({
                game: gameId === 'game1' ? 'Code Runner' : 'Hangman Challenge',
                date: new Date(gameStats.lastPlayed),
                score: gameStats.highScore
            });
        }
    }

    // Sort by date (most recent first)
    activities.sort((a, b) => b.date - a.date);

    // Display activities
    const activityList = document.getElementById('activityList');
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">🎮</div>
                <div class="activity-details">
                    <p class="activity-text">No recent activity</p>
                    <span class="activity-time">Start playing to see your activity!</span>
                </div>
            </div>
        `;
        return;
    }

    activityList.innerHTML = '';
    
    activities.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">🎮</div>
            <div class="activity-details">
                <p class="activity-text">Played <strong>${activity.game}</strong> - Score: ${activity.score}</p>
                <span class="activity-time">${formatDate(activity.date)}</span>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// setup event listeners
function setupEventListeners() {
    // Edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', openEditModal);

    // Modal close buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);

    // Edit profile form
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);

    // Account actions
    document.getElementById('exportDataBtn').addEventListener('click', handleExportData);
    document.getElementById('clearStatsBtn').addEventListener('click', handleClearStats);
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
}


// Open edit profile modal
function openEditModal() {
    document.getElementById('editUsername').value = currentUser.username;
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editFirstName').value = currentUser.firstName || '';
    document.getElementById('editLastName').value = currentUser.lastName || '';
    
    document.getElementById('editModal').classList.remove('hidden');
}

/**
 * Close edit profile modal
 */
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

/**
 * Handle edit profile form submission
 */
function handleEditProfile(e) {
    e.preventDefault();

    const newUsername = document.getElementById('editUsername').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    const newFirstName = document.getElementById('editFirstName').value.trim();
    const newLastName = document.getElementById('editLastName').value.trim();

    // Check if username is taken by another user
    if (newUsername !== currentUser.username) {
        const existingUser = getUser(newUsername);
        if (existingUser && existingUser.id !== currentUser.id) {
            alert('❌ Username is already taken. Please choose a different one.');
            return;
        }

    }

    // Check if email is taken by another user
    if (newEmail !== currentUser.email) {
        const existingUser = getUser(newEmail);
        if (existingUser && existingUser.id !== currentUser.id) {
            alert('❌ Email is already in use. Please use a different one.');
            return;
        }
    }

    // Update user data
    const updatedUser = {
        ...currentUser,
        username: newUsername,
        email: newEmail,
        firstName: newFirstName,
        lastName: newLastName
    };
        // Update leaderboard with new username
    updateLeaderboardUsername(currentUser.id, newUsername);

    // Save to storage
    updateUser(currentUser.id, updatedUser);
    setCurrentUser(updatedUser);
    currentUser = updatedUser;

    // Reload profile and navbar
    loadUserProfile();
    updateNavbarUser();
    closeEditModal();

}

// Handle export data
function handleExportData() {
    const data = exportUserData(currentUser.id);
    
    if (!data) {
        alert(' Error exporting data. Please try again.');
        return;
    }
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `game-hub-data-${currentUser.username}-${Date.now()}.json`;
    link.click();

}

// Handle clear statistics
function handleClearStats() {
    if (confirm('⚠️ Are you sure you want to clear all your game statistics? This cannot be undone!')) {
        clearUserStats(currentUser.id);
        location.reload();
    }
}

// Handle delete account
function handleDeleteAccount() {
    const confirmation = prompt('⚠️ WARNING: This will permanently delete your account and all data!\n\nType "DELETE" to confirm:');
    
    if (confirmation === 'DELETE') {
        deleteAllUserData(currentUser.id);
        logout();
        alert('Account deleted successfully.');
        window.location.href = 'login-signup.html';
    }
}

/**
 * Format date to readable string
 */
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}