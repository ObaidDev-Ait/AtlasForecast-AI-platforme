import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useWeatherAlerts, { ALERT_TYPES, getSeverity, generateAISummary } from './useWeatherAlerts';
import '../Styles/AlertsPage.css';

const dayNamesFr = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const monthsFr = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
function fmtDate(d) { const dt = new Date(d); return `${dayNamesFr[dt.getDay()]} ${dt.getDate()} ${monthsFr[dt.getMonth()]}`; }

const FILTERS = [
  { key: 'all', label: 'Toutes', icon: 'fa-globe' },
  { key: 'extreme', label: 'Extrême', icon: 'fa-skull-crossbones' },
  { key: 'red', label: 'Rouge', icon: 'fa-circle-exclamation' },
  { key: 'orange', label: 'Orange', icon: 'fa-triangle-exclamation' },
  { key: 'yellow', label: 'Jaune', icon: 'fa-circle-info' },
];

function AlertCard({ alert, onClick }) {
  const info = ALERT_TYPES[alert.type] || { label: alert.type, icon: 'fa-exclamation', color: '#94a3b8' };
  const sev = getSeverity(alert.score);
  return (
    <motion.div className={`alert-card severity-${sev.level}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} onClick={() => onClick(alert)} whileHover={{ y: -4 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '20px 20px 0 0', background: `linear-gradient(90deg, ${sev.color}, ${sev.color}88)`, boxShadow: `0 0 16px ${sev.glow}` }} />
      <div className="alert-card-header">
        <div>
          <div className="alert-card-city">{alert.city}</div>
          <div className="alert-card-date">{fmtDate(alert.date)}</div>
        </div>
        <span className="alert-card-badge" style={{ background: `${sev.color}18`, color: sev.color, border: `1px solid ${sev.color}30` }}>{sev.label}</span>
      </div>
      <div className="alert-card-type">
        <div className="alert-card-type-icon" style={{ background: `${info.color}18`, color: info.color }}><i className={`fas ${info.icon}`} /></div>
        <div className="alert-card-type-name">{info.label}</div>
      </div>
      <div className="alert-card-detail">{alert.detail}</div>
      <div className="alert-card-footer">
        <div className="alert-card-score">
          <span style={{ color: sev.color }}>{Math.round(alert.score)}%</span>
          <div className="alert-card-score-bar"><div className="alert-card-score-fill" style={{ width: `${alert.score}%`, background: sev.color }} /></div>
        </div>
        <div className="alert-card-metrics">
          <span className="alert-card-metric"><i className="fas fa-temperature-high" /> {Math.round(alert.tMax)}°</span>
          <span className="alert-card-metric"><i className="fas fa-wind" /> {Math.round(alert.wind)} km/h</span>
        </div>
      </div>
    </motion.div>
  );
}

// City photo mapping with local URLs
const CITY_IMAGES = {
  'Casablanca': '/images/cities/casablanca.png',
  'Rabat': '/images/cities/rabat.png',
  'Marrakech': '/images/cities/marrakech.png',
  'Fès': '/images/cities/fes.png',
  'Tanger': '/images/cities/tangier.png',
  'Agadir': '/images/cities/agadir.png',
  'Meknès': '/images/cities/meknes.png',
  'Essaouira': '/images/cities/essaouira.png',
  'Ouarzazate': '/images/cities/ouarzazate.png',
  'Dakhla': '/images/cities/dakhla.png',
  'Oujda': '/images/cities/fes.png',
  'Kénitra': '/images/cities/rabat.png',
  'Tétouan': '/images/cities/tangier.png',
  'Nador': '/images/cities/fes.png',
  'Errachidia': '/images/cities/ouarzazate.png',
  'Laâyoune': '/images/cities/dakhla.png',
  'Beni Mellal': '/images/cities/marrakech.png',
  'Taza': '/images/cities/fes.png',
  'Safi': '/images/cities/essaouira.png',
  'El Jadida': '/images/cities/casablanca.png'
};
const defaultCityImg = '/images/cities/marrakech.png';

function getAlertRecommendations(type) {
  const recs = {
    extremeHeat: ['Évitez toute activité extérieure prolongée', 'Hydratez-vous régulièrement (min. 2L/jour)', 'Restez dans des lieux climatisés', 'Surveillez les personnes vulnérables'],
    heatWave: ['Limitez les efforts physiques aux heures fraîches', 'Portez des vêtements légers et clairs', 'Gardez votre logement frais', 'Buvez de l\'eau fréquemment'],
    heavyRain: ['Évitez les zones inondables', 'Ne traversez jamais une route inondée', 'Rangez les objets sensibles à l\'extérieur', 'Suivez les bulletins météo régulièrement'],
    thunderstorm: ['Restez à l\'intérieur pendant l\'orage', 'Débranchez les appareils électriques', 'Éloignez-vous des arbres et structures métalliques', 'Évitez les activités nautiques'],
    strongWind: ['Sécurisez les objets légers à l\'extérieur', 'Évitez les déplacements non essentiels', 'Attention aux chutes d\'arbres et débris', 'Roulez prudemment sur les ponts'],
    floodRisk: ['Préparez un kit d\'urgence', 'Montez les objets de valeur en hauteur', 'Ne vous engagez pas en véhicule dans l\'eau', 'Écoutez les consignes des autorités'],
    dustStorm: ['Fermez portes et fenêtres', 'Portez un masque en extérieur', 'Protégez vos yeux avec des lunettes', 'Limitez les déplacements'],
    frost: ['Protégez la plomberie du gel', 'Couvrez les plantes sensibles', 'Roulez prudemment (verglas)', 'Vérifiez votre chauffage'],
    snow: ['Équipez votre véhicule (pneus neige)', 'Évitez les déplacements inutiles', 'Dégagez les accès régulièrement', 'Attention aux surcharges sur les toits'],
    coastal: ['Éloignez-vous du littoral', 'Évitez les activités nautiques', 'Sécurisez les embarcations', 'Suivez les alertes de la marine'],
    instability: ['Restez attentif aux changements brusques', 'Ayez un plan en cas d\'urgence', 'Suivez les mises à jour météo', 'Préparez des vêtements adaptés'],
  };
  return recs[type] || recs.instability;
}

function getAlertExplanation(alert) {
  const info = ALERT_TYPES[alert.type];
  const explanations = {
    extremeHeat: `Les modèles météorologiques prévoient une température maximale de ${Math.round(alert.tMax)}°C à ${alert.city}. Ce niveau de chaleur extrême présente un danger immédiat pour la santé. Les vents de ${Math.round(alert.wind)} km/h n'apporteront pas de soulagement significatif. Indice de confiance : ${Math.round(alert.score)}%.`,
    heatWave: `Une vague de chaleur est attendue sur ${alert.city} avec des températures atteignant ${Math.round(alert.tMax)}°C. L'écart thermique jour/nuit (${Math.round(alert.tMax)}°/${Math.round(alert.tMin)}°) indique ${(alert.tMax - alert.tMin) < 8 ? 'peu de répit nocturne' : 'un léger rafraîchissement nocturne'}. Confiance : ${Math.round(alert.score)}%.`,
    heavyRain: `Des précipitations de ${alert.precip.toFixed(1)} mm sont prévues sur ${alert.city}. ${alert.precip >= 20 ? 'Ce cumul important peut provoquer des inondations localisées et des ruissellements.' : 'Des accumulations d\'eau sont possibles dans les zones basses.'} Confiance : ${Math.round(alert.score)}%.`,
    thunderstorm: `Des orages ${alert.code >= 96 ? 'violents avec risque de grêle' : 'significatifs'} sont prévus sur ${alert.city}. Associés à des vents de ${Math.round(alert.wind)} km/h et ${alert.precip.toFixed(1)} mm de précipitations. Confiance : ${Math.round(alert.score)}%.`,
    strongWind: `Des rafales de vent atteignant ${Math.round(alert.wind)} km/h sont prévues à ${alert.city}. ${alert.wind >= 70 ? 'Ces vents peuvent causer des dégâts matériels significatifs.' : 'Prudence recommandée pour les déplacements.'} Confiance : ${Math.round(alert.score)}%.`,
    floodRisk: `Le cumul de précipitations prévu (${alert.precip.toFixed(1)} mm) à ${alert.city} crée un risque d'inondation significatif. Les cours d'eau et les zones basses sont particulièrement vulnérables. Confiance : ${Math.round(alert.score)}%.`,
    dustStorm: `Les conditions à ${alert.city} (${Math.round(alert.tMax)}°C, vent ${Math.round(alert.wind)} km/h, air sec) sont propices à la formation de tempêtes de sable. Visibilité potentiellement réduite. Confiance : ${Math.round(alert.score)}%.`,
    frost: `Un épisode de gel est prévu à ${alert.city} avec une température minimale de ${Math.round(alert.tMin)}°C. ${alert.tMin <= -5 ? 'Gel sévère attendu — risques pour les cultures et la plomberie.' : 'Gel modéré — attention aux surfaces glissantes.'} Confiance : ${Math.round(alert.score)}%.`,
    snow: `Des chutes de neige sont attendues à ${alert.city} avec des températures entre ${Math.round(alert.tMin)}° et ${Math.round(alert.tMax)}°C. ${alert.precip.toFixed(1)} mm de précipitations associées. Confiance : ${Math.round(alert.score)}%.`,
    coastal: `Des vents côtiers de ${Math.round(alert.wind)} km/h sont prévus à ${alert.city}. La mer sera agitée avec des vagues potentiellement dangereuses. Navigation déconseillée. Confiance : ${Math.round(alert.score)}%.`,
    instability: `Une instabilité atmosphérique significative est détectée à ${alert.city} avec un écart thermique important et ${alert.precip.toFixed(1)} mm de précipitations. Changements brusques possibles. Confiance : ${Math.round(alert.score)}%.`,
  };
  return explanations[alert.type] || `Alerte météorologique détectée pour ${alert.city}. Confiance : ${Math.round(alert.score)}%.`;
}

function DetailModal({ alert, onClose }) {
  if (!alert) return null;
  const info = ALERT_TYPES[alert.type] || { label: alert.type, icon: 'fa-exclamation', color: '#94a3b8' };
  const sev = getSeverity(alert.score);
  const cityImg = CITY_IMAGES[alert.city] || defaultCityImg;
  const recs = getAlertRecommendations(alert.type);
  const explanation = getAlertExplanation(alert);

  return (
    <motion.div className="alert-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="alert-modal alert-modal-enhanced" initial={{ scale: .92, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .92, y: 40 }} onClick={e => e.stopPropagation()}>
        <button className="alert-modal-close" onClick={onClose}><i className="fas fa-times" /></button>

        {/* City Photo Hero */}
        <div className="alert-modal-photo-hero">
          <img src={cityImg} alt={alert.city} className="alert-modal-photo" />
          <div className="alert-modal-photo-overlay" />
          <div className="alert-modal-photo-content">
            <span className="alert-modal-sev-badge" style={{ background: `${sev.color}E6`, color: '#fff', border: `1px solid rgba(255,255,255,0.2)` }}>
              <i className="fas fa-exclamation-triangle" /> ALERTE {sev.label} — {Math.round(alert.score)}%
            </span>
            <div className="alert-modal-photo-city">{alert.city}</div>
            <div className="alert-modal-photo-meta">
              <span className="alert-modal-photo-type" style={{ color: info.color }}>
                <i className={`fas ${info.icon}`} /> {info.label}
              </span>
              <span className="alert-modal-photo-divider">•</span>
              <span className="alert-modal-photo-date">{fmtDate(alert.date)}</span>
            </div>
          </div>
        </div>

        {/* Alert Detail Description */}
        <div className="alert-modal-desc">{alert.detail}</div>

        {/* Weather Metrics Grid */}
        <div className="alert-modal-grid">
          <div className="alert-modal-stat"><div className="alert-modal-stat-icon" style={{ color: '#ef4444' }}><i className="fas fa-temperature-high" /></div><div className="alert-modal-stat-val">{Math.round(alert.tMax)}°C</div><div className="alert-modal-stat-label">Temp. Max</div></div>
          <div className="alert-modal-stat"><div className="alert-modal-stat-icon" style={{ color: '#3b82f6' }}><i className="fas fa-temperature-low" /></div><div className="alert-modal-stat-val">{Math.round(alert.tMin)}°C</div><div className="alert-modal-stat-label">Temp. Min</div></div>
          <div className="alert-modal-stat"><div className="alert-modal-stat-icon" style={{ color: '#06b6d4' }}><i className="fas fa-wind" /></div><div className="alert-modal-stat-val">{Math.round(alert.wind)} km/h</div><div className="alert-modal-stat-label">Vent Max</div></div>
          <div className="alert-modal-stat"><div className="alert-modal-stat-icon" style={{ color: '#6366f1' }}><i className="fas fa-cloud-rain" /></div><div className="alert-modal-stat-val">{alert.precip.toFixed(1)} mm</div><div className="alert-modal-stat-label">Précipitations</div></div>
          <div className="alert-modal-stat"><div className="alert-modal-stat-icon" style={{ color: '#f59e0b' }}><i className="fas fa-chart-line" /></div><div className="alert-modal-stat-val">{Math.round(alert.score)}%</div><div className="alert-modal-stat-label">Confiance</div></div>
          <div className="alert-modal-stat"><div className="alert-modal-stat-icon" style={{ color: sev.color }}><i className="fas fa-shield-alt" /></div><div className="alert-modal-stat-val" style={{ color: sev.color }}>{sev.label}</div><div className="alert-modal-stat-label">Sévérité</div></div>
        </div>

        {/* AI Explanation */}
        <div className="alert-modal-ai">
          <div className="alert-modal-ai-header"><i className="fas fa-robot" /> Analyse Atlas AI</div>
          <div className="alert-modal-ai-text">{explanation}</div>
        </div>

        {/* Recommendations */}
        <div className="alert-modal-recs">
          <div className="alert-modal-recs-header"><i className="fas fa-list-check" /> Recommandations</div>
          <div className="alert-modal-recs-list">
            {recs.map((r, i) => (
              <motion.div key={i} className="alert-modal-rec-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <i className="fas fa-check-circle" style={{ color: '#10b981', marginTop: '2px' }} />
                <span>{r}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AISummaryPanel({ alerts }) {
  const ai = useMemo(() => generateAISummary(alerts), [alerts]);
  const riskColors = { critical: '#f87171', high: '#fca5a5', moderate: '#fbbf24', low: '#34d399' };
  return (
    <motion.div className="alerts-ai" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="alerts-ai-header">
        <div className="alerts-ai-title"><i className="fas fa-robot" /> Atlas AI — Analyse des Alertes</div>
        <span className={`alerts-ai-risk ${ai.risk}`}><i className="fas fa-shield-alt" /> Risque {ai.risk === 'critical' ? 'Critique' : ai.risk === 'high' ? 'Élevé' : ai.risk === 'moderate' ? 'Modéré' : 'Faible'}</span>
      </div>
      <div className="alerts-ai-text">{ai.text}</div>
      <div className="alerts-ai-stats">
        <div className="alerts-ai-stat-item"><div className="alerts-ai-stat-num" style={{ color: '#f87171' }}>{ai.totalAlerts || 0}</div><div className="alerts-ai-stat-label">Alertes totales</div></div>
        <div className="alerts-ai-stat-item"><div className="alerts-ai-stat-num" style={{ color: '#ef4444' }}>{ai.redAlerts || 0}</div><div className="alerts-ai-stat-label">Alertes rouges</div></div>
        <div className="alerts-ai-stat-item"><div className="alerts-ai-stat-num" style={{ color: '#6366f1' }}>{ai.affectedCities || 0}</div><div className="alerts-ai-stat-label">Villes touchées</div></div>
        <div className="alerts-ai-stat-item"><div className="alerts-ai-stat-num" style={{ color: '#10b981' }}>{ai.confidence}%</div><div className="alerts-ai-stat-label">Confiance</div></div>
      </div>
    </motion.div>
  );
}

function LiveFeed({ alerts }) {
  const top = alerts.slice(0, 12);
  return (
    <div className="alerts-feed">
      <div className="alerts-feed-title"><i className="fas fa-satellite-dish" style={{ color: '#6366f1' }} /> Fil d'Alertes en Direct</div>
      <div className="alerts-feed-list">
        {top.map((a, i) => {
          const info = ALERT_TYPES[a.type] || { icon: 'fa-exclamation', color: '#94a3b8' };
          const sev = getSeverity(a.score);
          return (
            <motion.div key={i} className="alerts-feed-item" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
              <div className="alerts-feed-dot" style={{ background: sev.color }} />
              <i className={`fas ${info.icon}`} style={{ color: info.color, fontSize: '.85rem' }} />
              <span className="alerts-feed-text"><strong>{a.city}</strong> — {a.detail}</span>
              <span className="alerts-feed-time">{fmtDate(a.date)}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, loading, error, progress, refetch } = useWeatherAlerts();
  const [filter, setFilter] = useState('all');
  const [modalAlert, setModalAlert] = useState(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter(a => getSeverity(a.score).level === filter);
  }, [alerts, filter]);

  const stats = useMemo(() => {
    const extreme = alerts.filter(a => a.score >= 90).length;
    const red = alerts.filter(a => a.score >= 70 && a.score < 90).length;
    const orange = alerts.filter(a => a.score >= 50 && a.score < 70).length;
    const yellow = alerts.filter(a => a.score < 50).length;
    return { extreme, red, orange, yellow, total: alerts.length, cities: new Set(alerts.map(a => a.city)).size };
  }, [alerts]);

  return (
    <>
      {/* Dynamic Background when Modal is open */}
      <AnimatePresence>
        {modalAlert && (
          <motion.div
            className="alerts-dynamic-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ backgroundImage: `url(${CITY_IMAGES[modalAlert.city] || defaultCityImg})` }}
          />
        )}
      </AnimatePresence>

      <div className="container" style={{ paddingTop: '100px', paddingBottom: '40px', position: 'relative', zIndex: 1 }}>
        <div className="alerts-module">
          {/* Hero */}
          <motion.div className="alerts-hero" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="alerts-hero-title"><i className="fas fa-shield-alt" /> Centre d'Alertes Météo</h1>
            <p className="alerts-hero-sub">Surveillance automatique des conditions météorologiques sévères sur l'ensemble du territoire marocain.</p>
            <div className="alerts-live-badge"><div className="alerts-live-dot" /> SURVEILLANCE EN DIRECT — 20 VILLES</div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="alerts-progress-wrap">
              <div className="alerts-progress-text">Analyse des données météorologiques... {progress}%</div>
              <div className="alerts-progress-bar"><div className="alerts-progress-fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="pf14-error">
              <i className="fas fa-exclamation-triangle" />
              <h3>Erreur</h3><p>{error}</p>
              <button className="pf14-error-btn" onClick={refetch}><i className="fas fa-redo" /> Réessayer</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stats */}
              <motion.div className="alerts-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>
                <div className="alerts-stat"><span className="alerts-stat-num" style={{ color: '#dc2626' }}>{stats.extreme}</span><span className="alerts-stat-label">Extrêmes</span></div>
                <div className="alerts-stat"><span className="alerts-stat-num" style={{ color: '#ef4444' }}>{stats.red}</span><span className="alerts-stat-label">Rouges</span></div>
                <div className="alerts-stat"><span className="alerts-stat-num" style={{ color: '#f97316' }}>{stats.orange}</span><span className="alerts-stat-label">Oranges</span></div>
                <div className="alerts-stat"><span className="alerts-stat-num" style={{ color: '#eab308' }}>{stats.yellow}</span><span className="alerts-stat-label">Jaunes</span></div>
                <div className="alerts-stat"><span className="alerts-stat-num" style={{ color: '#6366f1' }}>{stats.cities}</span><span className="alerts-stat-label">Villes</span></div>
                <div className="alerts-stat"><span className="alerts-stat-num" style={{ color: '#e2e8f0' }}>{stats.total}</span><span className="alerts-stat-label">Total</span></div>
              </motion.div>

              {/* AI Summary */}
              <AISummaryPanel alerts={alerts} />

              {/* Filters */}
              <div className="alerts-filters">
                {FILTERS.map(f => (
                  <button key={f.key} className={`alerts-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                    <i className={`fas ${f.icon}`} style={{ marginRight: '.4rem' }} />{f.label} {f.key !== 'all' && `(${f.key === 'extreme' ? stats.extreme : f.key === 'red' ? stats.red : f.key === 'orange' ? stats.orange : stats.yellow})`}
                  </button>
                ))}
              </div>

              {/* Live Feed */}
              <LiveFeed alerts={alerts} />

              {/* Grid */}
              {filtered.length > 0 ? (
                <div className="alerts-grid">
                  {filtered.map((a, i) => <AlertCard key={`${a.city}-${a.type}-${a.date}-${i}`} alert={a} onClick={setModalAlert} />)}
                </div>
              ) : (
                <div className="alerts-empty">
                  <i className="fas fa-check-circle" />
                  <h3>Aucune alerte{filter !== 'all' ? ` de niveau ${FILTERS.find(f => f.key === filter)?.label}` : ''}</h3>
                  <p>Conditions météorologiques normales détectées.</p>
                </div>
              )}
          </>
        )}
      </div>
    </div>

    {/* Modal */}
    <AnimatePresence>
      {modalAlert && <DetailModal alert={modalAlert} onClose={() => setModalAlert(null)} />}
    </AnimatePresence>
    </>
  );
}
