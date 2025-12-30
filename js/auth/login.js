/**
 * login.js - Authentication Logic (Compatible with existing system)
 * מטפל בהתחברות, רישום ואימות משתמשים
 * משתמש בפונקציות הקיימות מ-storage.js ו-auth.js
 */

// Constants
const MAX_LOGIN_ATTEMPTS = 3; // התאמה למערכת הקיימת
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes



// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

/**
 * Initialize authentication page
 */
function initAuth() {
    // Check if already logged in using existing checkSession
    if (checkSession()) {
        window.location.href = 'games.html';
        return;
    }

    // Setup event listeners
    setupEventListeners();
    
    // Focus on first input
    document.getElementById('loginUsername').focus();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Switch between login and register
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    document.getElementById('showLogin').addEventListener('click', showLoginForm);

    // Toggle password visibility
    document.getElementById('toggleLoginPassword').addEventListener('click', () => {
        togglePasswordVisibility('loginPassword', 'toggleLoginPassword');
    });
    document.getElementById('toggleRegisterPassword').addEventListener('click', () => {
        togglePasswordVisibility('registerPassword', 'toggleRegisterPassword');
    });
    document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
        togglePasswordVisibility('registerConfirmPassword', 'toggleConfirmPassword');
    });

    // Real-time validation
    document.getElementById('registerUsername').addEventListener('input', validateUsernameRealtime);
    document.getElementById('registerEmail').addEventListener('input', validateEmailRealtime);
    document.getElementById('registerPassword').addEventListener('input', validatePasswordRealtime);
    document.getElementById('registerConfirmPassword').addEventListener('input', validateConfirmPasswordRealtime);
}

/**
 * Handle login form submission
 */
function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login attempt started');

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    console.log('Username:', username);
    console.log('Password length:', password.length);

    // Clear previous errors
    clearErrors();

    // Validate inputs
    if (!username || !password) {
        console.log('❌ Validation failed: Empty fields');
        if (!username) {
            showError('loginUsernameError', 'Please enter your username');
            document.getElementById('loginUsername').classList.add('error');
        }
        if (!password) {
            showError('loginPasswordError', 'Please enter your password');
            document.getElementById('loginPassword').classList.add('error');
        }
        return;
    }

    console.log('✓ Basic validation passed');

    // Check login attempts using existing function
    if (!checkLoginAttempts(username)) {
        console.log('❌ User is blocked');
        const user = getUser(username);
        if (user && user.blockedUntil) {
            const blockedUntilTime = new Date(user.blockedUntil).getTime();
            const minutes = Math.ceil((blockedUntilTime - Date.now()) / 60000);
            showLoginWarning(`User is blocked for ${minutes} more minutes`);
        } else {
            showLoginWarning('Too many failed attempts. Try again later');
        }
        return;
    }

    console.log('✓ Login attempts check passed');

    // Use existing validateLogin function
    const user = validateLogin(username, password);

    if (!user) {
        console.log('❌ Login validation failed');
        // Check if user exists
        const userData = getUser(username);
        
        if (!userData) {
            // User doesn't exist
            console.log('❌ User does not exist');
            showError('loginPasswordError', 'Username does not exist');
            return;
        }
        
        console.log('❌ Wrong password, incrementing attempts');
        // User exists but wrong password - increment attempts
        incrementLoginAttempts(username);
        
        const attempts = userData.loginAttempts || 0;
        
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            showLoginWarning('Too many failed attempts. User blocked for 15 minutes');
        } else {
            showError('loginPasswordError', `Wrong password (${attempts}/${MAX_LOGIN_ATTEMPTS} attempts)`);
        }
        return;
    }

    console.log('✅ Login successful!', user.username);

    // Create session using existing function
    const sessionData = createSession(user);
    
    // Update session expiration based on "Remember Me"
    if (rememberMe) {
        sessionData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
        setCurrentUser(sessionData);
    }

    // Show success and redirect
    showSuccess('Login successful! Redirecting...');
    setTimeout(() => {
        // Check if there's a saved last visited page for this user
        const storageKey = `lastVisitedPage_${user.username}`;
        const lastPage = localStorage.getItem(storageKey);
        // Redirect to last page or default to games.html
        const redirectPage = lastPage && lastPage !== 'login.html' && lastPage !== 'register.html' ? lastPage : 'games.html';
        console.log('🔄 Redirecting', user.username, 'to:', redirectPage);
        window.location.href = redirectPage;
    }, 1500);
}

/**
 * Handle register form submission
 */
