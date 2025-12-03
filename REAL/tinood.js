document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('mode-toggle');
    const body = document.body;
    
    // Key for local storage
    const storageKey = 'malindang-theme-mode';

    /**
     * Applies the stored theme preference on page load.
     */
    function loadTheme() {
        const storedMode = localStorage.getItem(storageKey);
        if (storedMode === 'dark') {
            body.classList.add('dark-mode');
        } else {
            // Default to light mode if nothing is stored or it's 'light'
            body.classList.remove('dark-mode');
        }
    }

    /**
     * Toggles the theme and saves the preference to local storage.
     */
    function toggleMode() {
        // Toggle the class on the body element
        body.classList.toggle('dark-mode');
        
        // Check current mode after toggling
        if (body.classList.contains('dark-mode')) {
            // Save the dark mode preference
            localStorage.setItem(storageKey, 'dark');
        } else {
            // Save the light mode preference
            localStorage.setItem(storageKey, 'light');
        }
    }

    // 1. Load the theme preference when the page loads
    loadTheme();

    // 2. Attach the event listener to the toggle button
    toggleButton.addEventListener('click', toggleMode);
});