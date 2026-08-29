
// Liste de toutes les pages HTML du site
const PAGES = [
    'index.html',
    'weather.html', 
    'forecast.html',
    'alerts.html',
    'about.html',
    'contact.html',
    'login.html',
    'register.html',
    'profile.html',
    'settings.html',
    'premium.html',
    'premium-signup.html',
    'auth-google.html',
    'auth-facebook.html',
    'auth-x.html',
    'privacy.html',
    'forgot.html',
    'checkout.html'
];

// Template de navigation hamburger
const NAVIGATION_TEMPLATE = `<!-- Header et Navigation -->
<header class="header">
    <nav class="navbar">
        <div class="nav-container">
            <!-- Logo et Brand -->
            <a href="index.html" class="nav-brand">
                <div class="brand-icon">
                    <i class="fas fa-mountain"></i>
                </div>
                <span class="brand-text">AtlasForecast</span>
            </a>
            
            <!-- Menu Desktop -->
            <div class="nav-menu">
                <a href="index.html" class="nav-link">
                    <i class="fas fa-home"></i>
                    <span>Accueil</span>
                </a>
                <a href="weather.html" class="nav-link">
                    <i class="fas fa-cloud-sun"></i>
                    <span>Météo</span>
                </a>
                <a href="forecast.html" class="nav-link">
                    <i class="fas fa-chart-line"></i>
                    <span>Prévisions</span>
                </a>
                <a href="alerts.html" class="nav-link">
                    <i class="fas fa-bell"></i>
                    <span>Alertes</span>
                </a>
                <a href="about.html" class="nav-link">
                    <i class="fas fa-info-circle"></i>
                    <span>À propos</span>
                </a>
                <a href="contact.html" class="nav-link">
                    <i class="fas fa-envelope"></i>
                    <span>Contact</span>
                </a>
            </div>
            
            <!-- Actions et Menu Mobile -->
            <div class="nav-actions">
                <!-- Boutons d'action -->
                <div class="nav-buttons">
                    <a href="login.html" class="btn btn-secondary btn-sm">
                        <i class="fas fa-sign-in-alt"></i>
                        <span class="btn-text">Connexion</span>
                    </a>
                    <a href="register.html" class="btn btn-primary btn-sm">
                        <i class="fas fa-user-plus"></i>
                        <span class="btn-text">S'inscrire</span>
                    </a>
                </div>
                
                <!-- Bouton Hamburger -->
                <button class="mobile-menu-toggle" aria-label="Ouvrir le menu de navigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </nav>
</header>

<!-- Menu Mobile Overlay -->
<div class="mobile-menu-overlay">
    <div class="mobile-menu-content">
        <!-- En-tête du menu mobile -->
        <div class="mobile-menu-header">
            <div class="mobile-menu-brand">
                <div class="brand-icon">
                    <i class="fas fa-mountain"></i>
                </div>
                <div class="brand-text">AtlasForecast</div>
            </div>
            <button class="mobile-menu-close" aria-label="Fermer le menu">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <!-- Navigation principale -->
        <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">Navigation</div>
            <div class="mobile-menu-links">
                <a href="index.html" class="mobile-menu-link">
                    <i class="fas fa-home"></i>
                    <span>Accueil</span>
                </a>
                <a href="weather.html" class="mobile-menu-link">
                    <i class="fas fa-cloud-sun"></i>
                    <span>Météo</span>
                </a>
                <a href="forecast.html" class="mobile-menu-link">
                    <i class="fas fa-chart-line"></i>
                    <span>Prévisions</span>
                </a>
                <a href="alerts.html" class="mobile-menu-link">
                    <i class="fas fa-bell"></i>
                    <span>Alertes</span>
                </a>
                <a href="about.html" class="mobile-menu-link">
                    <i class="fas fa-info-circle"></i>
                    <span>À propos</span>
                </a>
                <a href="contact.html" class="mobile-menu-link">
                    <i class="fas fa-envelope"></i>
                    <span>Contact</span>
                </a>
            </div>
        </div>
        
        <!-- Section Compte -->
        <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">Mon Compte</div>
            <div class="mobile-menu-links">
                <a href="login.html" class="mobile-menu-link">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Connexion</span>
                </a>
                <a href="register.html" class="mobile-menu-link">
                    <i class="fas fa-user-plus"></i>
                    <span>S'inscrire</span>
                </a>
                <a href="profile.html" class="mobile-menu-link">
                    <i class="fas fa-user"></i>
                    <span>Profil</span>
                </a>
                <a href="settings.html" class="mobile-menu-link">
                    <i class="fas fa-cog"></i>
                    <span>Paramètres</span>
                </a>
            </div>
        </div>
        
        <!-- Section Premium -->
        <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">Services Premium</div>
            <div class="mobile-menu-links">
                <a href="premium.html" class="mobile-menu-link">
                    <i class="fas fa-crown"></i>
                    <span>Premium</span>
                </a>
                <a href="premium-signup.html" class="mobile-menu-link">
                    <i class="fas fa-star"></i>
                    <span>S'abonner</span>
                </a>
            </div>
        </div>
        
        <!-- Section Authentification Sociale -->
        <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">Connexion Rapide</div>
            <div class="mobile-menu-links">
                <a href="auth-google.html" class="mobile-menu-link">
                    <i class="fab fa-google"></i>
                    <span>Google</span>
                </a>
                <a href="auth-facebook.html" class="mobile-menu-link">
                    <i class="fab fa-facebook"></i>
                    <span>Facebook</span>
                </a>
                <a href="auth-x.html" class="mobile-menu-link">
                    <i class="fab fa-x-twitter"></i>
                    <span>X (Twitter)</span>
                </a>
            </div>
        </div>
        
        <!-- Section Informations -->
        <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">Informations</div>
            <div class="mobile-menu-links">
                <a href="privacy.html" class="mobile-menu-link">
                    <i class="fas fa-shield-alt"></i>
                    <span>Confidentialité</span>
                </a>
                <a href="forgot.html" class="mobile-menu-link">
                    <i class="fas fa-key"></i>
                    <span>Mot de passe oublié</span>
                </a>
            </div>
        </div>
        
        <!-- Footer du menu mobile -->
        <div class="mobile-menu-footer">
            <div class="mobile-menu-footer-text">
                © 2024 AtlasForecast - Tous droits réservés
            </div>
            <div class="mobile-menu-social">
                <a href="#" class="social-link" aria-label="Facebook">
                    <i class="fab fa-facebook"></i>
                </a>
                <a href="#" class="social-link" aria-label="Twitter">
                    <i class="fab fa-x-twitter"></i>
                </a>
                <a href="#" class="social-link" aria-label="Instagram">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="social-link" aria-label="LinkedIn">
                    <i class="fab fa-linkedin"></i>
                </a>
            </div>
        </div>
    </div>
</div>`;