function handleRegister(e) {
    e.preventDefault();

    const firstName = document.getElementById('registerFirstName').value.trim();
    const lastName = document.getElementById('registerLastName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Clear previous errors
    clearErrors();

    // Validate all fields
    let hasErrors = false;

    if (!validateUsername(username)) {
        hasErrors = true;
    }

    if (!validateEmail(email)) {
        hasErrors = true;
    }

    if (!validatePassword(password)) {
        hasErrors = true;
    }

    if (!validateConfirmPassword(password, confirmPassword)) {
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    // Check if username already exists using existing function
    if (getUser(username)) {
        showError('registerUsernameError', 'Username already taken');
        return;
    }

    // Check if email already exists
    const users = getAllUsers();
    if (users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        showError('registerEmailError', 'Email already registered');
        return;
    }

    // Create new user object matching existing structure
    const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        registeredAt: new Date().toISOString(),
        lastLogin: null,
        loginAttempts: 0,
        isBlocked: false,
        blockedUntil: null
    };

    // Save user using existing function
    const userAdded = addUser(newUser);
    
    if (!userAdded) {
        showError('registerUsernameError', 'Error creating user. Try again.');
        return;
    }

    // Initialize game stats for new user
    initializeGameStats(newUser.id, 'game1');
    initializeGameStats(newUser.id, 'game2');

    // Create session using existing function
    createSession(newUser);

    // Show success and redirect
    showSuccess('Registration successful! Redirecting to games...');
    setTimeout(() => {
        window.location.href = 'games.html';
    }, 1500);
}

/**
 * Validate username
 */
function validateUsername(username) {
    const usernameError = document.getElementById('registerUsernameError');
    const usernameInput = document.getElementById('registerUsername');

    if (username.length < 3) {
        showError('registerUsernameError', 'Username must be at least 3 characters');
        usernameInput.classList.add('error');
        return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError('registerUsernameError', 'Username can only contain letters, numbers and underscore');
        usernameInput.classList.add('error');
        return false;
    }

    usernameInput.classList.remove('error');
    usernameError.classList.remove('show');
    return true;
}

/**
 * Validate email
 */
function validateEmail(email) {
    const emailError = document.getElementById('registerEmailError');
    const emailInput = document.getElementById('registerEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showError('registerEmailError', 'Invalid email address');
        emailInput.classList.add('error');
        return false;
    }

    emailInput.classList.remove('error');
    emailError.classList.remove('show');
    return true;
}

/**
 * Validate password
 */
function validatePassword(password) {
    const passwordError = document.getElementById('registerPasswordError');
    const passwordInput = document.getElementById('registerPassword');

    if (password.length < 6) {
        showError('registerPasswordError', 'Password must be at least 6 characters');
        passwordInput.classList.add('error');
        return false;
    }

    passwordInput.classList.remove('error');
    passwordError.classList.remove('show');
    return true;
}

/**
 * Validate confirm password
 */
function validateConfirmPassword(password, confirmPassword) {
    const confirmError = document.getElementById('registerConfirmPasswordError');
    const confirmInput = document.getElementById('registerConfirmPassword');

    if (password !== confirmPassword) {
        showError('registerConfirmPasswordError', 'Passwords do not match');
        confirmInput.classList.add('error');
        return false;
    }

    confirmInput.classList.remove('error');
    confirmError.classList.remove('show');
    return true;
}

/**
 * Real-time validation functions
 */
function validateUsernameRealtime(e) {
    const username = e.target.value.trim();
    if (username.length > 0) {
        validateUsername(username);
    }
}

function validateEmailRealtime(e) {
    const email = e.target.value.trim();
    if (email.length > 0) {
        validateEmail(email);
    }
}

function validatePasswordRealtime(e) {
    const password = e.target.value;
    if (password.length > 0) {
        validatePassword(password);
    }
}

function validateConfirmPasswordRealtime(e) {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = e.target.value;
    if (confirmPassword.length > 0) {
        validateConfirmPassword(password, confirmPassword);
    }
}

/**
 * Show/hide forms
 */
function showRegisterForm() {
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('registerCard').classList.remove('hidden');
    clearErrors();
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('registerFirstName').focus();
    }, 100);
}

function showLoginForm() {
    document.getElementById('registerCard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
    clearErrors();
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('loginUsername').focus();
    }, 100);
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

/**
 * Show error message
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        console.log('❌ Error:', message);
    } else {
        console.error('Error element not found:', elementId);
    }
}

/**
 * Clear all errors
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.input-error');
    errorElements.forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });

    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => input.classList.remove('error'));

    const loginWarning = document.getElementById('loginWarning');
    if (loginWarning) {
        loginWarning.classList.add('hidden');
    }
    
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
        successAlert.classList.add('hidden');
    }
}

/**
 * Show login warning with auto-scroll
 */
function showLoginWarning(message) {
    const warning = document.getElementById('loginWarning');
    if (warning) {
        warning.querySelector('.alert-text').textContent = message;
        warning.classList.remove('hidden');
        
        // הוספת גלילה אוטומטית אל האלמנט
        warning.scrollIntoView({ 
            behavior: 'smooth', // גלילה חלקה
            block: 'center'      // מרכז את ההודעה במסך
        });
        
        console.warn('⚠️ Warning:', message);
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    if (alert) {
        alert.querySelector('.alert-text').textContent = message;
        alert.classList.remove('hidden');
        console.log('✅ Success:', message);
    }
}

console.log('✅ login.js loaded successfully');