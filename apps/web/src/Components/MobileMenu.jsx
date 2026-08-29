import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_LINKS, SOCIAL_LINKS } from './helpers'
import { useAuth } from '../contexts/AuthContext'
import '../Styles/MobileMenu.css'

export default function MobileMenu({ isOpen, onClose }) {
  const loc = useLocation()
  const { user, isAdmin, signOut } = useAuth()

  const isActive = (to) =>
    to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to)

  const ML = ({ to, icon, label, className = '' }) => (
    <Link
      to={to}
      className={`af-menu-link${isActive(to) ? ' active' : ''} ${className}`}
      onClick={onClose}
    >
      <i className={icon}></i>
      <span>{label}</span>
    </Link>
  )

  const MS = ({ title, children }) => (
    <div className="af-menu-section">
      <div className="af-menu-section-title">{title}</div>
      <div className="af-menu-links">{children}</div>
    </div>
  )

  return (
    <div
      className={`af-menu-overlay${isOpen ? ' open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className="af-menu-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="af-menu-header">
          <div className="af-menu-brand">
            <img
              src="/images/atlasforecast-logo.png"
              alt="Logo"
              className="af-menu-logo"
            />
            <div className="af-menu-brand-info">
              <span className="af-menu-brand-text">AtlasForecast</span>
              <span className="af-menu-brand-tag">SaaS 2026</span>
            </div>
          </div>
          <button
            className="af-menu-close"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="af-menu-body">
          {/* Main navigation */}
          <MS title="Navigation">
            {NAV_LINKS.map((l) => (
              <ML key={l.to} {...l} />
            ))}
          </MS>

          {/* Premium promotion */}
          <MS title="Offre Premium">
            <ML
              to="/premium"
              icon="fas fa-crown"
              label="AtlasForecast Premium ($5/mo)"
              className="af-menu-link-premium"
            />
          </MS>

          {/* Account section */}
          <MS title="Espace Membre">
            {user ? (
              <>
                {isAdmin && (
                  <ML
                    to="/admin"
                    icon="fas fa-shield-alt"
                    label="Panneau Admin"
                    className="af-menu-link-admin"
                  />
                )}
                {isAdmin && (
                  <ML to="/dashboard" icon="fas fa-gauge" label="Dashboard" />
                )}
                <ML to="/profile" icon="fas fa-user" label="Mon Profil" />
                <ML to="/settings" icon="fas fa-cog" label="Paramètres" />
                <button
                  onClick={() => {
                    signOut()
                    onClose()
                  }}
                  className="af-menu-link af-menu-logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <ML to="/login" icon="fas fa-sign-in-alt" label="Connexion" />
                <ML to="/register" icon="fas fa-user-plus" label="Créer un compte" />
              </>
            )}
          </MS>

          {/* Social Links */}
          <div className="af-menu-footer">
            <div className="af-menu-footer-text">© 2026 AtlasForecast AI Platform</div>
            <div className="af-menu-social">
              {Object.entries(SOCIAL_LINKS).map(([k, u]) => (
                <a
                  key={k}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="af-menu-social-link"
                  aria-label={k}
                >
                  <i className={`fab fa-${k}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
