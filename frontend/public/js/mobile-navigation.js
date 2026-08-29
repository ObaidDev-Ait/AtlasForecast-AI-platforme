
class MobileNavigation {
    constructor() {
        this.isInitialized = false;
        this.isMenuOpen = false;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.currentPage = this.getCurrentPage();
        
        // Éléments DOM
        this.elements = {
            toggle: null,
            overlay: null,
            content: null,
            close: null,
            links: null,
            header: null,
            body: null
        };
        
        // Configuration
        this.config = {
            breakpoint: 1023,
            animationDuration: 300,
            enableKeyboardNav: true,
            enableTouchGestures: true,
            autoCloseOnScroll: true,
            autoCloseOnResize: true,
            enableSmoothScroll: true
        };
        
        // Timers pour debouncing
        this.timers = {
            resize: null,
            scroll: null
        };
        
        this.init();
    }
    
    // ========================================
    // INITIALISATION
    // ========================================
    
    init() {
        if (this.isInitialized) return;
        
        this.cacheElements();
        this.bindEvents();
        this.setupAccessibility();
        this.setupTouchGestures();
        this.setupKeyboardNavigation();
        this.setupScrollEffects();
        this.setupOrientationHandling();
        
        this.isInitialized = true;
        this.log('🚀 Mobile Navigation initialisé avec succès');
    }
    
    // ========================================
    // CACHE DES ÉLÉMENTS DOM
    // ========================================
    
    cacheElements() {
        this.elements.toggle = document.querySelector('.mobile-menu-toggle');
        this.elements.overlay = document.querySelector('.mobile-menu-overlay');
        this.elements.content = document.querySelector('.mobile-menu-content');
        this.elements.close = document.querySelector('.mobile-menu-close');
        this.elements.links = document.querySelectorAll('.mobile-menu-link');
        this.elements.header = document.querySelector('.header');
        this.elements.body = document.body;
        
        // Vérifier que tous les éléments essentiels existent
        if (!this.elements.toggle || !this.elements.overlay || !this.elements.content) {
            this.log('❌ Éléments DOM manquants pour le menu mobile', 'error');
            return;
        }
        
        this.log('✅ Éléments DOM mis en cache');
    }
    
    // ========================================
    // GESTION DES ÉVÉNEMENTS
    // ========================================
    
    bindEvents() {
        // Toggle du menu
        if (this.elements.toggle) {
            this.elements.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        
        // Fermeture du menu
        if (this.elements.close) {
            this.elements.close.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeMenu();
            });
        }
        
