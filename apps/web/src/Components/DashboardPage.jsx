import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { authFetch } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] } })
};

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingCities, setLoadingCities] = useState(true);

  const token = localStorage.getItem('access_token');

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const res = await authFetch(`${API_URL}/cities`);
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      } else {
        console.error('Failed to fetch cities');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (token) fetchCities();
  }, [token]);

  const handleAddCity = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!newCity.trim()) return;
    try {
      const res = await authFetch(`${API_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify({ city_name: newCity.trim() })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save city');
      }
      setNewCity('');
      fetchCities();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteCity = async (cityId) => {
    try {
      const res = await authFetch(`${API_URL}/cities/${cityId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete city');
      }
      fetchCities();
    } catch (err) {
      console.error(err);
    }
  };

  const fullName = profile?.full_name || [user?.user_metadata?.first_name, user?.user_metadata?.last_name].filter(Boolean).join(' ') || 'Utilisateur';

  return (
    <div className="container">
      <section className="af-page">
        {/* Page Header */}
        <motion.div className="af-page-header" initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="af-page-title"><i className="fas fa-gauge"></i> Tableau de bord</h1>
          <p className="af-page-subtitle">Bienvenue, {fullName}. Gérez votre profil et vos villes favorites.</p>
        </motion.div>

        {/* KPI Row */}
        <motion.div className="af-grid af-grid-auto-sm" style={{ marginBottom: 'var(--sp-8)' }} initial="hidden" animate="visible">
          <motion.div className="af-kpi" variants={fadeUp} custom={0}>
            <span className="af-kpi-label">Villes sauvegardées</span>
            <span className="af-kpi-value">{loadingCities ? '—' : cities.length}</span>
          </motion.div>
          <motion.div className="af-kpi" variants={fadeUp} custom={1}>
            <span className="af-kpi-label">Statut compte</span>
            <span className="af-kpi-value" style={{ fontSize: 'var(--text-xl)' }}>{profile?.is_premium ? '⭐ Premium' : 'Gratuit'}</span>
          </motion.div>
          <motion.div className="af-kpi" variants={fadeUp} custom={2}>
            <span className="af-kpi-label">Outils rapides</span>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)', flexWrap: 'wrap' }}>
              <Link to="/weather" className="af-btn af-btn-sm af-btn-secondary"><i className="fas fa-cloud-sun"></i> Météo</Link>
              <Link to="/assistant" className="af-btn af-btn-sm af-btn-secondary"><i className="fas fa-robot"></i> AI</Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Cards Grid */}
        <div className="af-grid af-grid-2">
          {/* Profile Card */}
          <motion.div className="af-card" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <div className="af-card-header">
              <i className="fas fa-user-circle"></i>
              <h2>Mon Profil</h2>
            </div>
            <div className="af-card-body">
              <div className="af-list">
                <div className="af-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-1)' }}>
                  <span className="af-kpi-label">NOM COMPLET</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</span>
                </div>
                <div className="af-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-1)' }}>
                  <span className="af-kpi-label">ADRESSE E-MAIL</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{user?.email}</span>
                </div>
                <div className="af-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-1)' }}>
                  <span className="af-kpi-label">COMPTE CRÉÉ LE</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>
              <Link to="/profile" className="af-btn af-btn-secondary af-btn-block" style={{ marginTop: 'var(--sp-5)' }}>
                <i className="fas fa-pen"></i> Modifier le profil
              </Link>
            </div>
          </motion.div>

          {/* Saved Cities Card */}
          <motion.div className="af-card" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <div className="af-card-header">
              <i className="fas fa-star" style={{ color: '#eab308' }}></i>
              <h2>Villes Sauvegardées</h2>
            </div>
            <div className="af-card-body">
              {errorMsg && (
                <div className="af-notice af-notice-error" style={{ marginBottom: 'var(--sp-4)' }}>
                  <i className="fas fa-exclamation-circle"></i> {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddCity} style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Ajouter une ville (ex: Paris)"
                  required
                  className="af-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="af-btn af-btn-primary">
                  <i className="fas fa-plus"></i> Ajouter
                </button>
              </form>

              {loadingCities ? (
                <div className="af-list">
                  {[1,2,3].map(i => <div key={i} className="af-skeleton af-skeleton-text" style={{ height: '48px', borderRadius: 'var(--radius-lg)' }}></div>)}
                </div>
              ) : cities.length === 0 ? (
                <div className="af-empty">
                  <div className="af-empty-icon"><i className="fas fa-city"></i></div>
                  <div className="af-empty-title">Aucune ville sauvegardée</div>
                  <div className="af-empty-desc">Ajoutez vos villes favorites pour un accès rapide à la météo.</div>
                </div>
              ) : (
                <ul className="af-list">
                  {cities.map((city) => (
                    <li key={city.id} className="af-list-item">
                      <Link to={`/weather`} style={{ fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                        <i className="fas fa-location-dot" style={{ color: 'var(--accent-primary)' }}></i>
                        {city.city_name}
                      </Link>
                      <button onClick={() => handleDeleteCity(city.id)} className="af-btn af-btn-icon af-btn-danger" style={{ width: '36px', height: '36px', minHeight: '36px' }} aria-label="Supprimer">
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
