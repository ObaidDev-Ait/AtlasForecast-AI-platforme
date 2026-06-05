import { NavLink, Link } from 'react-router-dom'
import { NAV_LINKS } from './helpers'
import ThemeToggle from './ThemeToggle'
import '../Styles/Navbar.css'

import { useAuth } from '../contexts/AuthContext'

export default function Navbar({ onMobileMenuOpen }) {
  const { user, signOut } = useAuth()

  return (
    <header className="af-header">
      <nav className="af-navbar">
        <div className="af-nav-container">
          <Link to="/" className="af-nav-brand">
            <img src="/images/atlasforecast-logo.png" alt="AtlasForecast Logo" className="af-brand-logo" />
            <span className="af-brand-text">AtlasForecast</span>
          </Link>
          <div className="af-nav-menu">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to==='/'} className={({isActive})=>`af-nav-link${isActive?' active':''}`}>
                <i className={link.icon}></i><span>{link.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="af-nav-actions">
            <div className="af-nav-buttons">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ marginRight: '5px' }}><i className="fas fa-gauge"></i><span className="af-btn-text"> Dashboard</span></Link>
                  <Link to="/profile" className="btn btn-secondary btn-sm"><i className="fas fa-user"></i><span className="af-btn-text"> Profil</span></Link>
                  <button onClick={signOut} className="btn btn-primary btn-sm" style={{ border: 'none', cursor: 'pointer' }}><i className="fas fa-sign-out-alt"></i><span className="af-btn-text"> Déconnexion</span></button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary btn-sm"><i className="fas fa-sign-in-alt"></i><span className="af-btn-text"> Connexion</span></Link>
                  <Link to="/register" className="btn btn-primary btn-sm"><i className="fas fa-user-plus"></i><span className="af-btn-text"> S'inscrire</span></Link>
                </>
              )}
            </div>
            <ThemeToggle />
            <button className="af-mobile-toggle" onClick={onMobileMenuOpen} aria-label="Menu"><span></span><span></span><span></span></button>
          </div>
        </div>
      </nav>
    </header>
  )
}
