import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { authFetch, API_BASE_URL as API_URL } from '../lib/api'

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
})

export default function DashboardPage() {
  const { user, profile, isPremium, isAdmin } = useAuth()
  const [cities, setCities] = useState([])
  const [newCity, setNewCity] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [loadingCities, setLoadingCities] = useState(true)

  const token = localStorage.getItem('access_token')

  const fetchCities = async () => {
    try {
      setLoadingCities(true)
      const res = await authFetch(`${API_URL}/cities`)
      if (res.ok) {
        const data = await res.json()
        setCities(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Fetch cities error:', err)
    } finally {
      setLoadingCities(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    if (token) fetchCities()
  }, [token])

  const handleAddCity = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    if (!newCity.trim()) return

    try {
      const res = await authFetch(`${API_URL}/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_name: newCity.trim() }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Impossible d'ajouter cette ville.")
      }
      setNewCity('')
      setSuccessMsg('Ville ajoutée avec succès !')
      fetchCities()
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleDeleteCity = async (cityId) => {
    try {
      const res = await authFetch(`${API_URL}/cities/${cityId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Erreur de suppression.')
      }
      fetchCities()
    } catch (err) {
      console.error(err)
    }
  }

  const fullName =
    profile?.full_name ||
    [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
      .filter(Boolean)
      .join(' ') ||
    'Utilisateur'

  return (
    <div className="container">
      <div className="af-page" style={{ paddingTop: '1rem' }}>
        {/* Dashboard Header */}
        <motion.div
          className="af-page-header"
          initial="hidden"
          animate="visible"
          variants={fadeUp(0)}
          style={{ textAlign: 'left', margin: '0 0 var(--sp-8)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
            <div>
              <div className="af-badge af-badge-primary" style={{ marginBottom: 'var(--sp-2)' }}>
                <i className="fas fa-gauge"></i> ESPACE MEMBRE
              </div>
              <h1 className="af-page-title" style={{ margin: 0 }}>
                Bonjour, {fullName}
              </h1>
              <p className="af-page-subtitle" style={{ margin: '0.25rem 0 0' }}>
                Tableau de bord météo personnel & gestion des stations surveillées.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(124, 58, 237, 0.4)', color: '#a78bfa' }}>
                  <i className="fas fa-shield-alt"></i> Panneau Admin
                </Link>
              )}
              <Link to="/weather" className="btn btn-primary btn-sm">
                <i className="fas fa-cloud-sun"></i> Météo en direct
              </Link>
            </div>
          </div>
        </motion.div>

        {/* KPI Summary Cards */}
        <motion.div
          className="af-grid af-grid-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--sp-4)',
            marginBottom: 'var(--sp-8)',
          }}
          initial="hidden"
          animate="visible"
        >
          {/* KPI 1: Saved Cities */}
          <motion.div className="af-card af-card-kpi" variants={fadeUp(1)}>
            <div className="af-kpi-icon af-wm-blue">
              <i className="fas fa-city"></i>
            </div>
            <div>
              <span className="af-wm-label">VILLES SURVEILLÉES</span>
              <span className="af-wm-value">{loadingCities ? '—' : cities.length}</span>
            </div>
          </motion.div>

          {/* KPI 2: Subscription Status */}
          <motion.div
            className={`af-card af-card-kpi ${isPremium ? 'af-card-premium' : ''}`}
            variants={fadeUp(2)}
          >
            <div className="af-kpi-icon af-wm-gold">
              <i className="fas fa-crown"></i>
            </div>
            <div>
              <span className="af-wm-label">FORMULE D'ACCÈS</span>
              <span className="af-wm-value" style={{ color: isPremium ? '#fbbf24' : 'var(--text-primary)' }}>
                {isPremium ? '⭐ Premium Pro' : 'Gratuit'}
              </span>
            </div>
            {!isPremium && (
              <Link to="/premium" className="btn btn-premium btn-sm" style={{ marginLeft: 'auto', padding: '0.25rem 0.65rem' }}>
                Upgrade
              </Link>
            )}
          </motion.div>

          {/* KPI 3: AI Weather Copilot */}
          <motion.div className="af-card af-card-kpi af-card-ai" variants={fadeUp(3)}>
            <div className="af-kpi-icon af-wm-cyan">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <span className="af-wm-label">ASSISTANT COPILOT IA</span>
              <span className="af-wm-value" style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                Disponible 24/7
              </span>
            </div>
            <Link to="/assistant" className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', padding: '0.25rem 0.65rem' }}>
              Ouvrir
            </Link>
          </motion.div>

          {/* KPI 4: Active Alerts */}
          <motion.div className="af-card af-card-kpi" variants={fadeUp(4)}>
            <div className="af-kpi-icon af-wm-orange">
              <i className="fas fa-bell"></i>
            </div>
            <div>
              <span className="af-wm-label">ALERTES CLIMAT</span>
              <span className="af-wm-value">Actives</span>
            </div>
            <Link to="/alerts" className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', padding: '0.25rem 0.65rem' }}>
              Consulter
            </Link>
          </motion.div>
        </motion.div>

        {/* Main Content Grid: Saved Cities & Profile Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 'var(--sp-6)',
          }}
          className="af-dash-main-grid"
        >
          {/* Left Column: Saved Cities Management */}
          <motion.div
            className="af-card"
            initial="hidden"
            animate="visible"
            variants={fadeUp(5)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  <i className="fas fa-star" style={{ color: '#fbbf24', marginRight: '0.5rem' }}></i>
                  Mes Villes Favorites
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Accès instantané aux prévisions pour vos localités régulières
                </p>
              </div>
              <span className="af-badge af-badge-neutral">{cities.length} ville(s)</span>
            </div>

            {errorMsg && (
              <div className="af-notice af-notice-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="af-notice af-notice-success">
                <i className="fas fa-check-circle"></i>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Add New City Form */}
            <form onSubmit={handleAddCity} style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Ajouter une ville (ex: Marrakech, Tanger, Paris...)"
                className="af-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-plus"></i>
                <span>Ajouter</span>
              </button>
            </form>

            {/* Cities List */}
            {loadingCities ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '52px',
                      background: 'var(--bg-glass-light)',
                      borderRadius: 'var(--radius-md)',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : cities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', color: 'var(--text-muted)' }}>
                <i className="fas fa-city" style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)', opacity: 0.5 }}></i>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Aucune ville enregistrée</h4>
                <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
                  Utilisez le champ ci-dessus pour ajouter vos localités à surveiller.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {cities.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Link
                      to="/weather"
                      state={{ initialCity: c.city_name }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                      }}
                    >
                      <i className="fas fa-location-dot" style={{ color: 'var(--accent-primary)' }}></i>
                      <span>{c.city_name}</span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      <Link
                        to="/forecast"
                        state={{ initialCity: c.city_name }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <i className="fas fa-chart-line"></i> Prévisions
                      </Link>
                      <button
                        onClick={() => handleDeleteCity(c.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--accent-danger)', padding: '0.3rem 0.5rem' }}
                        title="Supprimer cette ville"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Account & Subscription Summary */}
          <motion.div
            className="af-card"
            initial="hidden"
            animate="visible"
            variants={fadeUp(6)}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--sp-5)' }}>
                <i className="fas fa-user-circle" style={{ fontSize: '1.35rem', color: 'var(--accent-primary)' }}></i>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Profil & Abonnement</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ADRESSE E-MAIL
                  </span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {user?.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    STATUT D'ACCÈS
                  </span>
                  <div style={{ marginTop: '0.3rem' }}>
                    <span className={`af-badge ${isPremium ? 'af-badge-premium' : 'af-badge-neutral'}`}>
                      {isPremium ? '⭐ Membre Premium Pro' : 'Compte Gratuit'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    MEMBRE DEPUIS
                  </span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'AtlasForecast 2026'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)' }}>
              {!isPremium && (
                <Link to="/premium" className="btn btn-premium" style={{ justifyContent: 'center' }}>
                  <i className="fas fa-crown"></i> Passer à Premium ($5/mo)
                </Link>
              )}
              <Link to="/profile" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                <i className="fas fa-pen"></i> Modifier mon profil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
