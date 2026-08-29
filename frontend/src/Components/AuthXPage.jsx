import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthXPage = () => {
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
    const email = document.getElementById('xEmail')?.value || '';
    if (!/.+@.+\..+/.test(email)) return;
    try {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authProvider', 'X');
    } catch (_) {}
    navigate('/');
  };

  return (
    <>
        <div className="auth-wrap">
            <div className="auth-header">
                <div className="brand-chip"><i className="fab fa-x-twitter" style={{"color": "#000000"}}></i> X</div>
                <h1 className="auth-title">Continuer avec X</h1>
                <p className="auth-sub">Autorisez AtlasForecast à utiliser votre compte X pour vous connecter.</p>
            </div>
            <div className="auth-card provider-x">
                <form id="xAuthForm" className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="xEmail">Email X (Twitter)</label>
                        <input id="xEmail" type="email" placeholder="vous@email.com" required />
                    </div>
                    <ul className="scope-list">
                        <li><i className="fas fa-check"></i> Lecture de l'email</li>
                        <li><i className="fas fa-check"></i> Profil de base</li>
                    </ul>
                    <div className="actions">
                        <button className="btn-continue" type="submit"><i className="fab fa-x-twitter"></i> Continuer</button>
                        <a className="link-cancel" href="/login">Annuler</a>
                    </div>
                    <div id="xError" className="error-msg"></div>
                    <div className="info-msg">Démo: pas de connexion réelle, juste simulation.</div>
                </form>
            </div>
        </div>
    </>
  );
};

export default AuthXPage;
