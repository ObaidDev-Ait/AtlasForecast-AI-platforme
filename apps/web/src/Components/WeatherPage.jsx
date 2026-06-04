import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <>
        {/*  Hero Section  */}
        <section className="weather-hero">
            <div className="container">
                <div className="hero-content">
                    <h1 className="hero-title">Météo en Temps Réel</h1>
                    <p className="hero-description">
                        Consultez les conditions météorologiques actuelles pour n'importe quelle ville 
                        avec des données précises et mises à jour en continu
                    </p>
                </div>
            </div>
        </section>

        {/*  Section de Recherche  */}
        <section className="search-section">
            <div className="container">
                <div className="search-container">
                    <form onSubmit={handleSearchSubmit} className="search-box">
                        <div className="search-input-wrapper" style={{ position: 'relative' }}>
                            <i className="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Rechercher une ville..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                onFocus={() => { if (city.length >= 2 || suggestions.length > 0) setShowSuggestions(true); }}
                             />
                             {showSuggestions && (
                                <div className="search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '10px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1000, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <div 
                                        className="suggestion-item current-location" 
                                        onClick={handleGeoLocation}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', cursor: 'pointer', background: '#f8fafc', borderBottom: '1px solid #edf2f7', transition: 'all 0.2s' }}
                                    >
                                        <i className="fas fa-location-arrow" style={{ color: '#3b82f6', fontSize: '1.1rem' }}></i>
                                        <span style={{ color: '#334155', fontWeight: '600', fontSize: '0.95rem' }}>Utiliser le lieu actuel</span>
                                    </div>
                                    {suggestions.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className="suggestion-item" 
                                            onClick={() => handleSuggestionClick(item.lat, item.lon, item.name)}
                                            style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid #edf2f7' : 'none', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ color: '#1e293b', fontWeight: '700', fontSize: '1rem' }}>{item.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.state ? `${item.state}, ` : ''}{item.country}</div>
                                        </div>
                                    ))}
                                </div>
                             )}
                        </div>
                        <button type="submit" className="search-btn" disabled={loading}>
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-search"></i> Rechercher</>}
                        </button>
                    </form>
                    {error && <div className="error-message" style={{color: '#f87171', marginTop: '10px', textAlign: 'center'}}>{error}</div>}
                </div>

                {/*  Sélecteur d'unités  */}
                <div className="units-toggle">
                    <label style={{ color: 'var(--text-primary)' }}>Unités :</label>
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="form-input" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', outline: 'none', cursor: 'pointer' }}>
                        <option value="metric">Métrique (°C, km/h)</option>
                        <option value="imperial">Impérial (°F, mph)</option>
                    </select>
                </div>
            </div>
        </section>

        {/*  Affichage de la Météo  */}
        {weatherData && (
        <section className="weather-display" style={{display: 'block'}}>
            <div className="container">
                {/*  Informations principales  */}
                <div className="weather-main">
                    <div className="weather-header">
                        <div className="location-info">
                            <h2 className="city-name">{weatherData.name}</h2>
                            <div className="location-details">
                                <span className="country">{weatherData.sys.country}</span>
                                <span className="coordinates">[{weatherData.coord.lat}, {weatherData.coord.lon}]</span>
                            </div>
                        </div>
                        <div className="weather-time">
                            <div className="current-time">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                            <div className="last-updated">Mis à jour à l'instant</div>
                        </div>
                    </div>

                    <div className="weather-overview">
                        <div className="weather-icon-large">
                            <img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt="weather icon" />
                        </div>
                        <div className="temperature-main">
                            <span className="temp-value">{Math.round(weatherData.main.temp)}</span>
                            <span className="temp-unit">{unit === 'metric' ? '°C' : '°F'}</span>
                        </div>
                        <div className="weather-description">{weatherData.weather[0].description}</div>
                        <div className="feels-like">Ressenti : {Math.round(weatherData.main.feels_like)}°</div>
                    </div>

                    <div className="details-grid">
                        <div className="detail-card">
                            <div className="detail-icon"><i className="fas fa-tint" style={{color: '#60a5fa'}}></i></div>
                            <div className="detail-content">
                                <div className="detail-label">Humidité</div>
                                <div className="detail-value">{weatherData.main.humidity}%</div>
                            </div>
                        </div>

                        <div className="detail-card">
                            <div className="detail-icon"><i className="fas fa-wind" style={{color: '#a78bfa'}}></i></div>
                            <div className="detail-content">
                                <div className="detail-label">Vent</div>
                                <div className="detail-value">{Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'km/h' : 'mph'}</div>
                            </div>
                        </div>

                        <div className="detail-card">
                            <div className="detail-icon"><i className="fas fa-compress-arrows-alt" style={{color: '#34d399'}}></i></div>
                            <div className="detail-content">
                                <div className="detail-label">Pression</div>
                                <div className="detail-value">{weatherData.main.pressure} hPa</div>
                            </div>
                        </div>

                        <div className="detail-card">
                            <div className="detail-icon"><i className="fas fa-eye" style={{color: '#3b82f6'}}></i></div>
                            <div className="detail-content">
                                <div className="detail-label">Visibilité</div>
                                <div className="detail-value">{weatherData.visibility / 1000} km</div>
                            </div>
                        </div>

                        <div className="detail-card">
                            <div className="detail-icon"><i className="fas fa-cloud-showers-heavy" style={{color: '#60a5fa'}}></i></div>
                            <div className="detail-content">
                                <div className="detail-label">Précipitations</div>
                                <div className="detail-value">{(weatherData.rain && weatherData.rain['1h']) || 0} mm</div>
                            </div>
                        </div>

                        <div className="detail-card">
                            <div className="detail-icon"><i className="fas fa-sun" style={{color: '#fbbf24'}}></i></div>
                            <div className="detail-content">
                                <div className="detail-label">Lever du Soleil</div>
                                <div className="detail-value">{formatTime(weatherData.sys.sunrise, weatherData.timezone)}</div>
                            </div>
                        </div>

                        <div className="detail-card">
                            <div className="detail-icon"><i className="fas fa-moon" style={{color: '#8b5cf6'}}></i></div>
                            <div className="detail-content">
                                <div className="detail-label">Coucher du Soleil</div>
                                <div className="detail-value">{formatTime(weatherData.sys.sunset, weatherData.timezone)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        )}

        {/*  Villes du Maroc  */}
        <section className="morocco-cities">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Villes du Maroc</h2>
                    <p className="section-description">
                        Consultez la météo dans les principales villes du Royaume
                    </p>
                </div>
                
                <div className="cities-grid">
                    {[
                        {name: 'Casablanca', region: 'Casablanca-Settat', temp: 22, desc: 'Partiellement nuageux', icon: 'cloud-sun'},
                        {name: 'Rabat', region: 'Rabat-Salé-Kénitra', temp: 24, desc: 'Ensoleillé', icon: 'sun'},
                        {name: 'Marrakech', region: 'Marrakech-Safi', temp: 28, desc: 'Ensoleillé', icon: 'sun'},
                        {name: 'Fès', region: 'Fès-Meknès', temp: 20, desc: 'Nuageux', icon: 'cloud'},
                        {name: 'Agadir', region: 'Souss-Massa', temp: 25, desc: 'Ensoleillé', icon: 'sun'},
                        {name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', temp: 21, desc: 'Partiellement nuageux', icon: 'cloud-sun'},
                        {name: 'Oujda', region: 'L\'Oriental', temp: 23, desc: 'Ensoleillé', icon: 'sun'},
                        {name: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra', temp: 27, desc: 'Ensoleillé', icon: 'sun'},
                        {name: 'Nador', region: 'L\'Oriental', temp: 22, desc: 'Partiellement nuageux', icon: 'cloud-sun'}
                    ].map((city, idx) => (
                        <div key={idx} className="city-card" onClick={() => handleCityClick(city.name)} style={{ cursor: 'pointer' }}>
                            <div className="city-header">
                                <h3 className="city-name">{city.name}</h3>
                                <span className="city-region">{city.region}</span>
                            </div>
                            <div className="city-weather">
                                <div className="weather-icon"><i className={`fas fa-${city.icon}`}></i></div>
                                <div className="temperature">{city.temp}°C</div>
                                <div className="condition">{city.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/*  Villes du Monde  */}
        <section className="world-cities">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Villes du Monde</h2>
                    <p className="section-description">
                        Découvrez la météo dans les grandes villes internationales
                    </p>
                </div>
                
                <div className="world-cities-grid">
                    {[
                        {name: 'Paris', country: 'France', temp: 18, desc: 'Partiellement nuageux', icon: 'cloud-sun'},
                        {name: 'New York', country: 'États-Unis', temp: 22, desc: 'Ensoleillé', icon: 'sun'},
                        {name: 'Tokyo', country: 'Japon', temp: 25, desc: 'Nuageux', icon: 'cloud'},
                        {name: 'Londres', country: 'Royaume-Uni', temp: 15, desc: 'Pluie légère', icon: 'cloud-rain'},
                        {name: 'Dubaï', country: 'Émirats Arabes Unis', temp: 35, desc: 'Chaud et ensoleillé', icon: 'sun'},
                        {name: 'Sydney', country: 'Australie', temp: 20, desc: 'Nuit Claire', icon: 'moon'},
                        {name: 'Madrid', country: 'Espagne', temp: 24, desc: 'Ensoleillé', icon: 'sun'},
                        {name: 'Rome', country: 'Italie', temp: 22, desc: 'Partiellement nuageux', icon: 'cloud-sun'},
                        {name: 'Berlin', country: 'Allemagne', temp: 16, desc: 'Nuageux', icon: 'cloud'}
                    ].map((city, idx) => (
                        <div key={idx} className="city-card" onClick={() => handleCityClick(city.name)} style={{ cursor: 'pointer' }}>
                            <div className="city-header">
                                <h3 className="city-name">{city.name}</h3>
                                <span className="city-region">{city.country}</span>
                            </div>
                            <div className="city-weather">
                                <div className="weather-icon"><i className={`fas fa-${city.icon}`}></i></div>
                                <div className="temperature">{city.temp}°C</div>
                                <div className="condition">{city.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/*  Section Informations Météo  */}
        <section className="weather-info-section">
            <div className="horizontal-container">
                <div className="form-column">
                    <div className="form-header">
                        <h1>Informations Météo</h1>
                        <p>Découvrez les détails et explications des phénomènes météorologiques</p>
                    </div>

                    <div className="form-card">
                        <div className="weather-info">
                            <h3><i className="fas fa-info-circle"></i> Comprendre la Météo</h3>
                            <p>La météorologie est la science qui étudie l'atmosphère terrestre et ses phénomènes. Nos données proviennent de stations météo professionnelles et de satellites météorologiques.</p>
                            
                            <div className="info-features">
                                <div className="info-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Données en temps réel toutes les 15 minutes</span>
                                </div>
                                <div className="info-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Précision de 95% grâce aux modèles avancés</span>
                                </div>
                                <div className="info-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Couverture mondiale avec focus sur le Maroc</span>
                                </div>
                                <div className="info-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Alertes automatiques pour conditions dangereuses</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="info-column">
                    <div className="info-card">
                        <div className="info-header">
                            <h2>Outils Météo</h2>
                            <p>Accédez à nos fonctionnalités avancées</p>
                        </div>

                        <div className="weather-tools">
                            <h3><i className="fas fa-tools"></i> Outils Disponibles</h3>
                            <div className="tools-grid">
                                <a href="/forecast" className="tool-link">
                                    <i className="fas fa-chart-line"></i>
                                    <span>Prévisions 5 Jours</span>
                                </a>
                                <a href="/alerts" className="tool-link">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <span>Alertes Météo</span>
                                </a>
                                <a href="/premium" className="tool-link">
                                    <i className="fas fa-crown"></i>
                                    <span>Version Premium</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
  );
};

export default WeatherPage;
