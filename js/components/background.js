/**
 * background.js
 * Creates the animated emoji background for all pages
 * Just include this script at the end of the body to add the background
 */

/**
 * Create and inject the animated background
 */
function createBackground() {
    // Check if background already exists
    if (document.querySelector('.bg-animation')) {
        return;
    }

    const bgHTML = `
        <div class="bg-animation">
            <div class="shape shape-1">🎮</div>
            <div class="shape shape-2">🎯</div>
            <div class="shape shape-3">🏆</div>
            <div class="shape shape-4">⭐</div>
            <div class="shape shape-5">🎲</div>
            <div class="shape shape-6">🎪</div>
        </div>
    `;

    // Insert at the end of body
    document.body.insertAdjacentHTML('beforeend', bgHTML);
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', createBackground);

// Also try to create immediately in case DOM is already loaded
if (document.readyState !== 'loading') {
    createBackground();
}
