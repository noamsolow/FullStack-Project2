/**
 * navbar.js
 * Reusable navigation component for all pages
 * Automatically creates and manages the navbar
 */

/**
 * Create and inject navbar into the page
 * @param {string} activePage - Current page identifier ('games', 'profile', 'game1', 'game2')
 */
function createNavbar(activePage = '') {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.warn('No user logged in, navbar not created');
        return;
    }

    // Create navbar HTML
    const navbarHTML = `
        <nav class="navbar">
            <div class="navbar-container">
                <div class="navbar-brand">
                    <h1>🎮 Game Hub</h1>
                </div>
                <div class="navbar-menu">
                    <a href="games.html" class="nav-link ${activePage === 'games' ? 'active' : ''}">
                        <span class="nav-icon">🎯</span>
                        <span class="nav-text">Games</span>
                    </a>
                    <a href="leaderboard.html" class="nav-link ${activePage === 'leaderboard' ? 'active' : ''}">
                        <span class="nav-icon">🏆</span>
                        <span class="nav-text">Leaderboard</span>
                    </a>
                    <a href="profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">
                        <span class="nav-icon">👤</span>
                        <span class="nav-text">Profile</span>
                    </a>
                </div>
                <div class="navbar-user">
                    <div class="user-info">
                        <span class="user-avatar">${currentUser.username.charAt(0).toUpperCase()}</span>
                        <span class="user-name">${currentUser.username}</span>
                    </div>
                    <button id="navLogoutBtn" class="btn btn-logout">
                        <span class="logout-text">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    `;

    // Insert navbar at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Setup logout button
    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleNavbarLogout);
    }

    console.log('✅ Navbar created for page:', activePage);
}

/**
 * Handle logout from navbar
 */
function handleNavbarLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Get current user before logging out
        const currentUser = getCurrentUser();
        
        // Save current page to localStorage with username as key
        const currentPage = window.location.pathname.split('/').pop() || 'games.html';
        if (currentUser && currentUser.username) {
            const storageKey = `lastVisitedPage_${currentUser.username}`;
            localStorage.setItem(storageKey, currentPage);
            console.log('💾 Saved last visited page for', currentUser.username + ':', currentPage);
        }
        
        logout();
        window.location.href = 'login.html';
    }
}

/**
 * Update navbar user info (if navbar already exists)
 */
function updateNavbarUser() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;

    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');

    if (userAvatar) {
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
    }

    if (userName) {
        userName.textContent = currentUser.username;
    }
}

/**
 * Highlight active page in navbar
 * @param {string} pageName - Page identifier
 */
function setActivePage(pageName) {
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href && href.includes(pageName)) {
            link.classList.add('active');
        }
    });
}

/**
 * Add notification badge to navbar item
 * @param {string} itemName - 'games' or 'profile'
 * @param {number} count - Number to show in badge
 */
function addNavbarBadge(itemName, count) {
    const link = document.querySelector(`a[href="${itemName}.html"]`);
    
    if (!link) return;

    // Remove existing badge if any
    const existingBadge = link.querySelector('.nav-badge');
    if (existingBadge) {
        existingBadge.remove();
    }

    // Add new badge
    if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.textContent = count;
        link.appendChild(badge);
    }
}

/**
 * Show quick stats in navbar (optional)
 */
function showNavbarStats() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const allGameStats = getUserAllGameStats(currentUser.id);
    
    let totalGamesPlayed = 0;
    let newAchievements = 0;

    for (const gameId in allGameStats) {
        const gameStats = allGameStats[gameId];
        totalGamesPlayed += gameStats.played || 0;
        // Count achievements (you can track "new" ones separately)
    }

    // Add badge to profile if there are new achievements
    if (newAchievements > 0) {
        addNavbarBadge('profile', newAchievements);
    }
}

console.log('✅ navbar.js loaded successfully');