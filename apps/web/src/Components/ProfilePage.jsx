import React, { useEffect } from 'react';

const ProfilePage = () => {
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
            {/*  En-tête du profil  */}
            <div className="profile-header">
                <div className="profile-avatar">
                    <div className="avatar-container">
                        <div className="fallback-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', color: 'white', fontSize: '60px' }}>
                            <i className="fas fa-user-circle"></i>
                        </div>
                        <div className="status-badge online">
                            <i className="fas fa-circle"></i>
                        </div>
                    </div>
                </div>
                
                <div className="profile-info">
                    <h1>Obaid Ait Mattou</h1>
                    <p className="profile-title">Développeur Full Stack</p>
                    <div className="profile-stats">
                        <div className="stat-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>24 ans</span>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-graduation-cap"></i>
                            <span>3ème année</span>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-university"></i>
                            <span>Université Privée Marrakech</span>
                        </div>
                    </div>
                </div>
                
                <div className="profile-actions">
                    <button className="btn btn-primary">
                        <i className="fas fa-edit"></i>
                        Modifier le Profil
                    </button>
                    <button className="btn btn-outline">
                        <i className="fas fa-share"></i>
                        Partager
                    </button>
                </div>
            </div>

            {/*  Navigation du profil  */}
            <div className="profile-nav">
                <a href="#informations" className="nav-item active">
                    <i className="fas fa-user"></i>
                    <span>Informations</span>
                </a>
                <a href="#competences" className="nav-item">
                    <i className="fas fa-code"></i>
                    <span>Compétences</span>
                </a>
                <a href="#projets" className="nav-item">
                    <i className="fas fa-project-diagram"></i>
                    <span>Projets</span>
                </a>
                <a href="#experience" className="nav-item">
                    <i className="fas fa-briefcase"></i>
                    <span>Expérience</span>
                </a>
                <a href="#formation" className="nav-item">
                    <i className="fas fa-graduation-cap"></i>
                    <span>Formation</span>
                </a>
                <a href="#contact" className="nav-item">
                    <i className="fas fa-envelope"></i>
                    <span>Contact</span>
                </a>
            </div>

            {/*  Section Informations Personnelles  */}
            <section id="informations" className="profile-section">
                <h2><i className="fas fa-user"></i> Informations Personnelles</h2>
                <div className="section-content">
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">
                                <i className="fas fa-id-card"></i>
                            </div>
                            <div className="info-content">
                                <h3>Identité</h3>
                                <div className="info-details">
                                    <div className="detail-item">
                                        <span className="label">Nom complet :</span>
                                        <span className="value">Obaid Ait Mattou</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Âge :</span>
                                        <span className="value">24 ans</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Nationalité :</span>
                                        <span className="value">Marocaine</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Ville :</span>
                                        <span className="value">Marrakech</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="info-card">
                            <div className="info-icon">
                                <i className="fas fa-graduation-cap"></i>
                            </div>
                            <div className="info-content">
                                <h3>Formation</h3>
                                <div className="info-details">
                                    <div className="detail-item">
                                        <span className="label">Niveau :</span>
                                        <span className="value">3ème année</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Spécialité :</span>
                                        <span className="value">Développeur Logiciel</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Établissement :</span>
                                        <span className="value">Université Privée Marrakech</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Domaine :</span>
                                        <span className="value">Full Stack Development</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="info-card">
                            <div className="info-icon">
                                <i className="fas fa-code"></i>
                            </div>
                            <div className="info-content">
                                <h3>Compétences Techniques</h3>
                                <div className="info-details">
                                    <div className="detail-item">
                                        <span className="label">Frontend :</span>
                                        <span className="value">HTML, CSS, JavaScript</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Backend :</span>
                                        <span className="value">Node.js, PHP, Python</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Base de données :</span>
                                        <span className="value">MySQL, MongoDB</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Outils :</span>
                                        <span className="value">Git, VS Code, Docker</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Compétences  */}
            <section id="competences" className="profile-section">
                <h2><i className="fas fa-code"></i> Compétences Techniques</h2>
                <div className="section-content">
                    <div className="skills-categories">
                        <div className="skill-category">
                            <h3>Développement Frontend</h3>
                            <div className="skills-grid">
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-html5"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>HTML5</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="95"></div>
                                            <span>95%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-css3-alt"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>CSS3</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="90"></div>
                                            <span>90%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-js-square"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>JavaScript</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="85"></div>
                                            <span>85%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-react"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>React.js</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="80"></div>
                                            <span>80%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="skill-category">
                            <h3>Développement Backend</h3>
                            <div className="skills-grid">
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-node-js"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>Node.js</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="85"></div>
                                            <span>85%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-php"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>PHP</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="80"></div>
                                            <span>80%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-python"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>Python</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="75"></div>
                                            <span>75%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fas fa-database"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>MySQL</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="85"></div>
                                            <span>85%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="skill-category">
                            <h3>Outils et Technologies</h3>
                            <div className="skills-grid">
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-git-alt"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>Git</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="90"></div>
                                            <span>90%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-docker"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>Docker</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="70"></div>
                                            <span>70%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-aws"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>AWS</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="65"></div>
                                            <span>65%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="skill-item">
                                    <div className="skill-icon">
                                        <i className="fab fa-linux"></i>
                                    </div>
                                    <div className="skill-info">
                                        <h4>Linux</h4>
                                        <div className="skill-level">
                                            <div className="skill-bar" data-level="80"></div>
                                            <span>80%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Projets  */}
            <section id="projets" className="profile-section">
                <h2><i className="fas fa-project-diagram"></i> Projets Réalisés</h2>
                <div className="section-content">
                    <div className="projects-grid">
                        <div className="project-card">
                            <div className="project-header">
                                <div className="project-icon">
                                    <i className="fas fa-mountain"></i>
                                </div>
                                <div className="project-badge">En cours</div>
                            </div>
                            <div className="project-content">
                                <h3>AtlasForecast</h3>
                                <p>Application météo professionnelle avec prévisions avancées, API intégrées et interface moderne</p>
                                <div className="project-tech">
                                    <span className="tech-tag">HTML/CSS</span>
                                    <span className="tech-tag">JavaScript</span>
                                    <span className="tech-tag">API Météo</span>
                                </div>
                                <div className="project-links">
                                    <a href="#" className="project-link">
                                        <i className="fas fa-external-link-alt"></i>
                                        Voir le projet
                                    </a>
                                    <a href="#" className="project-link">
                                        <i className="fab fa-github"></i>
                                        Code source
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="project-card">
                            <div className="project-header">
                                <div className="project-icon">
                                    <i className="fas fa-shopping-cart"></i>
                                </div>
                                <div className="project-badge">Terminé</div>
                            </div>
                            <div className="project-content">
                                <h3>E-Commerce Platform</h3>
                                <p>Plateforme de commerce en ligne complète avec gestion des produits, panier et paiements</p>
                                <div className="project-tech">
                                    <span className="tech-tag">React.js</span>
                                    <span className="tech-tag">Node.js</span>
                                    <span className="tech-tag">MongoDB</span>
                                </div>
                                <div className="project-links">
                                    <a href="#" className="project-link">
                                        <i className="fas fa-external-link-alt"></i>
                                        Voir le projet
                                    </a>
                                    <a href="#" className="project-link">
                                        <i className="fab fa-github"></i>
                                        Code source
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="project-card">
                            <div className="project-header">
                                <div className="project-icon">
                                    <i className="fas fa-tasks"></i>
                                </div>
                                <div className="project-badge">Terminé</div>
                            </div>
                            <div className="project-content">
                                <h3>Task Manager</h3>
                                <p>Application de gestion des tâches avec authentification, CRUD et interface responsive</p>
                                <div className="project-tech">
                                    <span className="tech-tag">PHP</span>
                                    <span className="tech-tag">MySQL</span>
                                    <span className="tech-tag">Bootstrap</span>
                                </div>
                                <div className="project-links">
                                    <a href="#" className="project-link">
                                        <i className="fas fa-external-link-alt"></i>
                                        Voir le projet
                                    </a>
                                    <a href="#" className="project-link">
                                        <i className="fab fa-github"></i>
                                        Code source
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Expérience  */}
            <section id="experience" className="profile-section">
                <h2><i className="fas fa-briefcase"></i> Expérience Professionnelle</h2>
                <div className="section-content">
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <h3>Développeur Full Stack Stagiaire</h3>
                                    <span className="timeline-date">Juin 2025 - Août 2025</span>
                                </div>
                                <div className="timeline-company">
                                    <i className="fas fa-building"></i>
                                    <span>Tech Solutions Marrakech</span>
                                </div>
                                <p>Développement d'applications web avec React.js et Node.js. Gestion de bases de données et intégration d'APIs.</p>
                                <div className="timeline-skills">
                                    <span className="skill-tag">React.js</span>
                                    <span className="skill-tag">Node.js</span>
                                    <span className="skill-tag">MongoDB</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="timeline-item">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <h3>Développeur Frontend Freelance</h3>
                                    <span className="timeline-date">Janvier 2025 - Mai 2025</span>
                                </div>
                                <div className="timeline-company">
                                    <i className="fas fa-laptop-code"></i>
                                    <span>Freelance</span>
                                </div>
                                <p>Création de sites web responsifs et d'interfaces utilisateur modernes pour divers clients.</p>
                                <div className="timeline-skills">
                                    <span className="skill-tag">HTML/CSS</span>
                                    <span className="skill-tag">JavaScript</span>
                                    <span className="skill-tag">Bootstrap</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="timeline-item">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <h3>Projet Académique - AtlasForecast</h3>
                                    <span className="timeline-date">Avril 2025 - Présent</span>
                                </div>
                                <div className="timeline-company">
                                    <i className="fas fa-university"></i>
                                    <span>Université Privée Marrakech</span>
                                </div>
                                <p>Développement d'une application météo professionnelle comme projet de fin d'études.</p>
                                <div className="timeline-skills">
                                    <span className="skill-tag">Full Stack</span>
                                    <span className="skill-tag">API Integration</span>
                                    <span className="skill-tag">UI/UX Design</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Formation  */}
            <section id="formation" className="profile-section">
                <h2><i className="fas fa-graduation-cap"></i> Formation et Éducation</h2>
                <div className="section-content">
                    <div className="education-timeline">
                        <div className="education-item">
                            <div className="education-icon">
                                <i className="fas fa-university"></i>
                            </div>
                            <div className="education-content">
                                <h3>Licence en Développement Logiciel</h3>
                                <div className="education-details">
                                    <span className="institution">Université Privée Marrakech</span>
                                    <span className="period">2023 - 2026</span>
                                    <span className="level">3ème année en cours</span>
                                </div>
                                <p>Formation complète en développement logiciel avec spécialisation en développement web full stack.</p>
                                <div className="education-subjects">
                                    <h4>Matières principales :</h4>
                                    <ul>
                                        <li>Programmation orientée objet</li>
                                        <li>Développement web avancé</li>
                                        <li>Bases de données</li>
                                        <li>Architecture logicielle</li>
                                        <li>Gestion de projet</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div className="education-item">
                            <div className="education-icon">
                                <i className="fas fa-certificate"></i>
                            </div>
                            <div className="education-content">
                                <h3>Certifications Professionnelles</h3>
                                <div className="certifications-grid">
                                    <div className="certification">
                                        <i className="fab fa-aws"></i>
                                        <span>AWS Cloud Practitioner</span>
                                    </div>
                                    <div className="certification">
                                        <i className="fab fa-microsoft"></i>
                                        <span>Microsoft Azure Fundamentals</span>
                                    </div>
                                    <div className="certification">
                                        <i className="fab fa-google"></i>
                                        <span>Google Cloud Platform</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Section Contact  */}
            <section id="contact" className="profile-section">
                <h2><i className="fas fa-envelope"></i> Contact et Réseaux</h2>
                <div className="section-content">
                    <div className="contact-grid">
                        <div className="contact-card">
                            <div className="contact-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className="contact-content">
                                <h3>Email</h3>
                                <p><a href="mailto:obaid.aitmattou@email.com">obaidaitmattou204@gmail.com</a></p>
                                <span>Réponse sous 24h</span>
                            </div>
                        </div>
                        
                        <div className="contact-card">
                            <div className="contact-icon">
                                <i className="fas fa-phone"></i>
                            </div>
                            <div className="contact-content">
                                <h3>Téléphone</h3>
                                <p><a href="tel:+212645508349">+212 645-508349</a></p>
                                <span>Disponible 9h-18h</span>
                            </div>
                        </div>
                        
                        <div className="contact-card">
                            <div className="contact-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div className="contact-content">
                                <h3>Localisation</h3>
                                <p>Marrakech, Maroc</p>
                                <span>Disponible pour télétravail</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="social-networks">
                        <h3>Réseaux Professionnels</h3>
                        <div className="social-grid">
                            <a href="https://www.linkedin.com/in/obaid-ait-mattou-2b058130b" target="_blank" rel="noopener" className="social-link linkedin">
                                <i className="fab fa-linkedin"></i>
                                <span>LinkedIn</span>
                            </a>
                            
                            <a href="https://github.com/Obaid-dev-rebelesto" target="_blank" rel="noopener" className="social-link github">
                                <i className="fab fa-github"></i>
                                <span>GitHub</span>
                            </a>
                            
                            <a href="https://www.facebook.com/profile.php?id=61578902663416" target="_blank" rel="noopener" className="social-link facebook">
                                <i className="fab fa-facebook"></i>
                                <span>Facebook</span>
                            </a>
                            
                            <a href="https://www.instagram.com/obaid.sr46/" target="_blank" rel="noopener" className="social-link instagram">
                                <i className="fab fa-instagram"></i>
                                <span>Instagram</span>
                            </a>
                            
                            <a href="https://wa.me/212645508349" target="_blank" rel="noopener" className="social-link whatsapp">
                                <i className="fab fa-whatsapp"></i>
                                <span>WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </>
  );
};

export default ProfilePage;
