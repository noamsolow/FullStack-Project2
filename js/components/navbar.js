/**
 * navbar.js
 * Reusable navigation component for all pages
 * Automatically creates and manages the navbar
 */

// create a navbar component
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

// Handle logout from navbar
function handleNavbarLogout() {
    if (confirm('Are you sure you want to logout?')) {
        logout();
        window.location.href = 'login-signup.html';
    }
}

// Update navbar user info (e.g., after username change)
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

// Set active page in navbar
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

