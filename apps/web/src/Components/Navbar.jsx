import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { NAV_LINKS } from './helpers'
import ThemeToggle from './ThemeToggle'
import '../Styles/Navbar.css'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar({ onMobileMenuOpen }) {
  const { user, isAdmin, isPremium, signOut } = useAuth()

  return (
    <header className="af-header">
      <nav className="af-navbar" aria-label="Navigation principale">
        <div className="af-nav-container">
          {/* Brand Logo & Title */}
          <Link to="/" className="af-nav-brand">
            <div className="af-brand-logo-wrap">
              <img
                src="/images/atlasforecast-logo.png"
                alt="AtlasForecast Logo"
                className="af-brand-logo"
              />
            </div>
            <div className="af-brand-info">
              <span className="af-brand-text">AtlasForecast</span>
              <span className="af-brand-tag">SaaS 2026</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="af-nav-menu">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `af-nav-link${isActive ? ' active' : ''}`
                }
              >
                <i className={link.icon}></i>
                <span>{link.label}</span>
              </NavLink>
            ))}

            {/* Premium direct nav link */}
            <NavLink
              to="/premium"
              className={({ isActive }) =>
                `af-nav-link af-nav-link-premium${isActive ? ' active' : ''}`
              }
            >
              <i className="fas fa-crown"></i>
              <span>Premium</span>
              {!isPremium && <span className="af-nav-badge-pro">PRO</span>}
            </NavLink>
          </div>

          {/* Right Action Controls */}
          <div className="af-nav-actions">
            <div className="af-nav-buttons">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="btn af-btn-admin btn-sm"
                      title="Accéder au panneau d'administration"
                    >
                      <i className="fas fa-shield-alt"></i>
                      <span className="af-btn-text">Admin</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fas fa-gauge"></i>
                      <span className="af-btn-text">Dashboard</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="btn btn-secondary btn-sm"
                    title="Mon profil"
                  >
                    <i className="fas fa-user"></i>
                    <span className="af-btn-text">Profil</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="btn btn-ghost btn-sm af-logout-btn"
                    title="Se déconnecter"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-secondary btn-sm"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    <span className="af-btn-text">Connexion</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-user-plus"></i>
                    <span className="af-btn-text">S'inscrire</span>
                  </Link>
                </>
              )}
            </div>

            <ThemeToggle />

            <button
              className="af-mobile-toggle"
              onClick={onMobileMenuOpen}
              aria-label="Ouvrir le menu de navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
