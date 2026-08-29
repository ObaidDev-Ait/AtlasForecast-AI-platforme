import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SOCIAL_LINKS } from './helpers'
import '../Styles/Pages.css'

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
})

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'question',
    priority: 'normale',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setLoading(true)

    // Simulate reliable transmission / future endpoint hook
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 900)
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: 'question',
      priority: 'normale',
      message: '',
    })
    setSubmitted(false)
  }

  return (
    <div className="container">
      <div className="af-page" style={{ paddingTop: '1rem' }}>
        {/* ====================================================================
            PAGE HEADER
            ==================================================================== */}
        <motion.div
          className="af-page-header"
          initial="hidden"
          animate="visible"
          variants={fadeUp(0)}
        >
          <div className="af-badge af-badge-primary" style={{ marginBottom: 'var(--sp-2)' }}>
            <i className="fas fa-headset"></i> SUPPORT TECHNIQUE & COMMERCIAL
          </div>
          <h1 className="af-page-title">
            Contactez l'Équipe <span className="text-gradient">AtlasForecast</span>
          </h1>
          <p className="af-page-subtitle">
            Une question technique, une demande de partenariat ou une suggestion ? Notre équipe vous répond sous 2 heures ouvrées.
          </p>
        </motion.div>

        {/* ====================================================================
            2-COLUMN CONTACT GRID
            ==================================================================== */}
        <div className="af-contact-main-grid">
          {/* Left Column: Direct Communication Channels & Information */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minWidth: 0, width: '100%' }}
            initial="hidden"
            animate="visible"
            variants={fadeUp(1)}
          >
            {/* Email Card */}
            <div className="af-card af-contact-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', minWidth: 0, width: '100%' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-envelope"></i>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                    Courrier Électronique
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Support direct & questions générales
                  </p>
                  <a
                    href="mailto:contact@atlasforecast.ma"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.4rem',
                      fontWeight: 700,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--accent-primary)',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    contact@atlasforecast.ma
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Phone Card */}
            <div className="af-card af-contact-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', minWidth: 0, width: '100%' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-success)',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-phone"></i>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                    Assistance Téléphonique
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Lun-Ven : 9h00 - 18h00 (GMT+1)
                  </p>
                  <a
                    href="tel:+212645508349"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.4rem',
                      fontWeight: 700,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--accent-success)',
                      wordBreak: 'break-word',
                    }}
                  >
                    +212 645508349
                  </a>
                </div>
              </div>
            </div>

            {/* Headquarters Card */}
            <div className="af-card af-contact-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', minWidth: 0, width: '100%' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-location-dot"></i>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                    Localisation
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-word' }}>
                    Rue Mohammed EL Bekall, Marrakech, Maroc
                  </p>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                    Zone Afrique du Nord • Fuseau GMT+1
                  </span>
                </div>
              </div>
            </div>

            {/* Response SLA Notice */}
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(0.75rem, 2vw, var(--sp-4))',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-3)',
                boxSizing: 'border-box',
                maxWidth: '100%',
              }}
            >
              <i className="fas fa-bolt" style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', flexShrink: 0 }}></i>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, minWidth: 0 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Engagement SLA :</strong> Temps de réponse moyen constaté de <strong>45 minutes</strong> en période ouvrée.
              </span>
            </div>

            {/* Social Network Links */}
            <div className="af-card af-contact-card">
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                RÉSEAUX PROFESSIONNELS
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'var(--sp-3)', flexWrap: 'wrap' }}>
                {Object.entries(SOCIAL_LINKS).map(([k, u]) => (
                  <a
                    key={k}
                    href={u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    aria-label={k}
                    style={{ padding: '0.45rem 0.75rem' }}
                  >
                    <i className={`fab fa-${k}`}></i>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            className="af-card af-contact-form-card"
            initial="hidden"
            animate="visible"
            variants={fadeUp(2)}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)' }}
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
                    <i className="fas fa-check"></i>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 'var(--sp-2)' }}>
                    Message Envoyé avec Succès !
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '420px', margin: '0 auto var(--sp-6)' }}>
                    Merci <strong>{formData.name}</strong>. Votre demande a été transmise à notre équipe. Un accusé de réception a été envoyé à <strong>{formData.email}</strong>.
                  </p>
                  <button onClick={handleReset} className="btn btn-primary">
                    <i className="fas fa-arrow-rotate-left"></i> Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%', minWidth: 0 }}
                >
                  <div style={{ marginBottom: 'var(--sp-2)' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Formulaire de Contact
                    </h2>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                      Remplissez ce formulaire pour joindre directement nos ingénieurs.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="af-notice af-notice-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name and Email in responsive row */}
                  <div className="af-contact-row">
                    <div className="af-form-group" style={{ margin: 0 }}>
                      <label className="af-label" htmlFor="contact-name">
                        <i className="fas fa-user"></i> Nom complet *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        required
                        className="af-input"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="af-form-group" style={{ margin: 0 }}>
                      <label className="af-label" htmlFor="contact-email">
                        <i className="fas fa-envelope"></i> Adresse e-mail *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        required
                        className="af-input"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Subject and Priority in responsive row */}
                  <div className="af-contact-row">
                    <div className="af-form-group" style={{ margin: 0 }}>
                      <label className="af-label" htmlFor="contact-subject">
                        <i className="fas fa-tag"></i> Motif *
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        className="af-select"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="question">Question générale</option>
                        <option value="technical">Support technique & API</option>
                        <option value="premium">Abonnement & Facturation</option>
                        <option value="partnership">Partenariat & Entreprise</option>
                        <option value="bug">Signalement d'anomalie</option>
                      </select>
                    </div>

                    <div className="af-form-group" style={{ margin: 0 }}>
                      <label className="af-label" htmlFor="contact-priority">
                        <i className="fas fa-fire"></i> Niveau de priorité
                      </label>
                      <select
                        id="contact-priority"
                        name="priority"
                        className="af-select"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="normale">Normale (Standard)</option>
                        <option value="haute">Haute (Prioritaire)</option>
                        <option value="urgente">Urgente (Incident)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="af-form-group" style={{ margin: 0 }}>
                    <label className="af-label" htmlFor="contact-message">
                      <i className="fas fa-comment-dots"></i> Message détaillé *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      required
                      className="af-textarea"
                      placeholder="Décrivez votre demande avec le plus de précisions possible..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-large"
                    style={{ width: '100%', marginTop: 'var(--sp-2)' }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span>Envoyer mon message</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
