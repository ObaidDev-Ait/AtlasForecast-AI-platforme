import React from 'react';
import { Link } from 'react-router-dom';

const NavTemplatePage = () => {
    return (
        <React.Fragment>
            <div>
  {/* ========================================
   ATLASFORECAST - TEMPLATE DE NAVIGATION HAMBURGER
   Template réutilisable pour toutes les pages du site
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
        {/* Actions et Menu Mobile */}
        <div className="nav-actions">
          {/* Boutons d'action */}
          <div className="nav-buttons">
            <a href="/login" className="btn btn-secondary btn-sm">
              <i className="fas fa-sign-in-alt" />
              <span className="btn-text">Connexion</span>
            </a>
            <a href="/register" className="btn btn-primary btn-sm">
              <i className="fas fa-user-plus" />
              <span className="btn-text">S'inscrire</span>
            </a>
          </div>
          {/* Bouton Hamburger */}
          <button className="mobile-menu-toggle" aria-label="Ouvrir le menu de navigation">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  </header>
  {/* Menu Mobile Overlay */}
  <div className="mobile-menu-overlay">
    <div className="mobile-menu-content">
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
      {/* Footer du menu mobile */}
      <div className="mobile-menu-footer">
        <div className="mobile-menu-footer-text">
          © 2024 AtlasForecast - Tous droits réservés
        </div>
        <div className="mobile-menu-social">
          <a href="#" className="social-link" aria-label="Facebook">
            <i className="fab fa-facebook" />
          </a>
          <a href="#" className="social-link" aria-label="Twitter">
            <i className="fab fa-x-twitter" />
          </a>
          <a href="#" className="social-link" aria-label="Instagram">
            <i className="fab fa-instagram" />
          </a>
          <a href="#" className="social-link" aria-label="LinkedIn">
            <i className="fab fa-linkedin" />
          </a>
        </div>
      </div>
    </div>
  </div>
  {/* ========================================
   FIN DU TEMPLATE DE NAVIGATION
   ======================================== */}
</div>

        </React.Fragment>
    );
};

export default NavTemplatePage;
