import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Forecast7Days from './Forecast7Days';
import { API_BASE_URL } from '../lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

// OpenWeatherMap Icons Map
const getWeatherIconClass = (code) => {
  const map = {
    '01d': 'fas fa-sun', '01n': 'fas fa-moon',
    '02d': 'fas fa-cloud-sun', '02n': 'fas fa-cloud-moon',
    '03d': 'fas fa-cloud', '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud', '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-showers-heavy', '09n': 'fas fa-cloud-showers-heavy',
    '10d': 'fas fa-cloud-rain', '10n': 'fas fa-cloud-rain',
    '11d': 'fas fa-bolt', '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake', '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog', '50n': 'fas fa-smog'
  };
  return map[code] || 'fas fa-cloud';
};

const ForecastPage = () => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');

  const location = useLocation();

  const tempChartRef = useRef(null);
  const precipChartRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const precipCanvasRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check for initial city from navigation state, otherwise default to Casablanca
    if (location.state && location.state.initialCity) {
      setCity(location.state.initialCity);
      searchWeather(location.state.initialCity);
    } else {
      setCity('Casablanca');
      searchWeather('Casablanca');
    }

    // Clean up any existing map instance before starting a new one
    if (window.nasaGibsMap) {
      try {
        window.nasaGibsMap.destroy();
      } catch (e) {
        console.error("Error destroying nasaGibsMap on mount:", e);
      }
      window.nasaGibsMap = null;
    }

    // Dispatch event for NASA/Rainviewer legacy maps
    const timer = setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true, cancelable: true
      }));
    }, 500);

    return () => {
      clearTimeout(timer);
      if (window.nasaGibsMap) {
        try {
          window.nasaGibsMap.destroy();
        } catch (e) {
          console.error("Error destroying nasaGibsMap on unmount:", e);
        }
        window.nasaGibsMap = null;
      }
    };
  }, [location.state]);

  const processForecastData = (forecastList) => {
    const daily = {};
    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date]) {
        daily[date] = {
          date,
          temps: [],
          weather: item.weather[0],
          precip: 0,
          timestamp: item.dt * 1000
        };
      }
      daily[date].temps.push(item.main.temp);
      if (item.rain && item.rain['3h']) {
        daily[date].precip += item.rain['3h'];
      }
    });

    return Object.values(daily).slice(0, 5).map(day => ({
      ...day,
      tmax: Math.max(...day.temps),
      tmin: Math.min(...day.temps)
    }));
  };

  const searchWeather = async (searchCity, lat = null, lon = null, currentUnit = unit) => {
    if (!searchCity.trim() && (!lat || !lon)) return;
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    try {
      let weatherUrl, forecastUrl;
      if (lat && lon) {
        weatherUrl = `${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}&units=${currentUnit}&lang=fr`;
        forecastUrl = `${API_BASE_URL}/weather/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&lang=fr`;
      } else {
        weatherUrl = `${API_BASE_URL}/weather/current?city=${encodeURIComponent(searchCity)}&units=${currentUnit}&lang=fr`;
        forecastUrl = `${API_BASE_URL}/weather/forecast?city=${encodeURIComponent(searchCity)}&units=${currentUnit}&lang=fr`;
      }

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      if (!weatherRes.ok || !forecastRes.ok) throw new Error("Ville non trouvée");

      const weather = await weatherRes.json();
      const forecast = await forecastRes.json();

      setWeatherData(weather);
      setForecastData({
        city: forecast.city,
        daily: processForecastData(forecast.list)
      });

    } catch (err) {
      setError(err.message);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchWeather(city);
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    if (weatherData && weatherData.name) {
      // Re-fetch with new unit to get correct API conversions
      searchWeather(weatherData.name, weatherData.coord?.lat, weatherData.coord?.lon, newUnit);
    }
  };

  // Autocomplete effect via AtlasForecast Backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (city.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const url = `${API_BASE_URL}/weather/geocoding?q=${encodeURIComponent(city)}&limit=5`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          // Only show suggestions if the user is actively focused on the search input
          const searchInput = document.querySelector('.search-input');
          if (document.activeElement === searchInput) {
            setShowSuggestions(true);
          }
        }
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [city]);

  // Handle suggestion click
  const handleSuggestionClick = (lat, lon, cityName) => {
    setCity(cityName);
    searchWeather(cityName, lat, lon);
  };

  // Handle current location
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
        setCity("Position Actuelle");
        searchWeather("Position Actuelle", latitude, longitude);
      },
      (err) => {
        setLoading(false);
        setError("Impossible d'obtenir votre position actuelle.");
      }
    );
  };

  useEffect(() => {
    if (!forecastData || !window.Chart) return;

    const labels = forecastData.daily.map(d => new Date(d.timestamp).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));
    const maxTemps = forecastData.daily.map(d => d.tmax);
    const minTemps = forecastData.daily.map(d => d.tmin);
    const precips = forecastData.daily.map(d => d.precip);

    // Dynamic color depending on dark/light mode context
    const textColor = 'rgba(255, 255, 255, 0.7)';
    const gridColor = 'rgba(255, 255, 255, 0.1)';

    // Render Temp Chart
    if (tempChartRef.current) tempChartRef.current.destroy();
    tempChartRef.current = new window.Chart(tempCanvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Max (°)', data: maxTemps, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', fill: true, tension: 0.4 },
          { label: 'Min (°)', data: minTemps, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.15)', fill: true, tension: 0.4 }
        ]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { labels: { color: textColor, font: { weight: '600' } } } 
        }, 
        scales: { 
          x: { ticks: { color: textColor }, grid: { color: gridColor } }, 
          y: { ticks: { color: textColor }, grid: { color: gridColor } } 
        } 
      }
    });

    // Render Precip Chart
    if (precipChartRef.current) precipChartRef.current.destroy();
    precipChartRef.current = new window.Chart(precipCanvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Précipitations (mm)', data: precips, backgroundColor: '#3b82f6', borderRadius: 6 }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { labels: { color: textColor, font: { weight: '600' } } } 
        }, 
        scales: { 
          x: { ticks: { color: textColor }, grid: { color: gridColor } }, 
          y: { ticks: { color: textColor }, grid: { color: gridColor } } 
        } 
      }
    });

  }, [forecastData]);

  return (
    <div className="container">
      <section className="af-page">
        {/*  Page Header  */}
        <motion.div className="af-page-header" initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="af-page-title"><i className="fas fa-calendar-alt"></i> Prévisions 7 Jours</h1>
          <p className="af-page-subtitle">
            Accédez aux prévisions climatiques les plus détaillées et analysez les modèles d'évolution des températures et précipitations.
          </p>
        </motion.div>

        {/* Search & Setup Card */}
        <motion.div className="af-card" style={{ maxWidth: '640px', margin: '0 auto var(--sp-10)' }} initial="hidden" animate="visible" variants={fadeUp}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', position: 'relative' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-color)' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: '600' }}>Unité de mesure :</label>
            <select value={unit} onChange={handleUnitChange} className="af-select" style={{ width: 'auto', minWidth: '180px' }}>
              <option value="metric">Métrique (°C, km/h)</option>
              <option value="imperial">Impérial (°F, mph)</option>
            </select>
          </div>
        </motion.div>

        {/* Current Weather Card */}
        {weatherData && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ marginBottom: 'var(--sp-10)' }}>
            <div className="af-card af-card-elevated">
              <div className="af-card-header">
                <i className="fas fa-location-dot"></i>
                <h2>Météo Actuelle à {weatherData.name}, {weatherData.sys.country}</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', background: 'rgba(255,255,255,0.01)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-xl)' }}>
                  <i className={getWeatherIconClass(weatherData.weather[0].icon)} style={{ fontSize: '4.5rem', color: 'var(--weather-icon-color)' }}></i>
                  <div>
                    <div style={{ fontSize: 'var(--text-4xl)', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'capitalize', marginTop: 'var(--sp-1)' }}>
                      {weatherData.weather[0].description}
                    </div>
                  </div>
                </div>

                <div className="af-grid af-grid-3" style={{ gap: 'var(--sp-3)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}><i className="fas fa-tint"></i> Hum</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{weatherData.main.humidity}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}><i className="fas fa-wind"></i> Vent</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'km/h' : 'm'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}><i className="fas fa-temperature-half"></i> Ressenti</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{Math.round(weatherData.main.feels_like)}°</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5 Days Grid */}
        {forecastData && (
          <div className="af-section">
            <div className="af-section-title">
              <i className="fas fa-calendar-days"></i> Prévisions sur 5 Jours
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-4)' }}>
              {forecastData.daily.map((day, idx) => (
                <div key={idx} className="af-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: 'var(--text-primary)', marginBottom: 'var(--sp-3)' }}>
                    {new Date(day.timestamp).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ margin: 'var(--sp-3) 0' }}>
                    <i className={getWeatherIconClass(day.icon)} style={{ fontSize: '3rem', color: 'var(--accent-primary)' }}></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', marginBottom: 'var(--sp-2)' }}>
                      <span style={{ fontSize: 'var(--text-xl)', fontWeight: '900', color: 'var(--text-primary)' }}>{Math.round(day.tmax)}°</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>/ {Math.round(day.tmin)}°</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'capitalize' }}>
                      {day.description}
                    </div>
                  </div>
                  {day.precip > 0 && (
                    <div style={{ marginTop: 'var(--sp-3)', display: 'inline-flex', alignSelf: 'center', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700' }}>
                      <i className="fas fa-tint" style={{ marginRight: '4px' }}></i> {day.precip.toFixed(1)} mm
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7 Days Advanced Forecast Component */}
        {weatherData && (
          <div className="af-section">
            <div className="af-section-title">
              <i className="fas fa-chart-line"></i> Prévisions Avancées 7 Jours
            </div>
            <Forecast7Days lat={weatherData.coord.lat} lon={weatherData.coord.lon} cityName={weatherData.name} />
          </div>
        )}

        {/* Interactive Charts */}
        {forecastData && (
          <motion.div className="af-grid af-grid-2" initial="hidden" animate="visible" variants={fadeUp} style={{ marginBottom: 'var(--sp-12)' }}>
            <div className="af-card">
              <div className="af-card-header">
                <i className="fas fa-temperature-high" style={{ color: 'var(--accent-danger)' }}></i>
                <h3>Évolution des Températures</h3>
              </div>
              <div style={{ height: '320px', position: 'relative' }}>
                <canvas ref={tempCanvasRef}></canvas>
              </div>
            </div>

            <div className="af-card">
              <div className="af-card-header">
                <i className="fas fa-cloud-showers-water" style={{ color: 'var(--accent-primary)' }}></i>
                <h3>Précipitations (mm)</h3>
              </div>
              <div style={{ height: '320px', position: 'relative' }}>
                <canvas ref={precipCanvasRef}></canvas>
              </div>
            </div>
          </motion.div>
        )}

        {/* Satellite Imagery NASA-GIBS */}
        <div className="af-section">
          <div className="af-card">
            <div className="af-card-header">
              <i className="fas fa-satellite"></i>
              <h3>Imagerie Satellite NASA-GIBS</h3>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)', justifyContent: 'center' }}>
              <select id="gibsLayerSelect" className="af-select" style={{ width: 'auto', minWidth: '260px' }}>
                <option value="MODIS_Terra_CorrectedReflectance_TrueColor">MODIS Terra - Couleurs Réelles</option>
                <option value="MODIS_Aqua_CorrectedReflectance_TrueColor">MODIS Aqua - Couleurs Réelles</option>
                <option value="VIIRS_SNPP_CorrectedReflectance_TrueColor">VIIRS SNPP - Couleurs Réelles</option>
                <option value="VIIRS_NOAA20_CorrectedReflectance_TrueColor">VIIRS NOAA-20 - Couleurs Réelles</option>
                <option value="BlueMarble_ShadedRelief">Blue Marble - Relief</option>
              </select>
              <input type="date" id="gibsDateInput" className="af-input" style={{ width: 'auto' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <button id="gibsPrevBtn" className="af-btn af-btn-secondary"><i className="fas fa-chevron-left"></i> Précédent</button>
              <button id="gibsNextBtn" className="af-btn af-btn-secondary">Suivant <i className="fas fa-chevron-right"></i></button>
              <button id="gibsFullscreenBtn" className="af-btn af-btn-ghost" onClick={() => {
                const mapContainer = document.getElementById('gibsMap');
                if (mapContainer) {
                  if (!document.fullscreenElement) {
                    mapContainer.requestFullscreen?.() || mapContainer.webkitRequestFullscreen?.() || mapContainer.msRequestFullscreen?.();
                  } else {
                    document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
                  }
                }
              }}><i className="fas fa-expand"></i> Plein Écran</button>
            </div>

            <div id="gibsRangeHint" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)' }}></div>
            
            <div style={{ height: '480px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
              <div id="gibsMap" style={{ height: "100%", width: "100%" }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForecastPage;
