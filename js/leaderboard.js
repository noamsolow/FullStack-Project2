/**
 * leaderboard.js - Leaderboard Page Logic
 * Handles displaying and managing the game leaderboards
 */

// Current selected game
let currentGame = 'game1';
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initLeaderboard();
});

/**
 * Initialize the leaderboard page
 */
function initLeaderboard() {
    // Check session
    if (!checkSession()) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = getCurrentUser();
    
    // Create navbar
    createNavbar('leaderboard');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial leaderboard
    loadLeaderboard('game1');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('.tab-btn');
            const gameId = target.dataset.game;
            
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            
            // Load leaderboard for selected game
            currentGame = gameId;
            loadLeaderboard(gameId);
        });
    });
}

/**
 * Load and display leaderboard for a specific game
 */
function loadLeaderboard(gameId) {
    const leaderboard = getLeaderboardData(gameId);
    
    // Update podium
    updatePodium(leaderboard);
    
    // Update table
    updateTable(leaderboard);
    
    // Update user's rank
    updateUserRank(leaderboard);
}

/**
 * Update the podium display
 */
function updatePodium(leaderboard) {
    const topThree = leaderboard.slice(0, 3);
    
    // First place
    const podium1 = document.getElementById('podium1');
    if (topThree[0]) {
        podium1.querySelector('.podium-name').textContent = topThree[0].username;
        podium1.querySelector('.podium-score').textContent = `${topThree[0].score} pts`;
    } else {
        podium1.querySelector('.podium-name').textContent = '---';
        podium1.querySelector('.podium-score').textContent = '0';
    }
    
    // Second place
    const podium2 = document.getElementById('podium2');
    if (topThree[1]) {
        podium2.querySelector('.podium-name').textContent = topThree[1].username;
        podium2.querySelector('.podium-score').textContent = `${topThree[1].score} pts`;
    } else {
        podium2.querySelector('.podium-name').textContent = '---';
        podium2.querySelector('.podium-score').textContent = '0';
    }
    
    // Third place
    const podium3 = document.getElementById('podium3');
    if (topThree[2]) {
        podium3.querySelector('.podium-name').textContent = topThree[2].username;
        podium3.querySelector('.podium-score').textContent = `${topThree[2].score} pts`;
    } else {
        podium3.querySelector('.podium-name').textContent = '---';
        podium3.querySelector('.podium-score').textContent = '0';
    }
}

/**
 * Update the leaderboard table
 */
function updateTable(leaderboard) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    if (!leaderboard || leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No scores yet. Be the first to play!</td></tr>';
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        // Highlight current user
        if (currentUser && entry.userId === currentUser.id) {
            row.classList.add('current-user');
        }
        
        // Rank display
        let rankDisplay;
        if (index === 0) {
            rankDisplay = '<span class="rank-medal">🥇</span>';
        } else if (index === 1) {
            rankDisplay = '<span class="rank-medal">🥈</span>';
        } else if (index === 2) {
            rankDisplay = '<span class="rank-medal">🥉</span>';
        } else {
            rankDisplay = `<span class="rank-cell">${index + 1}</span>`;
        }
        
        // Format date
        const date = entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A';
        
        // Difficulty badge
        const difficulty = entry.difficulty || 'easy';
        const difficultyBadge = `<span class="difficulty-badge ${difficulty}">${difficulty}</span>`;
        
        row.innerHTML = `
            <td>${rankDisplay}</td>
            <td>${entry.username}</td>
            <td><strong>${entry.score}</strong></td>
            <td>${difficultyBadge}</td>
            <td>${date}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Update the user's rank section
 */
function updateUserRank(leaderboard) {
    const yourRankSection = document.getElementById('yourRankSection');
    const yourRank = document.getElementById('yourRank');
    const yourUsername = document.getElementById('yourUsername');
    const yourScore = document.getElementById('yourScore');
    
    if (!currentUser) {
        yourRankSection.style.display = 'none';
        return;
    }
    
    // Find user's position
    const userIndex = leaderboard.findIndex(entry => entry.userId === currentUser.id);
    
    if (userIndex === -1) {
        yourRank.textContent = '#--';
        yourUsername.textContent = currentUser.username;
        yourScore.textContent = 'No score yet - play to get ranked!';
    } else {
        yourRank.textContent = `#${userIndex + 1}`;
        yourUsername.textContent = currentUser.username;
        yourScore.textContent = `Score: ${leaderboard[userIndex].score}`;
    }
    
    yourRankSection.style.display = 'block';
}

/**
 * Get leaderboard data from localStorage
 */
function getLeaderboardData(gameId) {
    const leaderboard = localStorage.getItem('leaderboard');
    if (!leaderboard) return [];
    
    const allLeaderboards = JSON.parse(leaderboard);
    const gameLeaderboard = allLeaderboards[gameId] || [];
    
    // Sort by score descending
    return gameLeaderboard.sort((a, b) => b.score - a.score);
}
