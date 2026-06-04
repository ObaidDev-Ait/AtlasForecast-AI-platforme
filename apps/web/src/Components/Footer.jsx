import { Link } from 'react-router-dom'
import { SOCIAL_LINKS } from './helpers'
import '../Styles/Footer.css'
export default function Footer() {
  return (
    <footer className="af-footer"><div className="container">
      <div className="af-footer-content">
        <div className="af-footer-brand"><div className="af-footer-brand-icon"><i className="fas fa-mountain"></i></div><div><h3 className="af-footer-brand-name">AtlasForecast</h3><p className="af-footer-brand-desc">Service météorologique professionnel</p></div></div>
        <div className="af-footer-links">
          <div className="af-footer-group"><h4>Navigation</h4><Link to="/">Accueil</Link><Link to="/weather">Météo</Link><Link to="/forecast">Prévisions</Link><Link to="/alerts">Alertes</Link></div>
          <div className="af-footer-group"><h4>Informations</h4><Link to="/about">À propos</Link><Link to="/contact">Contact</Link><Link to="/premium">Premium</Link><Link to="/privacy">Confidentialité</Link></div>
          <div className="af-footer-group"><h4>Compte</h4><Link to="/login">Connexion</Link><Link to="/register">Inscription</Link><Link to="/profile">Profil</Link><Link to="/settings">Paramètres</Link></div>
        </div>
        <div className="af-footer-social"><h4>Suivez-nous</h4><div className="af-footer-social-links">{Object.entries(SOCIAL_LINKS).map(([k,u])=><a key={k} href={u} target="_blank" rel="noopener noreferrer"><i className={`fab fa-${k}`}></i></a>)}</div></div>
      </div>
      <div className="af-footer-bottom"><p>&copy; 2025 AtlasForecast. Tous droits réservés.</p><p className="af-footer-credit">Créé par <strong>Obaid Ait Mattou</strong></p></div>
    </div></footer>
  )
}
