import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const firstName = e.target.firstName.value
    const lastName = e.target.lastName.value
    const email = e.target.email.value
    const password = e.target.password.value
    const confirmPassword = e.target.confirmPassword.value

    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName
      })

      if (error) {
        throw error
      }
      
      // Since email confirmation might be disabled in Supabase or auto-sign-in works:
      navigate('/dashboard')
      
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }));
    }, 100);
  }, [])

  return (
    <div className="container">
      <section className="af-page">
        <motion.div className="af-page-header" initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="af-page-title">
            <i className="fas fa-user-plus"></i> Créer un compte
          </h1>
          <p className="af-page-subtitle">Rejoignez AtlasForecast pour une expérience météo professionnelle</p>
        </motion.div>

        <div className="af-grid af-grid-2" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/*  Carte Inscription  */}
          <motion.div className="af-card" initial="hidden" animate="visible" variants={fadeUp}>
            {errorMsg && (
              <div className="af-notice af-notice-error" style={{ marginBottom: 'var(--sp-5)' }}>
                <i className="fas fa-exclamation-circle"></i> <span>{errorMsg}</span>
              </div>
            )}

            <form id="registerForm" onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                <div className="af-form-group">
                  <label htmlFor="firstName" className="af-label">
                    <i className="fas fa-user"></i> Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="af-input"
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div className="af-form-group">
                  <label htmlFor="lastName" className="af-label">
                    <i className="fas fa-user"></i> Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="af-input"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

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
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                <div className="af-form-group">
                  <label htmlFor="password" className="af-label">
                    <i className="fas fa-lock"></i> Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="af-input"
                    placeholder="Votre mot de passe"
                    required
                  />
                </div>
                <div className="af-form-group">
                  <label htmlFor="confirmPassword" className="af-label">
                    <i className="fas fa-lock"></i> Confirmer
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="af-input"
                    placeholder="Confirmez"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                <div className="af-form-group">
                  <label htmlFor="country" className="af-label">
                    <i className="fas fa-globe"></i> Pays
                  </label>
                  <select id="country" name="country" className="af-select" required>
                    <option value="">Sélectionnez</option>
                    <option value="FR">France</option>
                    <option value="MA">Maroc</option>
                    <option value="DZ">Algérie</option>
                    <option value="TN">Tunisie</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="CA">Canada</option>
                    <option value="US">États-Unis</option>
                    <option value="GB">Royaume-Uni</option>
                    <option value="DE">Allemagne</option>
                    <option value="ES">Espagne</option>
                    <option value="IT">Italie</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="af-form-group">
                  <label className="af-label">
                    <i className="fas fa-bell"></i> Préférences
                  </label>
                  <label className="af-input" style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', cursor: 'pointer', height: '44px' }}>
                    <input type="checkbox" id="newsletter" name="newsletter" style={{ transform: 'scale(1.1)' }} />
                    <span style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Recevoir les actualités</span>
                  </label>
                </div>
              </div>

              <div className="af-form-group">
                <label className="checkbox-label" style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" id="terms" name="terms" required style={{ transform: 'scale(1.1)', marginTop: '3px' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    J'accepte les <a href="/terms" style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>conditions d'utilisation</a> et la <a href="/privacy" style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>politique de confidentialité</a>
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="af-btn af-btn-primary af-btn-block" style={{ marginTop: 'var(--sp-2)' }}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Création...</> : <><i className="fas fa-user-plus"></i> Créer mon compte</>}
              </button>

              <div className="af-divider">ou</div>

              <div style={{ display: 'grid', gap: 'var(--sp-2)' }}>
                <button type="button" className="af-btn af-btn-secondary af-btn-block">
                  <i className="fab fa-google"></i> Google
                </button>
                <button type="button" className="af-btn af-btn-secondary af-btn-block">
                  <i className="fab fa-facebook-f"></i> Facebook
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 'var(--sp-4)' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>
                  Déjà un compte ? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>Se connecter</Link>
                </p>
              </div>
            </form>
          </motion.div>

          {/*  Carte Avantages  */}
          <motion.aside className="af-card af-card-elevated" initial="hidden" animate="visible" variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <i className="fas fa-star" style={{ color: 'var(--accent-warning)' }}></i> Avantages
              </h3>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 'var(--sp-3)', margin: 0, padding: 0 }}>
                <li style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--accent-success)' }}><i className="fas fa-check-circle"></i></span>
                  <span>Prévisions 5 jours, alertes personnalisées et radar en temps réel</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--accent-success)' }}><i className="fas fa-check-circle"></i></span>
                  <span>Expérience Premium sans publicité</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--accent-success)' }}><i className="fas fa-check-circle"></i></span>
                  <span>Synchronisation multi-appareils</span>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                <i className="fas fa-shield-alt" style={{ color: 'var(--accent-primary)' }}></i> Données sécurisées
              </strong>
              <p style={{ margin: 'var(--sp-2) 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
                Vos données sont chiffrées de bout en bout et ne sont jamais partagées à des tiers.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
