import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

// Pages that must never be a redirect destination (loop prevention)
const LOOP_GUARD = new Set(['/login', '/register', '/forgot']);

/**
 * Safely resolves the post-auth destination from the ?redirect= query param.
 * Falls back to `fallback` when the param is absent, unsafe, or would loop.
 */
function resolveRedirect(search, fallback = '/dashboard') {
  const raw = new URLSearchParams(search).get('redirect');
  if (!raw) return fallback;
  try {
    const decoded = decodeURIComponent(raw);
    // Must be an absolute-path URL (starts with /) and not a protocol-relative URL (//)
    // Must not be one of the auth pages (prevents redirect loops)
    const pathOnly = decoded.split('?')[0].split('#')[0];
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !LOOP_GUARD.has(pathOnly)) {
      return decoded;
    }
  } catch (_) { /* decodeURIComponent failed — ignore */ }
  return fallback;
}

/**
 * Maps authentication errors to user-friendly messages.
 * Only credential errors are mapped to "L’adresse e-mail ou le mot de passe est incorrect."
 * Technical and other errors (network, rate limiting, validation) remain distinct and meaningful.
 */
function formatLoginError(error) {
  if (!error) return null;

  const rawMessage = typeof error === 'string' ? error : (error.message || '');
  const normalized = rawMessage.toLowerCase().trim();
  const status = error.status;

  // 1. Wrong credentials / authentication failure
  if (
    status === 401 ||
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('password incorrect') ||
    normalized.includes('wrong password') ||
    normalized.includes('user not found') ||
    normalized.includes('email not confirmed') ||
    normalized.includes('invalid email or password') ||
    normalized.includes('bad credentials') ||
    normalized === 'l’adresse e-mail ou le mot de passe est incorrect.'
  ) {
    return 'L’adresse e-mail ou le mot de passe est incorrect.';
  }

  // 2. Rate limiting
  if (
    status === 429 ||
    normalized.includes('rate limit') ||
    normalized.includes('too many requests') ||
    normalized.includes('trop de tentatives')
  ) {
    return 'Trop de tentatives de connexion. Veuillez patienter avant de réessayer.';
  }

  // 3. Network / Backend availability
  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network error') ||
    normalized.includes('temporarily unavailable') ||
    normalized.includes('err_connection') ||
    normalized.includes('service unavailable')
  ) {
    return 'Le service est temporairement indisponible. Veuillez vérifier votre connexion ou réessayer dans quelques instants.';
  }

  // 4. Validation errors
  if (
    normalized.includes('valid email address is required') ||
    normalized.includes('email must be an email') ||
    normalized.includes('adresse e-mail valide')
  ) {
    return 'Veuillez saisir une adresse e-mail valide.';
  }
  if (
    normalized.includes('password is required') ||
    normalized.includes('mot de passe est requis')
  ) {
    return 'Veuillez saisir votre mot de passe.';
  }

  // 5. Clean custom French messages
  if (/^[A-ZÀ-Ÿ].*[.!?]$/.test(rawMessage) && !normalized.includes('error') && !normalized.includes('exception')) {
    return rawMessage;
  }

  // 6. Generic server error
  if (status && status >= 500) {
    return 'Le service est temporairement indisponible. Veuillez réessayer plus tard.';
  }

  return 'L’adresse e-mail ou le mot de passe est incorrect.';
}

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // The redirect destination we'll use after a successful login or to pass to Register
  const redirectDestination = resolveRedirect(location.search, '/dashboard');

  // Build the Register URL preserving the redirect destination
  const registerHref = redirectDestination && redirectDestination !== '/dashboard'
    ? `/register?redirect=${encodeURIComponent(redirectDestination)}`
    : '/register';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      navigate(redirectDestination, { replace: true });
    } catch (error) {
      setErrorMsg(formatLoginError(error));
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
                <Link to={registerHref} style={{ fontWeight: 800 }}>Créer un compte</Link>
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
