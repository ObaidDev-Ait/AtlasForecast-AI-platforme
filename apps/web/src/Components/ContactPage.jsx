import React, { useEffect } from 'react';

const ContactPage = () => {
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
        <div className="form-container">
            {/*  En-tête de la page  */}
            <div className="form-header">
                <h1>Contactez AtlasForecast</h1>
                <p>Nous sommes là pour vous aider et répondre à toutes vos questions</p>
            </div>

            {/*  Formulaire de contact  */}
            <div className="form-card">
                <form id="contactForm" className="contact-form">
                    <div className="form-group">
                        <label htmlFor="name">Nom complet *</label>
                        <input type="text" id="name" name="name" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Adresse email *</label>
                        <input type="email" id="email" name="email" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Sujet *</label>
                        <select id="subject" name="subject" required>
                            <option value="">Sélectionnez un sujet</option>
                            <option value="question">Question générale</option>
                            <option value="bug">Signalement de bug</option>
                            <option value="feature">Demande de fonctionnalité</option>
                            <option value="support">Support technique</option>
                            <option value="partnership">Partenariat</option>
                            <option value="other">Autre</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message *</label>
                        <textarea id="message" name="message" rows="6" required 
                                  placeholder="Décrivez votre demande en détail..."></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priorité</label>
                        <select id="priority" name="priority">
                            <option value="low">Faible</option>
                            <option value="medium" selected>Moyenne</option>
                            <option value="high">Élevée</option>
                            <option value="urgent">Urgente</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input type="checkbox" id="newsletter" name="newsletter" />
                            <span className="checkmark"></span>
                            Je souhaite recevoir la newsletter AtlasForecast
                        </label>
                    </div>

                    <button type="submit" className="form-submit">
                        <i className="fas fa-paper-plane"></i>
                        Envoyer le Message
                    </button>
                </form>

                {/*  Informations de contact  */}
                <div className="contact-info-section">
                    <h3><i className="fas fa-info-circle"></i> Autres Moyens de Contact</h3>
                    
                    <div className="contact-methods">
                        <div className="contact-method">
                            <i className="fas fa-envelope"></i>
                            <div>
                                <h4>Email</h4>
                                <p>contact@atlasforecast.ma</p>
                                <p>support@atlasforecast.ma</p>
                            </div>
                        </div>

                        <div className="contact-method">
                            <i className="fas fa-phone"></i>
                            <div>
                                <h4>Téléphone</h4>
                                <p>+212 645508349</p>
                                <p>Lun-Ven: 9h-18h</p>
                            </div>
                        </div>

                        <div className="contact-method">
                            <i className="fas fa-map-marker-alt"></i>
                            <div>
                                <h4>Adresse</h4>
                                <p>Rue Mohammed EL Bekall</p>
                                <p>Marrakech, Maroc</p>
                            </div>
                        </div>

                        <div className="contact-method">
                            <i className="fas fa-clock"></i>
                            <div>
                                <h4>Horaires</h4>
                                <p>Lundi - Vendredi: 9h-18h</p>
                                <p>Samedi: 9h-12h</p>
                            </div>
                        </div>
                    </div>

                    <div className="social-links">
                        <h4>Suivez-nous sur les réseaux sociaux</h4>
                        <div className="social-icons">
                            <a href="https://www.facebook.com/profile.php?id=61578902663416&locale=fr_FR" className="social-icon" title="Facebook" target="_blank" rel="noopener">
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a href="https://wa.me/212645508349" className="social-icon" title="WhatsApp" target="_blank" rel="noopener">
                                <i className="fab fa-whatsapp"></i>
                            </a>
                            <a href="https://www.instagram.com/obaid.sr46/" className="social-icon" title="Instagram" target="_blank" rel="noopener">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="https://www.linkedin.com/in/obaid-ait-mattou-2b058130b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="social-icon" title="LinkedIn" target="_blank" rel="noopener">
                                <i className="fab fa-linkedin"></i>
                            </a>
                            <a href="https://github.com/Obaid-dev-rebelesto" className="social-icon" title="GitHub" target="_blank" rel="noopener">
                                <i className="fab fa-github"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Liens de navigation  */}
            <div className="form-footer">
                <p>
                    <a href="/">← Retour à l'accueil</a> | 
                    <a href="/about">En savoir plus sur AtlasForecast</a> | 
                    <a href="/login">Se connecter</a>
                </p>
            </div>
        </div>
    </>
  );
};

export default ContactPage;
