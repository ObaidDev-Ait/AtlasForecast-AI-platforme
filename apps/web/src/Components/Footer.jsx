import React from 'react'
import { Link } from 'react-router-dom'
import { SOCIAL_LINKS } from './helpers'
import '../Styles/Footer.css'

export default function Footer() {
  return (
    <footer className="af-footer">
      <div className="container">
        <div className="af-footer-content">
          {/* Brand Col */}
          <div className="af-footer-brand">
            <div className="af-footer-brand-logo-wrap">
              <img
                src="/images/atlasforecast-logo.png"
                alt="AtlasForecast"
                className="af-footer-logo-img"
              />
            </div>
            <div>
              <h3 className="af-footer-brand-name">AtlasForecast</h3>
              <p className="af-footer-brand-desc">
                Plateforme d'intelligence météorologique & prévisions haute précision pour le Maroc.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="af-footer-links">
            <div className="af-footer-group">
              <h4>Navigation</h4>
              <Link to="/">Accueil</Link>
              <Link to="/weather">Météo en direct</Link>
              <Link to="/forecast">Prévisions 5/14 Jours</Link>
              <Link to="/alerts">Centre d'Alertes</Link>
              <Link to="/assistant">Assistant Copilot IA</Link>
            </div>

            <div className="af-footer-group">
              <h4>Offres & Infos</h4>
              <Link to="/premium">AtlasForecast Premium ($5/mo)</Link>
              <Link to="/about">À propos de la plateforme</Link>
              <Link to="/contact">Support & Contact</Link>
              <Link to="/privacy">Politique de confidentialité</Link>
            </div>

            <div className="af-footer-group">
              <h4>Espace Membre</h4>
              <Link to="/login">Connexion</Link>
              <Link to="/register">Créer un compte</Link>
              <Link to="/dashboard">Tableau de bord</Link>
              <Link to="/profile">Mon profil</Link>
              <Link to="/settings">Préférences</Link>
            </div>
          </div>

          {/* Social */}
          <div className="af-footer-social">
            <h4>Réseaux & Communauté</h4>
            <div className="af-footer-social-links">
              {Object.entries(SOCIAL_LINKS).map(([k, u]) => (
                <a
                  key={k}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={k}
                  className="af-footer-social-btn"
                >
                  <i className={`fab fa-${k}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="af-footer-bottom">
          <p>© 2026 AtlasForecast AI Platform. Tous droits réservés.</p>
          <p className="af-footer-credit">
            Développé avec passion pour le Maroc • Créé par <strong>Obaid Ait Mattou</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}