        // Fermeture au clic extérieur
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', (e) => {
                if (e.target === this.elements.overlay) {
                    this.closeMenu();
                }
            });
        }
        
        // Fermeture au clic sur les liens
        this.elements.links.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });
        
        // Redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Scroll de la page
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // Changement d'orientation
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        this.log('✅ Événements liés');
    }
    
    // ========================================
    // GESTION DU MENU
    // ========================================
    
    openMenu() {
        if (this.isMenuOpen) return;
        
        this.isMenuOpen = true;
        
        // Ajouter les classes actives
        this.elements.toggle.classList.add('active');
        this.elements.overlay.classList.add('active');
        this.elements.body.classList.add('menu-open');
        
        // Bloquer le scroll du body
        this.elements.body.style.overflow = 'hidden';
        
        // Animation du bouton hamburger
        this.animateHamburger(true);
        
        // Focus sur le premier lien pour l'accessibilité
        setTimeout(() => {
            if (this.elements.links.length > 0) {
                this.elements.links[0].focus();
            }
        }, this.config.animationDuration);
        
        // Émettre un événement personnalisé
        this.emitEvent('menuOpened');
        
        this.log('📱 Menu mobile ouvert');
    }
    
    closeMenu() {
        if (!this.isMenuOpen) return;
        
        this.isMenuOpen = false;
        
        // Retirer les classes actives
        this.elements.toggle.classList.remove('active');
        this.elements.overlay.classList.remove('active');
        this.elements.body.classList.remove('menu-open');
        
        // Restaurer le scroll du body
        this.elements.body.style.overflow = '';
        
        // Animation du bouton hamburger
        this.animateHamburger(false);
        
        // Émettre un événement personnalisé
        this.emitEvent('menuClosed');
        
        this.log('📱 Menu mobile fermé');
    }
    
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    // ========================================
    // ANIMATIONS
    // ========================================
    
    animateHamburger(isOpen) {
        const spans = this.elements.toggle.querySelectorAll('span');
        
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[1].style.transform = 'scale(0)';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[1].style.transform = 'none';
            spans[2].style.transform = 'none';
        }
    }
    
    // ========================================
    // ACCESSIBILITÉ
    // ========================================
    
    setupAccessibility() {
        // Ajouter les attributs ARIA
        if (this.elements.toggle) {
            this.elements.toggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
            this.elements.toggle.setAttribute('aria-expanded', 'false');
            this.elements.toggle.setAttribute('aria-controls', 'mobile-menu-content');
        }
        
        if (this.elements.close) {
            this.elements.close.setAttribute('aria-label', 'Fermer le menu');
        }
        
        if (this.elements.content) {
            this.elements.content.setAttribute('id', 'mobile-menu-content');
            this.elements.content.setAttribute('aria-hidden', 'true');
        }
        
        this.log('✅ Accessibilité configurée');
    }
    
    updateAriaAttributes() {
        if (this.elements.toggle) {
            this.elements.toggle.setAttribute('aria-expanded', this.isMenuOpen.toString());
        }
        
        if (this.elements.content) {
            this.elements.content.setAttribute('aria-hidden', (!this.isMenuOpen).toString());
        }
    }
    
    // ========================================
    // NAVIGATION CLAVIER
    // ========================================
    
    setupKeyboardNavigation() {
        if (!this.config.enableKeyboardNav) return;
        
        document.addEventListener('keydown', (e) => {
            // Échap pour fermer le menu
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
                return;
            }
            
            // Navigation dans le menu mobile
            if (this.isMenuOpen && this.elements.content) {
                this.handleKeyboardNavigation(e);
            }
        });
        
        this.log('✅ Navigation clavier configurée');
    }
    
    handleKeyboardNavigation(e) {
        const focusableElements = this.elements.content.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                focusableElements[nextIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
                focusableElements[prevIndex].focus();
                break;
                
            case 'Home':
                e.preventDefault();
                focusableElements[0].focus();
                break;
                
            case 'End':
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
                break;
        }
    }
    
    // ========================================
    // GESTES TACTILES
    // ========================================
    
    setupTouchGestures() {
        if (!this.config.enableTouchGestures || !this.isTouchDevice) return;
        
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        // Détecter le début du geste
        document.addEventListener('touchstart', (e) => {
            if (this.isMenuOpen) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
            }
        }, { passive: true });
        
        // Détecter le mouvement
        document.addEventListener('touchmove', (e) => {
            if (!isDragging || !this.isMenuOpen) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Si le mouvement horizontal est plus important que le vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                // Balayage vers la droite pour fermer le menu
                if (deltaX > 0) {
                    this.closeMenu();
                    isDragging = false;
                }
            }
        }, { passive: true });
        
        // Fin du geste
        document.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });
        
        this.log('✅ Gestes tactiles configurés');
    }
    
    // ========================================
    // EFFETS DE SCROLL
    // ========================================
    
    setupScrollEffects() {
        if (!this.elements.header) return;
        
        let lastScrollTop = 0;
        let ticking = false;
        
        const updateHeader = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Ajouter/supprimer la classe scrolled
            if (scrollTop > 100) {
                this.elements.header.classList.add('scrolled');
            } else {
                this.elements.header.classList.remove('scrolled');
            }
            
            // Masquer/afficher le header au scroll (seulement si le menu n'est pas ouvert)
            if (!this.isMenuOpen) {
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    this.elements.header.style.transform = 'translateY(-100%)';
                } else {
                    this.elements.header.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollTop = scrollTop;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
        
        this.log('✅ Effets de scroll configurés');
    }
    
    // ========================================
    // GESTION DES ÉVÉNEMENTS
    // ========================================
    
    handleResize() {
        if (this.timers.resize) {
            clearTimeout(this.timers.resize);
        }
        
        this.timers.resize = setTimeout(() => {
            if (window.innerWidth > this.config.breakpoint) {
                this.closeMenu();
            }
            
            this.updateAriaAttributes();
        }, 250);
    }
    
    handleScroll() {
        if (!this.config.autoCloseOnScroll || !this.isMenuOpen) return;
        
        if (this.timers.scroll) {
            clearTimeout(this.timers.scroll);
        }
        
        this.timers.scroll = setTimeout(() => {
            this.closeMenu();
        }, 100);
    }
    
    handleOrientationChange() {
        setTimeout(() => {
            if (window.innerWidth > this.config.breakpoint) {
                this.closeMenu();
            }
            
            this.updateAriaAttributes();
        }, 500);
    }
    
    setupOrientationHandling() {
        // Détecter l'orientation initiale
        this.detectOrientation();
        
        // Écouter les changements d'orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectOrientation();
            }, 100);
        });
        
        this.log('✅ Gestion de l\'orientation configurée');
    }
    
    detectOrientation() {
        if (window.innerWidth <= this.config.breakpoint) {
            if (window.orientation === 90 || window.orientation === -90) {
                this.elements.body.classList.add('landscape');
                this.elements.body.classList.remove('portrait');
            } else {
                this.elements.body.classList.add('portrait');
                this.elements.body.classList.remove('landscape');
            }
        }
    }
    
    // ========================================
    // UTILITAIRES
    // ========================================
    
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }
    
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(`mobileMenu:${eventName}`, {
            detail: {
                isOpen: this.isMenuOpen,
                currentPage: this.currentPage,
                ...detail
            }
        });
        
        document.dispatchEvent(event);
    }
    
    log(message, level = 'info') {
        if (typeof console !== 'undefined') {
            const prefix = '🍔 Mobile Navigation:';
            
            switch (level) {
                case 'error':
                    console.error(prefix, message);
                    break;
                case 'warn':
                    console.warn(prefix, message);
                    break;
                default:
                    console.log(prefix, message);
            }
        }
    }
    
    // ========================================
    // API PUBLIQUE
    // ========================================
    
    // Méthodes publiques pour contrôler le menu
    open() {
        this.openMenu();
    }
    
    close() {
        this.closeMenu();
    }
    
    toggle() {
        this.toggleMenu();
    }
    
    isOpen() {
        return this.isMenuOpen;
    }
    
    // Configuration dynamique
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('⚙️ Configuration mise à jour');
    }
    
    // Destruction de l'instance
    destroy() {
        this.closeMenu();
        
        // Nettoyer les événements
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        
        this.isInitialized = false;
        this.log('🗑️ Instance détruite');
    }
}

// ========================================
// INITIALISATION AUTOMATIQUE
// ========================================

// Initialiser le menu mobile quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // Créer l'instance globale
    window.AtlasForecastMobileNav = new MobileNavigation();
    
    // Exposer l'API globalement
    window.AtlasForecast = {
        ...window.AtlasForecast,
        mobileNav: window.AtlasForecastMobileNav,
        openMobileMenu: () => window.AtlasForecastMobileNav.open(),
        closeMobileMenu: () => window.AtlasForecastMobileNav.close(),
        toggleMobileMenu: () => window.AtlasForecastMobileNav.toggle(),
        isMobileMenuOpen: () => window.AtlasForecastMobileNav.isOpen()
    };
    
    console.log('🚀 AtlasForecast Mobile Navigation chargé !');
});

// ========================================
// SUPPORT DES NAVIGATEURS ANCIENS
// ========================================

// Polyfill pour requestAnimationFrame
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 16);
    };
}

// Polyfill pour CustomEvent
if (typeof window.CustomEvent !== 'function') {
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
}

/* ========================================
   FIN DU MENU HAMBURGER PROFESSIONNEL
   ======================================== */
