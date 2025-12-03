// Hero section carousel functionality with touch support
(function() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const heroSection = document.getElementById('hero');
    
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    
    function showSlide(index) {
        // Wrap around
        currentIndex = (index + slides.length) % slides.length;
        
        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === currentIndex) slide.classList.add('active');
        });
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === currentIndex) dot.classList.add('active');
        });
    }
    
    // Show first slide on load
    if (slides.length > 0) {
        showSlide(0);
    }
    
    // Arrow button click handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showSlide(currentIndex + 1);
        });
    }
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Touch support for mobile swipe
    if (heroSection) {
        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        heroSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        const threshold = 50; // minimum distance for swipe
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swiped left - next slide
                showSlide(currentIndex + 1);
            } else {
                // Swiped right - prev slide
                showSlide(currentIndex - 1);
            }
        }
    }
})();
