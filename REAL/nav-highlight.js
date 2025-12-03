// Navigation section highlighting based on scroll position
(function() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = [
        { id: 'biodiversity', link: 'biodiversity' },
        { id: 'species', link: 'species' },
        { id: 'ecosystems', link: 'ecosystems' },
        { id: 'conservation', link: 'conservation' }
    ];

    function updateActiveLink() {
        let current = '';
        
        // Determine which section is currently in view
        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                const rect = element.getBoundingClientRect();
                // Section is in view if it's in the top half of the viewport
                if (rect.top <= window.innerHeight / 2) {
                    current = section.link;
                }
            }
        });
        
        // Update active state on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }

    // Update on scroll
    window.addEventListener('scroll', updateActiveLink);
    
    // Update on page load
    updateActiveLink();

    // Update when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(updateActiveLink, 100);
        });
    });
})();
