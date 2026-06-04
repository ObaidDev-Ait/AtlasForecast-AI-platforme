import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Forecast7Days from './Forecast7Days';

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

  const API_KEY = '47c1019c93bf4a70c11537bebf481926';

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

    // Dispatch event for NASA/Rainviewer legacy maps
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true, cancelable: true
      }));
    }, 500);
  }, [location.state]);

  const processForecastData = (list) => {
    const daily = {};
    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date]) {
        daily[date] = {
          date,
          temps: [],
          precip: 0,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
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
        weatherUrl = `http://localhost:4000/weather/current?city=${lat},${lon}`;
        forecastUrl = `http://localhost:4000/weather/forecast?city=${lat},${lon}`;
      } else {
        weatherUrl = `http://localhost:4000/weather/current?city=${encodeURIComponent(searchCity)}`;
        forecastUrl = `http://localhost:4000/weather/forecast?city=${encodeURIComponent(searchCity)}`;
      }

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      if (!weatherRes.ok || !forecastRes.ok) throw new Error("Ville non trouvée");

      const weatherRaw = await weatherRes.json();
      const weather = {
        name: weatherRaw.city,
        coord: { lat: lat || 33.5731, lon: lon || -7.5898 },
        sys: { country: 'MA', sunrise: 0, sunset: 0 },
        main: {
          temp: weatherRaw.temperature,
          feels_like: weatherRaw.temperature,
          humidity: 60,
          pressure: 1015,
        },
        weather: [{
          description: weatherRaw.description,
          icon: '02d',
        }],
        wind: { speed: 12 },
        visibility: 10000,
        timezone: 3600,
      };
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
      searchWeather(weatherData.name, weatherData.coord.lat, weatherData.coord.lon, newUnit);
    }
  };

  // Autocomplete effect
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (city.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`;
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

    // Render Temp Chart
    if (tempChartRef.current) tempChartRef.current.destroy();
    tempChartRef.current = new window.Chart(tempCanvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Max (°)', data: maxTemps, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true, tension: 0.4 },
          { label: 'Min (°)', data: minTemps, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', fill: true, tension: 0.4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#1f2937' } } }, scales: { x: { ticks: { color: '#4b5563' } }, y: { ticks: { color: '#4b5563' } } } }
    });

    // Render Precip Chart
    if (precipChartRef.current) precipChartRef.current.destroy();
    precipChartRef.current = new window.Chart(precipCanvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Précipitations (mm)', data: precips, backgroundColor: '#3b82f6', borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#1f2937' } } }, scales: { x: { ticks: { color: '#4b5563' } }, y: { ticks: { color: '#4b5563' } } } }
    });

  }, [forecastData]);

  return (
    <>
      <div className="container" style={{ paddingBottom: '40px', paddingTop: '100px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="hero-section" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="hero-content">
            <h1 className="hero-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '15px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', hyphens: 'none', wordBreak: 'keep-all' }}>Les Prévisions Météo 7 Jours</h1>
            <p className="hero-description" style={{ color: '#9ca3af', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>Accédez aux prévisions météorologiques les plus précises et détaillées. Planifiez vos activités avec confiance grâce à nos données climatiques avancées.</p>
          </div>
        </div>

        <section className="search-section" style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container">
            <form onSubmit={handleSearchSubmit} className="search-container" style={{ display: 'flex', gap: '15px', maxWidth: '700px', margin: '0 auto', flexWrap: 'wrap', position: 'relative' }}>
              <div className="search-box" style={{ display: 'flex', flex: 1, gap: '15px' }}>
                <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
                  <i className="fas fa-search search-icon" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher une ville (ex: Paris, Tokyo...)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={() => { if (city.length >= 2 || suggestions.length > 0) setShowSuggestions(true); }}
                    style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: '16px', outline: 'none', transition: 'all 0.3s' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '0 25px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Rechercher'}
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '10px', background: 'var(--bg-primary)', borderRadius: '14px', boxShadow: 'var(--shadow-lg)', zIndex: 90, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div
                    onClick={handleGeoLocation}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 18px', cursor: 'pointer', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <i className="fas fa-location-arrow" style={{ fontSize: '1.1rem', color: '#3b82f6' }}></i>
                    <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)' }}>Utiliser le lieu actuel</span>
                  </div>

                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(item.lat, item.lon, item.name)}
                      style={{ padding: '15px 18px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#ffffff', transition: 'all 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.state ? `${item.state}, ` : ''}{item.country}</div>
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div className="units-toggle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
              <label className="unit-label" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Unité de mesure :</label>
              <select className="form-input" value={unit} onChange={handleUnitChange} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', outline: 'none', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'var(--text-primary)' }}>
                <option value="metric">Métrique (°C, km/h)</option>
                <option value="imperial">Impérial (°F, mph)</option>
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '8px', marginBottom: '30px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {weatherData && (
          <div className="weather-card" style={{ background: 'var(--bg-glass)', borderRadius: '24px', padding: 'clamp(1rem, 5vw, 30px)', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
              <i className="fas fa-location-dot" style={{ color: '#3b82f6' }}></i> Météo Actuelle à {weatherData.name}, {weatherData.sys.country}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <i className={getWeatherIconClass(weatherData.weather[0].icon)} style={{ fontSize: '5rem', background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 10px 15px rgba(245,158,11,0.3))' }}></i>
                <div>
                  <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: '800', lineHeight: '1', color: 'var(--text-primary)' }}>{Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}</div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: '5px' }}>{weatherData.weather[0].description}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '15px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-tint" style={{ color: '#60a5fa' }}></i> Humidité</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{weatherData.main.humidity}%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-wind" style={{ color: '#a78bfa' }}></i> Vent</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'km/h' : 'mph'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-eye" style={{ color: '#3b82f6' }}></i> Visibilité</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{weatherData.visibility / 1000} km</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-cloud-showers-heavy" style={{ color: '#60a5fa' }}></i> Précipitations</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{(weatherData.rain && weatherData.rain['1h']) || 0} mm</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-sun" style={{ color: '#fbbf24' }}></i> Lever du Soleil</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{new Date((weatherData.sys.sunrise + weatherData.timezone) * 1000).toISOString().substr(11, 5)}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-moon" style={{ color: '#8b5cf6' }}></i> Coucher du Soleil</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{new Date((weatherData.sys.sunset + weatherData.timezone) * 1000).toISOString().substr(11, 5)}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-temperature-half" style={{ color: '#f87171' }}></i> Ressenti</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{Math.round(weatherData.main.feels_like)}°</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}><i className="fas fa-compress-arrows-alt" style={{ color: '#34d399' }}></i> Pression</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{weatherData.main.pressure} hPa</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {forecastData && (
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: '#111827', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
              <i className="fas fa-calendar-alt" style={{ color: '#8b5cf6' }}></i> Prévisions sur 5 Jours
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '20px' }}>
              {forecastData.daily.map((day, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '25px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', backdropFilter: 'blur(8px)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '15px' }}>
                    {new Date(day.timestamp).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                  <i className={getWeatherIconClass(day.icon)} style={{ fontSize: '3.5rem', color: '#3b82f6', marginBottom: '15px', display: 'block' }}></i>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>{Math.round(day.tmax)}°</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '500', color: '#4b5563' }}>/ {Math.round(day.tmin)}°</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#4b5563', textTransform: 'capitalize', marginBottom: '15px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' }}>
                    {day.description}
                  </div>
                  {day.precip > 0 && (
                    <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                      <i className="fas fa-tint"></i> {day.precip.toFixed(1)} mm
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Module 7 Jours Avancé (Open-Meteo) ===== */}
        {weatherData && (
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fas fa-calendar-week" style={{ color: '#6366f1' }}></i> Prévisions Avancées 7 Jours
            </h2>
            <Forecast7Days lat={weatherData.coord.lat} lon={weatherData.coord.lon} cityName={weatherData.name} />
          </div>
        )}

        {forecastData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '30px', marginBottom: '50px' }}>
            <div className="chart-section" style={{ background: '#ffffff', padding: '30px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', color: '#111827' }}><i className="fas fa-temperature-high" style={{ color: '#ef4444', marginRight: '8px' }}></i> Évolution des Températures</h3>
              <div style={{ height: '400px', position: 'relative' }}>
                <canvas ref={tempCanvasRef}></canvas>
              </div>
            </div>

            <div className="chart-section" style={{ background: '#ffffff', padding: '30px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', color: '#111827' }}><i className="fas fa-cloud-showers-water" style={{ color: '#3b82f6', marginRight: '8px' }}></i> Précipitations (mm)</h3>
              <div style={{ height: '400px', position: 'relative' }}>
                <canvas ref={precipCanvasRef}></canvas>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Maps Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
          <div className="chart-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}><i className="fas fa-satellite" style={{ color: '#a78bfa' }}></i> Imagerie Satellite NASA-GIBS</h3>
            <div className="map-controls" style={{ marginBottom: "25px", textAlign: "center", display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
              <select id="gibsLayerSelect" style={{ padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "14px", fontWeight: "500", minWidth: "250px", outline: 'none' }}>
                <option value="MODIS_Terra_CorrectedReflectance_TrueColor">MODIS Terra - Couleurs Réelles</option>
                <option value="MODIS_Aqua_CorrectedReflectance_TrueColor">MODIS Aqua - Couleurs Réelles</option>
                <option value="VIIRS_SNPP_CorrectedReflectance_TrueColor">VIIRS SNPP - Couleurs Réelles</option>
                <option value="VIIRS_NOAA20_CorrectedReflectance_TrueColor">VIIRS NOAA-20 - Couleurs Réelles</option>
                <option value="BlueMarble_ShadedRelief">Blue Marble - Relief</option>
              </select>
              <input type="date" id="gibsDateInput" style={{ padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "14px", fontWeight: "500", outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button id="gibsPrevBtn" style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}><i className="fas fa-chevron-left"></i> Précédent</button>
              <button id="gibsNextBtn" style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}>Suivant <i className="fas fa-chevron-right"></i></button>
              <button id="gibsFullscreenBtn" onClick={() => {
                const mapContainer = document.getElementById('gibsMap');
                if (mapContainer) {
                  if (!document.fullscreenElement) {
                    mapContainer.requestFullscreen?.() || mapContainer.webkitRequestFullscreen?.() || mapContainer.msRequestFullscreen?.();
                  } else {
                    document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
                  }
                }
              }} style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}><i className="fas fa-expand"></i> Plein Écran</button>
            </div>
            <div id="gibsRangeHint" style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', marginBottom: '15px' }}></div>
            <div style={{ height: '500px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div id="gibsMap" style={{ height: "100%", width: "100%" }}></div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ForecastPage;
