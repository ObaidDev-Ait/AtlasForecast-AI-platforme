import React, { useEffect } from 'react';

const ForgotPage = () => {
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
            <div className="forgot-container">
                <div className="forgot-header">
                    <h1><i className="fas fa-key"></i> Réinitialisation du mot de passe</h1>
                    <p>Suivez les 3 étapes simples ci-dessous pour réinitialiser votre mot de passe en toute sécurité</p>
                </div>

                <div className="forgot-card">
                    {/*  Étape 1: Demande de code  */}
                    <section id="stepRequest">
                        <div className="step-title"><i className="fas fa-envelope"></i> Étape 1 — Recevoir un code de vérification</div>
                        <p className="step-note">Saisissez l’adresse e-mail associée à votre compte. Un code vous sera envoyé.</p>

                        <form id="forgotForm" className="forgot-form">
                            <div className="form-group">
                                <label htmlFor="fpEmail">Adresse e-mail</label>
                                <input type="email" id="fpEmail" placeholder="votre@email.com" required />
                                <div id="fpError" className="error-msg"></div>
                                <div id="fpSuccess" className="success-msg"></div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="form-submit">
                                    <i className="fas fa-paper-plane"></i>
                                    Envoyer le code
                                </button>
                                <a className="back-link" href="/login">
                                    <i className="fas fa-arrow-left"></i>
                                    Retour à la connexion
                                </a>
                            </div>
                        </form>
                    </section>

                    {/*  Étape 2: Vérification du code  */}
                    <section id="stepVerify" style={{"display": "none"}}>
                        <div className="step-title"><i className="fas fa-shield-alt"></i> Étape 2 — Vérifier le code</div>
                        <p className="step-note">
                            Entrez le code reçu par e-mail pour confirmer votre identité.
                            <span className="demo-code"><i className="fas fa-bolt"></i> Code démo: <strong>123456</strong></span>
                        </p>

                        <form id="verifyForm" className="verify-form" style={{"display": "none"}}>
                            <div className="form-group">
                                <label htmlFor="fpCode">Code de vérification</label>
                                <input type="text" id="fpCode" placeholder="Ex: 123456" required />
                                <div id="fvError" className="error-msg"></div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="form-submit">
                                    <i className="fas fa-check-circle"></i>
                                    Vérifier le code
                                </button>
                                <a className="back-link" href="/login">
                                    <i className="fas fa-arrow-left"></i>
                                    Retour à la connexion
                                </a>
                            </div>
                        </form>
                    </section>

                    {/*  Étape 3: Nouveau mot de passe  */}
                    <section id="stepReset" style={{"display": "none"}}>
                        <div className="step-title"><i className="fas fa-lock"></i> Étape 3 — Définir un nouveau mot de passe</div>
                        <p className="step-note">Choisissez un mot de passe sécurisé (au moins 6 caractères).</p>

                        <form id="resetForm" className="reset-form" style={{"display": "none"}}>
                            <div className="form-group">
                                <label htmlFor="fpNew">Nouveau mot de passe</label>
                                <input type="password" id="fpNew" placeholder="Votre nouveau mot de passe" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fpConfirm">Confirmer le mot de passe</label>
                                <input type="password" id="fpConfirm" placeholder="Confirmez le mot de passe" required />
                                <div id="frError" className="error-msg"></div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="form-submit">
                                    <i className="fas fa-unlock"></i>
                                    Réinitialiser le mot de passe
                                </button>
                                <a className="back-link" href="/login">
                                    <i className="fas fa-arrow-left"></i>
                                    Retour à la connexion
                                </a>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </>
  );
};

export default ForgotPage;
