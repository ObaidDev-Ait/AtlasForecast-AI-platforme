import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGooglePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }));
    }, 100);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('gaEmail')?.value || '';
    if (!/.+@.+\..+/.test(email)) return;
    try {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authProvider', 'Google');
    } catch (_) {}
    navigate('/');
  };

  return (
    <>
        <div className="auth-wrap">
            <div className="auth-header">
                <div className="brand-chip"><i className="fab fa-google" style={{"color": "#EA4335"}}></i> Google</div>
                <h1 className="auth-title">Continuer avec Google</h1>
                <p className="auth-sub">Autorisez AtlasForecast à utiliser votre email pour vous connecter.</p>
            </div>
            <div className="auth-card provider-google">
                <form id="googleAuthForm" className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="gaEmail">Email Google</label>
                        <input id="gaEmail" type="email" placeholder="vous@gmail.com" required />
                    </div>
                    <ul className="scope-list">
                        <li><i className="fas fa-check"></i> Lecture de l'email</li>
                        <li><i className="fas fa-check"></i> Profil de base</li>
                    </ul>
                    <div className="actions">
                        <button className="btn-continue" type="submit"><i className="fab fa-google"></i> Continuer</button>
                        <a className="link-cancel" href="/login">Annuler</a>
                    </div>
                    <div id="gaError" className="error-msg"></div>
                    <div className="info-msg">Démo: pas de connexion réelle, juste simulation.</div>
                </form>
            </div>
        </div>
    </>
  );
};

export default AuthGooglePage;
