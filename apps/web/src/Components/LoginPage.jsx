import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const email = e.target.email.value;
    const password = e.target.password.value;
    console.log("LoginPage - Email:", email);
    console.log("LoginPage - Password:", password);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container">
      <section className="af-page">
        <motion.div className="af-page-header" initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="af-page-title"><i className="fas fa-right-to-bracket"></i> Connexion</h1>
          <p className="af-page-subtitle">Accédez à votre espace AtlasForecast</p>
        </motion.div>

        <div className="af-grid af-grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Login Card */}
          <motion.div className="af-card" initial="hidden" animate="visible" variants={fadeUp}>
            {errorMsg && (
              <div className="af-notice af-notice-error" style={{ marginBottom: 'var(--sp-5)' }}>
                <i className="fas fa-exclamation-circle"></i> <span>{errorMsg}</span>
              </div>
            )}

            <form id="loginForm" onSubmit={handleLogin} autoComplete="on">
              <div className="af-form-group">
                <label htmlFor="email" className="af-label">
                  <i className="fas fa-envelope"></i> Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="af-input"
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="af-form-group">
                <label htmlFor="password" className="af-label">
                  <i className="fas fa-lock"></i> Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="af-input"
                    placeholder="Votre mot de passe"
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      border: 'none', background: 'transparent', color: 'var(--text-muted)',
                      cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1rem'
                    }}
                  >
                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" id="rememberMe" name="rememberMe" style={{ transform: 'scale(1.1)' }} />
                  Se souvenir de moi
                </label>
                <Link to="/forgot" style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Mot de passe oublié ?</Link>
              </div>

              <button type="submit" disabled={loading} className="af-btn af-btn-primary af-btn-lg af-btn-block">
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Connexion...</>
                ) : (
                  <><i className="fas fa-right-to-bracket"></i> Se connecter</>
                )}
              </button>

              <div className="af-divider">ou</div>

              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                <Link to="/auth-google" className="af-btn af-btn-ghost af-btn-block">
                  <i className="fab fa-google"></i> Continuer avec Google
                </Link>
                <Link to="/auth-facebook" className="af-btn af-btn-ghost af-btn-block">
                  <i className="fab fa-facebook-f"></i> Continuer avec Facebook
                </Link>
                <Link to="/auth-x" className="af-btn af-btn-ghost af-btn-block">
                  <i className="fab fa-x-twitter"></i> Continuer avec X
                </Link>
              </div>

              <p style={{ textAlign: 'center', marginTop: 'var(--sp-5)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Pas encore de compte ?{' '}
                <Link to="/register" style={{ fontWeight: 800 }}>Créer un compte</Link>
              </p>
            </form>
          </motion.div>

          {/* Benefits Card */}
          <motion.aside className="af-card" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
            <div className="af-card-header">
              <i className="fas fa-bolt"></i>
              <h3>Pourquoi nous rejoindre ?</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 'var(--sp-4)', margin: 0, padding: 0 }}>
              {[
                'Données météo précises et mises à jour en continu',
                'Alertes intelligentes pour conditions extrêmes',
                'Prévisions multi-modèles et cartes radar',
                'Expérience Premium sans publicités'
              ].map((text, i) => (
                <li key={i} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--accent-success)', marginTop: '2px', flexShrink: 0 }}></i>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="af-card" style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-4)' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                <i className="fas fa-lock" style={{ color: 'var(--accent-primary)' }}></i> Sécurité
              </strong>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Vos informations sont protégées et chiffrées selon les normes de l'industrie.</p>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
