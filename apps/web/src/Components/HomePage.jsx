import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const HomePage = () => {
  const navigate = useNavigate();
  const handleCityClick = (cityName) => {
    navigate('/forecast', { state: { initialCity: cityName } });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }));
    }, 100);
  }, []);

  return (
    <>
        {/*  Hero Section  */}
        <section className="hero-section">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="title-line">Météo</span>
                            <span className="title-line highlight">Professionnelle</span>
                            <span className="title-line">pour le Maroc</span>
                        </h1>
                        <p className="hero-description">
                            Accédez aux prévisions météorologiques les plus précises et aux alertes en temps réel. 
                            Planifiez vos activités avec confiance grâce à nos données climatiques avancées.
                        </p>
                        <div className="hero-actions">
                            <a href="/weather" className="btn btn-primary btn-large">
                                <i className="fas fa-search"></i>
                                Voir la Météo
                            </a>
                            <a href="/forecast" className="btn btn-outline btn-large">
                                <i className="fas fa-chart-line"></i>
                                Prévisions 5 Jours
                            </a>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="weather-preview">
                            <div className="weather-card">
                                <div className="weather-icon">
                                    <i className="fas fa-sun"></i>
                                </div>
                                <div className="weather-info">
                                    <div className="temperature">24°C</div>
                                    <div className="location">Rabat, Maroc</div>
                                    <div className="condition">Ensoleillé</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/*  Features Section  */}
        <section className="features-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Pourquoi Choisir AtlasForecast ?</h2>
                    <p className="section-description">
                        Notre plateforme combine technologie avancée et expertise météorologique 
                        pour vous offrir les informations les plus fiables
                    </p>
                </div>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-bullseye"></i>
                        </div>
                        <h3 className="feature-title">Précision Maximale</h3>
                        <p className="feature-description">
                            Prévisions météorologiques avec une précision de 95% grâce à nos modèles climatiques avancés
                        </p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <h3 className="feature-title">Temps Réel</h3>
                        <p className="feature-description">
                            Données météorologiques mises à jour toutes les 15 minutes pour une information toujours actuelle
                        </p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-map-marked-alt"></i>
                        </div>
                        <h3 className="feature-title">Couverture Complète</h3>
                        <p className="feature-description">
                            Couverture météorologique de tout le Maroc avec plus de 1000 points de mesure
                        </p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h3 className="feature-title">Alertes Intelligentes</h3>
                        <p className="feature-description">
                            Système d'alertes automatiques pour les conditions météorologiques dangereuses
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/*  Section Plateformes avec Disposition Horizontale  */}
        <section className="platforms-section">
            <div className="horizontal-container">
                {/*  Colonne de gauche : Informations sur les plateformes  */}
                <div className="form-column">
                    <div className="form-header">
                        <h1>Nos Plateformes</h1>
                        <p>Accédez à AtlasForecast sur tous vos appareils et plateformes préférées</p>
                    </div>

                    <div className="form-card">
                        <div className="platform-info">
                            <h3><i className="fas fa-globe"></i> Accès Multi-Plateformes</h3>
                            <p>AtlasForecast est disponible on tous vos appareils : ordinateurs, smartphones, tablettes et plus encore.</p>
                            
                            <div className="platform-features">
                                <div className="platform-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Interface responsive adaptée à tous les écrans</span>
                                </div>
                                <div className="platform-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Application web progressive (PWA)</span>
                                </div>
                                <div className="platform-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Compatibilité avec tous les navigateurs</span>
                                </div>
                                <div className="platform-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Synchronisation en temps réel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Colonne de droite : Boutons des plateformes  */}
                <div className="info-column">
                    <div className="info-card">
                        <div className="info-header">
                            <h2>Accès Rapide</h2>
                            <p>Choisissez votre plateforme préférée</p>
                        </div>

                        {/*  Boutons des plateformes  */}
                        <div className="platform-buttons">
                            <h3><i className="fas fa-desktop"></i> Ordinateur</h3>
                            <div className="platform-btn-group">
                                <button className="platform-btn web-btn">
                                    <i className="fab fa-chrome"></i>
                                    <span>Chrome</span>
                                </button>
                                <button className="platform-btn web-btn">
                                    <i className="fab fa-firefox"></i>
                                    <span>Firefox</span>
                                </button>
                                <button className="platform-btn web-btn">
                                    <i className="fab fa-edge"></i>
                                    <span>Edge</span>
                                </button>
                                <button className="platform-btn web-btn">
                                    <i className="fab fa-safari"></i>
                                    <span>Safari</span>
                                </button>
                            </div>

                            <h3><i className="fas fa-mobile-alt"></i> Mobile</h3>
                            <div className="platform-btn-group">
                                <button className="platform-btn mobile-btn">
                                    <i className="fab fa-android"></i>
                                    <span>Android</span>
                                </button>
                                <button className="platform-btn mobile-btn">
                                    <i className="fab fa-apple"></i>
                                    <span>iOS</span>
                                </button>
                                <button className="platform-btn mobile-btn">
                                    <i className="fas fa-mobile-alt"></i>
                                    <span>PWA</span>
                                </button>
                            </div>

                            <h3><i className="fas fa-tablet-alt"></i> Tablette</h3>
                            <div className="platform-btn-group">
                                <button className="platform-btn tablet-btn">
                                    <i className="fab fa-android"></i>
                                    <span>Android</span>
                                </button>
                                <button className="platform-btn tablet-btn">
                                    <i className="fab fa-apple"></i>
                                    <span>iPad</span>
                                </button>
                            </div>
                        </div>

                        {/*  Liens rapides  */}
                        <div className="quick-links">
                            <h3><i className="fas fa-link"></i> Liens rapides</h3>
                            <div className="links-grid">
                                <a href="/weather" className="quick-link">
                                    <i className="fas fa-cloud-sun"></i>
                                    <span>Météo</span>
                                </a>
                                <a href="/forecast" className="quick-link">
                                    <i className="fas fa-chart-line"></i>
                                    <span>Prévisions</span>
                                </a>
                                <a href="/alerts" className="quick-link">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <span>Alertes</span>
                                </a>
                                <a href="/premium" className="quick-link">
                                    <i className="fas fa-crown"></i>
                                    <span>Premium</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/*  Weather Preview Section  */}
        <section className="weather-preview-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Météo Actuelle</h2>
                    <p className="section-description">
                        Consultez les conditions météorologiques actuelles dans les principales villes du Maroc et du monde
                    </p>
                </div>
                
                <div className="cities-grid">
                    <div className="city-weather-card" onClick={() => handleCityClick('Rabat')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Rabat</h3>
                            <span className="city-region">Rabat-Salé-Kénitra</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-sun"></i>
                            </div>
                            <div className="temperature">24°C</div>
                            <div className="condition">Ensoleillé</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">65%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">12 km/h</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="city-weather-card" onClick={() => handleCityClick('Casablanca')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Casablanca</h3>
                            <span className="city-region">Casablanca-Settat</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-cloud-sun"></i>
                            </div>
                            <div className="temperature">22°C</div>
                            <div className="condition">Partiellement nuageux</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">70%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">15 km/h</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="city-weather-card" onClick={() => handleCityClick('Marrakech')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Marrakech</h3>
                            <span className="city-region">Marrakech-Safi</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-sun"></i>
                            </div>
                            <div className="temperature">28°C</div>
                            <div className="condition">Ensoleillé</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">45%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">8 km/h</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="city-weather-card" onClick={() => handleCityClick('Fès')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Fès</h3>
                            <span className="city-region">Fès-Meknès</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-cloud"></i>
                            </div>
                            <div className="temperature">20°C</div>
                            <div className="condition">Nuageux</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">75%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">10 km/h</span>
                            </div>
                        </div>
                    </div>

                    <div className="city-weather-card" onClick={() => handleCityClick('Agadir')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Agadir</h3>
                            <span className="city-region">Souss-Massa</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-sun"></i>
                            </div>
                            <div className="temperature">25°C</div>
                            <div className="condition">Ensoleillé</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">60%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">18 km/h</span>
                            </div>
                        </div>
                    </div>

                    <div className="city-weather-card" onClick={() => handleCityClick('Tanger')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Tanger</h3>
                            <span className="city-region">Tanger-Tétouan-Al Hoceïma</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-cloud-sun"></i>
                            </div>
                            <div className="temperature">21°C</div>
                            <div className="condition">Partiellement nuageux</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">68%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">22 km/h</span>
                            </div>
                        </div>
                    </div>

                    <div className="city-weather-card" onClick={() => handleCityClick('Oujda')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Oujda</h3>
                            <span className="city-region">L'Oriental</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-sun"></i>
                            </div>
                            <div className="temperature">23°C</div>
                            <div className="condition">Ensoleillé</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">55%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">14 km/h</span>
                            </div>
                        </div>
                    </div>

                    <div className="city-weather-card" onClick={() => handleCityClick('Laâyoune')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Laâyoune</h3>
                            <span className="city-region">Laâyoune-Sakia El Hamra</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-sun"></i>
                            </div>
                            <div className="temperature">27°C</div>
                            <div className="condition">Ensoleillé</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">40%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">25 km/h</span>
                            </div>
                        </div>
                    </div>

                    <div className="city-weather-card" onClick={() => handleCityClick('Paris')} style={{ cursor: 'pointer' }}>
                        <div className="city-header">
                            <h3 className="city-name">Paris</h3>
                            <span className="city-region">France</span>
                        </div>
                        <div className="weather-display">
                            <div className="weather-icon">
                                <i className="fas fa-cloud-sun"></i>
                            </div>
                            <div className="temperature">18°C</div>
                            <div className="condition">Partiellement nuageux</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">Humidité</span>
                                <span className="detail-value">60%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vent</span>
                                <span className="detail-value">10 km/h</span>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="view-all-weather">
                    <a href="/weather" className="btn btn-outline btn-large">
                        <i className="fas fa-eye"></i>
                        Voir Toutes les Villes
                    </a>
                </div>
            </div>
        </section>

        {/*  CTA Section  */}
        <section className="cta-section">
            <div className="container">
                <div className="cta-content">
                    <h2 className="cta-title">Prêt à Planifier Votre Journée ?</h2>
                    <p className="cta-description">
                        Accédez à nos prévisions météorologiques détaillées et planifiez vos activités 
                        avec une précision inégalée
                    </p>
                    <div className="cta-actions">
                        <a href="/forecast" className="btn btn-primary btn-large">
                            <i className="fas fa-chart-line"></i>
                            Voir les Prévisions
                        </a>
                        <a href="/register" className="btn btn-outline btn-large">
                            <i className="fas fa-user-plus"></i>
                            Créer un Compte
                        </a>
                    </div>
                </div>
            </div>
        </section>

        {/*  Section Premium  */}
        <section className="premium-section">
            <div className="container">
                <div className="premium-header">
                    <div className="premium-badge">
                        <i className="fas fa-crown"></i>
                        <span>Premium</span>
                    </div>
                    <h2 className="premium-title">Débloquez le Potentiel Complet d'AtlasForecast</h2>
                    <p className="premium-subtitle">
                        Accédez à des fonctionnalités avancées et des données météorologiques de niveau professionnel
                    </p>
                </div>

                <div className="premium-features">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-satellite-dish"></i>
                        </div>
                        <h3 className="feature-title">Données Satellite HD</h3>
                        <p className="feature-description">
                            Images satellite haute résolution avec archives de 10 ans et mises à jour toutes les 15 minutes
                        </p>
                        <div className="feature-highlight">
                            <i className="fas fa-check"></i>
                            <span>Résolution 4K</span>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-chart-area"></i>
                        </div>
                        <h3 className="feature-title">Prévisions Ultra-Précises</h3>
                        <p className="feature-description">
                            Modèles météo multi-ensembles avec prévisions jusqu'à 15 jours et précision de 95%
                        </p>
                        <div className="feature-highlight">
                            <i className="fas fa-check"></i>
                            <span>15 jours avancés</span>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-bell"></i>
                        </div>
                        <h3 className="feature-title">Alertes Personnalisées</h3>
                        <p className="feature-description">
                            Notifications en temps réel pour conditions météo extrêmes et alertes personnalisées
                        </p>
                        <div className="feature-highlight">
                            <i className="fas fa-check"></i>
                            <span>Alertes instantanées</span>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-database"></i>
                        </div>
                        <h3 className="feature-title">Historique Complet</h3>
                        <p className="feature-description">
                            Accès à 50 ans de données climatiques avec analyses statistiques et tendances
                        </p>
                        <div className="feature-highlight">
                            <i className="fas fa-check"></i>
                            <span>50 ans d'historique</span>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-mobile-alt"></i>
                        </div>
                        <h3 className="feature-title">Application Mobile</h3>
                        <p className="feature-description">
                            Application native iOS et Android avec synchronisation cloud et mode hors ligne
                        </p>
                        <div className="feature-highlight">
                            <i className="fas fa-check"></i>
                            <span>iOS & Android</span>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-headset"></i>
                        </div>
                        <h3 className="feature-title">Support Prioritaire</h3>
                        <p className="feature-description">
                            Support client 24/7 avec accès direct aux experts météo et assistance technique
                        </p>
                        <div className="feature-highlight">
                            <i className="fas fa-check"></i>
                            <span>Support 24/7</span>
                        </div>
                    </div>
                </div>

                <div className="premium-pricing">
                    <div className="pricing-cards">
                        {/*  Plan Mensuel  */}
                        <div className="pricing-card monthly-card">
                            <div className="pricing-header">
                                <h3 className="plan-name">Plan Mensuel</h3>
                                <div className="price">
                                    <span className="currency">€</span>
                                    <span className="amount">4.99</span>
                                    <span className="period">/mois</span>
                                </div>
                                <p className="billing">Facturation mensuelle</p>
                            </div>
                            
                            <div className="pricing-features">
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Toutes les fonctionnalités premium</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Données en temps réel</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Support prioritaire</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Application mobile</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Annulation gratuite</span>
                                </div>
                            </div>

                            <div className="pricing-actions">
                                <a href="/premium" className="btn btn-premium btn-large">
                                    <i className="fas fa-rocket"></i>
                                    Commencer l'Essai Gratuit
                                </a>
                                <p className="trial-info">14 jours d'essai gratuit, sans engagement</p>
                            </div>
                        </div>

                        {/*  Plan Annuel (Recommandé)  */}
                        <div className="pricing-card annual-card recommended">
                            <div className="recommended-badge">
                                <i className="fas fa-star"></i>
                                <span>Recommandé</span>
                            </div>
                            <div className="pricing-header">
                                <h3 className="plan-name">Plan Annuel</h3>
                                <div className="price">
                                    <span className="currency">€</span>
                                    <span className="amount">49.99</span>
                                    <span className="period">/an</span>
                                </div>
                                <p className="billing">Facturation annuelle</p>
                                <div className="savings">
                                    <i className="fas fa-piggy-bank"></i>
                                    <span>Économisez 30%</span>
                                </div>
                            </div>
                            
                            <div className="pricing-features">
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Toutes les fonctionnalités premium</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Données en temps réel</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Support prioritaire</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Application mobile</span>
                                </div>
                                <div className="pricing-feature">
                                    <i className="fas fa-check"></i>
                                    <span>Annulation gratuite</span>
                                </div>
                                <div className="pricing-feature bonus">
                                    <i className="fas fa-gift"></i>
                                    <span>+ 2 mois offerts</span>
                                </div>
                            </div>

                            <div className="pricing-actions">
                                <a href="/premium" className="btn btn-premium btn-large">
                                    <i className="fas fa-crown"></i>
                                    Choisir l'Annuel
                                </a>
                                <p className="trial-info">14 jours d'essai gratuit, sans engagement</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-cta">
                    <div className="cta-content">
                        <h3>Prêt à Transformer Votre Expérience Météo ?</h3>
                        <p>Rejoignez des milliers de professionnels qui font confiance à AtlasForecast Premium</p>
                        <div className="cta-buttons">
                            <a href="/premium" className="btn btn-outline btn-large">
                                <i className="fas fa-info-circle"></i>
                                En Savoir Plus
                            </a>
                            <a href="/register" className="btn btn-primary btn-large">
                                <i className="fas fa-crown"></i>
                                Devenir Premium
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
  );
};

export default HomePage;