// CSS à ajouter dans le head
const CSS_LINKS = `
    <!-- CSS de base pour la navigation -->
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/responsive-system.css">
    <link rel="stylesheet" href="css/hamburger-menu.css">`;

// Script à ajouter avant la fermeture du body
const JS_SCRIPT = `
    <!-- Script du menu mobile hamburger -->
    <script src="js/mobile-menu.js"></script>`;

// Fonction pour déterminer la page active
function getActivePage(currentPage) {
    const pageMap = {
        'index.html': 'index.html',
        'weather.html': 'weather.html',
        'forecast.html': 'forecast.html',
        'alerts.html': 'alerts.html',
        'about.html': 'about.html',
        'contact.html': 'contact.html',
        'login.html': 'login.html',
        'register.html': 'register.html',
        'profile.html': 'profile.html',
        'settings.html': 'settings.html',
        'premium.html': 'premium.html',
        'premium-signup.html': 'premium-signup.html',
        'auth-google.html': 'auth-google.html',
        'auth-facebook.html': 'auth-facebook.html',
        'auth-x.html': 'auth-x.html',
        'privacy.html': 'privacy.html',
        'forgot.html': 'forgot.html',
        'checkout.html': 'checkout.html'
    };
    
    return pageMap[currentPage] || 'index.html';
}

// Fonction pour marquer la page active
function markActivePage(navigationHTML, currentPage) {
    const activePage = getActivePage(currentPage);
    
    // Marquer le lien desktop actif
    navigationHTML = navigationHTML.replace(
        new RegExp(`href="${activePage}" class="nav-link"`),
        `href="${activePage}" class="nav-link active"`
    );
    
    // Marquer le lien mobile actif
    navigationHTML = navigationHTML.replace(
        new RegExp(`href="${activePage}" class="mobile-menu-link"`),
        `href="${activePage}" class="mobile-menu-link active"`
    );
    
    return navigationHTML;
}

// Fonction pour appliquer la navigation à une page
function applyNavigationToPage(pageName) {
    console.log(`🔄 Application de la navigation à ${pageName}...`);
    
    // Cette fonction serait appelée côté serveur ou avec un outil de build
    // Pour l'instant, elle sert de référence pour l'implémentation
    
    const navigationWithActive = markActivePage(NAVIGATION_TEMPLATE, pageName);
    
    return {
        css: CSS_LINKS,
        navigation: navigationWithActive,
        script: JS_SCRIPT
    };
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PAGES,
        NAVIGATION_TEMPLATE,
        CSS_LINKS,
        JS_SCRIPT,
        getActivePage,
        markActivePage,
        applyNavigationToPage
    };
}

// Fonction pour tester le système
function testNavigationSystem() {
    console.log('🧪 Test du système de navigation hamburger...');
    
    PAGES.forEach(page => {
        const result = applyNavigationToPage(page);
        console.log(`✅ ${page}:`, {
            hasCSS: result.css.includes('hamburger-menu.css'),
            hasNavigation: result.navigation.includes('mobile-menu-toggle'),
            hasScript: result.script.includes('mobile-menu.js'),
            activePage: getActivePage(page)
        });
    });
    
    console.log('🎉 Test terminé !');
}

// Exécuter le test si le script est chargé directement
if (typeof window !== 'undefined') {
    console.log('🚀 Script d\'application du menu hamburger chargé !');
    console.log('📋 Pages supportées:', PAGES.length);
    
    // Exposer les fonctions globalement pour le debug
    window.AtlasForecastNavigation = {
        PAGES,
        NAVIGATION_TEMPLATE,
        getActivePage,
        markActivePage,
        applyNavigationToPage,
        testNavigationSystem
    };
}

/* ========================================
   FIN DU SCRIPT D'APPLICATION
   ======================================== */
