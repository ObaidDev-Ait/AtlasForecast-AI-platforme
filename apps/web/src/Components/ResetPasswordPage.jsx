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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Detect a Supabase recovery session — Supabase redirects here with #access_token=...&type=recovery
  // and detectSessionInUrl exchanges it for a session automatically.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) {
          setErrorMsg('Le lien de réinitialisation est invalide ou a expiré.');
        }
        setHasRecoverySession(Boolean(data?.session));
      } catch (_) {
        if (!cancelled) setErrorMsg('Impossible de vérifier le lien de réinitialisation.');
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les deux mots de passe ne correspondent pas.');
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
      // Sign out the recovery session so the user lands on /login cleanly.
      try {
        await supabase.auth.signOut();
      } catch (_) {}
      setTimeout(() => navigate('/login', { replace: true }), 2500);
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
            <i className="fas fa-key"></i> NOUVEAU MOT DE PASSE
          </div>
          <h1 className="af-page-title">Définir un nouveau mot de passe</h1>
          <p className="af-page-subtitle">
            Choisissez un nouveau mot de passe sécurisé pour votre compte AtlasForecast.
          </p>
        </motion.div>

        <motion.div
          className="af-card"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ maxWidth: '480px', width: '100%' }}
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
                  Mot de passe mis à jour !
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Vous allez être redirigé vers la page de connexion...
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

                <div className="af-form-group" style={{ margin: 0 }}>
                  <label className="af-label" htmlFor="new-password">
                    <i className="fas fa-lock"></i> Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="af-input"
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="af-form-group" style={{ margin: 0 }}>
                  <label className="af-label" htmlFor="confirm-new-password">
                    <i className="fas fa-lock"></i> Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    className="af-input"
                    placeholder="Confirmez le mot de passe"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

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
                      <i className="fas fa-shield-halved"></i>
                      <span>Mettre à jour le mot de passe</span>
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
