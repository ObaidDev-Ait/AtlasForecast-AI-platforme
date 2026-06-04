import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }));
    }, 100);
  }, []);

  return (
    <>
    <div className="container">
      <section className="auth-section">
        <div className="auth-header" style={{"textAlign": "center", "margin": "1.5rem 0 2rem"}}>
          <h1 className="auth-title" style={{"fontWeight": "900", "fontSize": "clamp(1.8rem,1.2rem+2vw,2.6rem)", "background": "var(--gradient-primary)", "WebkitBackgroundClip": "text", "WebkitTextFillColor": "transparent", "backgroundClip": "text"}}>
            <i className="fas fa-right-to-bracket"></i> Connexion
          </h1>
          <p className="auth-subtitle" style={{"color": "var(--text-secondary)", "fontWeight": "600"}}>Accédez à votre espace AtlasForecast</p>
        </div>

        <div className="auth-grid responsive-grid responsive-grid-login">
          {/*  Carte Connexion  */}
          <div className="auth-card" style={{"position": "relative", "background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1.25rem,1rem+1vw,2rem)", "boxShadow": "0 20px 40px var(--shadow-color)", "overflow": "hidden"}}>
            {errorMsg && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "14px", marginBottom: "1rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <i className="fas fa-exclamation-circle"></i> {errorMsg}
              </div>
            )}
            <form id="loginForm" className="auth-form" onSubmit={handleLogin}>
              <div className="form-group" style={{"marginBottom": "1rem"}}>
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

              <div className="form-group" style={{"marginBottom": "1rem"}}>
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

              <div className="form-row" style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "margin": ".5rem 0 1rem"}}>
                <label className="checkbox-label" style={{"display": "flex", "alignItems": "center", "gap": ".5rem", "cursor": "pointer"}}>
                  <input type="checkbox" id="rememberMe" name="rememberMe" style={{"transform": "scale(1.1)"}} />
                  <span>Se souvenir de moi</span>
                </label>
                <a className="forgot-link" href="/forgot" style={{"color": "var(--accent-primary)", "fontWeight": "800", "textDecoration": "none"}}>Mot de passe oublié ?</a>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{"width": "100%", "padding": "1rem 1.25rem", "border": "none", "borderRadius": "14px", "background": "var(--gradient-primary)", "color": "#fff", "fontWeight": "900", "cursor": loading ? "not-allowed" : "pointer", "opacity": loading ? 0.7 : 1}}>
                <i className="fas fa-right-to-bracket"></i> Se connecter
              </button>

              <div className="divider" style={{"display": "flex", "alignItems": "center", "gap": ".75rem", "margin": "1.25rem 0"}}>
                <div style={{"flex": "1", "height": "1px", "background": "var(--border-color)"}}></div>
                <span style={{"color": "var(--text-secondary)", "fontWeight": "700"}}>ou</span>
                <div style={{"flex": "1", "height": "1px", "background": "var(--border-color)"}}></div>
              </div>

              <div className="social-login" style={{"display": "grid", "gap": ".6rem"}}>
                <button className="btn btn-ghost social-btn google-btn" style={{"padding": ".9rem 1rem", "borderRadius": "12px", "border": "1px solid var(--border-color)", "background": "var(--bg-glass)", "color": "var(--text-primary)", "fontWeight": "800", "cursor": "pointer"}}>
                  <i className="fab fa-google"></i> Continuer avec Google
                </button>
                <button className="btn btn-ghost social-btn facebook-btn" style={{"padding": ".9rem 1rem", "borderRadius": "12px", "border": "1px solid var(--border-color)", "background": "var(--bg-glass)", "color": "var(--text-primary)", "fontWeight": "800", "cursor": "pointer"}}>
                  <i className="fab fa-facebook-f"></i> Continuer avec Facebook
                </button>
                <button className="btn btn-ghost social-btn twitter-btn" style={{"padding": ".9rem 1rem", "borderRadius": "12px", "border": "1px solid var(--border-color)", "background": "var(--bg-glass)", "color": "var(--text-primary)", "fontWeight": "800", "cursor": "pointer"}}>
                  <i className="fab fa-x-twitter"></i> Continuer avec X
                </button>
              </div>

              <div className="auth-footer" style={{"textAlign": "center", "marginTop": "1rem", "color": "var(--text-secondary)"}}>
                <p>Pas encore de compte ?
                  <a href="/register" style={{"color": "var(--accent-primary)", "fontWeight": "900", "textDecoration": "none"}}>Créer un compte</a>
                </p>
              </div>
            </form>
          </div>

          {/*  Carte Avantages  */}
          <aside className="auth-benefits" style={{"background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1rem, .8rem + 1vw, 1.5rem)", "boxShadow": "0 20px 40px var(--shadow-color)"}}>
            <h3 style={{"fontWeight": "900", "marginBottom": ".75rem"}}><i className="fas fa-bolt"></i> Pourquoi nous rejoindre ?</h3>
            <ul style={{"listStyle": "none", "display": "grid", "gap": ".75rem", "margin": "0", "padding": "0"}}>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Données météo précises et mises à jour en continu</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Alertes intelligentes pour conditions extrêmes</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Prévisions multi-modèles et cartes radar</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Expérience Premium sans publicités</span>
              </li>
            </ul>

            <div style={{"marginTop": "1.25rem", "padding": "1rem", "borderRadius": "16px", "background": "var(--bg-glass)", "border": "1px solid var(--border-color)"}}>
              <strong><i className="fas fa-lock"></i> Sécurité</strong>
              <p style={{"margin": ".35rem 0 0", "color": "var(--text-secondary)"}}>Vos informations sont protégées et chiffrées selon les normes de l’industrie.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
    </>
  );
};

export default LoginPage;
