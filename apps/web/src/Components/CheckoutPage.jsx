import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

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
      <section className="checkout-section">
        <div className="account-header" style={{"textAlign": "center", "margin": "1.5rem 0 2rem"}}>
          <h1 className="account-title" style={{"fontWeight": "900", "fontSize": "clamp(1.8rem,1.2rem+2vw,2.6rem)", "background": "var(--gradient-primary)", "WebkitBackgroundClip": "text", "WebkitTextFillColor": "transparent", "backgroundClip": "text"}}>
            <i className="fas fa-lock"></i> Finaliser votre commande
          </h1>
          <p className="account-subtitle" style={{"color": "var(--text-secondary)", "fontWeight": "600"}}>Paiement sécurisé — chiffrement et meilleures pratiques</p>
        </div>

        <div className="checkout-grid responsive-grid responsive-grid-checkout">
          {/*  Résumé de commande  */}
          <aside className="order-summary" style={{"background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1rem, .8rem + 1vw, 1.5rem)", "boxShadow": "0 20px 40px var(--shadow-color)"}}>
            <h2 style={{"fontWeight": "900", "margin": "0 0 1rem"}}><i className="fas fa-receipt"></i> Résumé</h2>

            <div className="summary-plan" style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": ".5rem", "padding": "1rem", "borderRadius": "16px", "background": "var(--bg-glass)", "border": "1px solid var(--border-color)"}}>
              <div className="plan-info">
                <div id="selectedPlanName" style={{"fontWeight": "900"}}>Premium</div>
                <div id="selectedPlanDescription" style={{"color": "var(--text-secondary)", "fontWeight": "600"}}>Accès complet aux fonctionnalités avancées</div>
              </div>
              <div className="plan-price" style={{"textAlign": "right"}}>
                <div style={{"fontWeight": "900", "fontSize": "1.15rem"}} id="selectedPlanPrice">9.99€</div>
                <div style={{"color": "var(--text-secondary)"}}>/mois</div>
              </div>
            </div>

            <div className="billing-box" style={{"marginTop": "1rem"}}>
              <h3 style={{"fontWeight": "900", "marginBottom": ".5rem"}}><i className="fas fa-file-invoice-dollar"></i> Facturation</h3>
              <label className="radio-label" style={{"display": "flex", "gap": ".6rem", "alignItems": "center", "cursor": "pointer", "margin": ".35rem 0"}}>
                <input type="radio" name="billing" value="monthly" checked />
                <span>Mensuelle</span>
              </label>
              <label className="radio-label" style={{"display": "flex", "gap": ".6rem", "alignItems": "center", "cursor": "pointer", "margin": ".35rem 0"}}>
                <input type="radio" name="billing" value="yearly" />
                <span>Annuelle <span className="discount" style={{"color": "#22c55e", "fontWeight": "900"}}>-20%</span></span>
              </label>
            </div>

            <div className="totals" style={{"marginTop": "1rem", "background": "var(--bg-glass)", "border": "1px solid var(--border-color)", "borderRadius": "16px", "padding": "1rem"}}>
              <div className="total-line" style={{"display": "flex", "justifyContent": "space-between", "margin": ".2rem 0"}}>
                <span>Sous-total</span><span id="subtotal">9.99€</span>
              </div>
              <div className="total-line" style={{"display": "flex", "justifyContent": "space-between", "margin": ".2rem 0"}}>
                <span>Remise</span><span id="discount">0.00€</span>
              </div>
              <div className="total-line" style={{"display": "flex", "justifyContent": "space-between", "margin": ".4rem 0", "fontWeight": "900"}}>
                <span>Total</span><span id="total">9.99€</span>
              </div>
            </div>

            <div className="security-badge" style={{"marginTop": "1rem", "padding": "1rem", "borderRadius": "16px", "background": "var(--bg-glass)", "border": "1px solid var(--border-color)"}}>
              <strong><i className="fas fa-shield-halved"></i> Sécurité</strong>
              <p style={{"margin": ".35rem 0 0", "color": "var(--text-secondary)"}}>Paiement sécurisé SSL — Données chiffrées et protégées.</p>
            </div>
          </aside>

          {/*  Formulaire de paiement  */}
          <section className="checkout-form-card" style={{"position": "relative", "background": "var(--bg-glass-dark)", "border": "1px solid var(--border-color)", "borderRadius": "22px", "padding": "clamp(1.25rem,1rem+1vw,2rem)", "boxShadow": "0 20px 40px var(--shadow-color)", "overflow": "hidden"}}>
            <div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "1rem", "marginBottom": ".5rem"}}>
              <h2 style={{"fontWeight": "900", "margin": "0"}}><i className="fas fa-credit-card"></i> Paiement</h2>
              <div style={{"color": "var(--text-secondary)", "fontWeight": "700"}}>Méthode: <span id="checkoutMethod">Carte bancaire</span></div>
            </div>

            <form id="checkoutForm" onSubmit={async (e) => {
              e.preventDefault();
              setIsProcessing(true);
              try {
                // Simulate payment processing then update Supabase profile directly
                // (In a real app, a Stripe Webhook would do this, but we simulate it here for now)
                if (user) {
                  await supabase.from('profiles').update({ is_premium: true }).eq('id', user.id);
                  // Allow time for AuthContext to pick up the change or just redirect
                  setTimeout(() => {
                    window.location.href = '/premium';
                  }, 1500);
                } else {
                  window.location.href = '/login';
                }
              } catch(e) {
                console.error(e);
                setIsProcessing(false);
              }
            }}>
              {/*  Sélection méthode (URL ?method=card|paypal assurera l’ouverture correcte)  */}
              <div className="payment-methods" style={{"display": "flex", "gap": "1rem", "flexWrap": "wrap", "margin": ".25rem 0 1rem"}}>
                <button id="cardPayBtn" className="btn btn-outline" style={{"padding": ".6rem .9rem", "borderRadius": "12px", "cursor": "pointer"}}>
                  <i className="fas fa-credit-card"></i> Carte
                </button>
                <button id="paypalPayBtn" className="btn btn-outline" style={{"padding": ".6rem .9rem", "borderRadius": "12px", "cursor": "pointer"}}>
                  <i className="fab fa-paypal"></i> PayPal
                </button>
              </div>

              {/*  Bloc Carte  */}
              <div id="cardBlock">
                <div className="form-section">
                  <h3 style={{"fontWeight": "900", "margin": ".25rem 0 .75rem"}}><i className="fas fa-user"></i> Informations personnelles</h3>
                  <div className="form-row responsive-grid-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Prénom</label>
                      <input type="text" id="firstName" className="form-input" required
                        style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Nom</label>
                      <input type="text" id="lastName" className="form-input" required
                        style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                    </div>
                  </div>
                  <div className="form-group" style={{"marginTop": ".9rem"}}>
                    <label htmlFor="ccEmail" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>E-mail de facturation</label>
                    <input type="email" id="ccEmail" className="form-input" required
                      style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                  </div>
                </div>

                <div className="form-section" style={{"marginTop": "1rem"}}>
                  <h3 style={{"fontWeight": "900", "margin": ".25rem 0 .75rem"}}><i className="fas fa-credit-card"></i> Détails de la carte</h3>

                  {/*  Champ requis par script.js  */}
                  <div className="form-group">
                    <label htmlFor="ccName" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Nom sur la carte</label>
                    <input type="text" id="ccName" className="form-input" placeholder="Comme indiqué sur la carte"
                      style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                  </div>

                  <div className="form-group" style={{"marginTop": ".9rem"}}>
                    <label htmlFor="ccNumber" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Numéro de carte</label>
                    <input type="text" id="ccNumber" className="form-input" placeholder="1234 5678 9012 3456"
                      style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                  </div>
                  <div className="form-row responsive-grid-row" style={{"marginTop": ".9rem"}}>
                    <div className="form-group">
                      <label htmlFor="ccExp" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Expiration (MM/AA)</label>
                      <input type="text" id="ccExp" className="form-input" placeholder="MM/AA"
                        style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ccCvc" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>CVC</label>
                      <input type="text" id="ccCvc" className="form-input" placeholder="123"
                        style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                    </div>
                  </div>
                </div>

                <div className="form-section" style={{"marginTop": "1rem"}}>
                  <h3 style={{"fontWeight": "900", "margin": ".25rem 0 .75rem"}}><i className="fas fa-location-dot"></i> Adresse de facturation</h3>
                  <div className="form-group">
                    <label htmlFor="address" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Adresse</label>
                    <input type="text" id="address" className="form-input" required
                      style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                  </div>
                  <div className="form-row responsive-grid-row" style={{"marginTop": ".9rem"}}>
                    <div className="form-group">
                      <label htmlFor="city" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Ville</label>
                      <input type="text" id="city" className="form-input" required
                        style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="postalCode" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Code postal</label>
                      <input type="text" id="postalCode" className="form-input" required
                        style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                    </div>
                  </div>
                  <div className="form-group" style={{"marginTop": ".9rem"}}>
                    <label htmlFor="country" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Pays</label>
                    <select id="country" className="form-input form-select" required
                      style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}}>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                      <option value="US">États-Unis</option>
                      <option value="MA">Maroc</option>
                    </select>
                  </div>
                </div>
              </div>

              {/*  Bloc PayPal  */}
              <div id="paypalBlock" style={{"display": "none"}}>
                <div className="form-section">
                  <h3 style={{"fontWeight": "900", "margin": ".25rem 0 .75rem"}}><i className="fab fa-paypal"></i> Connexion PayPal</h3>
                  <div className="form-group">
                    <label htmlFor="ppEmail" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>E-mail PayPal</label>
                    <input type="email" id="ppEmail" className="form-input" placeholder="email@paypal.com"
                      style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ppPassword" className="form-label" style={{"display": "block", "marginBottom": ".45rem", "fontWeight": "800"}}>Mot de passe</label>
                    <input type="password" id="ppPassword" className="form-input" placeholder="Mot de passe PayPal"
                      style={{"width": "100%", "padding": ".95rem 1.1rem", "background": "var(--bg-glass)", "color": "var(--text-primary)", "border": "1px solid var(--border-color)", "borderRadius": "14px"}} />
                  </div>
                </div>
              </div>

              {/*  Conditions  */}
              <div className="form-section" style={{"marginTop": "1rem"}}>
                <label className="checkbox-label" style={{"display": "flex", "gap": ".5rem", "alignItems": "flex-start", "cursor": "pointer"}}>
                  <input type="checkbox" id="terms" name="terms" required style={{"transform": "scale(1.1)", "marginTop": ".25rem"}} />
                  <span>J'accepte les <a href="terms.html" className="terms-link" style={{"color": "var(--accent-primary)", "fontWeight": "800", "textDecoration": "none"}}>conditions d'utilisation</a> et la
                    <a href="/privacy" className="terms-link" style={{"color": "var(--accent-primary)", "fontWeight": "800", "textDecoration": "none"}}>politique de confidentialité</a></span>
                </label>
              </div>

              {/*  Erreur et spinner  */}
              <div id="checkoutError" style={{"color": "var(--accent-error)", "fontWeight": "800", "margin": ".6rem 0"}}></div>
              <div id="checkoutSpinner" style={{"display": "none", "color": "var(--text-secondary)", "margin": ".25rem 0 0"}}><i className="fas fa-spinner fa-spin"></i> Traitement en cours...</div>

              {/*  Action  */}
              <button id="checkoutSubmit" type="submit" className="btn btn-primary btn-lg" style={{"width": "100%", "padding": "1rem 1.25rem", "border": "none", "borderRadius": "14px", "background": "var(--gradient-primary)", "color": "#fff", "fontWeight": "900", "cursor": "pointer", "marginTop": ".85rem"}}>
                {isProcessing ? <><i className="fas fa-spinner fa-spin"></i> Traitement...</> : <><i className="fas fa-lock"></i> Payer maintenant</>}
              </button>
            </form>
          </section>
        </div>
      </section>
    </div>
    </>
  );
};

export default CheckoutPage;
