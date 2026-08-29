
class AtlasResponsiveSystem {
    constructor() {
        this.isMobileMenuOpen = false;
        this.lastScrollTop = 0;
        this.scrollThreshold = 100;
        this.animationObserver = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupTouchGestures();
        this.setupPerformanceOptimizations();
        this.setupAccessibility();
        this.setupBreakpointDetection();
    }

    /**
     * Configuration du menu mobile avancé avec sidebar
     */
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.mobile-sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        const sidebarClose = document.querySelector('.sidebar-close');
        const body = document.body;

        if (mobileToggle && sidebar && sidebarOverlay) {
            // Toggle du menu sidebar
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar(sidebar, sidebarOverlay, mobileToggle);
            });

            // Fermeture avec le bouton X
            if (sidebarClose) {
                sidebarClose.addEventListener('click', () => {
                    this.closeSidebar(sidebar, sidebarOverlay, mobileToggle);
                });
            }

            // Fermeture au clic sur l'overlay
            sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar(sidebar, sidebarOverlay, mobileToggle);
            });

            // Fermeture au clic sur un lien du sidebar
            const sidebarLinks = sidebar.querySelectorAll('.sidebar-link, .sidebar-btn');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', () => {
                    setTimeout(() => {
                        this.closeSidebar(sidebar, sidebarOverlay, mobileToggle);
                    }, 300);
                });
            });

            // Fermeture au scroll
            window.addEventListener('scroll', () => {
                if (this.isMobileMenuOpen) {
                    this.closeSidebar(sidebar, sidebarOverlay, mobileToggle);
                }
            });

            // Animation d'entrée des liens du sidebar
            this.setupSidebarAnimations(sidebar);
        }
    }

    /**
     * Toggle du sidebar mobile
     */
    toggleSidebar(sidebar, overlay, toggle) {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            this.openSidebar(sidebar, overlay, toggle);
        } else {
            this.closeSidebar(sidebar, overlay, toggle);
        }
    }

    /**
     * Ouverture du sidebar
     */
    openSidebar(sidebar, overlay, toggle) {
        // Ajouter les classes actives
        sidebar.classList.add('active');
        overlay.classList.add('active');
        toggle.classList.add('active');
        
        // Bloquer le scroll du body
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée des liens
        this.animateSidebarLinks(sidebar);
        
        // Focus sur le premier lien pour l'accessibilité
        const firstLink = sidebar.querySelector('.sidebar-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 400);
        }
    }

    /**
     * Fermeture du sidebar
     */
    closeSidebar(sidebar, overlay, toggle) {
        this.isMobileMenuOpen = false;
        
        // Supprimer les classes actives
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
        
        // Restaurer le scroll du body
        document.body.style.overflow = '';
        
        // Reset des animations
        this.resetSidebarAnimations(sidebar);
    }

    /**
     * Animation des liens du sidebar
     */
    animateSidebarLinks(sidebar) {
        const links = sidebar.querySelectorAll('.sidebar-link');
        links.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                link.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                link.style.opacity = '1';
                link.style.transform = 'translateX(0)';
            }, index * 80 + 200);
        });
    }

    /**
     * Reset des animations du sidebar
     */
    resetSidebarAnimations(sidebar) {
        const links = sidebar.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.style.transition = '';
            link.style.opacity = '';
            link.style.transform = '';
        });
    }

    /**
     * Configuration des animations du sidebar
     */
    setupSidebarAnimations(sidebar) {
        // Observer pour les animations au scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observer tous les éléments du sidebar
        const sidebarElements = sidebar.querySelectorAll('.sidebar-section, .sidebar-link');
        sidebarElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Effets de scroll avancés
     */
    setupScrollEffects() {
        const header = document.querySelector('.header');
        
        if (header) {
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Effet de scroll sur le header
                if (scrollTop > this.scrollThreshold) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                // Animation des éléments au scroll
                this.animateOnScroll();
                
                this.lastScrollTop = scrollTop;
            });
        }
    }

    /**
     * Animations au scroll avec Intersection Observer
     */
    setupAnimations() {
        const animatedElements = document.querySelectorAll('.animate-fade-in-up, .animate-fade-in-down, .animate-fade-in-left, .animate-fade-in-right, .animate-scale-in, .animate-slide-in-up');
        
        if (animatedElements.length > 0) {
            this.animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                        this.animationObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px) scale(0.95)';
                element.style.transition = 'all 0.6s ease-out';
                this.animationObserver.observe(element);
            });
        }
    }

    animateOnScroll() {
        const elements = document.querySelectorAll('.card, .btn, .nav-link');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
            }
        });
    }

    /**
     * Gestes tactiles avancés
     */
    setupTouchGestures() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = this.touchStartX - touchEndX;
            const diffY = this.touchStartY - touchEndY;
            
            // Swipe horizontal
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe gauche
                    this.handleSwipeLeft();
                } else {
                    // Swipe droite
                    this.handleSwipeRight();
                }
            }
            
            // Swipe vertical
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
                if (diffY > 0) {
                    // Swipe haut
                    this.handleSwipeUp();
                } else {
                    // Swipe bas
                    this.handleSwipeDown();
                }
            }
            
            this.touchStartX = 0;
            this.touchStartY = 0;
        });
    }

    handleSwipeLeft() {
        // Navigation vers la page suivante ou fermeture du menu mobile
        if (this.isMobileMenuOpen) {
            const mobileToggle = document.getElementById('mobileMenuToggle');
            const navActions = document.querySelector('.nav-actions');
            this.closeMobileMenu(mobileToggle, navActions);
        }
    }

    handleSwipeRight() {
        // Ouverture du menu mobile ou navigation vers la page précédente
        if (!this.isMobileMenuOpen && window.innerWidth <= 1023) {
            const mobileToggle = document.getElementById('mobileMenuToggle');
            const navActions = document.querySelector('.nav-actions');
            this.toggleMobileMenu(mobileToggle, navActions);
        }
    }

    handleSwipeUp() {
        // Scroll vers le haut ou action spécifique
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handleSwipeDown() {
        // Scroll vers le bas ou action spécifique
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }

    /**
     * Optimisations de performance
     */
    setupPerformanceOptimizations() {
        // Throttling du scroll
        let ticking = false;
        
        const throttleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttleScroll);

        // Lazy loading des images
        const images = document.querySelectorAll('img[data-src]');
        if (images.length > 0) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Debouncing des événements de redimensionnement
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleScroll() {
        // Optimisations spécifiques au scroll
        const header = document.querySelector('.header');
        if (header) {
            const scrollTop = window.pageYOffset;
            header.style.transform = `translateY(${Math.min(scrollTop * 0.5, 100)}px)`;
        }
    }

    handleResize() {
        // Gestion du redimensionnement de la fenêtre
        this.updateBreakpoint();
        this.adjustLayout();
    }

    /**
     * Accessibilité avancée
     */
    setupAccessibility() {
        // Navigation au clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                const mobileToggle = document.getElementById('mobileMenuToggle');
                const navActions = document.querySelector('.nav-actions');
                this.closeMobileMenu(mobileToggle, navActions);
            }
        });

        // Focus management
        const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--accent-primary)';
                element.style.outlineOffset = '2px';
            });

            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });

        // Support des préférences utilisateur
        this.setupUserPreferences();
    }

    setupUserPreferences() {
        // Réduction du mouvement
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-normal', '0.01s');
            document.documentElement.style.setProperty('--transition-slow', '0.01s');
        }

        // Mode contraste élevé
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.documentElement.classList.add('high-contrast');
        }

        // Mode sombre automatique
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark-mode');
        }
    }

    /**
     * Détection des breakpoints
     */
    setupBreakpointDetection() {
        this.updateBreakpoint();
        
        window.addEventListener('resize', () => {
            this.updateBreakpoint();
        });
    }

    updateBreakpoint() {
        const width = window.innerWidth;
        let breakpoint = 'desktop';
        
        if (width <= 374) breakpoint = 'mobile-xs';
        else if (width <= 479) breakpoint = 'mobile-sm';
        else if (width <= 767) breakpoint = 'mobile';
        else if (width <= 1023) breakpoint = 'tablet';
        else if (width <= 1279) breakpoint = 'desktop';
        else if (width <= 1439) breakpoint = 'desktop-lg';
        else if (width <= 1919) breakpoint = 'desktop-xl';
        else breakpoint = 'desktop-2xl';
        
        document.documentElement.setAttribute('data-breakpoint', breakpoint);
        this.currentBreakpoint = breakpoint;
    }

    adjustLayout() {
        // Ajustements spécifiques au breakpoint
        switch (this.currentBreakpoint) {
            case 'mobile-xs':
            case 'mobile-sm':
            case 'mobile':
                this.adjustMobileLayout();
                break;
            case 'tablet':
                this.adjustTabletLayout();
                break;
            case 'desktop':
            case 'desktop-lg':
            case 'desktop-xl':
            case 'desktop-2xl':
                this.adjustDesktopLayout();
                break;
        }
    }

    adjustMobileLayout() {
        // Optimisations spécifiques au mobile
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.marginBottom = '1rem';
        });
    }

    adjustTabletLayout() {
        // Optimisations spécifiques à la tablette
        const grids = document.querySelectorAll('.grid');
        grids.forEach(grid => {
            grid.style.gap = '1.5rem';
        });
    }

    adjustDesktopLayout() {
        // Optimisations spécifiques au desktop
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.style.maxWidth = 'var(--container-desktop)';
        });
    }

    /**
     * Utilitaires publics
     */
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }

    isMobile() {
        return ['mobile-xs', 'mobile-sm', 'mobile'].includes(this.currentBreakpoint);
    }

    isTablet() {
        return this.currentBreakpoint === 'tablet';
    }

    isDesktop() {
        return ['desktop', 'desktop-lg', 'desktop-xl', 'desktop-2xl'].includes(this.currentBreakpoint);
    }

    // Méthode pour forcer la fermeture du menu mobile
    forceCloseMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.mobile-sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (mobileToggle && sidebar && sidebarOverlay) {
            this.closeSidebar(sidebar, sidebarOverlay, mobileToggle);
        }
    }

    // Méthode pour ajouter des animations personnalisées
    addCustomAnimation(element, animationClass, delay = 0) {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, delay);
    }

    // Méthode pour détecter l'orientation
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    // Méthode pour détecter si l'appareil supporte le tactile
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}

// Initialisation du système responsive
document.addEventListener('DOMContentLoaded', () => {
    window.atlasResponsive = new AtlasResponsiveSystem();
    
    // Exposer les méthodes utiles globalement
    window.closeMobileMenu = () => window.atlasResponsive.forceCloseMobileMenu();
    window.getBreakpoint = () => window.atlasResponsive.getCurrentBreakpoint();
    window.isMobile = () => window.atlasResponsive.isMobile();
    window.isTablet = () => window.atlasResponsive.isTablet();
    window.isDesktop = () => window.atlasResponsive.isDesktop();
});

// Support pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AtlasResponsiveSystem;
}
