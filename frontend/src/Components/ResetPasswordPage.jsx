import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import '../Styles/Auth.css';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Check if Supabase passed an error directly in URL query/hash
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const params = new URLSearchParams(search || hash.replace(/^#/, '?'));
    const urlError = params.get('error_description') || params.get('error');

    if (urlError) {
      setErrorMsg(decodeURIComponent(urlError.replace(/\+/g, ' ')));
      setReady(true);
      return;
    }

    // 1. Listen for Supabase PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoverySession(true);
        setReady(true);
        setErrorMsg(null);
      } else if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        setHasRecoverySession(true);
        setReady(true);
      }
    });

    // 2. Handle PKCE code exchange or legacy hash recovery
    const checkRecoveryFlow = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
          // PKCE flow: exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!mounted) return;

          if (!error && data?.session) {
            setHasRecoverySession(true);
            setReady(true);
            return;
          }
        }

        // Check active session (detectSessionInUrl handles hash token automatically)
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          setErrorMsg('Le lien de réinitialisation est invalide ou a expiré.');
          setReady(true);
          return;
        }

        const isRecoveryTokenPresent =
          hash.includes('type=recovery') ||
          hash.includes('access_token=') ||
          Boolean(code);

        if (data?.session) {
          setHasRecoverySession(true);
          setReady(true);
        } else if (!isRecoveryTokenPresent) {
          // If no recovery token is in the URL and no active session exists
          setErrorMsg('Aucun jeton de réinitialisation trouvé dans l\'URL.');
          setReady(true);
        }
      } catch (_) {
        if (mounted) {
          setErrorMsg('Impossible de vérifier le lien de réinitialisation.');
          setReady(true);
        }
      }
    };

    checkRecoveryFlow();

    // Fallback: If after 2.5 seconds Supabase hasn't signaled session, mark ready
    const timer = setTimeout(() => {
      if (mounted) setReady(true);
    }, 2500);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message || 'Impossible de mettre à jour le mot de passe.');
        return;
      }

      setSuccess(true);

      // Sign out temporary recovery session so user begins a fresh session on login
      try {
        await supabase.auth.signOut();
      } catch (_) {}

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Mot de passe mis à jour avec succès.' },
        });
      }, 2000);
    } catch (err) {
      setErrorMsg(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div
        className="af-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 'clamp(2rem, 3vw, 4rem)',
        }}
      >
        <motion.div
          className="af-page-header"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="af-badge af-badge-info" style={{ marginBottom: 'var(--sp-2)' }}>
            <i className="fas fa-key"></i> SÉCURITÉ
          </div>
          <h1 className="af-page-title">Réinitialiser le mot de passe</h1>
          <p className="af-page-subtitle">
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
        </motion.div>

        <motion.div
          className="af-card"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ maxWidth: '460px', width: '100%' }}
        >
          <AnimatePresence mode="wait">
            {!ready ? (
              <div key="loading" style={{ textAlign: 'center', padding: 'var(--sp-6)' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}></i>
                <p style={{ marginTop: 'var(--sp-3)', color: 'var(--text-secondary)' }}>
                  Vérification du lien de réinitialisation...
                </p>
              </div>
            ) : success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: 'var(--sp-6) var(--sp-4)' }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '2px solid var(--accent-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-success)',
                    fontSize: '1.75rem',
                    margin: '0 auto var(--sp-4)',
                  }}
                >
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 'var(--sp-2)' }}>
                  Mot de passe mis à jour avec succès.
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Redirection vers la page de connexion...
                </p>
              </motion.div>
            ) : !hasRecoverySession ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: 'var(--sp-6) var(--sp-4)' }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '2px solid var(--accent-danger, #ef4444)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-danger, #ef4444)',
                    fontSize: '1.75rem',
                    margin: '0 auto var(--sp-4)',
                  }}
                >
                  <i className="fas fa-triangle-exclamation"></i>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 'var(--sp-2)' }}>
                  Lien invalide ou expiré
                </h2>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    marginBottom: 'var(--sp-5)',
                  }}
                >
                  {errorMsg ||
                    'Le lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.'}
                </p>
                <Link to="/forgot" className="btn btn-primary" style={{ width: '100%' }}>
                  <i className="fas fa-paper-plane"></i> Demander un nouveau lien
                </Link>
                <Link
                  to="/login"
                  className="btn btn-ghost"
                  style={{ width: '100%', marginTop: 'var(--sp-2)' }}
                >
                  <i className="fas fa-arrow-left"></i> Retour à la connexion
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-4)',
                  padding: 'var(--sp-2)',
                }}
              >
                {errorMsg && (
                  <div className="af-notice af-notice-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Field 1: Nouveau mot de passe */}
                <div className="af-form-group" style={{ margin: 0 }}>
                  <label className="af-label" htmlFor="new-password">
                    <i className="fas fa-lock"></i> Nouveau mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="new-password"
                      className="af-input"
                      placeholder="Minimum 8 caractères"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Field 2: Confirmer le mot de passe */}
                <div className="af-form-group" style={{ margin: 0 }}>
                  <label className="af-label" htmlFor="confirm-new-password">
                    <i className="fas fa-lock"></i> Confirmer le mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-new-password"
                      className="af-input"
                      placeholder="Confirmez le mot de passe"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Main button: Confirmer le mot de passe */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-large"
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      <span>Confirmer le mot de passe</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
