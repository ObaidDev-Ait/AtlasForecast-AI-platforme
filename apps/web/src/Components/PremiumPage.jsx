import React, { useEffect } from 'react';
import PremiumForecast14 from './PremiumForecast14';
import { useAuth } from '../contexts/AuthContext';

const PremiumPage = () => {
  const { isPremium } = useAuth();

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
            {/*  En-tête Premium  */}
            <div className="premium-header">
                <h1>AtlasForecast Premium</h1>
                <p>Débloquez le plein potentiel de la météo professionnelle</p>
                <div className="trial-badge">
                    <i className="fas fa-gift"></i>
                    <span>3 jours d'essai gratuit</span>
                </div>
            </div>

            {/*  🌤️ Module Prévisions 14 Jours Premium  */}
            {/* Paywall Wrapper */}
            <div style={{ position: 'relative' }}>
              {!isPremium && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 50,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  background: 'rgba(128, 128, 128, 0.15)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-start',
                  paddingTop: '8rem', borderRadius: '24px'
                }}>
                  <div style={{
                    background: 'var(--bg-card, #ffffff)', padding: '3rem 2rem',
                    borderRadius: '24px', border: '1px solid var(--border-color)',
                    textAlign: 'center', maxWidth: '500px', width: '90%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}>
                    <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#6366f1', margin: '0 auto 1.5rem', display: 'block' }}></i>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-primary)' }}>Contenu Réservé Premium</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                      Passez à AtlasForecast Premium pour accéder aux prévisions détaillées à 14 jours, au radar HD en direct et à toutes nos fonctionnalités avancées.
                    </p>
                    <a href="/premium-signup" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', borderRadius: '14px', fontWeight: '800', background: 'var(--gradient-primary)', color: '#fff', textDecoration: 'none' }}>
                      <i className="fas fa-crown"></i> Déverrouiller l'accès
                    </a>
                  </div>
                </div>
              )}

              <div style={!isPremium ? { pointerEvents: 'none', userSelect: 'none', overflow: 'hidden', maxHeight: '1000px', opacity: '0.5' } : {}}>
                <PremiumForecast14 />

                {/* 📡 Radar Météo Premium en Direct (RainViewer) */}
                <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)' }}>
                      <i className="fas fa-satellite-dish"></i>
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, color: 'var(--text-primary)' }}>Radar Live HD</h2>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>Suivi des précipitations en temps réel via RainViewer</p>
                    </div>
                  </div>
                  
                  <div style={{ 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 20px 40px var(--shadow-color)',
                    background: 'var(--bg-glass-dark)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', top: '1rem', left: '1rem', zIndex: 10,
                      background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                      padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: '800',
                      fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                    }}>
                      <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }}></div>
                      DIRECT
                    </div>

                    <iframe 
                      src="https://www.rainviewer.com/map.html?loc=31.7917,-7.0926,5&oFa=1&oC=1&oU=0&oCS=1&oF=0&oAP=1&c=3&o=83&lm=0&layer=radar&sm=1&sn=1" 
                      width="100%" 
                      height="500px" 
                      frameBorder="0" 
                      style={{ border: 0, display: 'block' }} 
                      allowFullScreen 
                      title="Radar Météo RainViewer"
                    ></iframe>
                  </div>
                </div>

            {/*  Fonctionnalités Premium Détaillées  */}
            <div className="premium-features-detailed">
                <h2>Fonctionnalités Premium Avancées</h2>
                <p className="features-subtitle">Découvrez tout ce qu'AtlasForecast Premium vous offre</p>
                
                <div className="features-grid">
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
                            Application native iOS et Android avec synchronisation cloud et mode hors ligne prochainement
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
            </div>

            {/*  Plans d'abonnement  */}
            <div className="pricing-section">
                <div className="pricing-grid">
                    {/*  Plan Mensuel  */}
                    <div className="pricing-card monthly">
                        <div className="card-header">
                            <h3>Plan Mensuel</h3>
                            <div className="price">
                                <span className="amount">4.99€</span>
                                <span className="period">/mois</span>
                            </div>
                            <p className="description">Parfait pour tester Premium</p>
                        </div>
                        
                        <div className="card-features">
                            <ul>
                                <li><i className="fas fa-check"></i> Toutes les fonctionnalités premium</li>
                                <li><i className="fas fa-check"></i> Données en temps réel</li>
                                <li><i className="fas fa-check"></i> Support prioritaire</li>
                                <li><i className="fas fa-check"></i> Application mobile</li>
                                <li><i className="fas fa-check"></i> Annulation gratuite</li>
                                <li><i className="fas fa-check"></i> Prévisions sur 15 jours</li>
                                <li><i className="fas fa-check"></i> Alertes personnalisées</li>
                                <li><i className="fas fa-check"></i> Données climatiques historiques</li>
                                <li><i className="fas fa-check"></i> Graphiques avancés</li>
                                <li><i className="fas fa-check"></i> Pas de publicités</li>
                            </ul>
                        </div>
                        
                        <div className="card-actions">
                            <a href="premium-signup.html?plan=monthly&price=4.99" className="btn btn-primary">
                                <i className="fas fa-rocket"></i>
                                Commencer l'Essai Gratuit
                            </a>
                            <p className="trial-info">14 jours d'essai gratuit, sans engagement</p>
                        </div>
                    </div>

                    {/*  Plan Annuel (Recommandé)  */}
                    <div className="pricing-card yearly recommended">
                        <div className="recommended-badge">
                            <i className="fas fa-star"></i>
                            Recommandé
                        </div>
                        
                        <div className="card-header">
                            <h3>Plan Annuel</h3>
                            <div className="price">
                                <span className="amount">49.99€</span>
                                <span className="period">/an</span>
                            </div>
                            <div className="savings">
                                <span className="savings-amount">Économisez 30%</span>
                                <span className="bonus-info">+ 2 mois offerts</span>
                            </div>
                            <p className="description">Meilleur rapport qualité-prix</p>
                        </div>
                        
                        <div className="card-features">
                            <ul>
                                <li><i className="fas fa-check"></i> Tout du plan mensuel</li>
                                <li><i className="fas fa-check"></i> Prévisions sur 15 jours</li>
                                <li><i className="fas fa-check"></i> Données satellite HD</li>
                                <li><i className="fas fa-check"></i> Modèles météo multi-ensembles</li>
                                <li><i className="fas fa-check"></i> Support VIP 24/7</li>
                                <li><i className="fas fa-check"></i> Accès aux bêta-tests</li>
                                <li><i className="fas fa-check"></i> Modèles climatiques avancés</li>
                                <li><i className="fas fa-check"></i> Intégration IoT & capteurs</li>
                                <li><i className="fas fa-check"></i> Rapports météo automatisés</li>
                                <li><i className="fas fa-check"></i> Accès aux données satellites</li>
                            </ul>
                        </div>
                        
                        <div className="card-actions">
                            <a href="premium-signup.html?plan=yearly&price=49.99" className="btn btn-premium">
                                <i className="fas fa-crown"></i>
                                Choisir l'Annuel
                            </a>
                            <p className="trial-info">14 jours d'essai gratuit, sans engagement</p>
                        </div>
                    </div>

                    {/*  Plan Entreprise  */}
                    <div className="pricing-card enterprise">
                        <div className="card-header">
                            <h3>Plan Entreprise</h3>
                            <div className="price">
                                <span className="amount">Sur mesure</span>
                                <span className="period">/an</span>
                            </div>
                            <p className="description">Solutions personnalisées</p>
                        </div>
                        
                        <div className="card-features">
                            <ul>
                                <li><i className="fas fa-check"></i> Tout des plans précédents</li>
                                <li><i className="fas fa-check"></i> Intégration personnalisée</li>
                                <li><i className="fas fa-check"></i> Données en temps réel</li>
                                <li><i className="fas fa-check"></i> Support dédié</li>
                                <li><i className="fas fa-check"></i> Formation des équipes</li>
                                <li><i className="fas fa-check"></i> SLA garanti</li>
                                <li><i className="fas fa-check"></i> Infrastructure dédiée</li>
                                <li><i className="fas fa-check"></i> Conformité RGPD & sécurité</li>
                                <li><i className="fas fa-check"></i> Développement sur mesure</li>
                                <li><i className="fas fa-check"></i> Accompagnement stratégique</li>
                            </ul>
                        </div>
                        
                        <div className="card-actions">
                            <a href="/contact" className="btn btn-secondary">
                                <i className="fas fa-phone"></i>
                                Contactez-nous
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Section CTA Finale  */}
            <div className="premium-cta-final">
                <div className="cta-content">
                    <h3>Prêt à Transformer Votre Expérience Météo ?</h3>
                    <p>Rejoignez des milliers de professionnels qui font confiance à AtlasForecast Premium</p>
                    <div className="cta-buttons">
                        <a href="/register" className="btn btn-outline btn-large">
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

            {/*  Comparaison des fonctionnalités  */}
            <div className="features-comparison">
                <h2>Comparaison des Plans</h2>
                <div className="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Fonctionnalité</th>
                                <th>Gratuit</th>
                                <th>Premium Mensuel</th>
                                <th>Premium Annuel</th>
                                <th>Entreprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Prévisions météo</td>
                                <td>5 jours</td>
                                <td>15 jours</td>
                                <td>15 jours</td>
                                <td>Illimité</td>
                            </tr>
                            <tr>
                                <td>Alertes météo</td>
                                <td>Basiques</td>
                                <td>Personnalisées</td>
                                <td>Avancées</td>
                                <td>Sur mesure</td>
                            </tr>
                            <tr>
                                <td>Données historiques</td>
                                <td>7 jours</td>
                                <td>1 an</td>
                                <td>5 ans</td>
                                <td>Complètes</td>
                            </tr>
                            <tr>
                                <td>Graphiques</td>
                                <td>Basiques</td>
                                <td>Avancés</td>
                                <td>Professionnels</td>
                                <td>Personnalisés</td>
                            </tr>
                            <tr>
                                <td>Support</td>
                                <td>Email</td>
                                <td>Prioritaire</td>
                                <td>VIP 24/7</td>
                                <td>Dédié</td>
                            </tr>
                            <tr>
                                <td>API</td>
                                <td>Non</td>
                                <td>Limite</td>
                                <td>Complète</td>
                                <td>Sur mesure</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/*  Fonctionnalités Exclusives Premium  */}
            <div className="exclusive-features">
                <h2>Fonctionnalités Exclusives Premium</h2>
                <div className="features-showcase">
                    <div className="feature-category">
                        <div className="category-icon">
                            <i className="fas fa-satellite"></i>
                        </div>
                        <h3>Données Satellite & Radar</h3>
                        <p>Accédez aux images satellite haute résolution et aux données radar en temps réel pour une précision météorologique exceptionnelle.</p>
                        <ul className="feature-list">
                            <li><i className="fas fa-check-circle"></i> Images satellite toutes les 15 minutes</li>
                            <li><i className="fas fa-check-circle"></i> Radar de précipitations haute résolution</li>
                            <li><i className="fas fa-check-circle"></i> Détection des orages en temps réel</li>
                            <li><i className="fas fa-check-circle"></i> Cartes de couverture nuageuse</li>
                        </ul>
                    </div>
                    
                    <div className="feature-category">
                        <div className="category-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Analyses Avancées</h3>
                        <p>Profitez d'outils d'analyse météorologique professionnels avec des graphiques interactifs et des modèles prédictifs.</p>
                        <ul className="feature-list">
                            <li><i className="fas fa-check-circle"></i> Graphiques 3D interactifs</li>
                            <li><i className="fas fa-check-circle"></i> Modèles de prévision multiples</li>
                            <li><i className="fas fa-check-circle"></i> Analyses statistiques avancées</li>
                            <li><i className="fas fa-check-circle"></i> Rapports automatisés personnalisables</li>
                        </ul>
                    </div>
                    
                    <div className="feature-category">
                        <div className="category-icon">
                            <i className="fas fa-mobile-alt"></i>
                        </div>
                        <h3>Expérience Mobile Premium</h3>
                        <p>Une expérience mobile optimisée avec des fonctionnalités exclusives et une interface personnalisable.</p>
                        <ul className="feature-list">
                            <li><i className="fas fa-check-circle"></i> Widgets personnalisables</li>
                            <li><i className="fas fa-check-circle"></i> Mode hors ligne complet</li>
                            <li><i className="fas fa-check-circle"></i> Notifications push intelligentes</li>
                            <li><i className="fas fa-check-circle"></i> Synchronisation multi-appareils</li>
                        </ul>
                    </div>
                    
                    <div className="feature-category">
                        <div className="category-icon">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h3>Sécurité & Conformité</h3>
                        <p>Vos données sont protégées par les plus hauts standards de sécurité et de conformité réglementaire.</p>
                        <ul className="feature-list">
                            <li><i className="fas fa-check-circle"></i> Chiffrement de bout en bout</li>
                            <li><i className="fas fa-check-circle"></i> Conformité RGPD & ISO 27001</li>
                            <li><i className="fas fa-check-circle"></i> Sauvegarde automatique sécurisée</li>
                            <li><i className="fas fa-check-circle"></i> Contrôle d'accès granulaire</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/*  FAQ  */}
            <div className="faq-section">
                <h2>Questions Fréquentes</h2>
                <div className="faq-grid">
                    <div className="faq-item">
                        <div className="faq-question">
                            <h3>Comment fonctionne l'essai gratuit ?</h3>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Vous bénéficiez de 14 jours d'essai gratuit avec accès à toutes les fonctionnalités Premium. Aucune carte de crédit n'est requise pour commencer.</p>
                        </div>
                    </div>
                    
                    <div className="faq-item">
                        <div className="faq-question">
                            <h3>Puis-je annuler à tout moment ?</h3>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Oui, vous pouvez annuler votre abonnement à tout moment depuis votre compte. L'accès Premium restera actif jusqu'à la fin de la période payée.</p>
                        </div>
                    </div>
                    
                    <div className="faq-item">
                        <div className="faq-question">
                            <h3>Les données sont-elles sécurisées ?</h3>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Absolument. Toutes vos données sont cryptées et protégées selon les standards de sécurité les plus élevés de l'industrie.</p>
                        </div>
                    </div>
                    
                    <div className="faq-item">
                        <div className="faq-question">
                            <h3>Y a-t-il des frais cachés ?</h3>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Non, le prix affiché est le prix final. Aucun frais caché, pas de frais d'activation ou de résiliation.</p>
                        </div>
                    </div>
                </div>
            </div>

                         {/*  Témoignages Premium  */}
             <div className="premium-testimonials">
                 <h2>Ce que disent nos utilisateurs</h2>
                 <div className="testimonials-grid">
                     <div className="testimonial-card">
                         <div className="testimonial-content">
                             <p>"AtlasForecast a révolutionné la façon dont nous planifions nos activités extérieures. La précision est incroyable !"</p>
                         </div>
                         <div className="testimonial-author">
                             <div className="author-avatar">
                                 <i className="fas fa-user-tie"></i>
                             </div>
                             <div className="author-info">
                                 <h4>Ahmed Benali</h4>
                                 <span>Directeur Commercial</span>
                             </div>
                         </div>
                     </div>
                     
                     <div className="testimonial-card">
                         <div className="testimonial-content">
                             <p>"Les alertes en temps réel m'ont sauvé plusieurs fois lors de mes randonnées en montagne."</p>
                         </div>
                         <div className="testimonial-author">
                             <div className="author-avatar">
                                 <i className="fas fa-hiking"></i>
                             </div>
                             <div className="author-info">
                                 <h4>Fatima Zahra</h4>
                                 <span>Guide de Montagne</span>
                             </div>
                         </div>
                     </div>
                     
                     <div className="testimonial-card">
                         <div className="testimonial-content">
                             <p>"Interface intuitive et données fiables. C'est exactement ce dont j'avais besoin pour mon entreprise."</p>
                         </div>
                         <div className="testimonial-author">
                             <div className="author-avatar">
                                 <i className="fas fa-seedling"></i>
                             </div>
                             <div className="author-info">
                                 <h4>Karim Mansouri</h4>
                                 <span>Agriculteur</span>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>

            {/*  Section CTA  */}
            <div className="cta-section">
                <div className="cta-content">
                    <h2>Prêt à Passer Premium ?</h2>
                    <p>Rejoignez des milliers d'utilisateurs qui font confiance à AtlasForecast Premium</p>
                    <div className="cta-actions">
                        <a href="/premium-signup" className="btn btn-premium">
                            <i className="fas fa-crown"></i>
                            Commencer l'Essai Gratuit
                        </a>
                        <a href="/contact" className="btn btn-secondary">
                            <i className="fas fa-question-circle"></i>
                            Besoin d'Aide ?
                        </a>
                    </div>
                </div>
            </div>
        </div>
        {/* Close Paywall Wrapper */}
        </div>
        </div>
    </>
  );
};

export default PremiumPage;
