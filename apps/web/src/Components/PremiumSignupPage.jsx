import React, { useEffect } from 'react';

const PremiumSignupPage = () => {
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
    <div className="container">
      <section className="premium-signup">
        <div className="ps-header" style={{"textAlign": "center", "margin": "1.5rem 0 2rem"}}>
          <h1 className="ps-title" style={{"fontWeight": "900", "fontSize": "clamp(1.8rem,1.2rem+2vw,2.6rem)", "background": "var(--gradient-primary)", "WebkitBackgroundClip": "text", "WebkitTextFillColor": "transparent", "backgroundClip": "text"}}>
            <i className="fas fa-crown"></i> Activer l'essai Premium
          </h1>
          <p className="ps-subtitle" style={{"color": "var(--text-secondary)", "fontWeight": "600"}}>3 jours d'essai — sans engagement</p>
        </div>

        <div className="ps-grid responsive-grid responsive-grid-premium">
          {/*  Carte Plan  */}
          <aside className="plan-card" style={{"background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1rem, .8rem + 1vw, 1.5rem)", "boxShadow": "0 20px 40px var(--shadow-color)"}}>
            <h2 style={{"fontWeight": "900", "margin": "0 0 .75rem"}}><i className="fas fa-bolt"></i> Ce que vous obtenez</h2>
            <ul style={{"listStyle": "none", "display": "grid", "gap": ".75rem", "margin": "0", "padding": "0"}}>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Prévisions 15 jours multi‑modèles (Open‑Meteo, ECMWF, GFS, ICON)</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Radar pluie (RainViewer) et imagerie satellite (NASA‑GIBS)</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Alertes météo personnalisées en temps réel</span>
              </li>
              <li style={{"display": "flex", "gap": ".6rem", "alignItems": "flex-start"}}>
                <span style={{"color": "#10b981"}}><i className="fas fa-check-circle"></i></span>
                <span>Expérience sans publicités et support prioritaire</span>
              </li>
            </ul>

            <div style={{"marginTop": "1.25rem", "padding": "1rem", "borderRadius": "16px", "background": "var(--bg-glass)", "border": "1px solid var(--border-color)"}}>
              <strong><i className="fas fa-tag"></i> Offres</strong>
              <p style={{"margin": ".35rem 0 0", "color": "var(--text-secondary)"}}>Mensuel 4,99€ / Annuel 49,99€ (économisez 30%).</p>
            </div>
          </aside>

          {/*  Carte Activation  */}
          <section className="ps-card" style={{"position": "relative", "background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1.25rem,1rem+1vw,2rem)", "boxShadow": "0 20px 40px var(--shadow-color)", "overflow": "hidden"}}>
            <h2 style={{"fontWeight": "900", "marginTop": "0"}}><i className="fas fa-rocket"></i> Commencer l'essai</h2>
            <p style={{"color": "var(--text-secondary)", "margin": ".35rem 0 1rem"}}>Entrez votre e‑mail pour activer votre essai. Aucune carte requise ici — vous choisirez votre méthode sur la page de paiement.</p>

            <form id="premiumSignupForm" style={{"display": "grid", "gap": ".9rem"}} onSubmit={(e) => { e.preventDefault(); window.location.href = '/checkout'; }}>
              <div className="form-group">
                <label htmlFor="psUsername" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                  <i className="fas fa-user"></i> Nom d'utilisateur
                </label>
                <input type="text" id="psUsername" className="form-input" placeholder="Votre pseudo" required
                  style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}} />
              </div>

              <div className="form-group">
                <label htmlFor="psEmail" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                  <i className="fas fa-envelope"></i> Adresse e‑mail
                </label>
                <input type="email" id="psEmail" className="form-input" placeholder="vous@email.com" required
                  style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}} />
              </div>

              <div className="form-group">
                <label htmlFor="psPassword" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>
                  <i className="fas fa-lock"></i> Créer un mot de passe
                </label>
                <input type="password" id="psPassword" className="form-input" placeholder="Minimum 8 caractères" required minLength="8"
                  style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "backdropFilter": "blur(10px)"}} />
              </div>

              <div className="form-actions" style={{"display": "flex", "gap": ".75rem", "alignItems": "center", "flexWrap": "wrap"}}>
                <button type="submit" className="btn btn-primary btn-lg"
                  style={{"padding": "1rem 1.25rem", "border": "none", "borderRadius": "14px", "background": "var(--gradient-primary)", "color": "#fff", "fontWeight": "900", "cursor": "pointer"}}>
                  <i className="fas fa-arrow-right"></i> Continuer vers le paiement
                </button>
                <a href="/premium" className="btn btn-outline" style={{"padding": ".9rem 1rem", "borderRadius": "12px", "cursor": "pointer"}}>
                  <i className="fas fa-info-circle"></i> Voir les détails
                </a>
              </div>

              <div className="secure-note" style={{"marginTop": ".35rem", "color": "var(--text-secondary)", "fontWeight": "600"}}>
                <i className="fas fa-shield-halved"></i> Données chiffrées — vous pourrez choisir Carte ou PayPal.
              </div>
            </form>

            <div className="faq-mini" style={{"marginTop": "1.25rem"}}>
              <details style={{"background": "var(--bg-glass)", "border": "1px solid var(--border-color)", "borderRadius": "14px", "padding": ".85rem"}}>
                <summary style={{"cursor": "pointer", "fontWeight": "800"}}><i className="fas fa-question-circle"></i> Est‑ce vraiment sans engagement ?</summary>
                <p style={{"margin": ".5rem 0 0", "color": "var(--text-secondary)"}}>Oui. Vous pouvez annuler à tout moment pendant l’essai dans votre espace compte.</p>
              </details>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default PremiumSignupPage;
