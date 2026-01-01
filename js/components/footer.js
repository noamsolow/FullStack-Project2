/**
 * footer.js
 * Reusable footer component for all pages
 * Automatically creates and manages the footer
 */

// Create footer element
function createFooter() {
    // Check if footer already exists to prevent duplicates
    if (document.querySelector('footer.footer')) {
        console.log('Footer already exists, skipping creation');
        return;
    }
    
    // Create footer HTML
    const footerHTML = `
        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 Game Hub. Created by Noam Solow & Yovel Yehoshua</p>
            </div>
        </footer>
    `;

    // Insert footer at the end of body
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    console.log('✅ Footer created');
}

// Auto-initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other components are loaded first
    setTimeout(() => {
        createFooter();
    }, 10);
});
