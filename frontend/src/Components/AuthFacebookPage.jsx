import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthFacebookPage = () => {
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
    const email = document.getElementById('fbEmail')?.value || '';
    if (!/.+@.+\..+/.test(email)) return;
    try {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authProvider', 'Facebook');
    } catch (_) {}
    navigate('/');
  };

  return (
    <>
        <div className="auth-wrap">
            <div className="auth-header">
                <div className="brand-chip"><i className="fab fa-facebook" style={{"color": "#1877F2"}}></i> Facebook</div>
                <h1 className="auth-title">Continuer avec Facebook</h1>
                <p className="auth-sub">Autorisez AtlasForecast à utiliser votre compte Facebook pour vous connecter.</p>
            </div>
            <div className="auth-card provider-facebook">
                <form id="fbAuthForm" className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fbEmail">Email Facebook</label>
                        <input id="fbEmail" type="email" placeholder="vous@facebook.com" required />
                    </div>
                    <ul className="scope-list">
                        <li><i className="fas fa-check"></i> Lecture de l'email</li>
                        <li><i className="fas fa-check"></i> Profil de base</li>
                        <li><i className="fas fa-check"></i> Photo de profil</li>
                    </ul>
                    <div className="actions">
                        <button className="btn-continue" type="submit"><i className="fab fa-facebook"></i> Continuer</button>
                        <a className="link-cancel" href="/login">Annuler</a>
                    </div>
                    <div id="fbError" className="error-msg"></div>
                    <div className="info-msg">Démo: pas de connexion réelle, juste simulation.</div>
                </form>
            </div>
        </div>
    </>
  );
};

export default AuthFacebookPage;
