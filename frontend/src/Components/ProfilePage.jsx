import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useUnits } from './Providers'
import { useTheme } from './Providers'
import { authFetch, API_BASE_URL } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import '../Styles/ProfilePage.css'

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
})

export default function ProfilePage() {
  const { user, profile, isPremium, role, isAdmin, refreshProfile, signOut } = useAuth()
  const { units, toggleUnits, unitLabel, windUnit } = useUnits()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Editing state for Personal Information
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null)
  const [profileErrorMsg, setProfileErrorMsg] = useState(null)

  // Password reset state
  const [sendingReset, setSendingReset] = useState(false)
  const [resetSuccessMsg, setResetSuccessMsg] = useState(null)
  const [resetErrorMsg, setResetErrorMsg] = useState(null)

  // Weather notifications toggle in local state & localStorage
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('af_pref_notifications') !== 'false'
  })

  // Saved cities state
  const [savedCities, setSavedCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [cityDeleteMsg, setCityDeleteMsg] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Synchronize full name when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name)
    } else if (user?.user_metadata?.first_name || user?.user_metadata?.last_name) {
      const fn = [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ')
      setFullName(fn)
    } else {
      setFullName('')
    }
  }, [profile, user])

  // Fetch real saved cities
  useEffect(() => {
    let isMounted = true
    const fetchCities = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/cities`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted) setSavedCities(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn('Could not load saved cities:', err)
      } finally {
        if (isMounted) setLoadingCities(false)
      }
    }
    fetchCities()
    return () => {
      isMounted = false
    }
  }, [])

  // Format initials
  const getInitials = () => {
    const name = fullName || profile?.full_name || user?.email || 'AF'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Format member since date
  const formatMemberDate = () => {
    const dateStr = profile?.created_at || user?.created_at
    if (!dateStr) return 'Août 2026'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    } catch {
      return 'Août 2026'
    }
  }

  // Handle personal info update
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSuccessMsg(null)
    setProfileErrorMsg(null)

    if (!fullName.trim()) {
      setProfileErrorMsg('Le nom complet ne peut pas être vide.')
      return
    }

    setSavingProfile(true)
    try {
      const res = await authFetch(`${API_BASE_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Échec de la mise à jour du profil.')
      }

      await refreshProfile()
      setProfileSuccessMsg('Profil mis à jour avec succès !')
      setIsEditing(false)

      setTimeout(() => setProfileSuccessMsg(null), 4000)
    } catch (err) {
      setProfileErrorMsg(err.message || 'Une erreur est survenue lors de l\'enregistrement.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Handle password reset email request
  const handleRequestPasswordReset = async () => {
    setResetSuccessMsg(null)
    setResetErrorMsg(null)

    const userEmail = profile?.email || user?.email
    if (!userEmail) {
      setResetErrorMsg('Aucune adresse e-mail trouvée pour ce compte.')
      return
    }

    setSendingReset(true)
    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: redirectUrl,
      })

      if (error) {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        })

        if (!res.ok) {
          throw new Error('Impossible d\'envoyer le lien de réinitialisation.')
        }
      }

      setResetSuccessMsg(
        `Un lien de réinitialisation sécurisé a été envoyé à ${userEmail}. Vérifiez votre boîte de réception.`
      )
      setTimeout(() => setResetSuccessMsg(null), 8000)
    } catch (err) {
      setResetErrorMsg(err.message || 'Erreur lors de l\'envoi du lien. Réessayez plus tard.')
    } finally {
      setSendingReset(false)
    }
  }

  // Toggle notifications
  const handleToggleNotifications = () => {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    localStorage.setItem('af_pref_notifications', String(next))
  }

  // Delete saved city
  const handleDeleteCity = async (id, cityName) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/cities/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSavedCities((prev) => prev.filter((c) => c.id !== id))
        setCityDeleteMsg(`Ville "${cityName}" retirée des favoris.`)
        setTimeout(() => setCityDeleteMsg(null), 3000)
      }
    } catch (err) {
      console.error('Failed to delete city:', err)
    }
  }

  const userEmail = profile?.email || user?.email || 'utilisateur@atlasforecast.ma'
  const displayName = fullName || profile?.full_name || 'Utilisateur AtlasForecast'

  return (
    <div className="container">
      <div className="af-profile-page">
        {/* ====================================================================
            1. PROFILE HEADER (SaaS Architecture)
            ==================================================================== */}
        <motion.div
          className="af-profile-hero"
          initial="hidden"
          animate="visible"
          variants={fadeUp(0)}
        >
          <div className="af-profile-hero-left">
            <div className="af-profile-avatar-wrap">
              <div className="af-profile-avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <div
                className="af-profile-status-dot"
                title="Compte actif et vérifié"
              />
            </div>

            <div className="af-profile-meta">
              <div className="af-profile-name-row">
                <h1 className="af-profile-name">{displayName}</h1>
                {isAdmin && (
                  <span className="af-badge af-badge-info" style={{ fontSize: '0.7rem' }}>
                    <i className="fas fa-shield-alt"></i> Administrateur
                  </span>
                )}
              </div>

              <p className="af-profile-email">
                <i className="fas fa-envelope" style={{ color: 'var(--accent-primary)' }}></i>
                {userEmail}
              </p>

              <div className="af-profile-badges-row">
                {isPremium ? (
                  <span className="af-profile-sub-badge pro">
                    <i className="fas fa-crown"></i> Abonnement Pro Actif
                  </span>
                ) : (
                  <span className="af-profile-sub-badge free">
                    <i className="fas fa-circle-check"></i> Formule Standard
                  </span>
                )}

                <span className="af-profile-country-badge">
                  <span>🇲🇦</span> Maroc
                </span>

                <span className="af-profile-country-badge">
                  <i className="fas fa-calendar-alt"></i> Membre depuis {formatMemberDate()}
                </span>
              </div>
            </div>
          </div>

          <div className="af-profile-hero-actions">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
            >
              <i className={isEditing ? 'fas fa-times' : 'fas fa-edit'}></i>
              <span>{isEditing ? 'Annuler l\'édition' : 'Modifier le profil'}</span>
            </button>

            {isPremium ? (
              <Link to="/premium" className="btn btn-premium btn-sm">
                <i className="fas fa-crown"></i> Gérer mon offre Pro
              </Link>
            ) : (
              <Link to="/premium" className="btn btn-primary btn-sm">
                <i className="fas fa-arrow-up-right-from-square"></i> Passer à Premium
              </Link>
            )}
          </div>
        </motion.div>

        {/* ====================================================================
            2. ACCOUNT OVERVIEW (4-KPI Real Data Cards)
            ==================================================================== */}
        <motion.div
          className="af-profile-kpis"
          initial="hidden"
          animate="visible"
          variants={fadeUp(0.05)}
        >
          {/* KPI 1: Plan */}
          <div className="af-profile-kpi-card">
            <div
              className="af-profile-kpi-icon"
              style={{ color: isPremium ? '#fbbf24' : 'var(--accent-primary)' }}
            >
              <i className={isPremium ? 'fas fa-crown' : 'fas fa-layer-group'}></i>
            </div>
            <div className="af-profile-kpi-body">
              <span className="af-profile-kpi-label">Formule Actuelle</span>
              <span className="af-profile-kpi-value">
                {isPremium ? 'AtlasForecast Pro' : 'AtlasForecast Standard'}
              </span>
            </div>
          </div>

          {/* KPI 2: Status */}
          <div className="af-profile-kpi-card">
            <div className="af-profile-kpi-icon" style={{ color: 'var(--accent-success)' }}>
              <i className="fas fa-shield-check"></i>
            </div>
            <div className="af-profile-kpi-body">
              <span className="af-profile-kpi-label">Statut du Compte</span>
              <span className="af-profile-kpi-value" style={{ color: 'var(--accent-success)' }}>
                Vérifié & Actif
              </span>
            </div>
          </div>

          {/* KPI 3: Member since */}
          <div className="af-profile-kpi-card">
            <div className="af-profile-kpi-icon" style={{ color: 'var(--accent-cyan)' }}>
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="af-profile-kpi-body">
              <span className="af-profile-kpi-label">Membre Depuis</span>
              <span className="af-profile-kpi-value">{formatMemberDate()}</span>
            </div>
          </div>

          {/* KPI 4: Saved cities */}
          <div className="af-profile-kpi-card">
            <div className="af-profile-kpi-icon" style={{ color: '#818cf8' }}>
              <i className="fas fa-location-dot"></i>
            </div>
            <div className="af-profile-kpi-body">
              <span className="af-profile-kpi-label">Villes Suivies</span>
              <span className="af-profile-kpi-value">
                {loadingCities ? '...' : `${savedCities.length} favorite(s)`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Global Notifications / Feedback Messages */}
        {profileSuccessMsg && (
          <motion.div
            className="af-notice af-notice-success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 'var(--sp-6)' }}
          >
            <i className="fas fa-check-circle"></i>
            <span>{profileSuccessMsg}</span>
          </motion.div>
        )}

        {profileErrorMsg && (
          <motion.div
            className="af-notice af-notice-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 'var(--sp-6)' }}
          >
            <i className="fas fa-exclamation-circle"></i>
            <span>{profileErrorMsg}</span>
          </motion.div>
        )}

        {/* ====================================================================
            3. MAIN CONTENT GRID (Personal Info, Preferences, Security, Plan)
            ==================================================================== */}
        <div className="af-profile-sections-grid">
          {/* LEFT COLUMN: Personal Info & Weather Preferences */}
          <div className="af-profile-col">
            {/* --- CARD: Personal Information --- */}
            <motion.div
              className="af-account-card"
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.1)}
            >
              <div className="af-account-card-header">
                <div>
                  <h2 className="af-account-card-title">
                    <i className="fas fa-id-badge"></i> Informations Personnelles
                  </h2>
                  <p className="af-account-card-desc">
                    Données d'identification associées à votre compte AtlasForecast.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <i className="fas fa-pen-to-square"></i> Modifier
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  <div className="af-form-group" style={{ margin: 0 }}>
                    <label className="af-label" htmlFor="edit-name">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      className="af-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Obaid Ait Mattou"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="af-form-group" style={{ margin: 0 }}>
                    <label className="af-label">
                      Adresse e-mail (liée au compte)
                    </label>
                    <input
                      type="email"
                      className="af-input"
                      value={userEmail}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      L'adresse e-mail est gérée de façon sécurisée par le système d'authentification.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn btn-primary btn-sm"
                    >
                      {savingProfile ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Enregistrement...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i> Enregistrer les modifications
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setFullName(profile?.full_name || '')
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="af-profile-field-list">
                  <div className="af-profile-field-item">
                    <span className="af-profile-field-label">
                      <i className="fas fa-user"></i> Nom complet
                    </span>
                    <div className="af-profile-field-val">
                      <span>{displayName}</span>
                    </div>
                  </div>

                  <div className="af-profile-field-item">
                    <span className="af-profile-field-label">
                      <i className="fas fa-envelope"></i> Adresse e-mail
                    </span>
                    <div className="af-profile-field-val">
                      <span>{userEmail}</span>
                      <span className="af-profile-field-val-sub">
                        <i className="fas fa-circle-check"></i> Vérifiée
                      </span>
                    </div>
                  </div>

                  <div className="af-profile-field-item">
                    <span className="af-profile-field-label">
                      <i className="fas fa-earth-africa"></i> Pays / Région
                    </span>
                    <div className="af-profile-field-val">
                      <span>Royaume du Maroc (MA)</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Fuseau GMT+1
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* --- CARD: Weather Preferences --- */}
            <motion.div
              className="af-account-card"
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.15)}
            >
              <div className="af-account-card-header">
                <div>
                  <h2 className="af-account-card-title">
                    <i className="fas fa-sliders"></i> Préférences Météorologiques
                  </h2>
                  <p className="af-account-card-desc">
                    Configurez l'affichage des mesures climatiques et les notifications.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {/* Units Setting */}
                <div className="af-pref-item">
                  <div className="af-pref-info">
                    <span className="af-pref-title">
                      <i className="fas fa-temperature-half" style={{ color: 'var(--accent-primary)' }}></i>
                      Système d'unités
                    </span>
                    <span className="af-pref-desc">
                      Actuellement réglé sur {unitLabel} et {windUnit}
                    </span>
                  </div>

                  <div className="af-pref-control">
                    <button
                      onClick={toggleUnits}
                      className="btn btn-secondary btn-sm"
                      title="Changer d'unité de mesure"
                    >
                      <i className="fas fa-arrow-right-arrow-left"></i>
                      <span>{units === 'metric' ? 'Métrique (°C, km/h)' : 'Impérial (°F, mph)'}</span>
                    </button>
                  </div>
                </div>

                {/* Theme Setting */}
                <div className="af-pref-item">
                  <div className="af-pref-info">
                    <span className="af-pref-title">
                      <i className="fas fa-palette" style={{ color: '#818cf8' }}></i>
                      Thème visuel de l'interface
                    </span>
                    <span className="af-pref-desc">
                      Mode {theme === 'dark' ? 'Sombre (Cosmos Saphir)' : 'Clair (Montagnes de l\'Atlas)'}
                    </span>
                  </div>

                  <div className="af-pref-control">
                    <button
                      onClick={toggleTheme}
                      className="btn btn-secondary btn-sm"
                    >
                      <i className={theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                      <span>{theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</span>
                    </button>
                  </div>
                </div>

                {/* Weather Alerts Notification Switch */}
                <div className="af-pref-item">
                  <div className="af-pref-info">
                    <span className="af-pref-title">
                      <i className="fas fa-bell" style={{ color: '#fbbf24' }}></i>
                      Alertes & Vigilance Météo
                    </span>
                    <span className="af-pref-desc">
                      Avertissements pour fortes chaleurs, neige sur l'Atlas et intempéries.
                    </span>
                  </div>

                  <div className="af-pref-control">
                    <button
                      onClick={handleToggleNotifications}
                      className={`btn btn-sm ${notificationsEnabled ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      <i className={notificationsEnabled ? 'fas fa-check' : 'fas fa-bell-slash'}></i>
                      <span>{notificationsEnabled ? 'Activées' : 'Désactivées'}</span>
                    </button>
                  </div>
                </div>

                {/* Update Frequency */}
                <div className="af-pref-item">
                  <div className="af-pref-info">
                    <span className="af-pref-title">
                      <i className="fas fa-clock-rotate-left" style={{ color: 'var(--accent-cyan)' }}></i>
                      Fréquence d'actualisation radar
                    </span>
                    <span className="af-pref-desc">
                      {isPremium ? 'Mise à jour ultra-rapide en continu (Temps réel)' : 'Cycle automatique toutes les 15 minutes'}
                    </span>
                  </div>

                  <span className="af-badge af-badge-primary">
                    {isPremium ? 'Temps Réel' : '15 min'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* --- CARD: Saved Cities --- */}
            <motion.div
              className="af-account-card"
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.2)}
            >
              <div className="af-account-card-header">
                <div>
                  <h2 className="af-account-card-title">
                    <i className="fas fa-city"></i> Villes & Régions Suivies
                  </h2>
                  <p className="af-account-card-desc">
                    Accès rapide aux bulletins météorologiques de vos localités favorites.
                  </p>
                </div>

                <Link to="/weather" className="btn btn-secondary btn-sm">
                  <i className="fas fa-plus"></i> Explorer
                </Link>
              </div>

              {cityDeleteMsg && (
                <div className="af-notice af-notice-info" style={{ padding: '0.5rem 0.85rem' }}>
                  <i className="fas fa-info-circle"></i>
                  <span>{cityDeleteMsg}</span>
                </div>
              )}

              {loadingCities ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  <i className="fas fa-spinner fa-spin"></i> Chargement des villes favorites...
                </div>
              ) : savedCities.length === 0 ? (
                <div className="af-profile-city-chip-empty">
                  Aucune ville favorite pour le moment. Ajoutez vos localités favorites depuis la page Météo ou Dashboard.
                </div>
              ) : (
                <div className="af-profile-cities-list">
                  {savedCities.map((city) => (
                    <div key={city.id} className="af-profile-city-chip">
                      <Link
                        to={`/weather?city=${encodeURIComponent(city.city_name)}`}
                        style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <i className="fas fa-map-pin" style={{ color: 'var(--accent-primary)' }}></i>
                        <span>{city.city_name}</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteCity(city.id, city.city_name)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0.15rem' }}
                        title={`Retirer ${city.city_name}`}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Subscription & Security */}
          <div className="af-profile-col">
            {/* --- CARD: Subscription Details --- */}
            <motion.div
              className="af-account-card"
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.12)}
            >
              <div className="af-account-card-header">
                <div>
                  <h2 className="af-account-card-title">
                    <i className="fas fa-crown" style={{ color: isPremium ? '#fbbf24' : 'var(--text-muted)' }}></i> Abonnement & Facturation
                  </h2>
                  <p className="af-account-card-desc">
                    Gestion de votre formule d'accès et des services associés.
                  </p>
                </div>
              </div>

              {isPremium ? (
                <div className="af-sub-callout pro">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="af-sub-plan-title">
                      <i className="fas fa-gem" style={{ color: '#fbbf24' }}></i>
                      AtlasForecast Pro
                    </h3>
                    <span className="af-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                      ACTIF
                    </span>
                  </div>

                  <p className="af-sub-plan-desc">
                    Vous bénéficiez de l'accès illimité à l'intelligence météorologique avancée,
                    au Copilot IA et aux radars haute résolution.
                  </p>

                  <ul className="af-sub-perks-list">
                    <li className="af-sub-perk-item">
                      <i className="fas fa-check"></i> Copilot IA 2026 illimité
                    </li>
                    <li className="af-sub-perk-item">
                      <i className="fas fa-check"></i> Prévisions 14 jours haute résolution
                    </li>
                    <li className="af-sub-perk-item">
                      <i className="fas fa-check"></i> Imagerie satellite et radar Doppler direct
                    </li>
                    <li className="af-sub-perk-item">
                      <i className="fas fa-check"></i> Alertes extrêmes prioritaires
                    </li>
                  </ul>

                  <div style={{ marginTop: 'var(--sp-2)' }}>
                    <Link to="/premium" className="btn btn-premium btn-sm" style={{ width: '100%' }}>
                      <i className="fas fa-sliders"></i> Gérer mon abonnement Paddle
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="af-sub-callout">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="af-sub-plan-title">
                      <i className="fas fa-layer-group" style={{ color: 'var(--accent-primary)' }}></i>
                      AtlasForecast Standard
                    </h3>
                    <span className="af-badge af-badge-primary">GRATUIT</span>
                  </div>

                  <p className="af-sub-plan-desc">
                    Accès de base aux prévisions 5 jours et aux bulletins actuels pour le Maroc.
                  </p>

                  <ul className="af-sub-perks-list">
                    <li className="af-sub-perk-item">
                      <i className="fas fa-check"></i> Météo actuelle toutes villes
                    </li>
                    <li className="af-sub-perk-item">
                      <i className="fas fa-check"></i> Prévisions 5 jours standards
                    </li>
                    <li className="af-sub-perk-item" style={{ opacity: 0.6 }}>
                      <i className="fas fa-xmark" style={{ color: 'var(--text-muted)' }}></i> Copilot IA (réservé Pro)
                    </li>
                    <li className="af-sub-perk-item" style={{ opacity: 0.6 }}>
                      <i className="fas fa-xmark" style={{ color: 'var(--text-muted)' }}></i> Radar haute précision (réservé Pro)
                    </li>
                  </ul>

                  <div style={{ marginTop: 'var(--sp-2)' }}>
                    <Link to="/premium" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      <i className="fas fa-crown"></i> Passer à Pro ($5/mois)
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* --- CARD: Security & Password --- */}
            <motion.div
              className="af-account-card"
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.18)}
            >
              <div className="af-account-card-header">
                <div>
                  <h2 className="af-account-card-title">
                    <i className="fas fa-lock"></i> Sécurité & Connexion
                  </h2>
                  <p className="af-account-card-desc">
                    Gestion du mot de passe et sécurité de votre session.
                  </p>
                </div>
              </div>

              {resetSuccessMsg && (
                <div className="af-notice af-notice-success">
                  <i className="fas fa-envelope-circle-check"></i>
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {resetErrorMsg && (
                <div className="af-notice af-notice-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{resetErrorMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <div className="af-profile-field-item">
                  <span className="af-profile-field-label">Mot de passe du compte</span>
                  <div className="af-profile-field-val">
                    <span>••••••••••••••••</span>
                    <button
                      onClick={handleRequestPasswordReset}
                      disabled={sendingReset}
                      className="btn btn-secondary btn-sm"
                    >
                      {sendingReset ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Envoi...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key"></i> Réinitialiser
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="af-pref-item">
                  <div className="af-pref-info">
                    <span className="af-pref-title">
                      <i className="fas fa-shield-halved" style={{ color: 'var(--accent-success)' }}></i>
                      Sécurité de session
                    </span>
                    <span className="af-pref-desc">
                      Session chiffrée SSL / Token JWT avec rotation automatique.
                    </span>
                  </div>
                  <span className="af-badge af-badge-success">Protégée</span>
                </div>

                <div style={{ paddingTop: 'var(--sp-2)' }}>
                  <button
                    onClick={signOut}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Se déconnecter de la session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
