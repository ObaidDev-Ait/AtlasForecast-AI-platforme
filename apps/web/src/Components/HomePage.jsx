import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MOROCCO_CITIES, getWeatherIcon } from './helpers'
import '../Styles/HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const [searchCity, setSearchCity] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchCity.trim()) return
    navigate('/forecast', { state: { initialCity: searchCity.trim() } })
  }

  const handleCityClick = (cityName) => {
    navigate('/forecast', { state: { initialCity: cityName } })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Sample static data for key cities (fast display with real navigation)
  const popularCities = [
    { name: 'Casablanca', region: 'Casablanca-Settat', temp: '22°C', cond: 'Ensoleillé', icon: 'fa-sun', humidity: '64%', wind: '18 km/h' },
    { name: 'Marrakech', region: 'Marrakech-Safi', temp: '26°C', cond: 'Ciel dégagé', icon: 'fa-sun', humidity: '38%', wind: '12 km/h' },
    { name: 'Rabat', region: 'Rabat-Salé-Kénitra', temp: '21°C', cond: 'Partiellement nuageux', icon: 'fa-cloud-sun', humidity: '72%', wind: '15 km/h' },
    { name: 'Tanger', region: 'Tanger-Tétouan', temp: '20°C', cond: 'Brise marine', icon: 'fa-wind', humidity: '68%', wind: '24 km/h' },
    { name: 'Agadir', region: 'Souss-Massa', temp: '24°C', cond: 'Beau temps', icon: 'fa-sun', humidity: '52%', wind: '14 km/h' },
    { name: 'Ifrane', region: 'Fès-Meknès', temp: '14°C', cond: 'Air frais d\'Atlas', icon: 'fa-snowflake', humidity: '45%', wind: '10 km/h' },
  ]

  return (
    <div className="container">
      {/* ====================================================================
          HERO SECTION
          ==================================================================== */}
      <section className="af-hero-section">
        <div className="af-hero-grid">
          {/* Left: Editorial Hero Content */}
          <div className="af-hero-content">
            <div className="af-hero-badge">
              <i className="fas fa-satellite-dish"></i>
              <span>INTELLIGENCE CLIMATIQUE MAROC 2026</span>
            </div>

            <h1 className="af-hero-title">
              Météo Professionnelle &{' '}
              <span className="title-accent">Prévisions Avancées</span> pour le Maroc
            </h1>

            <p className="af-hero-desc">
              Accédez aux données météorologiques haute résolution, alertes en temps réel
              et analyses prédictives propulsées par l'IA sur l'ensemble du territoire marocain.
            </p>

            {/* Quick Location Search Bar */}
            <form onSubmit={handleSearch} className="af-hero-search-box">
              <i className="fas fa-search" style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }}></i>
              <input
                type="text"
                className="af-hero-search-input"
                placeholder="Rechercher une ville au Maroc (ex: Casablanca, Marrakech, Ifrane...)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Consulter
              </button>
            </form>

            {/* Quick City Filter Chips */}
            <div className="af-hero-quick-chips">
              <span className="af-chip-label">Suggestions :</span>
              {['Casablanca', 'Marrakech', 'Rabat', 'Tanger', 'Agadir', 'Ifrane', 'Fès'].map((city) => (
                <button
                  key={city}
                  type="button"
                  className="af-city-chip"
                  onClick={() => handleCityClick(city)}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="af-hero-actions">
              <Link to="/weather" className="btn btn-primary btn-large">
                <i className="fas fa-cloud-sun"></i>
                <span>Explorer la Météo</span>
              </Link>
              <Link to="/assistant" className="btn btn-secondary btn-large">
                <i className="fas fa-robot" style={{ color: 'var(--accent-cyan)' }}></i>
                <span>Assistant IA Météo</span>
              </Link>
            </div>
          </div>

          {/* Right: Live Interactive Weather Card Visual */}
          <div className="af-hero-visual">
            <div className="af-hero-weather-card">
              <div className="af-hw-header">
                <div className="af-hw-location">
                  <div className="af-hw-city">
                    <span>Rabat</span>
                    <i className="fas fa-location-dot" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}></i>
                  </div>
                  <span className="af-hw-region">Capitale — Rabat-Salé-Kénitra</span>
                </div>
                <div className="af-hw-live-badge">
                  <span className="af-hw-live-dot"></span>
                  <span>EN DIRECT</span>
                </div>
              </div>

              <div className="af-hw-main">
                <div className="af-hw-temp-wrap">
                  <div className="af-hw-temp">24°C</div>
                  <div className="af-hw-condition">Ensoleillé & Ciel Dégagé</div>
                </div>
                <div className="af-hw-icon">
                  <i className="fas fa-sun"></i>
                </div>
              </div>

              <div className="af-hw-metrics">
                <div className="af-hw-metric-item">
                  <span className="af-hw-metric-label">Humidité</span>
                  <span className="af-hw-metric-val">62%</span>
                </div>
                <div className="af-hw-metric-item">
                  <span className="af-hw-metric-label">Vent</span>
                  <span className="af-hw-metric-val">14 km/h</span>
                </div>
                <div className="af-hw-metric-item">
                  <span className="af-hw-metric-label">Indice UV</span>
                  <span className="af-hw-metric-val">6 (Élevé)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FEATURES VALUE PROPOSITION SECTION
          ==================================================================== */}
      <section className="af-section">
        <div className="af-section-header">
          <span className="af-section-tag">Plateforme Météo Nouvelle Génération</span>
          <h2 className="af-section-title">Pourquoi Choisir AtlasForecast ?</h2>
          <p className="af-section-desc">
            Une suite technologique complète alliant modèles numériques de prévision,
            radar Doppler et intelligence artificielle appliquée au climat marocain.
          </p>
        </div>

        <div className="af-features-grid">
          <div className="af-feature-card">
            <div className="af-feature-icon-wrap">
              <i className="fas fa-bullseye"></i>
            </div>
            <h3 className="af-feature-title">Précision Multi-Modèles</h3>
            <p className="af-feature-desc">
              Agrégation continue des modèles ECMWF, GFS et ICON pour une fiabilité prédictive jusqu'à 95%.
            </p>
            <span className="af-feature-highlight">
              <i className="fas fa-check-circle"></i> Modèles haute résolution
            </span>
          </div>

          <div className="af-feature-card">
            <div className="af-feature-icon-wrap" style={{ color: 'var(--accent-cyan)' }}>
              <i className="fas fa-bolt"></i>
            </div>
            <h3 className="af-feature-title">Alertes Instantanées</h3>
            <p className="af-feature-desc">
              Détection automatique des phénomènes extrêmes (chergui, orages d'Atlas, vagues de chaleur et neige).
            </p>
            <span className="af-feature-highlight">
              <i className="fas fa-check-circle"></i> Notification temps réel
            </span>
          </div>

          <div className="af-feature-card">
            <div className="af-feature-icon-wrap" style={{ color: 'var(--accent-tertiary)' }}>
              <i className="fas fa-robot"></i>
            </div>
            <h3 className="af-feature-title">Copilot IA Météo</h3>
            <p className="af-feature-desc">
              Recommandations personnalisées pour l'agriculture, le voyage, les chantiers et vos loisirs en plein air.
            </p>
            <span className="af-feature-highlight">
              <i className="fas fa-check-circle"></i> Conseils contextualisés
            </span>
          </div>

          <div className="af-feature-card">
            <div className="af-feature-icon-wrap" style={{ color: '#fbbf24' }}>
              <i className="fas fa-map-location-dot"></i>
            </div>
            <h3 className="af-feature-title">Couverture Totale Maroc</h3>
            <p className="af-feature-desc">
              Surveillance météo de Tanger à Lagouira avec plus de 1 000 stations et localités analysées.
            </p>
            <span className="af-feature-highlight">
              <i className="fas fa-check-circle"></i> Données locales fiables
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          POPULAR MOROCCAN CITIES SHOWCASE
          ==================================================================== */}
      <section className="af-section">
        <div className="af-section-header">
          <span className="af-section-tag">Aperçu Régional</span>
          <h2 className="af-section-title">Météo des Principales Villes</h2>
          <p className="af-section-desc">
            Sélectionnez une ville pour accéder immédiatement au bulletin détaillé et aux prévisions à 14 jours.
          </p>
        </div>

        <div className="af-cities-grid">
          {popularCities.map((city) => (
            <div
              key={city.name}
              className="af-city-card"
              onClick={() => handleCityClick(city.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCityClick(city.name)}
            >
              <div className="af-city-top">
                <div>
                  <div className="af-city-name">{city.name}</div>
                  <div className="af-city-region">{city.region}</div>
                </div>
                <i className={`fas ${city.icon} af-city-cond-icon`}></i>
              </div>

              <div className="af-city-body">
                <div className="af-city-temp">{city.temp}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {city.cond}
                  </div>
                </div>
              </div>

              <div className="af-city-footer">
                <span><i className="fas fa-droplet"></i> {city.humidity}</span>
                <span><i className="fas fa-wind"></i> {city.wind}</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>
                  Voir détails <i className="fas fa-arrow-right"></i>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          SAAS PREMIUM PROMOTION SECTION
          ==================================================================== */}
      <section className="af-section">
        <div className="af-pricing-showcase">
          <div className="af-section-header" style={{ marginBottom: '2.5rem' }}>
            <div className="af-badge af-badge-premium" style={{ marginBottom: '1rem' }}>
              <i className="fas fa-crown"></i>
              <span>OFFRE ATLASFORECAST PREMIUM</span>
            </div>
            <h2 className="af-section-title">Débloquez l'Expérience Météo Complète</h2>
            <p className="af-section-desc">
              Accédez à l'Assistant Copilot IA illimité, aux prévisions étendues à 14 jours et aux alertes prioritaires.
            </p>
          </div>

          <div className="af-pricing-grid">
            {/* Monthly Plan Card */}
            <div className="af-price-card">
              <div className="af-price-header">
                <div className="af-price-name">Formule Mensuelle</div>
                <div className="af-price-desc">Flexibilité totale, sans engagement</div>
                <div className="af-price-figure">
                  <span className="af-price-amount">$5</span>
                  <span className="af-price-period">/ mois</span>
                </div>
              </div>

              <ul className="af-price-features">
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Assistant IA Météo illimité</span>
                </li>
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Prévisions multi-modèles 14 jours</span>
                </li>
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Alertes climatiques personnalisées</span>
                </li>
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Radar satellite HD sans publicité</span>
                </li>
              </ul>

              <Link
                to="/premium?plan=monthly"
                className="btn btn-secondary btn-large"
                style={{ width: '100%' }}
              >
                Choisir le forfait mensuel
              </Link>
            </div>

            {/* Yearly Plan Card (Featured) */}
            <div className="af-price-card featured">
              <div className="af-price-badge-rec">RECOMMANDE — 2 MOIS OFFERTS</div>

              <div className="af-price-header">
                <div className="af-price-name">Formule Annuelle</div>
                <div className="af-price-desc">Meilleur rapport qualité-prix</div>
                <div className="af-price-figure">
                  <span className="af-price-amount">$50</span>
                  <span className="af-price-period">/ an</span>
                </div>
                <span className="af-price-savings">Économisez 17% (soit $4.16 /mois)</span>
              </div>

              <ul className="af-price-features">
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Tout ce qui est inclus dans l'offre mensuelle</span>
                </li>
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Accès prioritaire aux nouveaux modèles</span>
                </li>
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Export des rapports historiques</span>
                </li>
                <li className="af-price-feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Support technique prioritaire 7j/7</span>
                </li>
              </ul>

              <Link
                to="/premium?plan=yearly"
                className="btn btn-premium btn-large"
                style={{ width: '100%' }}
              >
                <i className="fas fa-crown"></i>
                <span>Passer en Premium Annuel</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
