import React from 'react';
import { Link } from 'react-router-dom';

const NavigationTemplatePage = () => {
    return (
        <React.Fragment>
            <div>
  {/* ========================================
   ATLASFORECAST - TEMPLATE DE NAVIGATION PROFESSIONNEL
   Template complet avec menu hamburger responsive
   Compatible avec toutes les pages du site web
   ======================================== */}
  {/* Header et Navigation */}
  <header className="header">
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo et Brand */}
        <a href="/" className="nav-brand">
          <img src="/images/atlasforecast-logo.png" alt="AtlasForecast" className="nav-brand-logo" />
          <span className="brand-text">AtlasForecast</span>
        </a>
        {/* Menu Desktop */}
        <div className="nav-menu">
          <a href="/" className="nav-link">
            <i className="fas fa-home" />
            <span>Accueil</span>
          </a>
          <a href="/weather" className="nav-link">
            <i className="fas fa-cloud-sun" />
            <span>Météo</span>
          </a>
          <a href="/forecast" className="nav-link">
            <i className="fas fa-chart-line" />
            <span>Prévisions</span>
          </a>
          <a href="/alerts" className="nav-link">
            <i className="fas fa-bell" />
            <span>Alertes</span>
          </a>
          <a href="/about" className="nav-link">
            <i className="fas fa-info-circle" />
            <span>À propos</span>
          </a>
          <a href="/contact" className="nav-link">
            <i className="fas fa-envelope" />
            <span>Contact</span>
          </a>
        </div>
        {/* Bouton Hamburger */}
        <button className="mobile-menu-toggle" aria-label="Ouvrir le menu de navigation" aria-expanded="false" aria-controls="mobile-menu-content">
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  </header>
  {/* Menu Mobile Overlay */}
  <div className="mobile-menu-overlay">
    <div className="mobile-menu-content" id="mobile-menu-content" aria-hidden="true">
      {/* En-tête du menu mobile */}
      <div className="mobile-menu-header">
        <div className="mobile-menu-brand">
          <div className="brand-icon">
            <img src="/images/atlasforecast-logo.png" alt="AtlasForecast" className="mobile-brand-logo" />
          </div>
          <div className="brand-text">AtlasForecast</div>
        </div>
        <button className="mobile-menu-close" aria-label="Fermer le menu">
          <i className="fas fa-times" />
        </button>
      </div>
      {/* Navigation principale */}
      <div className="mobile-menu-section">
        <div className="mobile-menu-section-title">Navigation</div>
        <div className="mobile-menu-links">
          <a href="/" className="mobile-menu-link">
            <i className="fas fa-home" />
            <span>Accueil</span>
          </a>
          <a href="/weather" className="mobile-menu-link">
            <i className="fas fa-cloud-sun" />
            <span>Météo</span>
          </a>
          <a href="/forecast" className="mobile-menu-link">
            <i className="fas fa-chart-line" />
            <span>Prévisions</span>
          </a>
          <a href="/alerts" className="mobile-menu-link">
            <i className="fas fa-bell" />
            <span>Alertes</span>
          </a>
          <a href="/about" className="mobile-menu-link">
            <i className="fas fa-info-circle" />
            <span>À propos</span>
          </a>
          <a href="/contact" className="mobile-menu-link">
            <i className="fas fa-envelope" />
            <span>Contact</span>
          </a>
        </div>
      </div>
      {/* Section Compte */}
      <div className="mobile-menu-section">
        <div className="mobile-menu-section-title">Mon Compte</div>
        <div className="mobile-menu-links">
          <a href="/login" className="mobile-menu-link">
            <i className="fas fa-sign-in-alt" />
            <span>Connexion</span>
          </a>
          <a href="/register" className="mobile-menu-link">
            <i className="fas fa-user-plus" />
            <span>S'inscrire</span>
          </a>
          <a href="/profile" className="mobile-menu-link">
            <i className="fas fa-user" />
            <span>Profil</span>
          </a>
          <a href="/settings" className="mobile-menu-link">
            <i className="fas fa-cog" />
            <span>Paramètres</span>
          </a>
        </div>
      </div>
      {/* Section Premium */}
      <div className="mobile-menu-section">
        <div className="mobile-menu-section-title">Services Premium</div>
        <div className="mobile-menu-links">
          <a href="/premium" className="mobile-menu-link">
            <i className="fas fa-crown" />
            <span>Premium</span>
          </a>
          <a href="/premium-signup" className="mobile-menu-link">
            <i className="fas fa-star" />
            <span>S'abonner</span>
          </a>
        </div>
      </div>
      {/* Section Authentification Sociale */}
      <div className="mobile-menu-section">
        <div className="mobile-menu-section-title">Connexion Rapide</div>
        <div className="mobile-menu-links">
          <a href="/auth-google" className="mobile-menu-link">
            <i className="fab fa-google" />
            <span>Google</span>
          </a>
          <a href="/auth-facebook" className="mobile-menu-link">
            <i className="fab fa-facebook" />
            <span>Facebook</span>
          </a>
          <a href="/auth-x" className="mobile-menu-link">
            <i className="fab fa-x-twitter" />
            <span>X (Twitter)</span>
          </a>
        </div>
      </div>
      {/* Section Informations */}
      <div className="mobile-menu-section">
        <div className="mobile-menu-section-title">Informations</div>
        <div className="mobile-menu-links">
          <a href="/privacy" className="mobile-menu-link">
            <i className="fas fa-shield-alt" />
            <span>Confidentialité</span>
          </a>
          <a href="/forgot" className="mobile-menu-link">
            <i className="fas fa-key" />
            <span>Mot de passe oublié</span>
          </a>
        </div>
      </div>
      {/* Section Paiement */}
      <div className="mobile-menu-section">
        <div className="mobile-menu-section-title">Paiement</div>
        <div className="mobile-menu-links">
          <a href="/checkout" className="mobile-menu-link">
            <i className="fas fa-credit-card" />
            <span>Paiement</span>
          </a>
        </div>
      </div>
      {/* Footer du menu mobile */}
      <div className="mobile-menu-footer">
        <div className="mobile-menu-footer-text">
          © 2024 AtlasForecast - Tous droits réservés
        </div>
        <div className="mobile-menu-social">
          <a href="https://www.facebook.com/profile.php?id=61578902663416&locale=fr_FR" target="_blank" rel="noopener" className="social-link" aria-label="Facebook">
            <i className="fab fa-facebook" />
          </a>
          <a href="https://wa.me/212645508349" target="_blank" rel="noopener" className="social-link" aria-label="WhatsApp">
            <i className="fab fa-whatsapp" />
          </a>
          <a href="https://www.instagram.com/obaid.sr46/" target="_blank" rel="noopener" className="social-link" aria-label="Instagram">
            <i className="fab fa-instagram" />
          </a>
          <a href="https://www.linkedin.com/in/obaid-ait-mattou-2b058130b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener" className="social-link" aria-label="LinkedIn">
            <i className="fab fa-linkedin" />
          </a>
          <a href="https://github.com/Obaid-dev-rebelesto" target="_blank" rel="noopener" className="social-link" aria-label="GitHub">
            <i className="fab fa-github" />
          </a>
        </div>
      </div>
    </div>
  </div>
  {/* ========================================
   FIN DU TEMPLATE DE NAVIGATION PROFESSIONNEL
   ======================================== */}
</div>

        </React.Fragment>
    );
};

export default NavigationTemplatePage;
