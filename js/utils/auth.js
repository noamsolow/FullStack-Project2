/**
 * auth.js
 * Authentication and session management functions
 */

/**
 * Check if user session is valid
 * @returns {boolean} True if session is valid
 */
function checkSession() {
    const currentUser = localStorage.getItem('currentUser');

    // If no user logged in, create test user for development
    if (!currentUser) {
        return false;
        // // Create a test user for development/testing
        // const testUser = {
        //     id: 'test_user_123',
        //     username: 'TestPlayer',
        //     email: 'test@example.com',
        //     sessionToken: 'test_token_' + Date.now(),
        //     loginTime: new Date().toISOString(),
        //     expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        // };
        // localStorage.setItem('currentUser', JSON.stringify(testUser));
        // console.log('✅ Test user created for development');
        // return true;
    }
    
    // Check if session is expired
    try {
        const user = JSON.parse(currentUser);
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

/**
 * Get current logged in user
 * @returns {Object|null} User object or null
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    
    if (!userStr) {
        // Return test user for development
        return {
            id: 'test_user_123',
            username: 'TestPlayer',
            email: 'test@example.com'
        };
    }
    
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing current user:', error);
        return null;
    }
}

/**
 * Set current user session
 * @param {Object} userData - User data to store
 */
function setCurrentUser(userData) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('✅ User session created:', userData.username);
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

/**
 * Clear current user session (logout)
 */
function clearSession() {
    localStorage.removeItem('currentUser');
    console.log('✅ Session cleared');
}

/**
 * Logout user and clear session
 */
function logout() {
    clearSession();
    console.log('✅ User logged out');
}

/**
 * Check if session is valid (not expired)
 * @returns {boolean} True if valid
 */
function isSessionValid() {
    const user = getCurrentUser();
    if (!user || !user.expiresAt) {
        return false;
    }
    
    const expirationTime = new Date(user.expiresAt).getTime();
    const currentTime = Date.now();
    
    return currentTime < expirationTime;
}

/**
 * Validate login credentials
 * @param {string} username - Username or email
 * @param {string} password - Password
 * @returns {Object|null} User object if valid, null otherwise
 */
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

/**
 * Check login attempts for user
 * @param {string} username - Username or email
 * @returns {boolean} True if user can attempt login
 */
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

/**
 * Increment login attempts for user
 * @param {string} username - Username or email
 */
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

/**
 * Block user for specified minutes
 * @param {string} username - Username or email
 * @param {number} minutes - Minutes to block
 */
function blockUser(username, minutes) {
    const user = getUser(username);
    
    if (!user) return;
    
    user.isBlocked = true;
    user.blockedUntil = new Date(Date.now() + minutes * 60000).toISOString();
    updateUser(user.id, user);
    
    console.warn(`⚠️ User ${username} blocked for ${minutes} minutes`);
}

/**
 * Create a new user session after login
 * @param {Object} user - User object
 * @returns {Object} Session object
 */
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

/**
 * Set cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} expirationHours - Hours until expiration
 */
function setCookie(name, value, expirationHours) {
    const date = new Date();
    date.setTime(date.getTime() + (expirationHours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

/**
 * Get cookie value
 * @param {string} name - Cookie name
 * @returns {string} Cookie value or empty string
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
}

/**
 * Delete cookie
 * @param {string} name - Cookie name
 */
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

console.log('✅ auth.js loaded successfully');