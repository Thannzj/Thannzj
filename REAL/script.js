// Theme toggle - light/dark mode with localStorage persistence
(function() {
    const storageKey = 'mm-theme-preference';
    let body = document.body;
    let modeToggle = document.getElementById('mode-toggle');
    
    // Fallback if body not yet available
    if (!body && document.documentElement) {
        body = document.documentElement;
    }
    
    // Get user's preferred theme or default to light
    function getTheme() {
        // Check localStorage first
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved && (saved === 'light-mode' || saved === 'dark-mode')) {
                return saved;
            }
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark-mode';
        }
        
        // Default to light
        return 'light-mode';
    }
    
    // Apply theme immediately to prevent FOUC (Flash of Unstyled Content)
    function applyTheme(theme) {
        if (!body) return;
        
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(theme);
        
        // Update button icon and label
        const btn = modeToggle || document.getElementById('mode-toggle');
        if (btn) {
            btn.textContent = theme === 'dark-mode' ? '🌙' : '☀️';
            btn.setAttribute('aria-label', 
                theme === 'dark-mode' 
                    ? 'Switch to light mode (currently dark)' 
                    : 'Switch to dark mode (currently light)'
            );
        }
        
        // Save preference
        try {
            localStorage.setItem(storageKey, theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    }
    
    // Apply saved/preferred theme on page load (immediately, before other scripts)
    const initialTheme = getTheme();
    applyTheme(initialTheme);
    
    // Setup toggle button - wait for DOM if needed
    function setupToggleButton() {
        const btn = modeToggle || document.getElementById('mode-toggle');
        if (!btn) {
            // Try again after a small delay if button not found
            setTimeout(setupToggleButton, 100);
            return;
        }
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
            const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
            applyTheme(newTheme);
        });
        
        modeToggle = btn;
    }
    
    // Try to setup immediately, or on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupToggleButton);
    } else {
        setupToggleButton();
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
        try {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only apply system preference if user hasn't manually saved a preference
                try {
                    if (!localStorage.getItem(storageKey)) {
                        const newTheme = e.matches ? 'dark-mode' : 'light-mode';
                        applyTheme(newTheme);
                    }
                } catch (e) {
                    console.warn('Error handling system theme change:', e);
                }
            });
        } catch (e) {
            console.warn('matchMedia not fully supported:', e);
        }
    }
})();
