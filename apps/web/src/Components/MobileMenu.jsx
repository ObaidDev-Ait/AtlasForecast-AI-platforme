import { Link, useLocation } from 'react-router-dom'
import { NAV_LINKS, SOCIAL_LINKS } from './helpers'
import '../Styles/MobileMenu.css'
export default function MobileMenu({ isOpen, onClose }) {
  const loc = useLocation()
  const isActive = to => to==='/' ? loc.pathname==='/' : loc.pathname.startsWith(to)
  const ML = ({to,icon,label}) => <Link to={to} className={`af-menu-link${isActive(to)?' active':''}`} onClick={onClose}><i className={icon}></i><span>{label}</span></Link>
  const MS = ({title,children}) => <div className="af-menu-section"><div className="af-menu-section-title">{title}</div><div className="af-menu-links">{children}</div></div>
  return (
    <div className={`af-menu-overlay${isOpen?' open':''}`} onClick={onClose}>
      <div className="af-menu-content" onClick={e=>e.stopPropagation()}>
        <div className="af-menu-header">
          <div className="af-menu-brand"><div className="af-menu-brand-icon"><i className="fas fa-mountain"></i></div><div className="af-menu-brand-text">AtlasForecast</div></div>
          <button className="af-menu-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <MS title="Navigation">{NAV_LINKS.map(l=><ML key={l.to} {...l}/>)}</MS>
        <MS title="Mon Compte"><ML to="/login" icon="fas fa-sign-in-alt" label="Connexion"/><ML to="/register" icon="fas fa-user-plus" label="S'inscrire"/><ML to="/profile" icon="fas fa-user" label="Profil"/><ML to="/settings" icon="fas fa-cog" label="Paramètres"/></MS>
        <MS title="Premium"><ML to="/premium" icon="fas fa-crown" label="Premium"/><ML to="/premium-signup" icon="fas fa-star" label="S'abonner"/></MS>
        <MS title="Connexion Rapide"><ML to="/auth-google" icon="fab fa-google" label="Google"/><ML to="/auth-facebook" icon="fab fa-facebook" label="Facebook"/><ML to="/auth-x" icon="fab fa-x-twitter" label="X"/></MS>
        <div className="af-menu-footer">
          <div className="af-menu-footer-text">© 2025 AtlasForecast</div>
          <div className="af-menu-social">{Object.entries(SOCIAL_LINKS).map(([k,u])=><a key={k} href={u} target="_blank" rel="noopener noreferrer" className="af-menu-social-link"><i className={`fab fa-${k}`}></i></a>)}</div>
        </div>
      </div>
    </div>
  )
}
