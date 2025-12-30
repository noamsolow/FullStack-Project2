/**
 * footer.js
 * Reusable footer component for all pages
 * Automatically creates and manages the footer
 */

/**
 * Create and inject footer into the page
 */
function createFooter() {
    // Check if footer already exists to prevent duplicates
    if (document.querySelector('footer.footer')) {
        console.log('⚠️ Footer already exists, skipping creation');
        return;
    }

    // Check if this is an auth page (login/register)
    const isAuthPage = document.body.classList.contains('auth-page');
    
    // Create footer HTML with appropriate class
    const footerHTML = `
        <footer class="footer${isAuthPage ? ' auth-footer-component' : ''}">
            <div class="container">
                <p>&copy; 2024 Game Hub. Created by Noam Solow & Yovel Yehoshua</p>
            </div>
        </footer>
    `;

    // For auth pages, append after the auth-container
    if (isAuthPage) {
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.insertAdjacentHTML('afterend', footerHTML);
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    } else {
        // Insert footer at the end of body for regular pages
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    console.log('✅ Footer created');
}

// Auto-initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other components are loaded first
    setTimeout(() => {
        createFooter();
    }, 10);
});
