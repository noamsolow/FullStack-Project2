/**
 * auth.js
 */


// Get current logged-in user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        return null;
        }
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing current user:', error);
        return null;
    }
}

// Check if user session is valid
function checkSession() {

    try {
        const user = getCurrentUser();
        if (!user) {
            return false;
        }
        if (user.expiresAt) {
            const expirationTime = new Date(user.expiresAt).getTime();
            const currentTime = Date.now();
            
            if (currentTime >= expirationTime) {
                console.warn('⚠️ Session expired');
                clearSession();
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Error checking session:', error);
        return false;
    }
}



// Set current logged-in user
function setCurrentUser(userData) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('✅ User session created:', userData.username);
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

// Clear current user session
function clearSession() {
    localStorage.removeItem('currentUser');
    console.log('✅ Session cleared');
}

// Logout user and save last visited page
function logout() {
    // Get current user before clearing session
    const currentUser = getCurrentUser();
    
    // Save current page to localStorage with username as key
    const currentPage = window.location.pathname.split('/').pop() || 'games.html';
    if (currentUser && currentUser.username) {
        const storageKey = `lastVisitedPage_${currentUser.username}`;
        localStorage.setItem(storageKey, currentPage);
        console.log('💾 Saved last visited page for', currentUser.username + ':', currentPage);
    }
    
    clearSession();
    console.log('✅ User logged out');
}

// Require authentication to access page
function requireAuth() {
    if (!checkSession()) {
        window.location.replace('login-signup.html'); 
        return false;
    }
    // Show the page content after auth verified
    document.body.classList.add('auth-verified');
    return true;
}



// Validate login credentials
function validateLogin(username, password) {
    const users = getAllUsers();
    
    const user = users.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password
    );
    
    if (user) {
        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.isBlocked = false;
        user.lastLogin = new Date().toISOString();
        updateUser(user.id, user);
        return user;
    }
    
    return null;
}

// Check if user is blocked due to failed login attempts
function checkLoginAttempts(username) {
    const user = getUser(username);
    
    if (!user) return true; // User doesn't exist, allow attempt
    
    if (user.isBlocked && user.blockedUntil) {
        const blockedUntilTime = new Date(user.blockedUntil).getTime();
        const currentTime = Date.now();
        
        if (currentTime < blockedUntilTime) {
            const minutesLeft = Math.ceil((blockedUntilTime - currentTime) / 60000);
            console.warn(`⚠️ User blocked for ${minutesLeft} more minutes`);
            return false;
        } else {
            // Unblock user
            user.isBlocked = false;
            user.blockedUntil = null;
            user.loginAttempts = 0;
            updateUser(user.id, user);
        }
    }
    
    return user.loginAttempts < 3;
}

// Increment login attempts and block if necessary
function incrementLoginAttempts(username) {
    const user = getUser(username);
    
    if (!user) return;
    
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    
    if (user.loginAttempts >= 3) {
        blockUser(username, 15); // Block for 15 minutes
    } else {
        updateUser(user.id, user);
    }
}

// Block user for specified minutes
function blockUser(username, minutes) {
    const user = getUser(username);
    
    if (!user) return;
    
    user.isBlocked = true;
    user.blockedUntil = new Date(Date.now() + minutes * 60000).toISOString();
    updateUser(user.id, user);
    
    console.warn(`⚠️ User ${username} blocked for ${minutes} minutes`);
}

// Create user session after successful login
function createSession(user) {
    const sessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        sessionToken: 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2),
        loginTime: new Date().toISOString(), 
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    };
    
    setCurrentUser(sessionData);
    return sessionData;
}

