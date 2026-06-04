import React, { useEffect } from 'react';

const AboutPage = () => {
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
        <div className="container">
            {/*  En-tête About  */}
            <div className="about-header">
                <h1>À propos d'AtlasForecast</h1>
                <p>Découvrez notre mission, nos services et notre expertise en météorologie de pointe</p>
            </div>
            
            <div className="about-content">
                    <div className="about-section mission-section">
                        <h2><i className="fas fa-mountain"></i> Notre Mission</h2>
                        <p>AtlasForecast représente l'excellence météorologique au service du Maroc. Notre mission est de démocratiser l'accès aux informations climatiques de haute précision, en combinant innovation technologique et expertise météorologique pour offrir une expérience utilisateur inégalée.</p>
                        <p>Nous nous engageons à fournir des données météorologiques fiables, actualisées en temps réel, permettant aux citoyens, entreprises et institutions de prendre des décisions éclairées basées sur des prévisions climatiques précises.</p>
                    </div>

                    <div className="about-section services-section">
                        <h2><i className="fas fa-chart-line"></i> Nos Services Premium</h2>
                        <div className="services-grid">
                            <div className="service-item">
                                <h3><i className="fas fa-cloud-sun"></i> Météo en Temps Réel</h3>
                                <p>Données météorologiques actuelles avec une précision de 99.5% pour toutes les villes du Maroc et du monde entier.</p>
                            </div>
                            <div className="service-item">
                                <h3><i className="fas fa-chart-bar"></i> Prévisions Détaillées</h3>
                                <p>Modèles de prévision sur 5 jours avec résolution horaire, graphiques interactifs et analyses probabilistes.</p>
                            </div>
                            <div className="service-item">
                                <h3><i className="fas fa-radar"></i> Radar Météorologique</h3>
                                <p>Cartes radar en temps réel pour la pluie et satellite pour la couverture nuageuse mondiale.</p>
                            </div>
                            <div className="service-item">
                                <h3><i className="fas fa-exclamation-triangle"></i> Système d'Alertes</h3>
                                <p>Vigilance météorologique proactive pour vagues de chaleur, fortes précipitations et conditions extrêmes.</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-section coverage-section">
                        <h2><i className="fas fa-map-marked-alt"></i> Couverture Géographique Complète</h2>
                        <p>Notre plateforme couvre l'ensemble du territoire marocain avec une précision exceptionnelle, des sommets enneigés de l'Atlas aux vastes étendues sahariennes, en passant par les côtes atlantiques et méditerranéennes.</p>
                        <div className="coverage-details">
                            <div className="coverage-item">
                                <h4><i className="fas fa-city"></i> Villes Principales</h4>
                                <p>10 métropoles marocaines avec données ultra-précises et prévisions régionales détaillées</p>
                            </div>
                            <div className="coverage-item">
                                <h4><i className="fas fa-globe-africa"></i> Couverture Mondiale</h4>
                                <p>Accès aux données météorologiques de plus de 200,000 villes dans 190 pays</p>
                            </div>
                            <div className="coverage-item">
                                <h4><i className="fas fa-satellite"></i> Données Satellite</h4>
                                <p>Imagerie satellitaire haute résolution et modèles climatiques avancés</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-section tech-section">
                        <h2><i className="fas fa-cogs"></i> Architecture Technologique</h2>
                        <p>AtlasForecast repose sur une infrastructure technologique de pointe, conçue pour garantir performance, fiabilité et scalabilité dans un environnement météorologique en constante évolution.</p>
                        <div className="tech-stack">
                            <div className="tech-category">
                                <h4><i className="fas fa-database"></i> Sources de Données</h4>
                                <ul>
                                   <h4><i className="fas fa-database"></i> backend</h4>
                                 <li><strong>Express.js :</strong> Framework Node.js utilisé pour créer le serveur backend et gérer les requêtes API.</li> 
                                    <li><strong>OpenWeatherMap API :</strong> Données météorologiques mondiales certifiées</li>
                                    <li><strong>Open-Meteo :</strong> Modèles d'ensemble multi-modèles pour prévisions avancées</li>
                                    <li><strong>RainViewer :</strong> Radar de précipitations en temps réel</li>
                                </ul>
                            </div>
                            <div className="tech-category">
                                <h4><i className="fas fa-code"></i> Technologies Frontend</h4>
                                <ul>
                                    <li><strong>React.js :</strong> Bibliothèque responsive et accessible</li>
                                    <li><strong>JavaScript ES6+ :</strong> Logique métier et interactions avancées</li>
                                    <li><strong>React Leaflet.js :</strong> Cartographie interactive haute performance</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="about-section team-section">
                        <h2><i className="fas fa-users"></i> Notre Équipe d'Experts</h2>
                        <p>AtlasForecast est le fruit d'une collaboration entre météorologues certifiés, ingénieurs en développement logiciel et experts en sciences atmosphériques. Notre équipe pluridisciplinaire combine plus de 25 ans d'expérience dans le domaine météorologique.</p>
                        <div className="team-expertise">
                            <div className="expertise-area">
                                <h4><i className="fas fa-graduation-cap"></i> Expertise Météorologique</h4>
                                <p>Météorologues diplômés avec spécialisation en prévision numérique du temps</p>
                            </div>
                            <div className="expertise-area">
                                <h4><i className="fas fa-laptop-code"></i> Développement Logiciel</h4>
                                <p>Ingénieurs full-stack spécialisés dans les applications météorologiques</p>
                            </div>
                            <div className="expertise-area">
                                <h4><i className="fas fa-chart-area"></i> Analyse de Données</h4>
                                <p>Experts en traitement de données climatiques et modélisation statistique</p>
                            </div>
                        </div>
                    </div>

                    {/*  Section Sélecteurs et Informations avec Disposition Horizontale  */}
                    <div className="about-selectors-section">
                        <div className="horizontal-container">
                            {/*  Colonne de gauche : Sélecteurs et informations  */}
                            <div className="form-column">
                                <div className="form-header">
                                    <h1>Nos Sélecteurs</h1>
                                    <p>Choisissez les informations qui vous intéressent le plus</p>
                                </div>

                                <div className="form-card">
                                    <div className="selectors-info">
                                        <h3><i className="fas fa-sliders-h"></i> Sélecteurs Personnalisés</h3>
                                        <p>AtlasForecast vous permet de personnaliser votre expérience météorologique selon vos besoins spécifiques et vos préférences.</p>
                                        
                                        <div className="selector-features">
                                            <div className="selector-feature">
                                                <i className="fas fa-check"></i>
                                                <span>Sélection de villes favorites</span>
                                            </div>
                                            <div className="selector-feature">
                                                <i className="fas fa-check"></i>
                                                <span>Unités de mesure personnalisées</span>
                                            </div>
                                            <div className="selector-feature">
                                                <i className="fas fa-check"></i>
                                                <span>Alertes météo personnalisées</span>
                                            </div>
                                            <div className="selector-feature">
                                                <i className="fas fa-check"></i>
                                                <span>Interface adaptée à vos préférences</span>
                                            </div>
                                        </div>

                                        {/*  Sélecteurs interactifs  */}
                                        <div className="interactive-selectors">
                                            <h4><i className="fas fa-cog"></i> Paramètres Rapides</h4>
                                            <div className="selector-group">
                                                <label className="selector-label">
                                                    <span>Température en</span>
                                                    <select className="selector-select">
                                                        <option value="celsius">Celsius (°C)</option>
                                                        <option value="fahrenheit">Fahrenheit (°F)</option>
                                                        <option value="kelvin">Kelvin (K)</option>
                                                    </select>
                                                </label>
                                                
                                                <label className="selector-label">
                                                    <span>Vent en</span>
                                                    <select className="selector-select">
                                                        <option value="kmh">km/h</option>
                                                        <option value="mph">mph</option>
                                                        <option value="ms">m/s</option>
                                                    </select>
                                                </label>
                                                
                                                <label className="selector-label">
                                                    <span>Pression en</span>
                                                    <select className="selector-select">
                                                        <option value="hpa">hPa</option>
                                                        <option value="mmhg">mmHg</option>
                                                        <option value="atm">atm</option>
                                                    </select>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*  Colonne de droite : Informations et liens  */}
                            <div className="info-column">
                                <div className="info-card">
                                    <div className="info-header">
                                        <h2>Fonctionnalités Avancées</h2>
                                        <p>Découvrez nos outils spécialisés</p>
                                    </div>

                                    {/*  Outils spécialisés  */}
                                    <div className="specialized-tools">
                                        <h3><i className="fas fa-tools"></i> Outils Disponibles</h3>
                                        <div className="tools-grid">
                                            <a href="/weather" className="tool-link">
                                                <i className="fas fa-cloud-sun"></i>
                                                <span>Météo Temps Réel</span>
                                            </a>
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

                                    {/*  Liens rapides  */}
                                    <div className="quick-links">
                                        <h3><i className="fas fa-link"></i> Liens rapides</h3>
                                        <div className="links-grid">
                                            <a href="/" className="quick-link">
                                                <i className="fas fa-home"></i>
                                                <span>Accueil</span>
                                            </a>
                                            <a href="/weather" className="quick-link">
                                                <i className="fas fa-cloud-sun"></i>
                                                <span>Météo</span>
                                            </a>
                                            <a href="/contact" className="quick-link">
                                                <i className="fas fa-envelope"></i>
                                                <span>Contact</span>
                                            </a>
                                            <a href="/premium" className="quick-link">
                                                <i className="fas fa-crown"></i>
                                                <span>Premium</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/*  Statistiques  */}
                                    <div className="stats-section">
                                        <h3><i className="fas fa-chart-bar"></i> Nos Chiffres</h3>
                                        <div className="stats-grid">
                                            <div className="stat-item">
                                                <div className="stat-number">99.5%</div>
                                                <div className="stat-label">Précision</div>
                                            </div>
                                            <div className="stat-item">
                                                <div className="stat-number">200K+</div>
                                                <div className="stat-label">Villes</div>
                                            </div>
                                            <div className="stat-item">
                                                <div className="stat-number">24/7</div>
                                                <div className="stat-label">Disponibilité</div>
                                            </div>
                                            <div className="stat-item">
                                                <div className="stat-number">15min</div>
                                                <div className="stat-label">Mise à jour</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="about-section contact-section">
                        <h2><i className="fas fa-envelope"></i> Contact et Support</h2>
                        <p>Notre équipe dédiée est disponible pour répondre à vos questions, traiter vos demandes techniques et recueillir vos suggestions d'amélioration. Nous nous engageons à maintenir un niveau de service client d'excellence.</p>
                        <div className="contact-channels">
                            <div className="contact-channel">
                                <h4><i className="fas fa-envelope"></i> Support Technique</h4>
                                <p><strong>Email :</strong> support@atlasforecast.ma</p>
                                <p><strong>Réponse :</strong> Sous 2 heures ouvrables</p>
                            </div>
                            <div className="contact-channel">
                                <h4><i className="fas fa-phone"></i> Contact Commercial</h4>
                                <p><strong>Téléphone :</strong> +212 645508349</p>
                                <p><strong>Horaires :</strong> Lun-Ven 9h-18h (GMT+1)</p>
                            </div>
                            <div className="contact-channel">
                                <h4><i className="fas fa-map-marker-alt"></i> Siège Social</h4>
                                <p><strong>Adresse :</strong> Maroc</p>
                                <p><strong>Zone :</strong> Afrique du Nord</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-cta">
                        <a href="/contact" className="btn btn-primary"><i className="fas fa-envelope"></i> Nous Contacter</a>
                        <a href="/" className="btn btn-secondary"><i className="fas fa-home"></i> Retour à l'Accueil</a>
                        <div className="footer-social" style={{"marginTop": "1rem"}}>
                            <a href="https://www.facebook.com/profile.php?id=61578902663416&locale=fr_FR" target="_blank" rel="noopener" title="Facebook"><i className="fab fa-facebook"></i></a>
                            <a href="https://wa.me/212645508349" target="_blank" rel="noopener" title="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                            <a href="https://www.instagram.com/obaid.sr46/" target="_blank" rel="noopener" title="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="https://www.linkedin.com/in/obaid-ait-mattou-2b058130b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener" title="LinkedIn"><i className="fab fa-linkedin"></i></a>
                            <a href="https://github.com/Obaid-dev-rebelesto" target="_blank" rel="noopener" title="GitHub"><i className="fab fa-github"></i></a>
                        </div>
                    </div>
                </div>
            </div>
    </>
  );
};

export default AboutPage;
