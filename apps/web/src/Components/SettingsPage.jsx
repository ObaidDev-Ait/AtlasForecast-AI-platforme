import React, { useEffect } from 'react';

const SettingsPage = () => {
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
            {/*  En-tête de la page  */}
            <div className="page-header">
                <h1><i className="fas fa-cog"></i> Paramètres</h1>
                <p>Personnalisez votre expérience AtlasForecast selon vos préférences</p>
            </div>

            {/*  Navigation des paramètres  */}
            <div className="settings-nav">
                <a href="#compte" className="nav-item active">
                    <i className="fas fa-user"></i>
                    <span>Compte</span>
                </a>
                <a href="#notifications" className="nav-item">
                    <i className="fas fa-bell"></i>
                    <span>Notifications</span>
                </a>
                <a href="#privacy" className="nav-item">
                    <i className="fas fa-shield-alt"></i>
                    <span>Confidentialité</span>
                </a>
                <a href="#appearance" className="nav-item">
                    <i className="fas fa-palette"></i>
                    <span>Apparence</span>
                </a>
                <a href="#language" className="nav-item">
                    <i className="fas fa-globe"></i>
                    <span>Langue</span>
                </a>
                <a href="#units" className="nav-item">
                    <i className="fas fa-ruler"></i>
                    <span>Unités</span>
                </a>
                <a href="#data" className="nav-item">
                    <i className="fas fa-database"></i>
                    <span>Données</span>
                </a>
                <a href="#security" className="nav-item">
                    <i className="fas fa-lock"></i>
                    <span>Sécurité</span>
                </a>
            </div>

            {/*  Section Paramètres du Compte  */}
            <section id="compte" className="settings-section">
                <h2><i className="fas fa-user"></i> Paramètres du Compte</h2>
                <div className="section-content">
                    <div className="settings-grid">
                        <div className="setting-card">
                            <div className="setting-header">
                                <div className="setting-icon">
                                    <i className="fas fa-id-card"></i>
                                </div>
                                <div className="setting-info">
                                    <h3>Informations Personnelles</h3>
                                    <p>Modifiez vos informations de base</p>
                                </div>
                            </div>
                            <div className="setting-content">
                                <form className="settings-form">
                                    <div className="form-group">
                                        <label htmlFor="firstName">Prénom</label>
                                        <input type="text" id="firstName" defaultValue="Obaid" className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Nom</label>
                                        <input type="text" id="lastName" defaultValue="Ait Mattou" className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input type="email" id="email" defaultValue="obaid.aitmattou@email.com" className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">Téléphone</label>
                                        <input type="tel" id="phone" defaultValue="+212 645-508349" className="form-input" />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save"></i>
                                        Sauvegarder
                                    </button>
                                </form>
                            </div>
                        </div>
                        
                        <div className="setting-card">
                            <div className="setting-header">
                                <div className="setting-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="setting-info">
                                    <h3>Localisation par Défaut</h3>
                                    <p>Définissez votre ville de référence</p>
                                </div>
                            </div>
                            <div className="setting-content">
                                <div className="location-settings">
                                    <div className="current-location">
                                        <i className="fas fa-map-pin"></i>
                                        <span>Marrakech, Maroc</span>
                                    </div>
                                    <div className="location-actions">
                                        <button className="btn btn-outline">
                                            <i className="fas fa-crosshairs"></i>
                                            Utiliser ma position
                                        </button>
                                        <button className="btn btn-outline">
                                            <i className="fas fa-search"></i>
                                            Changer de ville
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Notifications  */}
            <section id="notifications" className="settings-section">
                <h2><i className="fas fa-bell"></i> Paramètres des Notifications</h2>
                <div className="section-content">
                    <div className="settings-grid">
                        <div className="setting-card">
                            <div className="setting-header">
                                <div className="setting-icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div className="setting-info">
                                    <h3>Alertes Météo</h3>
                                    <p>Configurez vos alertes météorologiques</p>
                                </div>
                            </div>
                            <div className="setting-content">
                                <div className="notification-settings">
                                    <div className="setting-toggle">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                        <div className="toggle-info">
                                            <span className="toggle-label">Alertes de tempête</span>
                                            <span className="toggle-description">Recevoir des alertes pour les conditions météo extrêmes</span>
                                        </div>
                                    </div>
                                    
                                    <div className="setting-toggle">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                        <div className="toggle-info">
                                            <span className="toggle-label">Alertes de pluie</span>
                                            <span className="toggle-description">Notifications pour les précipitations importantes</span>
                                        </div>
                                    </div>
                                    
                                    <div className="setting-toggle">
                                        <label className="toggle-switch">
                                            <input type="checkbox" />
                                            <span className="slider"></span>
                                        </label>
                                        <div className="toggle-info">
                                            <span className="toggle-label">Alertes de chaleur</span>
                                            <span className="toggle-description">Avertissements pour les vagues de chaleur</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Apparence  */}
            <section id="appearance" className="settings-section">
                <h2><i className="fas fa-palette"></i> Paramètres d'Apparence</h2>
                <div className="section-content">
                    <div className="settings-grid">
                        <div className="setting-card">
                            <div className="setting-header">
                                <div className="setting-icon">
                                    <i className="fas fa-moon"></i>
                                </div>
                                <div className="setting-info">
                                    <h3>Thème</h3>
                                    <p>Choisissez votre thème préféré</p>
                                </div>
                            </div>
                            <div className="setting-content">
                                <div className="theme-settings">
                                    <div className="theme-option">
                                        <input type="radio" id="theme-light" name="theme" value="light" />
                                        <label htmlFor="theme-light" className="theme-label">
                                            <div className="theme-preview light">
                                                <i className="fas fa-sun"></i>
                                            </div>
                                            <span>Clair</span>
                                        </label>
                                    </div>
                                    
                                    <div className="theme-option">
                                        <input type="radio" id="theme-dark" name="theme" value="dark" defaultChecked />
                                        <label htmlFor="theme-dark" className="theme-label">
                                            <div className="theme-preview dark">
                                                <i className="fas fa-moon"></i>
                                            </div>
                                            <span>Sombre</span>
                                        </label>
                                    </div>
                                    
                                    <div className="theme-option">
                                        <input type="radio" id="theme-auto" name="theme" value="auto" />
                                        <label htmlFor="theme-auto" className="theme-label">
                                            <div className="theme-preview auto">
                                                <i className="fas fa-magic"></i>
                                            </div>
                                            <span>Automatique</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Langue  */}
            <section id="language" className="settings-section">
                <h2><i className="fas fa-globe"></i> Paramètres de Langue</h2>
                <div className="section-content">
                    <div className="settings-grid">
                        <div className="setting-card">
                            <div className="setting-header">
                                <div className="setting-icon">
                                    <i className="fas fa-language"></i>
                                </div>
                                <div className="setting-info">
                                    <h3>Langue de l'Interface</h3>
                                    <p>Choisissez votre langue préférée</p>
                                </div>
                            </div>
                            <div className="setting-content">
                                <div className="language-settings">
                                    <div className="language-option">
                                        <input type="radio" id="lang-fr" name="language" value="fr" defaultChecked />
                                        <label htmlFor="lang-fr" className="language-label">
                                            <div className="language-flag">🇫🇷</div>
                                            <div className="language-info">
                                                <span className="language-name">Français</span>
                                                <span className="language-native">Français</span>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <div className="language-option">
                                        <input type="radio" id="lang-en" name="language" value="en" />
                                        <label htmlFor="lang-en" className="language-label">
                                            <div className="language-flag">🇺🇸</div>
                                            <div className="language-info">
                                                <span className="language-name">English</span>
                                                <span className="language-native">Anglais</span>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <div className="language-option">
                                        <input type="radio" id="lang-ar" name="language" value="ar" />
                                        <label htmlFor="lang-ar" className="language-label">
                                            <div className="language-flag">🇸🇦</div>
                                            <div className="language-info">
                                                <span className="language-name">العربية</span>
                                                <span className="language-native">Arabe</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Unités  */}
            <section id="units" className="settings-section">
                <h2><i className="fas fa-ruler"></i> Paramètres des Unités</h2>
                <div className="section-content">
                    <div className="settings-grid">
                        <div className="setting-card">
                            <div className="setting-header">
                                <div className="setting-icon">
                                    <i className="fas fa-thermometer-half"></i>
                                </div>
                                <div className="setting-info">
                                    <h3>Unités de Température</h3>
                                    <p>Choisissez votre échelle de température</p>
                                </div>
                            </div>
                            <div className="setting-content">
                                <div className="temperature-settings">
                                    <div className="unit-option">
                                        <input type="radio" id="temp-celsius" name="temperature" value="celsius" defaultChecked />
                                        <label htmlFor="temp-celsius" className="unit-label">
                                            <span className="unit-symbol">°C</span>
                                            <span className="unit-name">Celsius</span>
                                        </label>
                                    </div>
                                    
                                    <div className="unit-option">
                                        <input type="radio" id="temp-fahrenheit" name="temperature" value="fahrenheit" />
                                        <label htmlFor="temp-fahrenheit" className="unit-label">
                                            <span className="unit-symbol">°F</span>
                                            <span className="unit-name">Fahrenheit</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </>
  );
};

export default SettingsPage;
