
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // 1. ÉLÉMENTS DU DOM
    // ========================================
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenuContent = document.querySelector('.mobile-menu-content');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    const navActions = document.querySelector('.nav-actions');
    const header = document.querySelector('.header');
    const body = document.body;
    
    // ========================================
    // 2. TOGGLE DU MENU MOBILE AVANCÉ
    // ========================================
    
    function openMobileMenu() {
        if (mobileMenuToggle && mobileMenuOverlay) {
            // Activer le bouton hamburger
            mobileMenuToggle.classList.add('active');
            
            // Activer l'overlay et le contenu
            mobileMenuOverlay.classList.add('active');
            
            // Bloquer le scroll du body
            body.classList.add('menu-open');
            body.style.overflow = 'hidden';
            
            // Animation du bouton hamburger
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[1].style.transform = 'scale(0)';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            
            // Focus sur le premier lien pour l'accessibilité
            setTimeout(() => {
                if (mobileMenuLinks.length > 0) {
                    mobileMenuLinks[0].focus();
                }
            }, 300);
        }
    }
    
    function closeMobileMenu() {
        if (mobileMenuToggle && mobileMenuOverlay) {
            // Désactiver le bouton hamburger
            mobileMenuToggle.classList.remove('active');
            
            // Désactiver l'overlay et le contenu
            mobileMenuOverlay.classList.remove('active');
            
            // Restaurer le scroll du body
            body.classList.remove('menu-open');
            body.style.overflow = '';
            
            // Reset des animations du bouton hamburger
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[1].style.transform = 'none';
            spans[2].style.transform = 'none';
        }
    }
    
    // Event listeners pour le toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (mobileMenuOverlay.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    // Event listener pour le bouton de fermeture
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
    }
    
    // ========================================
    // 3. FERMETURE DU MENU AU CLIC EXTÉRIEUR
    // ========================================
    
    document.addEventListener('click', function(event) {
        if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
            const isClickInsideMenu = mobileMenuContent && mobileMenuContent.contains(event.target);
            const isClickOnToggle = mobileMenuToggle && mobileMenuToggle.contains(event.target);
            const isClickOnOverlay = mobileMenuOverlay.contains(event.target) && !mobileMenuContent.contains(event.target);
            
            if (isClickOnOverlay || (!isClickInsideMenu && !isClickOnToggle)) {
                closeMobileMenu();
            }
        }
    });
    
    // ========================================
    // 4. FERMETURE DU MENU AU REDIMENSIONNEMENT
    // ========================================
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 1023) {
                closeMobileMenu();
            }
        }, 250);
    });
    
    // ========================================
    // 5. FERMETURE DU MENU AU SCROLL
    // ========================================
    
    let scrollTimer;
    window.addEventListener('scroll', function() {
        if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                closeMobileMenu();
            }, 100);
        }
    });
    
    // ========================================
    // 6. FERMETURE DU MENU AU CLIC SUR LES LIENS
    // ========================================
    
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // ========================================
    // 7. NAVIGATION CLAVIER AVANCÉE
    // ========================================
    
    document.addEventListener('keydown', function(e) {
        // Échap pour fermer le menu mobile
        if (e.key === 'Escape' && mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
            closeMobileMenu();
        }
        
        // Navigation au clavier dans le menu mobile
        if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
            const focusableElements = mobileMenuContent.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                focusableElements[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
                focusableElements[prevIndex].focus();
            } else if (e.key === 'Home') {
                e.preventDefault();
                focusableElements[0].focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        }
    });
    
    // ========================================
    // 8. SCROLL SMOOTH POUR LES LIENS ANCRES
    // ========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                // Fermer le menu mobile si ouvert
                closeMobileMenu();
                
                // Scroll smooth vers la cible
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // 9. LAZY LOADING POUR LES IMAGES
    // ========================================
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // ========================================
    // 10. INTERACTIONS TACTILES AMÉLIORÉES
    // ========================================
    
    // Détection du support tactile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Ajouter des classes pour les appareils tactiles
        body.classList.add('touch-device');
        
        // Améliorer les interactions tactiles
        document.querySelectorAll('.btn, .nav-link, .card').forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // Prévenir le zoom sur les inputs
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('focus', function() {
                this.style.fontSize = '16px'; // Prévenir le zoom sur iOS
            });
        });
    }
    
    // ========================================
    // 11. GESTION DES ORIENTATIONS
    // ========================================
    
    function handleOrientation() {
        if (window.innerWidth <= 768) {
            if (window.orientation === 90 || window.orientation === -90) {
                // Mode paysage
                body.classList.add('landscape');
                body.classList.remove('portrait');
            } else {
                // Mode portrait
                body.classList.add('portrait');
                body.classList.remove('landscape');
            }
        }
    }
    
    // Écouter les changements d'orientation
    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);
    
    // Initialiser l'orientation
    handleOrientation();
    
    // ========================================
    // 12. PERFORMANCE ET OPTIMISATIONS
    // ========================================
    
    // Debounce pour les événements de scroll et resize
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Optimiser les événements de scroll
    const optimizedScrollHandler = debounce(function() {
        // Code de scroll optimisé ici
    }, 16); // ~60fps
    
    window.addEventListener('scroll', optimizedScrollHandler);
    
    // ========================================
    // 13. ACCESSIBILITÉ
    // ========================================
    
    // Support des raccourcis clavier
    document.addEventListener('keydown', function(e) {
        // Échap pour fermer le menu mobile
        if (e.key === 'Escape' && navActions && navActions.classList.contains('mobile-menu-open')) {
            closeMobileMenu();
        }
        
        // Entrée et Espace pour les boutons
        if (e.key === 'Enter' || e.key === ' ') {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'A')) {
                e.preventDefault();
                activeElement.click();
            }
        }
    });
    
    // Améliorer la navigation au clavier
    if (navActions) {
        const focusableElements = navActions.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (index === 0) {
                            e.preventDefault();
                            focusableElements[focusableElements.length - 1].focus();
                        }
                    } else {
                        // Tab seul
                        if (index === focusableElements.length - 1) {
                            e.preventDefault();
                            focusableElements[0].focus();
                        }
                    }
                }
            });
        });
    }
    
    // ========================================
    // 14. INITIALISATION FINALE
    // ========================================
    
    // Ajouter des classes d'initialisation
    body.classList.add('js-loaded');
    
    // Animation d'entrée pour le contenu
    setTimeout(() => {
        document.querySelectorAll('.fade-in-mobile').forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }, 100);
    
    // ========================================
    // 15. EFFET DE SCROLL SUR LE HEADER
    // ========================================
    
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (header) {
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Header qui se cache au scroll vers le bas (seulement si le menu n'est pas ouvert)
            if (!mobileMenuOverlay || !mobileMenuOverlay.classList.contains('active')) {
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollTop = scrollTop;
        }
    });
    
    // ========================================
    // 16. GESTION DES ORIENTATIONS
    // ========================================
    
    function handleOrientation() {
        if (window.innerWidth <= 1023) {
            if (window.orientation === 90 || window.orientation === -90) {
                // Mode paysage
                body.classList.add('landscape');
                body.classList.remove('portrait');
            } else {
                // Mode portrait
                body.classList.add('portrait');
                body.classList.remove('landscape');
            }
        }
    }
    
    // Écouter les changements d'orientation
    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);
    
    // Initialiser l'orientation
    handleOrientation();
    
    // ========================================
    // 17. PERFORMANCE ET OPTIMISATIONS
    // ========================================
    
    // Debounce pour les événements de scroll et resize
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Optimiser les événements de scroll
    const optimizedScrollHandler = debounce(function() {
        // Code de scroll optimisé ici
    }, 16); // ~60fps
    
    window.addEventListener('scroll', optimizedScrollHandler);
    
    // ========================================
    // 18. INTERACTIONS TACTILES AMÉLIORÉES
    // ========================================
    
    // Détection du support tactile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Ajouter des classes pour les appareils tactiles
        body.classList.add('touch-device');
        
        // Améliorer les interactions tactiles
        document.querySelectorAll('.btn, .nav-link, .card, .mobile-menu-link').forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // Prévenir le zoom sur les inputs
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('focus', function() {
                this.style.fontSize = '16px'; // Prévenir le zoom sur iOS
            });
        });
    }
    
    // ========================================
    // 19. INITIALISATION FINALE
    // ========================================
    
    // Ajouter des classes d'initialisation
    body.classList.add('js-loaded');
    
    // Animation d'entrée pour le contenu
    setTimeout(() => {
        document.querySelectorAll('.fade-in-mobile').forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }, 100);
    
    // ========================================
    // 20. DEBUG ET LOGS
    // ========================================
    
    console.log('🚀 Mobile Menu JS avancé chargé avec succès !');
    console.log('📱 Support tactile:', isTouchDevice);
    console.log('🖥️ Largeur d\'écran:', window.innerWidth);
    console.log('📐 Orientation:', window.orientation || 'auto');
    
    // Exposer les fonctions globalement pour le debug
    window.AtlasForecast = {
        openMobileMenu,
        closeMobileMenu,
        isTouchDevice
    };
});

/* ========================================
   FIN DU FICHIER MOBILE-MENU.JS AVANCÉ
   ======================================== */

