import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

function formatTime(timestamp, timezoneOffset = 0) {
  if (!timestamp) return '--:--';
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

const WeatherPage = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleCityClick = (cityName) => {
    navigate('/forecast', { state: { initialCity: cityName } });
  };

  const searchWeather = async (searchCity, lat = null, lon = null) => {
    if (!searchCity?.trim() && (lat === null || lon === null)) return;
    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      let url;
      if (lat !== null && lon !== null) {
        url = `${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}&units=${unit}&lang=fr`;
      } else {
        url = `${API_BASE_URL}/weather/current?city=${encodeURIComponent(searchCity)}&units=${unit}&lang=fr`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        let errMsg = 'Ville non trouvée ou service météo temporairement indisponible.';
        try {
          const errData = await res.json();
          if (errData.message) errMsg = errData.message;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();

      setWeatherData(data);
      setCity(data.name || data.city);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setShowSuggestions(false);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        searchWeather('Position Actuelle', latitude, longitude);
      },
      () => {
        setLoading(false);
        setError("Impossible d'obtenir votre position actuelle.");
      },
      { timeout: 10000 },
    );
  };

  const handleSuggestionClick = (lat, lon, name) => {
    setCity(name);
    setShowSuggestions(false);
    searchWeather(name, lat, lon);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const initialCity = location.state?.initialCity || 'Casablanca';
    searchWeather(initialCity);
  }, [location.state]);

  // Autocomplete effect via AtlasForecast Backend
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!city || city.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const url = `${API_BASE_URL}/weather/geocoding?q=${encodeURIComponent(city)}&limit=5`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching suggestions', err);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [city]);

  // Re-fetch when unit changes
  useEffect(() => {
    if (weatherData?.name) {
      searchWeather(weatherData.name, weatherData.coord?.lat, weatherData.coord?.lon);
    }
  }, [unit]);

  const moroccoCities = [
    { name: 'Casablanca', region: 'Casablanca-Settat', temp: 23, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
    { name: 'Rabat', region: 'Rabat-Salé-Kénitra', temp: 24, desc: 'Ensoleillé', icon: 'sun' },
    { name: 'Marrakech', region: 'Marrakech-Safi', temp: 29, desc: 'Ensoleillé', icon: 'sun' },
    { name: 'Fès', region: 'Fès-Meknès', temp: 22, desc: 'Nuageux', icon: 'cloud' },
    { name: 'Agadir', region: 'Souss-Massa', temp: 26, desc: 'Ensoleillé', icon: 'sun' },
    { name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', temp: 22, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
    { name: 'Oujda', region: "L'Oriental", temp: 24, desc: 'Ensoleillé', icon: 'sun' },
    { name: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra', temp: 28, desc: 'Ensoleillé', icon: 'sun' },
    { name: 'Nador', region: "L'Oriental", temp: 23, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
  ];

  const worldCities = [
    { name: 'Paris', country: 'France', temp: 19, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
    { name: 'Londres', country: 'Royaume-Uni', temp: 17, desc: 'Pluie légère', icon: 'cloud-rain' },
    { name: 'New York', country: 'États-Unis', temp: 22, desc: 'Ensoleillé', icon: 'sun' },
    { name: 'Tokyo', country: 'Japon', temp: 25, desc: 'Nuageux', icon: 'cloud' },
    { name: 'Dubaï', country: 'Émirats Arabes Unis', temp: 36, desc: 'Ensoleillé', icon: 'sun' },
    { name: 'Madrid', country: 'Espagne', temp: 27, desc: 'Ensoleillé', icon: 'sun' },
  ];

  return (
    <div className="af-page">
      <div className="container">
        {/* Header */}
        <motion.div className="af-page-header" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="af-badge af-badge-primary" style={{ marginBottom: 'var(--sp-3)' }}>
            <i className="fas fa-satellite"></i> DONNÉES EN TEMPS RÉEL
          </div>
          <h1 className="af-page-title">Météo en Direct</h1>
          <p className="af-page-subtitle">
            Consultez les conditions météorologiques mondiales certifiées avec précision atmosphérique haute fidélité.
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          className="af-card af-card-elevated"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ maxWidth: '780px', margin: '0 auto var(--sp-8)', position: 'relative', zIndex: 10 }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchWeather(city);
            }}
            style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', position: 'relative' }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Rechercher une ville (ex: Casablanca, Paris, Marrakech)..."
                className="af-input"
                style={{ paddingLeft: 'var(--sp-10)' }}
              />
              <i
                className="fas fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: 'var(--sp-4)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />

              {/* Autocomplete suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="af-card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-glass-dark)',
                      backdropFilter: 'blur(24px)',
                      padding: 'var(--sp-2)',
                      borderRadius: 'var(--radius-xl)',
                      zIndex: 100,
                      boxShadow: 'var(--shadow-xl)',
                    }}
                  >
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(item.lat, item.lon, item.name)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: 'var(--sp-3) var(--sp-4)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <strong style={{ display: 'block' }}>{item.name}</strong>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {[item.state, item.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                        <i className="fas fa-chevron-right" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={handleGeoLocation}
              className="af-btn af-btn-ghost af-btn-icon"
              title="Position actuelle"
              disabled={loading}
            >
              <i className="fas fa-location-crosshairs" />
            </button>

            <button type="submit" className="af-btn af-btn-primary" disabled={loading} style={{ minWidth: '130px' }}>
              {loading ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-search" /> Explorer</>}
            </button>
          </form>

          {error && (
            <div className="af-notice af-notice-error" style={{ marginTop: 'var(--sp-4)' }}>
              <i className="fas fa-circle-exclamation" /> <span>{error}</span>
            </div>
          )}

          {/* Unit Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'var(--sp-4)',
              paddingTop: 'var(--sp-4)',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: '600' }}>
              Système d'unités
            </span>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <button
                type="button"
                className={`af-chip ${unit === 'metric' ? 'active' : ''}`}
                onClick={() => setUnit('metric')}
                style={{
                  background: unit === 'metric' ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                  color: unit === 'metric' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                Métrique (°C)
              </button>
              <button
                type="button"
                className={`af-chip ${unit === 'imperial' ? 'active' : ''}`}
                onClick={() => setUnit('imperial')}
                style={{
                  background: unit === 'imperial' ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                  color: unit === 'imperial' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                Impérial (°F)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="af-card af-card-elevated af-skeleton af-skeleton-card" style={{ height: '360px', marginBottom: 'var(--sp-12)' }} />
        )}

        {/* Weather Display */}
        {!loading && weatherData && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ marginBottom: 'var(--sp-12)' }}>
            <div className="af-card af-card-elevated" style={{ padding: 'var(--sp-8)' }}>
              {/* Header Info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 'var(--sp-4)',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: 'var(--sp-6)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                      {weatherData.name}
                    </h2>
                    {weatherData.country && (
                      <span className="af-badge af-badge-primary">{weatherData.country}</span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-1)' }}>
                    Coordonnées : [{weatherData.coord?.lat?.toFixed(2)}, {weatherData.coord?.lon?.toFixed(2)}] • Fuseau : UTC{weatherData.timezone >= 0 ? `+${weatherData.timezone / 3600}` : weatherData.timezone / 3600}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="af-btn af-btn-ghost af-btn-sm"
                    onClick={() => handleCityClick(weatherData.name)}
                    style={{ gap: 'var(--sp-2)' }}
                  >
                    <i className="fas fa-chart-line" /> Prévisions 5-14 Jours
                  </button>
                </div>
              </div>

              {/* Main Weather Hero Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: 'var(--sp-8) 0',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: 'var(--sp-6)',
                }}
              >
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(59, 130, 246, 0.08)',
                    borderRadius: 'var(--radius-full)',
                    marginBottom: 'var(--sp-4)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.icon || weatherData.weather?.[0]?.icon || '01d'}@4x.png`}
                    alt="weather icon"
                    style={{ width: '110px', height: '110px' }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 'clamp(3rem, 2rem + 3vw, 4.5rem)',
                    fontWeight: '900',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    lineHeight: 1,
                  }}
                >
                  <span>{Math.round(weatherData.temperature ?? weatherData.main?.temp ?? 0)}</span>
                  <span style={{ fontSize: 'var(--text-2xl)', color: 'var(--accent-primary)', marginLeft: '4px' }}>
                    {unit === 'metric' ? '°C' : '°F'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xl)',
                    color: 'var(--accent-primary)',
                    fontWeight: '800',
                    marginTop: 'var(--sp-2)',
                    textTransform: 'capitalize',
                  }}
                >
                  {weatherData.description || weatherData.weather?.[0]?.description}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--sp-2)' }}>
                  Ressenti : <strong style={{ color: 'var(--text-primary)' }}>{Math.round(weatherData.feels_like ?? weatherData.main?.feels_like ?? 0)}°</strong>
                  {' • '}
                  Min: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(weatherData.temp_min ?? weatherData.main?.temp_min ?? weatherData.temperature)}°</strong>
                  {' • '}
                  Max: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(weatherData.temp_max ?? weatherData.main?.temp_max ?? weatherData.temperature)}°</strong>
                </div>
              </div>

              {/* Grid detail metrics */}
              <div className="af-grid af-grid-3">
                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(96, 165, 250, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '1.25rem' }}>
                    <i className="fas fa-droplet" />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Humidité</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--text-primary)' }}>{weatherData.humidity ?? weatherData.main?.humidity}%</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(167, 139, 250, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontSize: '1.25rem' }}>
                    <i className="fas fa-wind" />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Vent & Rafales</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {Math.round(weatherData.wind?.speed ?? 0)} {unit === 'metric' ? 'km/h' : 'mph'}
                    </div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(52, 211, 153, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontSize: '1.25rem' }}>
                    <i className="fas fa-gauge-high" />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Pression</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--text-primary)' }}>{weatherData.pressure ?? weatherData.main?.pressure} hPa</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '1.25rem' }}>
                    <i className="fas fa-eye" />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Visibilité</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--text-primary)' }}>{((weatherData.visibility ?? 10000) / 1000).toFixed(1)} km</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(96, 165, 250, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '1.25rem' }}>
                    <i className="fas fa-cloud" />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Couverture nuageuse</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--text-primary)' }}>{weatherData.clouds ?? 0}%</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(251, 191, 36, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontSize: '1.25rem' }}>
                    <i className="fas fa-sun" />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Lever / Coucher</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {formatTime(weatherData.sunrise ?? weatherData.sys?.sunrise, weatherData.timezone)} / {formatTime(weatherData.sunset ?? weatherData.sys?.sunset, weatherData.timezone)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Morocco Cities Grid */}
        <div className="af-section">
          <div className="af-section-title">
            <i className="fas fa-map-location-dot" /> Villes du Maroc
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)' }}>
            Consultez instantanément les prévisions météorologiques régionales du Royaume.
          </p>

          <motion.div className="af-grid af-grid-3" variants={staggerContainer} initial="hidden" animate="visible">
            {moroccoCities.map((c, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="af-card"
                onClick={() => handleCityClick(c.name)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '150px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {c.name}
                  </h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.region}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-4)' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)' }}>
                    {c.temp}°C
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                    <i className={`fas fa-${c.icon}`} style={{ fontSize: '1.2rem' }} />
                    <span>{c.desc}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* World Cities Grid */}
        <div className="af-section">
          <div className="af-section-title">
            <i className="fas fa-earth-americas" /> Métropoles Mondiales
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)' }}>
            Surveillance météorologique des grands carrefours internationaux.
          </p>

          <motion.div className="af-grid af-grid-3" variants={staggerContainer} initial="hidden" animate="visible">
            {worldCities.map((c, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="af-card"
                onClick={() => handleCityClick(c.name)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '150px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {c.name}
                  </h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.country}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-4)' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)' }}>
                    {c.temp}°C
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                    <i className={`fas fa-${c.icon}`} style={{ fontSize: '1.2rem' }} />
                    <span>{c.desc}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
