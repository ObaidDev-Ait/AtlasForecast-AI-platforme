import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const firstName = e.target.firstName.value
    const lastName = e.target.lastName.value
    const email = e.target.email.value
    const password = e.target.password.value
    const confirmPassword = e.target.confirmPassword.value

    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName
      })

      if (error) {
        throw error
      }
      
      // Since email confirmation might be disabled in Supabase or auto-sign-in works:
      navigate('/profile')
      
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }));
    }, 100);
  }, [])

  return (
    <>
    <div className="container">
      <section className="auth-section">
        <div className="auth-header" style={{"textAlign": "center", "margin": "1.5rem 0 2rem"}}>
          <h1 className="auth-title" style={{"fontWeight": "900", "fontSize": "clamp(1.8rem,1.2rem+2vw,2.6rem)", "background": "var(--gradient-primary)", "WebkitBackgroundClip": "text", "WebkitTextFillColor": "transparent", "backgroundClip": "text"}}>
            <i className="fas fa-user-plus"></i> Créer un compte
          </h1>
          <p className="auth-subtitle" style={{"color": "var(--text-secondary)", "fontWeight": "600"}}>Rejoignez AtlasForecast pour une expérience météo professionnelle</p>
        </div>

        <div className="auth-grid responsive-grid responsive-grid-auth">
          {/*  Carte Inscription  */}
          <div className="auth-card" style={{"position": "relative", "background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1.25rem,1rem+1vw,2rem)", "boxShadow": "0 20px 40px var(--shadow-color)", "overflow": "hidden"}}>
            
            {errorMsg && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "14px", marginBottom: "1rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <i className="fas fa-exclamation-circle"></i> {errorMsg}
              </div>
            )}

            <form id="registerForm" className="auth-form" onSubmit={handleRegister}>
              <div className="form-row responsive-grid-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                    <i className="fas fa-user"></i> Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-input"
                    placeholder="Votre prénom"
                    required
                    style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}}
                   />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                    <i className="fas fa-user"></i> Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-input"
                    placeholder="Votre nom"
                    required
                    style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}}
                   />
                </div>
              </div>

              <div className="form-group" style={{"marginTop": "1rem"}}>
                <label htmlFor="email" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                  <i className="fas fa-envelope"></i> Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="votre@email.com"
                  required
                  style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}}
                 />
              </div>

              <div className="form-row responsive-grid-row" style={{"marginTop": "1rem"}}>
                <div className="form-group">
                  <label htmlFor="password" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                    <i className="fas fa-lock"></i> Mot de passe
                  </label>
                  <div className="password-input" style={{"position": "relative"}}>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-input"
                      placeholder="Votre mot de passe"
                      required
                      style={{"width": "100%", "padding": ".95rem 2.75rem .95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}}
                     />
                    <button type="button" id="passwordToggle" className="password-toggle"
                      style={{"position": "absolute", "right": ".5rem", "top": "50%", "transform": "translateY(-50%)", "border": "none", "background": "transparent", "color": "var(--text-secondary)", "cursor": "pointer", "padding": ".25rem .5rem"}}>
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                    <i className="fas fa-lock"></i> Confirmer le mot de passe
                  </label>
                  <div className="password-input" style={{"position": "relative"}}>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Confirmez le mot de passe"
                      required
                      style={{"width": "100%", "padding": ".95rem 2.75rem .95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}}
                     />
                    <button type="button" id="confirmPasswordToggle" className="password-toggle"
                      style={{"position": "absolute", "right": ".5rem", "top": "50%", "transform": "translateY(-50%)", "border": "none", "background": "transparent", "color": "var(--text-secondary)", "cursor": "pointer", "padding": ".25rem .5rem"}}>
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row responsive-grid-row" style={{"marginTop": "1rem"}}>
                <div className="form-group">
                  <label htmlFor="country" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                    <i className="fas fa-globe"></i> Pays
                  </label>
                  <select id="country" name="country" className="form-input form-select" required
                    style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}}>
                    <option value="">Sélectionnez votre pays</option>
                    <option value="FR">France</option>
                    <option value="MA">Maroc</option>
                    <option value="DZ">Algérie</option>
                    <option value="TN">Tunisie</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="CA">Canada</option>
                    <option value="US">États-Unis</option>
                    <option value="GB">Royaume-Uni</option>
                    <option value="DE">Allemagne</option>
                    <option value="ES">Espagne</option>
                    <option value="IT">Italie</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                    <i className="fas fa-bell"></i> Préférences
                  </label>
                  <label className="checkbox-label" style={{"display": "flex", "gap": ".5rem", "alignItems": "center", "cursor": "pointer", "padding": ".95rem 1.1rem", "border": "1px solid var(--border-color)", "borderRadius": "14px", "background": "var(--bg-glass)"}}>
                    <input type="checkbox" id="newsletter" name="newsletter" style={{"transform": "scale(1.1)"}} />
                    <span>Recevoir les actualités météo et offres spéciales</span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{"marginTop": "1rem"}}>
                <label className="checkbox-label" style={{"display": "flex", "gap": ".5rem", "alignItems": "flex-start", "cursor": "pointer"}}>
                  <input type="checkbox" id="terms" name="terms" required style={{"transform": "scale(1.1)", "marginTop": ".25rem"}} />
                  <span>J'accepte les <a href="terms.html" className="terms-link" style={{"color": "var(--accent-primary)", "fontWeight": "800", "textDecoration": "none"}}>conditions d'utilisation</a> et la
                    <a href="/privacy" className="terms-link" style={{"color": "var(--accent-primary)", "fontWeight": "800", "textDecoration": "none"}}>politique de confidentialité</a></span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{"width": "100%", "padding": "1rem 1.25rem", "border": "none", "borderRadius": "14px", "background": "var(--gradient-primary)", "color": "#fff", "fontWeight": "900", "cursor": loading ? "not-allowed" : "pointer", "opacity": loading ? 0.7 : 1, "marginTop": ".75rem"}}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Création...</> : <><i className="fas fa-user-plus"></i> Créer mon compte</>}
              </button>

              <div className="divider" style={{"display": "flex", "alignItems": "center", "gap": ".75rem", "margin": "1.25rem 0"}}>
                <div style={{"flex": "1", "height": "1px", "background": "var(--border-color)"}}></div>
                <span style={{"color": "var(--text-secondary)", "fontWeight": "700"}}>ou</span>
                <div style={{"flex": "1", "height": "1px", "background": "var(--border-color)"}}></div>
              </div>

              <div className="social-register" style={{"display": "grid", "gap": ".6rem"}}>
                <button className="btn btn-ghost social-btn google-btn" style={{"padding": ".9rem 1rem", "borderRadius": "12px", "border": "1px solid var(--border-color)", "background": "var(--bg-glass)", "color": "var(--text-primary)", "fontWeight": "800", "cursor": "pointer"}}>
                  <i className="fab fa-google"></i> S'inscrire avec Google
                </button>
                <button className="btn btn-ghost social-btn facebook-btn" style={{"padding": ".9rem 1rem", "borderRadius": "12px", "border": "1px solid var(--border-color)", "background": "var(--bg-glass)", "color": "var(--text-primary)", "fontWeight": "800", "cursor": "pointer"}}>
                  <i className="fab fa-facebook-f"></i> S'inscrire avec Facebook
                </button>
                <button className="btn btn-ghost social-btn twitter-btn" style={{"padding": ".9rem 1rem", "borderRadius": "12px", "border": "1px solid var(--border-color)", "background": "var(--bg-glass)", "color": "var(--text-primary)", "fontWeight": "800", "cursor": "pointer"}}>
                  <i className="fab fa-x-twitter"></i> S'inscrire avec X
                </button>
              </div>

              <div className="auth-footer" style={{"textAlign": "center", "marginTop": "1rem", "color": "var(--text-secondary)"}}>
                <p>Déjà un compte ?
                  <a href="/login" style={{"color": "var(--accent-primary)", "fontWeight": "900", "textDecoration": "none"}}>Se connecter</a>
                </p>
              </div>
            </form>
          </div>

          {/*  Carte Avantages  */}
          <aside className="auth-benefits" style={{"background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1rem,.8rem + 1vw,1.5rem)", "boxShadow": "0 20px 40px var(--shadow-color)"}}>
            <h3 style={{"fontWeight": "900", "marginBottom": ".75rem"}}><i className="fas fa-star"></i> Avantages de l'inscription</h3>
            <ul style={{"listStyle": "none", "display": "grid", "gap": ".75rem", "margin": "0", "padding": "0"}}>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Prévisions 5 jours, alertes personnalisées et radar en temps réel</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Expérience Premium sans publicité</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Synchronisation multi-appareils</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Accès privilégié aux nouvelles fonctionnalités</span>
              </li>
            </ul>

            <div style={{"marginTop": "1.25rem", "padding": "1rem", "borderRadius": "16px", "background": "var(--bg-glass)", "border": "1px solid var(--border-color)"}}>
              <strong><i className="fas fa-shield-alt"></i> Sécurité</strong>
              <p style={{"margin": ".35rem 0 0", "color": "var(--text-secondary)"}}>Données chiffrées et conformes aux meilleures pratiques de l’industrie.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
    </>
  );
};

export default RegisterPage;
