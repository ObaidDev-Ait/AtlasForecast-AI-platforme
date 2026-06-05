import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingCities, setLoadingCities] = useState(true);

  const token = localStorage.getItem('access_token');
  const API_BASE_URL = 'http://localhost:4000';

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const res = await fetch(`${API_BASE_URL}/cities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
    if (token) {
      fetchCities();
    }
  }, [token]);

  const handleAddCity = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!newCity.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const res = await fetch(`${API_BASE_URL}/cities/${cityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      <section className="dashboard-section" style={{ padding: '2rem 0' }}>
        <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="dashboard-title" style={{ fontWeight: '900', fontSize: 'clamp(2rem, 1.5rem + 2vw, 3rem)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            <i className="fas fa-gauge"></i> Tableau de bord
          </h1>
          <p className="dashboard-subtitle" style={{ color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.5rem' }}>
            Gérez votre profil et vos villes favorites
          </p>
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* User Profile Card */}
          <div className="profile-card" style={{ background: 'var(--bg-glass-dark)', border: '1px solid var(--border-color)', borderRadius: '22px', padding: '2rem', boxShadow: '0 20px 40px var(--shadow-color)' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-user-circle" style={{ color: 'var(--accent-primary)' }}></i> Mon Profil
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>NOM COMPLET</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{fullName}</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>ADRESSE E-MAIL</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{user?.email}</span>
              </div>
              <div style={{ paddingBottom: '0.8rem' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>COMPTE CRÉÉ LE</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Cities Card */}
          <div className="cities-card" style={{ background: 'var(--bg-glass-dark)', border: '1px solid var(--border-color)', borderRadius: '22px', padding: '2rem', boxShadow: '0 20px 40px var(--shadow-color)' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-star" style={{ color: '#eab308' }}></i> Villes Sauvegardées
            </h2>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
                <i className="fas fa-exclamation-circle"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddCity} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Ajouter une ville (ex: Paris)"
                required
                style={{ flex: '1', padding: '0.8rem 1rem', background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '0.95rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.25rem', border: 'none', borderRadius: '12px', background: 'var(--gradient-primary)', color: '#fff', fontWeight: '800', cursor: 'pointer' }}>
                Ajouter
              </button>
            </form>

            {loadingCities ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                <i className="fas fa-spinner fa-spin"></i> Chargement...
              </div>
            ) : cities.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: '14px' }}>
                <i className="fas fa-city" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}></i>
                Aucune ville sauvegardée.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cities.map((city) => (
                  <li key={city.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{city.city_name}</span>
                    <button onClick={() => handleDeleteCity(city.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1rem' }} aria-label="Supprimer">
                      <i className="fas fa-trash-can"></i>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
