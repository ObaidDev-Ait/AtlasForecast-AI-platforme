import React, { useEffect } from 'react';

const PrivacyPage = () => {
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
                <h1><i className="fas fa-shield-alt"></i> Politique de Confidentialité</h1>
                <p>Protection de vos données personnelles et respect de votre vie privée</p>
                <div className="last-updated">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Dernière mise à jour : 15 Janvier 2025</span>
                </div>
            </div>

            {/*  Navigation rapide  */}
            <div className="quick-nav">
                <h2>Navigation Rapide</h2>
                <div className="nav-links">
                    <a href="#collecte" className="nav-link-item">
                        <i className="fas fa-database"></i>
                        <span>Collecte des Données</span>
                    </a>
                    <a href="#utilisation" className="nav-link-item">
                        <i className="fas fa-cogs"></i>
                        <span>Utilisation des Données</span>
                    </a>
                    <a href="#partage" className="nav-link-item">
                        <i className="fas fa-share-alt"></i>
                        <span>Partage des Données</span>
                    </a>
                    <a href="#securite" className="nav-link-item">
                        <i className="fas fa-lock"></i>
                        <span>Sécurité</span>
                    </a>
                    <a href="#droits" className="nav-link-item">
                        <i className="fas fa-user-check"></i>
                        <span>Vos Droits</span>
                    </a>
                    <a href="#contact" className="nav-link-item">
                        <i className="fas fa-envelope"></i>
                        <span>Contact</span>
                    </a>
                </div>
            </div>

            {/*  Section Collecte des Données  */}
            <section id="collecte" className="content-section">
                <h2><i className="fas fa-database"></i> Collecte des Données</h2>
                <div className="section-content">
                    <div className="info-card">
                        <h3>Données que nous collectons</h3>
                        <div className="data-types">
                            <div className="data-type">
                                <div className="type-icon">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div className="type-content">
                                    <h4>Informations Personnelles</h4>
                                    <ul>
                                        <li>Nom et prénom</li>
                                        <li>Adresse e-mail</li>
                                        <li>Numéro de téléphone (optionnel)</li>
                                        <li>Localisation (si autorisée)</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="data-type">
                                <div className="type-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="type-content">
                                    <h4>Données de Localisation</h4>
                                    <ul>
                                        <li>Coordonnées GPS</li>
                                        <li>Ville et pays</li>
                                        <li>Historique des recherches</li>
                                        <li>Préférences météo</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="data-type">
                                <div className="type-icon">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className="type-content">
                                    <h4>Données d'Utilisation</h4>
                                    <ul>
                                        <li>Pages visitées</li>
                                        <li>Temps passé sur le site</li>
                                        <li>Fonctionnalités utilisées</li>
                                        <li>Préférences de navigation</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Utilisation des Données  */}
            <section id="utilisation" className="content-section">
                <h2><i className="fas fa-cogs"></i> Utilisation des Données</h2>
                <div className="section-content">
                    <div className="usage-grid">
                        <div className="usage-item">
                            <div className="usage-icon">
                                <i className="fas fa-cloud-sun"></i>
                            </div>
                            <h3>Services Météo</h3>
                            <p>Fournir des prévisions météorologiques précises et personnalisées selon votre localisation</p>
                        </div>
                        
                        <div className="usage-item">
                            <div className="usage-icon">
                                <i className="fas fa-bell"></i>
                            </div>
                            <h3>Alertes Personnalisées</h3>
                            <p>Envoyer des notifications météo importantes et des alertes de sécurité</p>
                        </div>
                        
                        <div className="usage-item">
                            <div className="usage-icon">
                                <i className="fas fa-chart-area"></i>
                            </div>
                            <h3>Amélioration du Service</h3>
                            <p>Analyser l'utilisation pour améliorer nos fonctionnalités et l'expérience utilisateur</p>
                        </div>
                        
                        <div className="usage-item">
                            <div className="usage-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <h3>Support Client</h3>
                            <p>Répondre à vos demandes et fournir une assistance technique personnalisée</p>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Partage des Données  */}
            <section id="partage" className="content-section">
                <h2><i className="fas fa-share-alt"></i> Partage des Données</h2>
                <div className="section-content">
                    <div className="sharing-policy">
                        <div className="policy-item">
                            <div className="policy-icon">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <div className="policy-content">
                                <h3>Nous ne vendons JAMAIS vos données</h3>
                                <p>Vos informations personnelles ne seront jamais vendues, louées ou échangées avec des tiers à des fins commerciales.</p>
                            </div>
                        </div>
                        
                        <div className="policy-item">
                            <div className="policy-icon">
                                <i className="fas fa-handshake"></i>
                            </div>
                            <div className="policy-content">
                                <h3>Partenaires de Confiance</h3>
                                <p>Nous travaillons uniquement avec des partenaires de confiance pour fournir nos services météo, dans le strict respect de la confidentialité.</p>
                            </div>
                        </div>
                        
                        <div className="policy-item">
                            <div className="policy-icon">
                                <i className="fas fa-gavel"></i>
                            </div>
                            <div className="policy-content">
                                <h3>Obligations Légales</h3>
                                <p>Nous ne partageons vos données que si la loi l'exige ou pour protéger nos droits et la sécurité de nos utilisateurs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Sécurité  */}
            <section id="securite" className="content-section">
                <h2><i className="fas fa-lock"></i> Sécurité des Données</h2>
                <div className="section-content">
                    <div className="security-features">
                        <div className="security-item">
                            <div className="security-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h3>Chiffrement de Bout en Bout</h3>
                            <p>Toutes vos données sont chiffrées avec des protocoles de sécurité de niveau bancaire (AES-256)</p>
                        </div>
                        
                        <div className="security-item">
                            <div className="security-icon">
                                <i className="fas fa-server"></i>
                            </div>
                            <h3>Serveurs Sécurisés</h3>
                            <p>Nos serveurs sont protégés par des pare-feu avancés et des systèmes de détection d'intrusion</p>
                        </div>
                        
                        <div className="security-item">
                            <div className="security-icon">
                                <i className="fas fa-user-shield"></i>
                            </div>
                            <h3>Accès Restreint</h3>
                            <p>Seuls les employés autorisés ont accès à vos données, avec des contrôles d'accès stricts</p>
                        </div>
                        
                        <div className="security-item">
                            <div className="security-icon">
                                <i className="fas fa-sync-alt"></i>
                            </div>
                            <h3>Sauvegardes Sécurisées</h3>
                            <p>Sauvegardes automatiques et chiffrées pour protéger vos données contre toute perte</p>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Vos Droits  */}
            <section id="droits" className="content-section">
                <h2><i className="fas fa-user-check"></i> Vos Droits RGPD</h2>
                <div className="section-content">
                    <div className="rights-grid">
                        <div className="right-item">
                            <div className="right-icon">
                                <i className="fas fa-eye"></i>
                            </div>
                            <h3>Droit d'Accès</h3>
                            <p>Consulter toutes les données que nous détenons sur vous</p>
                        </div>
                        
                        <div className="right-item">
                            <div className="right-icon">
                                <i className="fas fa-edit"></i>
                            </div>
                            <h3>Droit de Rectification</h3>
                            <p>Corriger ou mettre à jour vos informations personnelles</p>
                        </div>
                        
                        <div className="right-item">
                            <div className="right-icon">
                                <i className="fas fa-trash-alt"></i>
                            </div>
                            <h3>Droit à l'Oubli</h3>
                            <p>Demander la suppression de vos données personnelles</p>
                        </div>
                        
                        <div className="right-item">
                            <div className="right-icon">
                                <i className="fas fa-download"></i>
                            </div>
                            <h3>Droit à la Portabilité</h3>
                            <p>Récupérer vos données dans un format lisible par machine</p>
                        </div>
                        
                        <div className="right-item">
                            <div className="right-icon">
                                <i className="fas fa-ban"></i>
                            </div>
                            <h3>Droit d'Opposition</h3>
                            <p>Vous opposer au traitement de vos données</p>
                        </div>
                        
                        <div className="right-item">
                            <div className="right-icon">
                                <i className="fas fa-cog"></i>
                            </div>
                            <h3>Droit de Limitation</h3>
                            <p>Limiter l'utilisation de vos données personnelles</p>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Contact  */}
            <section id="contact" className="content-section">
                <h2><i className="fas fa-envelope"></i> Contact et Questions</h2>
                <div className="section-content">
                    <div className="contact-info">
                        <div className="contact-item">
                            <div className="contact-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className="contact-content">
                                <h3>Email de Contact</h3>
                                <p><a href="mailto:privacy@atlasforecast.com">privacy@atlasforecast.com</a></p>
                                <span>Réponse sous 24-48 heures</span>
                            </div>
                        </div>
                        
                        <div className="contact-item">
                            <div className="contact-icon">
                                <i className="fas fa-phone"></i>
                            </div>
                            <div className="contact-content">
                                <h3>Téléphone</h3>
                                <p><a href="tel:+212645508349">+212 645-508349</a></p>
                                <span>Lun-Ven, 9h-18h (GMT+1)</span>
                            </div>
                        </div>
                        
                        <div className="contact-item">
                            <div className="contact-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div className="contact-content">
                                <h3>Adresse</h3>
                                <p>Rue Mohammed EL Bekall<br />Marrakech, Maroc</p>
                                <span>Siège social</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Mise à Jour  */}
            <section className="content-section">
                <h2><i className="fas fa-history"></i> Mises à Jour de la Politique</h2>
                <div className="section-content">
                    <div className="updates-timeline">
                        <div className="update-item">
                            <div className="update-date">15 Janvier 2025</div>
                            <div className="update-content">
                                <h3>Version 2.0 - Mise à jour majeure</h3>
                                <ul>
                                    <li>Ajout de nouvelles fonctionnalités de sécurité</li>
                                    <li>Mise à jour des procédures RGPD</li>
                                    <li>Clarification des droits utilisateur</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="update-item">
                            <div className="update-date">1 Juillet 2024</div>
                            <div className="update-content">
                                <h3>Version 1.5 - Conformité RGPD</h3>
                                <ul>
                                    <li>Mise en conformité avec le RGPD</li>
                                    <li>Ajout des droits utilisateur</li>
                                    <li>Amélioration de la transparence</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="update-item">
                            <div className="update-date">1 Janvier 2024</div>
                            <div className="update-content">
                                <h3>Version 1.0 - Première publication</h3>
                                <ul>
                                    <li>Politique de confidentialité initiale</li>
                                    <li>Protection des données de base</li>
                                    <li>Engagements de sécurité</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </>
  );
};

export default PrivacyPage;
