import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const WeatherPage = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = React.useRef(null);

  const API_KEY = '47c1019c93bf4a70c11537bebf481926';

  const handleCityClick = (cityName) => {
    navigate('/forecast', { state: { initialCity: cityName } });
  };

  const searchWeather = async (searchCity, lat = null, lon = null) => {
    if (!searchCity.trim() && (!lat || !lon)) return;
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    try {
      let url;
      if (lat && lon) {
        url = `http://localhost:4000/weather/current?city=${lat},${lon}`;
      } else {
        url = `http://localhost:4000/weather/current?city=${encodeURIComponent(searchCity)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Ville non trouvée');
      const data = await res.json();

      const transformedData = {
        name: data.city,
        coord: { lat: lat || 33.5731, lon: lon || -7.5898 },
        sys: { country: 'MA', sunrise: 0, sunset: 0 },
        main: {
          temp: data.temperature,
          feels_like: data.temperature,
          humidity: 60,
          pressure: 1015,
        },
        weather: [{
          description: data.description,
          icon: '02d',
        }],
        wind: { speed: 12 },
        visibility: 10000,
        timezone: 3600,
      };

      setWeatherData(transformedData);
      setCity(data.city);
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
        searchWeather("Position Actuelle", latitude, longitude);
      },
      (err) => {
        setLoading(false);
        setError("Impossible d'obtenir votre position actuelle.");
      }
    );
  };

  const handleSuggestionClick = (lat, lon, name) => {
    setCity(name);
    setShowSuggestions(false);
    searchWeather(name, lat, lon);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Initial search
    searchWeather('Casablanca');
    
    // Legacy event dispatch
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }));
    }, 500);
  }, []);

  // Autocomplete effect
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (city.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          const searchInput = document.querySelector('.search-input');
          if (document.activeElement === searchInput) {
            setShowSuggestions(true);
          }
        }
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [city]);

  // Update when unit changes
  useEffect(() => {
    if (weatherData) {
      searchWeather(weatherData.name);
    }
  }, [unit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchWeather(city);
  };

  const formatTime = (unix, timezone) => {
    if (!unix) return '--:--';
    return new Date((unix + timezone) * 1000).toISOString().substr(11, 5);
  };

  return (
    <div className="container">
      <section className="af-page">
        {/*  Page Header  */}
        <motion.div className="af-page-header" initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="af-page-title"><i className="fas fa-cloud-sun"></i> Météo en Temps Réel</h1>
          <p className="af-page-subtitle">
            Consultez les conditions météorologiques actuelles pour n'importe quelle ville avec des données précises et mises à jour en continu.
          </p>
        </motion.div>

        {/*  Search Section  */}
        <motion.div className="af-card" style={{ maxWidth: '640px', margin: '0 auto var(--sp-10)' }} initial="hidden" animate="visible" variants={fadeUp}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                className="af-input search-input" 
                placeholder="Rechercher une ville..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={() => { if (city.length >= 2 || suggestions.length > 0) setShowSuggestions(true); }}
                style={{ paddingLeft: '2.75rem' }}
              />
              {showSuggestions && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'var(--bg-glass-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 1000, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
                  <div 
                    onClick={handleGeoLocation}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  >
                    <i className="fas fa-location-arrow" style={{ color: 'var(--accent-primary)' }}></i>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>Utiliser le lieu actuel</span>
                  </div>
                  {suggestions.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSuggestionClick(item.lat, item.lon, item.name)}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.95rem' }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.state ? `${item.state}, ` : ''}{item.country}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="af-btn af-btn-primary" disabled={loading} style={{ minWidth: '120px' }}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-search"></i> Chercher</>}
            </button>
          </form>

          {error && (
            <div className="af-notice af-notice-error" style={{ marginTop: 'var(--sp-4)' }}>
              <i className="fas fa-exclamation-circle"></i> <span>{error}</span>
            </div>
          )}

          {/* Unit Toggle inside the search card for cohesive configuration */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-color)' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: '600' }}>Unités de mesure :</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="af-select" style={{ width: 'auto', minWidth: '180px' }}>
              <option value="metric">Métrique (°C, km/h)</option>
              <option value="imperial">Impérial (°F, mph)</option>
            </select>
          </div>
        </motion.div>

        {/*  Weather Display  */}
        {weatherData && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ marginBottom: 'var(--sp-12)' }}>
            <div className="af-card af-card-elevated" style={{ padding: 'var(--sp-8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-4)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--sp-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                    {weatherData.name} <span style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--text-muted)', marginLeft: 'var(--sp-2)' }}>{weatherData.sys.country}</span>
                  </h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-1)' }}>
                    Coordonnées : [{weatherData.coord.lat.toFixed(4)}, {weatherData.coord.lon.toFixed(4)}]
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-1)' }}>
                    Mis à jour à l'instant
                  </div>
                </div>
              </div>

              {/* Weather Overview block */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 'var(--sp-8) 0', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--sp-6)' }}>
                <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--sp-4)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt="weather icon" style={{ width: '100px', height: '100px' }} />
                </div>
                <div style={{ fontSize: 'var(--text-5xl)', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', lineHeight: 1 }}>
                  <span>{Math.round(weatherData.main.temp)}</span>
                  <span style={{ fontSize: 'var(--text-2xl)', color: 'var(--accent-primary)', marginLeft: '2px' }}>{unit === 'metric' ? '°C' : '°F'}</span>
                </div>
                <div style={{ fontSize: 'var(--text-xl)', color: 'var(--accent-primary)', fontWeight: '700', marginTop: 'var(--sp-2)', textTransform: 'capitalize' }}>
                  {weatherData.weather[0].description}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--sp-1)' }}>
                  Ressenti comme : <strong style={{ color: 'var(--text-primary)' }}>{Math.round(weatherData.main.feels_like)}°</strong>
                </div>
              </div>

              {/* Grid detail metrics */}
              <div className="af-grid af-grid-3">
                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(96, 165, 250, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '1.25rem' }}>
                    <i className="fas fa-tint"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Humidité</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)' }}>{weatherData.main.humidity}%</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(167, 139, 250, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontSize: '1.25rem' }}>
                    <i className="fas fa-wind"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Vent</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)' }}>{Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'km/h' : 'mph'}</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(52, 211, 153, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontSize: '1.25rem' }}>
                    <i className="fas fa-compress-arrows-alt"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Pression</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)' }}>{weatherData.main.pressure} hPa</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '1.25rem' }}>
                    <i className="fas fa-eye"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Visibilité</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)' }}>{weatherData.visibility / 1000} km</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(96, 165, 250, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '1.25rem' }}>
                    <i className="fas fa-cloud-showers-heavy"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Précipitations</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)' }}>{(weatherData.rain && weatherData.rain['1h']) || 0} mm</div>
                  </div>
                </div>

                <div className="af-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(251, 191, 36, 0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontSize: '1.25rem' }}>
                    <i className="fas fa-sun"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Soleil (Lever/Coucher)</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {formatTime(weatherData.sys.sunrise, weatherData.timezone)} / {formatTime(weatherData.sys.sunset, weatherData.timezone)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/*  Morocco Cities  */}
        <div className="af-section">
          <div className="af-section-title">
            <i className="fas fa-map-marker-alt"></i> Villes du Maroc
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)' }}>Consultez la météo en un clic dans les principales villes du Royaume.</p>
          
          <motion.div className="af-grid af-grid-3" variants={staggerContainer} initial="hidden" animate="visible">
            {[
              { name: 'Casablanca', region: 'Casablanca-Settat', temp: 22, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
              { name: 'Rabat', region: 'Rabat-Salé-Kénitra', temp: 24, desc: 'Ensoleillé', icon: 'sun' },
              { name: 'Marrakech', region: 'Marrakech-Safi', temp: 28, desc: 'Ensoleillé', icon: 'sun' },
              { name: 'Fès', region: 'Fès-Meknès', temp: 20, desc: 'Nuageux', icon: 'cloud' },
              { name: 'Agadir', region: 'Souss-Massa', temp: 25, desc: 'Ensoleillé', icon: 'sun' },
              { name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', temp: 21, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
              { name: 'Oujda', region: 'L\'Oriental', temp: 23, desc: 'Ensoleillé', icon: 'sun' },
              { name: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra', temp: 27, desc: 'Ensoleillé', icon: 'sun' },
              { name: 'Nador', region: 'L\'Oriental', temp: 22, desc: 'Partiellement nuageux', icon: 'cloud-sun' }
            ].map((city, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp} 
                className="af-card" 
                onClick={() => handleCityClick(city.name)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}
              >
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{city.name}</h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{city.region}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-4)' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)' }}>{city.temp}°C</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                    <i className={`fas fa-${city.icon}`} style={{ fontSize: '1.2rem', color: 'var(--weather-icon-color)' }}></i>
                    <span>{city.desc}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/*  World Cities  */}
        <div className="af-section">
          <div className="af-section-title">
            <i className="fas fa-globe"></i> Villes du Monde
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)' }}>Découvrez la météo actuelle dans les grandes capitales et destinations mondiales.</p>
          
          <motion.div className="af-grid af-grid-3" variants={staggerContainer} initial="hidden" animate="visible">
            {[
              { name: 'Paris', country: 'France', temp: 18, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
              { name: 'New York', country: 'États-Unis', temp: 22, desc: 'Ensoleillé', icon: 'sun' },
              { name: 'Tokyo', country: 'Japon', temp: 25, desc: 'Nuageux', icon: 'cloud' },
              { name: 'Londres', country: 'Royaume-Uni', temp: 15, desc: 'Pluie légère', icon: 'cloud-rain' },
              { name: 'Dubaï', country: 'Émirats Arabes Unis', temp: 35, desc: 'Chaud et ensoleillé', icon: 'sun' },
              { name: 'Sydney', country: 'Australie', temp: 20, desc: 'Nuit Claire', icon: 'moon' },
              { name: 'Madrid', country: 'Espagne', temp: 24, desc: 'Ensoleillé', icon: 'sun' },
              { name: 'Rome', country: 'Italie', temp: 22, desc: 'Partiellement nuageux', icon: 'cloud-sun' },
              { name: 'Berlin', country: 'Allemagne', temp: 16, desc: 'Nuageux', icon: 'cloud' }
            ].map((city, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp} 
                className="af-card" 
                onClick={() => handleCityClick(city.name)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}
              >
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{city.name}</h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{city.country}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-4)' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)' }}>{city.temp}°C</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                    <i className={`fas fa-${city.icon}`} style={{ fontSize: '1.2rem', color: 'var(--weather-icon-color)' }}></i>
                    <span>{city.desc}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/*  Comprendre la Météo & Outils Météo Horizontal Section  */}
        <motion.div className="af-grid af-grid-2" initial="hidden" animate="visible" variants={fadeUp} style={{ marginTop: 'var(--sp-12)' }}>
          <div className="af-card">
            <div className="af-card-header">
              <i className="fas fa-info-circle"></i>
              <h3>Comprendre la Météo</h3>
            </div>
            <div className="af-card-body">
              <p style={{ lineHeight: 1.6, marginBottom: 'var(--sp-4)' }}>
                La météorologie est la science qui étudie l'atmosphère terrestre et ses phénomènes. Nos données proviennent de stations professionnelles et de satellites météo avancés.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                  <i className="fas fa-check" style={{ color: 'var(--accent-success)' }}></i> <span>Données en temps réel actualisées</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                  <i className="fas fa-check" style={{ color: 'var(--accent-success)' }}></i> <span>Précision certifiée via modèles avancés</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                  <i className="fas fa-check" style={{ color: 'var(--accent-success)' }}></i> <span>Alertes automatiques pour conditions extrêmes</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="af-card">
            <div className="af-card-header">
              <i className="fas fa-tools"></i>
              <h3>Outils AtlasForecast</h3>
            </div>
            <div className="af-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <p style={{ lineHeight: 1.6 }}>Accédez rapidement à nos modules climatiques et de prévision météo les plus avancés :</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--sp-3)' }}>
                <a href="/forecast" className="af-btn af-btn-secondary" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-4)', height: 'auto', gap: '8px' }}>
                  <i className="fas fa-chart-line" style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}></i>
                  <span>Prévisions</span>
                </a>
                <a href="/alerts" className="af-btn af-btn-secondary" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-4)', height: 'auto', gap: '8px' }}>
                  <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.25rem', color: 'var(--accent-danger)' }}></i>
                  <span>Alertes</span>
                </a>
                <a href="/premium" className="af-btn af-btn-secondary" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-4)', height: 'auto', gap: '8px' }}>
                  <i className="fas fa-crown" style={{ fontSize: '1.25rem', color: 'var(--accent-warning)' }}></i>
                  <span>Premium</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default WeatherPage;
