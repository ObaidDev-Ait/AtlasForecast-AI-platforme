import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { API_BASE_URL } from '../lib/api'
import '../Styles/Auth.css'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse e-mail valide.')
      return
    }

    setLoading(true)

    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      })

      if (error) {
        // If frontend Supabase client errors (e.g. mock or network), try backend as fallback
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || error.message || 'Une erreur est survenue.')
        }
      }

      setSent(true)
    } catch (err) {
      setErrorMsg(err.message || 'Impossible de contacter le serveur. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

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
        {/* Header */}
        <motion.div
          className="af-page-header"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="af-badge af-badge-info" style={{ marginBottom: 'var(--sp-2)' }}>
            <i className="fas fa-key"></i> RÉCUPÉRATION DE COMPTE
          </div>
          <h1 className="af-page-title">Réinitialisation du Mot de Passe</h1>
          <p className="af-page-subtitle">
            Entrez votre adresse e-mail et nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="af-card"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ maxWidth: '480px', width: '100%' }}
        >
          <AnimatePresence mode="wait">
            {sent ? (
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
                  <i className="fas fa-envelope-circle-check"></i>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 'var(--sp-2)' }}>
                  Lien Envoyé !
                </h2>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.6,
                    maxWidth: '380px',
                    margin: '0 auto var(--sp-5)',
                  }}
                >
                  Si un compte existe avec l'adresse <strong>{email}</strong>, un lien de réinitialisation a été envoyé à votre boîte e-mail.
                  Vérifiez également vos <strong>spams</strong>.
                </p>

                <div
                  style={{
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--sp-3)',
                    marginBottom: 'var(--sp-5)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <i className="fas fa-clock" style={{ color: 'var(--accent-primary)' }}></i>
                    <span>Le lien est valide pendant <strong>60 minutes</strong>.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                    <i className="fas fa-arrow-left"></i> Retour à la connexion
                  </Link>
                  <button
                    onClick={() => {
                      setSent(false)
                      setEmail('')
                    }}
                    className="btn btn-ghost"
                    style={{ width: '100%' }}
                  >
                    <i className="fas fa-rotate-right"></i> Envoyer à une autre adresse
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-4)',
                  padding: 'var(--sp-2)',
                }}
              >
                {/* Step Indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-3)',
                    padding: 'var(--sp-3)',
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      Recevoir un lien de réinitialisation
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Un e-mail avec un lien sécurisé sera envoyé à votre boîte Gmail.
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="af-notice af-notice-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="af-form-group" style={{ margin: 0 }}>
                  <label className="af-label" htmlFor="forgot-email">
                    <i className="fas fa-envelope"></i> Adresse e-mail associée au compte
                  </label>
                  <input
                    type="email"
                    id="forgot-email"
                    className="af-input"
                    placeholder="votre@gmail.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-large"
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>Envoyer le lien de réinitialisation</span>
                    </>
                  )}
                </button>

                {/* Back to Login */}
                <Link
                  to="/login"
                  className="btn btn-ghost"
                  style={{ width: '100%', marginTop: 'var(--sp-1)' }}
                >
                  <i className="fas fa-arrow-left"></i> Retour à la connexion
                </Link>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
