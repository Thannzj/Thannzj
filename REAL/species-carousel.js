// Species carousel functionality (animals and plants) - fully mobile optimized
(function() {
    const carousels = {
        animals: {
            container: document.getElementById('animals-carousel'),
            track: null,
            currentIndex: 0,
            itemsPerView: 3,
            items: null,
            touchStartX: 0,
            touchEndX: 0,
            isDragging: false
        },
        plants: {
            container: document.getElementById('plants-carousel'),
            track: null,
            currentIndex: 0,
            itemsPerView: 3,
            items: null,
            touchStartX: 0,
            touchEndX: 0,
            isDragging: false
        }
    };

    // Get responsive settings based on viewport width
    function getResponsiveSettings() {
        const width = window.innerWidth;
        if (width <= 480) {
            return { itemsPerView: 1, gap: 12, padding: 12 };
        } else if (width <= 768) {
            return { itemsPerView: 1.5, gap: 15, padding: 15 };
        } else if (width <= 1024) {
            return { itemsPerView: 2, gap: 20, padding: 20 };
        } else {
            return { itemsPerView: 3, gap: 20, padding: 20 };
        }
    }

    // Calculate item width based on container and settings
    function getItemWidth(carouselKey) {
        const carousel = carousels[carouselKey];
        const settings = getResponsiveSettings();
        
        if (!carousel.container) return 0;
        
        const containerWidth = carousel.container.offsetWidth;
        const totalGap = (settings.itemsPerView - 1) * settings.gap;
        const itemWidth = (containerWidth - totalGap) / settings.itemsPerView;
        
        return Math.max(itemWidth, 100); // Minimum 100px width
    }

    // Initialize carousels
    Object.keys(carousels).forEach(key => {
        const carousel = carousels[key];
        if (carousel.container) {
            carousel.track = carousel.container.querySelector('.carousel-track-species');
            carousel.items = Array.from(carousel.track.querySelectorAll('figure'));
            
            // Set up touch listeners
            setupTouchListeners(key);
        }
    });

    function updateCarouselPosition(carouselKey, smooth = true) {
        const carousel = carousels[carouselKey];
        if (!carousel.track || !carousel.items.length) return;
        
        const settings = getResponsiveSettings();
        carousel.itemsPerView = settings.itemsPerView;
        
        const itemWidth = getItemWidth(carouselKey);
        const offset = -carousel.currentIndex * (itemWidth + settings.gap);
        
        carousel.track.style.transition = smooth ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none';
        carousel.track.style.transform = `translateX(${offset}px)`;
    }

    function navigateCarousel(carouselKey, direction) {
        const carousel = carousels[carouselKey];
        if (!carousel.items || carousel.isDragging) return;
        
        const settings = getResponsiveSettings();
        const maxIndex = Math.max(0, carousel.items.length - Math.ceil(settings.itemsPerView));
        
        if (direction === 'next') {
            carousel.currentIndex = Math.min(carousel.currentIndex + 1, maxIndex);
        } else if (direction === 'prev') {
            carousel.currentIndex = Math.max(carousel.currentIndex - 1, 0);
        }
        
        updateCarouselPosition(carouselKey, true);
    }

    // Touch and swipe support for mobile
    function setupTouchListeners(carouselKey) {
        const carousel = carousels[carouselKey];
        const track = carousel.track;
        
        if (!track) return;
        
        track.addEventListener('touchstart', (e) => {
            carousel.touchStartX = e.touches[0].clientX;
            carousel.isDragging = true;
            track.style.transition = 'none'; // Disable transition during drag
        }, { passive: true });
        
        track.addEventListener('touchmove', (e) => {
            if (!carousel.isDragging) return;
            carousel.touchEndX = e.touches[0].clientX;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            carousel.isDragging = false;
            handleSwipe(carouselKey);
        }, { passive: true });
        
        // Mouse drag support for desktop/tablet testing
        track.addEventListener('mousedown', (e) => {
            carousel.touchStartX = e.clientX;
            carousel.isDragging = true;
            track.style.transition = 'none';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (carousel.isDragging && carousels[carouselKey].isDragging) {
                carousel.touchEndX = e.clientX;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (carousel.isDragging) {
                carousel.isDragging = false;
                handleSwipe(carouselKey);
            }
        });
    }

    function handleSwipe(carouselKey) {
        const carousel = carousels[carouselKey];
        const diff = carousel.touchStartX - carousel.touchEndX;
        const threshold = 30; // Minimum distance for swipe (pixels)
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swiped left - next slide
                navigateCarousel(carouselKey, 'next');
            } else {
                // Swiped right - prev slide
                navigateCarousel(carouselKey, 'prev');
            }
        } else {
            // Swipe too small, snap back to current position
            updateCarouselPosition(carouselKey, true);
        }
        
        // Reset touch values
        carousel.touchStartX = 0;
        carousel.touchEndX = 0;
    }

    // Attach button listeners
    document.querySelectorAll('.carousel-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const carouselKey = btn.dataset.carousel;
            const direction = btn.classList.contains('next') ? 'next' : 'prev';
            navigateCarousel(carouselKey, direction);
        });
    });

    // Handle window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Update carousel positions on resize
            updateCarouselPosition('animals', false);
            updateCarouselPosition('plants', false);
        }, 300);
    });

    // Handle orientation change (mobile)
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            updateCarouselPosition('animals', false);
            updateCarouselPosition('plants', false);
        }, 100);
    });

    // Initialize carousel positions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                updateCarouselPosition('animals', false);
                updateCarouselPosition('plants', false);
            }, 50);
        });
    } else {
        setTimeout(() => {
            updateCarouselPosition('animals', false);
            updateCarouselPosition('plants', false);
        }, 50);
    }
})();
