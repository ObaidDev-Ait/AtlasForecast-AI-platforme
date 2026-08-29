import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SOCIAL_LINKS } from './helpers'
import '../Styles/Pages.css'

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
})

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const stats = [
    { num: '99.5%', label: 'Précision Certifiée', icon: 'fa-bullseye', color: 'var(--accent-primary)' },
    { num: '1 000+', label: 'Localités au Maroc', icon: 'fa-location-dot', color: 'var(--accent-cyan)' },
    { num: '15 min', label: 'Cycle d\'Actualisation', icon: 'fa-clock', color: '#fbbf24' },
    { num: '24/7', label: 'Surveillance IA Active', icon: 'fa-shield-halved', color: 'var(--accent-success)' },
  ]

  const pillars = [
    {
      icon: 'fa-satellite',
      title: 'Modélisation Numérique Avancée',
      desc: 'Agrégation continue des modèles ECMWF, GFS et ICON pour délivrer des prévisions probabilistes avec une résolution kilométrique.',
      badge: 'Multi-Modèles',
    },
    {
      icon: 'fa-radar',
      title: 'Radar & Imagerie Satellite HD',
      desc: 'Visualisation en direct de la couverture nuageuse, des fronts pluvieux et des tempêtes de sable sur l\'Afrique du Nord.',
      badge: 'Temps Réel',
    },
    {
      icon: 'fa-robot',
      title: 'Intelligence Artificielle Climat',
      desc: 'Assistant Copilot IA génératif entraîné pour fournir des recommandations d\'activités, de transport et d\'irrigation agricole.',
      badge: 'IA 2026',
    },
    {
      icon: 'fa-triangle-exclamation',
      title: 'Vigilance & Alertes Immédiates',
      desc: 'Système automatisé de détection des phénomènes extrêmes (vagues de chaleur, orages de montagne, chergui et neige).',
      badge: 'Sécurité Civile',
    },
  ]

  return (
    <div className="container">
      <div className="af-page" style={{ paddingTop: '1rem' }}>
        {/* ====================================================================
            HERO HEADER
            ==================================================================== */}
        <motion.div
          className="af-page-header"
          initial="hidden"
          animate="visible"
          variants={fadeUp(0)}
        >
          <div className="af-badge af-badge-primary" style={{ marginBottom: 'var(--sp-2)' }}>
            <i className="fas fa-mountain"></i> EXCELLENCE MÉTÉOROLOGIQUE MAROC
          </div>
          <h1 className="af-page-title">
            À Propos d'<span className="text-gradient">AtlasForecast</span>
          </h1>
          <p className="af-page-subtitle">
            Pionnier de l'intelligence climatique et de la prévision atmosphérique haute résolution au Maroc.
          </p>
        </motion.div>

        {/* ====================================================================
            KEY METRICS BAR
            ==================================================================== */}
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--sp-4)',
            marginBottom: 'var(--sp-10)',
          }}
          initial="hidden"
          animate="visible"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="af-card af-card-kpi"
              variants={fadeUp(i + 1)}
            >
              <div
                className="af-kpi-icon"
                style={{
                  background: 'var(--bg-glass-light)',
                  border: '1px solid var(--border-subtle)',
                  color: s.color,
                }}
              >
                <i className={`fas ${s.icon}`}></i>
              </div>
              <div>
                <span className="af-wm-label">{s.label}</span>
                <span className="af-wm-value" style={{ color: 'var(--text-primary)' }}>
                  {s.num}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ====================================================================
            MISSION & VISION SECTION
            ==================================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--sp-6)',
            marginBottom: 'var(--sp-10)',
          }}
        >
          <motion.div
            className="af-card"
            initial="hidden"
            animate="visible"
            variants={fadeUp(2)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--sp-4)' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  fontSize: '1.25rem',
                }}
              >
                <i className="fas fa-compass"></i>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Notre Mission</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              AtlasForecast a été conçu pour démocratiser l'accès aux prévisions météorologiques de haute précision au Maroc.
              En unissant les algorithmes de pointe, l'imagerie satellite et l'expertise climatique locale, nous permettons aux citoyens,
              voyageurs et professionnels de planifier leurs journées et activités en toute confiance.
            </p>
          </motion.div>

          <motion.div
            className="af-card"
            initial="hidden"
            animate="visible"
            variants={fadeUp(3)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--sp-4)' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-success)',
                  fontSize: '1.25rem',
                }}
              >
                <i className="fas fa-eye"></i>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Notre Vision</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              Bâtir la plateforme de référence en intelligence météorologique pour l'Afrique du Nord.
              Nous innovons continuellement pour intégrer des modèles micro-climatiques adaptés aux reliefs marocains — des sommets enneigés
              du Haut Atlas aux plaines côtières atlantiques et aux oasis sahariennes.
            </p>
          </motion.div>
        </div>

        {/* ====================================================================
            PILLARS OF EXCELLENCE (4 CARDS ORDERED GRID)
            ==================================================================== */}
        <div style={{ marginBottom: 'var(--sp-10)' }}>
          <div className="af-section-header" style={{ marginBottom: 'var(--sp-6)' }}>
            <span className="af-section-tag">PILIERS D'EXCELLENCE</span>
            <h2 className="af-section-title">Ce Qui Fait Notre Force</h2>
            <p className="af-section-desc">
              Une infrastructure robuste et certifiée alliant données météorologiques officielles et intelligence artificielle.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--sp-5)',
            }}
          >
            {pillars.map((p, idx) => (
              <motion.div
                key={p.title}
                className="af-card"
                initial="hidden"
                animate="visible"
                variants={fadeUp(idx + 1)}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-hover)',
                      fontSize: '1.3rem',
                    }}
                  >
                    <i className={`fas ${p.icon}`}></i>
                  </div>
                  <span className="af-badge af-badge-primary">{p.badge}</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
                  {p.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.65, margin: 0, flex: 1 }}>
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ====================================================================
            TECHNOLOGY & DATA STACK
            ==================================================================== */}
        <motion.div
          className="af-card"
          initial="hidden"
          animate="visible"
          variants={fadeUp(4)}
          style={{ marginBottom: 'var(--sp-10)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--sp-5)' }}>
            <i className="fas fa-server" style={{ fontSize: '1.4rem', color: 'var(--accent-primary)' }}></i>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Architecture & Sources de Données</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--sp-5)',
            }}
          >
            <div
              style={{
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--sp-5)',
              }}
            >
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-database" style={{ color: 'var(--accent-primary)' }}></i> Sources Numériques
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>OpenWeather Engine :</strong> Données météorologiques certifiées mondiales
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Modèles d'Ensemble :</strong> Prévisions multi-sources (ECMWF, GFS)
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Radar Doppler :</strong> Détection des précipitations et des tempêtes
                </li>
              </ul>
            </div>

            <div
              style={{
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--sp-5)',
              }}
            >
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-code" style={{ color: 'var(--accent-cyan)' }}></i> Technologies Modernes
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>NestJS Backend :</strong> API modulaire, sécurité RBAC et passerelle temps réel
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>React & Vite :</strong> Interface utilisateur réactive avec transition fluide
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Paddle Sandbox / Production :</strong> Système de facturation SaaS sécurisé
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ====================================================================
            CREATOR / LEAD ARCHITECT CARD
            ==================================================================== */}
        <motion.div
          className="af-card"
          initial="hidden"
          animate="visible"
          variants={fadeUp(5)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-6)',
            flexWrap: 'wrap',
            marginBottom: 'var(--sp-10)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '2rem',
              fontWeight: 900,
              flexShrink: 0,
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            O
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                Obaid Ait Mattou
              </h3>
              <span className="af-badge af-badge-primary">Fondateur & Développeur Principal</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '0.4rem 0 0', lineHeight: 1.6 }}>
              Étudiant en ingénierie logicielle à l'Université Privée de Marrakech (UPM). Passionné par l'intelligence artificielle,
              les architectures cloud et l'analyse de données appliquées à la météorologie nationale.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(SOCIAL_LINKS).map(([k, u]) => (
              <a
                key={k}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                aria-label={k}
                style={{ padding: '0.45rem 0.75rem' }}
              >
                <i className={`fab fa-${k}`}></i>
              </a>
            ))}
          </div>
        </motion.div>

        {/* ====================================================================
            CALL TO ACTION
            ==================================================================== */}
        <motion.div
          className="af-card"
          initial="hidden"
          animate="visible"
          variants={fadeUp(6)}
          style={{
            textAlign: 'center',
            padding: 'clamp(2rem, 1.5rem + 2vw, 3.5rem)',
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.12), transparent 70%), var(--bg-glass)',
          }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 'var(--sp-2)' }}>
            Prêt à Explorer le Climat Marocain ?
          </h2>
          <p style={{ maxWidth: '520px', margin: '0 auto var(--sp-6)', color: 'var(--text-secondary)' }}>
            Consultez les prévisions en direct ou découvrez les fonctionnalités avancées d'AtlasForecast Premium.
          </p>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/weather" className="btn btn-primary btn-large">
              <i className="fas fa-cloud-sun"></i> Consulter la Météo
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-large">
              <i className="fas fa-envelope"></i> Nous Contacter
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
