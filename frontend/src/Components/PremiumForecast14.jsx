import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import useForecast14, { searchCity } from './useForecast14';
import '../Styles/PremiumForecast14.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [.4,0,.2,1] } }),
};

function makeChartData(days, field, label, borderColor, bgFrom, bgTo) {
  return {
    labels: days.map(d => `${d.dayName} ${d.dayNum}`),
    datasets: [{
      label,
      data: days.map(d => d[field]),
      borderColor,
      backgroundColor: (ctx) => {
        if (!ctx.chart.chartArea) return bgFrom;
        const g = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom);
        g.addColorStop(0, bgFrom);
        g.addColorStop(1, bgTo);
        return g;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: borderColor,
      borderWidth: 2.5,
    }],
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e1b4b', titleColor: '#e2e8f0', bodyColor: '#cbd5e1', borderColor: 'rgba(99,102,241,.3)', borderWidth: 1, cornerRadius: 10, padding: 10 } },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 10, weight: 600 } }, grid: { color: 'rgba(255,255,255,.04)' } },
    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,.04)' } },
  },
};

// --- Sub-components ---

function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef(null);

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounce.current);
    if (v.length < 2) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      const r = await searchCity(v);
      setResults(r);
      setOpen(r.length > 0);
    }, 300);
  };

  return (
    <div className="pf14-search-wrap">
      <i className="fas fa-search pf14-search-icon" />
      <input className="pf14-search-input" value={query} onChange={handleInput} onBlur={() => setTimeout(() => setOpen(false), 200)} placeholder="Rechercher une ville..." />
      {open && (
        <motion.div className="pf14-suggestions" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          {results.map((r, i) => (
            <div key={i} className="pf14-suggestion-item" onMouseDown={() => { onSelect(r); setQuery(r.name); setOpen(false); }}>
              <i className="fas fa-map-marker-alt" style={{ color: '#6366f1' }} />
              <div>
                <div className="city-name">{r.name}</div>
                <div className="city-meta">{[r.admin, r.country].filter(Boolean).join(', ')}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function Timeline({ days, activeIdx, onSelect }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && activeIdx > 2) {
      const el = ref.current.children[activeIdx];
      if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeIdx]);

  return (
    <div className="pf14-timeline-wrap">
      <div className="pf14-timeline" ref={ref}>
        {days.map((d, i) => (
          <motion.div key={i} className={`pf14-tl-item ${i === activeIdx ? 'active' : ''}`}
            onClick={() => onSelect(i)} whileTap={{ scale: 0.95 }}>
            <span className="pf14-tl-day">{d.dayName}</span>
            <span className="pf14-tl-num">{d.dayNum}</span>
            <i className={`fas ${d.icon} pf14-tl-icon`} />
            <span className="pf14-tl-temp">{d.tempMax}°</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DayCard({ day, index, onClick }) {
  return (
    <motion.div className="pf14-day-card" variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index} onClick={onClick} layout>
      <div className="pf14-card-header">
        <div>
          <div className="pf14-card-date">{day.dayName}</div>
          <div className="pf14-card-datenum">{day.dayNum} {day.month}</div>
        </div>
        <i className={`fas ${day.icon} pf14-card-icon`} />
      </div>
      <div className="pf14-card-temps">
        <span className="pf14-card-tmax">{day.tempMax}°</span>
        <span className="pf14-card-tmin">{day.tempMin}°</span>
      </div>
      <div className="pf14-card-desc">{day.description}</div>
      <div className="pf14-card-metrics">
        <div className="pf14-metric"><i className="fas fa-tint" /><span className="pf14-metric-val">{day.precipProb}%</span> pluie</div>
        <div className="pf14-metric"><i className="fas fa-wind" /><span className="pf14-metric-val">{day.windMax}</span> km/h</div>
        <div className="pf14-metric"><i className="fas fa-droplet" /><span className="pf14-metric-val">{day.humidityMax}%</span> hum.</div>
        <div className="pf14-metric"><i className="fas fa-gauge-high" /><span className="pf14-metric-val">{Math.round(day.pressureMax)}</span> hPa</div>
      </div>
      <div className="pf14-card-expand"><i className="fas fa-expand" /> Détails</div>
    </motion.div>
  );
}

function DetailModal({ day, onClose }) {
  if (!day) return null;
  const sunriseTime = day.sunrise ? new Date(day.sunrise).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--';
  const sunsetTime = day.sunset ? new Date(day.sunset).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--';

  return (
    <motion.div className="pf14-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="pf14-modal" initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }} onClick={e => e.stopPropagation()}>
        <button className="pf14-modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        <div className="pf14-modal-hero">
          <div className="pf14-modal-hero-icon"><i className={`fas ${day.icon}`} /></div>
          <div className="pf14-modal-hero-temp">{day.tempMax}° / {day.tempMin}°</div>
          <div className="pf14-modal-hero-desc">{day.dayName} {day.dayNum} {day.month} — {day.description}</div>
        </div>
        <div className="pf14-modal-grid">
          <div className="pf14-modal-stat"><div className="pf14-modal-stat-icon"><i className="fas fa-tint" /></div><div className="pf14-modal-stat-val">{day.precipProb}%</div><div className="pf14-modal-stat-label">Prob. pluie</div></div>
          <div className="pf14-modal-stat"><div className="pf14-modal-stat-icon"><i className="fas fa-cloud-rain" /></div><div className="pf14-modal-stat-val">{day.precipSum.toFixed(1)} mm</div><div className="pf14-modal-stat-label">Précipitations</div></div>
          <div className="pf14-modal-stat"><div className="pf14-modal-stat-icon"><i className="fas fa-wind" /></div><div className="pf14-modal-stat-val">{day.windMax} km/h</div><div className="pf14-modal-stat-label">Vent max</div></div>
          <div className="pf14-modal-stat"><div className="pf14-modal-stat-icon"><i className="fas fa-droplet" /></div><div className="pf14-modal-stat-val">{day.humidityMin}–{day.humidityMax}%</div><div className="pf14-modal-stat-label">Humidité</div></div>
          <div className="pf14-modal-stat"><div className="pf14-modal-stat-icon"><i className="fas fa-gauge-high" /></div><div className="pf14-modal-stat-val">{Math.round(day.pressureMin)}–{Math.round(day.pressureMax)}</div><div className="pf14-modal-stat-label">Pression hPa</div></div>
          <div className="pf14-modal-stat"><div className="pf14-modal-stat-icon"><i className="fas fa-cloud" /></div><div className="pf14-modal-stat-val">{Math.round(day.cloudCover)}%</div><div className="pf14-modal-stat-label">Couverture nuageuse</div></div>
        </div>
        <div className="pf14-modal-sun">
          <div className="pf14-modal-sun-item"><i className="fas fa-sun" /> {sunriseTime}</div>
          <div className="pf14-modal-sun-item"><i className="fas fa-moon" /> {sunsetTime}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AISummary({ ai }) {
  if (!ai) return null;
  const confClass = ai.confidence >= 80 ? 'high' : ai.confidence >= 65 ? 'moderate' : 'low';
  const riskLabels = { low: 'Risque Faible', moderate: 'Risque Modéré', high: 'Risque Élevé' };

  return (
    <motion.div className="pf14-ai-panel" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
      <div className="pf14-ai-header">
        <div className="pf14-ai-title"><i className="fas fa-robot" /> Atlas AI Summary</div>
        <div className={`pf14-ai-confidence ${confClass}`}><i className="fas fa-chart-line" /> {ai.confidence}% confiance</div>
      </div>
      <div className={`pf14-ai-risk ${ai.riskLevel}`}><i className="fas fa-shield-alt" /> {riskLabels[ai.riskLevel] || 'Inconnu'}</div>
      <div className="pf14-ai-insights">
        {ai.insights.map((ins, i) => (
          <motion.div key={i} className="pf14-ai-insight" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <div className="pf14-ai-insight-icon" style={{ background: `${ins.color}18`, color: ins.color }}><i className={`fas ${ins.icon}`} /></div>
            <div className="pf14-ai-insight-text">{ins.text}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Charts({ days }) {
  const tempData = makeChartData(days, 'tempMax', 'Température °C', '#f59e0b', 'rgba(245,158,11,.25)', 'rgba(245,158,11,.02)');
  const precipData = makeChartData(days, 'precipSum', 'Précipitations mm', '#6366f1', 'rgba(99,102,241,.25)', 'rgba(99,102,241,.02)');
  const windData = makeChartData(days, 'windMax', 'Vent km/h', '#06b6d4', 'rgba(6,182,212,.25)', 'rgba(6,182,212,.02)');
  const humData = makeChartData(days, 'humidityMax', 'Humidité %', '#10b981', 'rgba(16,185,129,.25)', 'rgba(16,185,129,.02)');

  const charts = [
    { data: tempData, title: 'Température', icon: 'fa-temperature-high' },
    { data: precipData, title: 'Précipitations', icon: 'fa-cloud-rain' },
    { data: windData, title: 'Vitesse du vent', icon: 'fa-wind' },
    { data: humData, title: 'Humidité', icon: 'fa-droplet' },
  ];

  return (
    <div className="pf14-charts">
      {charts.map((c, i) => (
        <motion.div key={i} className="pf14-chart-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
          <div className="pf14-chart-title"><i className={`fas ${c.icon}`} /> {c.title}</div>
          <div className="pf14-chart-canvas"><Line data={c.data} options={chartOptions} /></div>
        </motion.div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="pf14-skeleton pf14-skel-timeline" />
      <div className="pf14-cards-grid">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="pf14-skeleton pf14-skel-card" />)}
      </div>
      <div className="pf14-charts">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="pf14-skeleton pf14-skel-chart" />)}
      </div>
    </div>
  );
}

// --- Main Component ---
export default function PremiumForecast14() {
  const [coords, setCoords] = useState({ lat: 33.5731, lon: -7.5898 });
  const [cityName, setCityName] = useState('Casablanca');
  const [activeDay, setActiveDay] = useState(0);
  const [modalDay, setModalDay] = useState(null);
  const { data, loading, error, refetch } = useForecast14(coords.lat, coords.lon);

  const handleCitySelect = useCallback((city) => {
    setCoords({ lat: city.lat, lon: city.lon });
    setCityName(city.name + (city.country ? `, ${city.country}` : ''));
    setActiveDay(0);
  }, []);

  return (
    <section className="pf14-module">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <SearchBar onSelect={handleCitySelect} />
      </motion.div>

      <div className="pf14-location">
        <motion.div className="pf14-location-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={cityName}>
          <i className="fas fa-map-marker-alt" /> {cityName}
        </motion.div>
      </div>

      {loading && <LoadingSkeleton />}
      {error && (
        <div className="pf14-error">
          <i className="fas fa-exclamation-triangle" />
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button className="pf14-error-btn" onClick={refetch}><i className="fas fa-redo" /> Réessayer</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <Timeline days={data.days} activeIdx={activeDay} onSelect={setActiveDay} />
          <div className="pf14-cards-grid">
            {data.days.map((d, i) => (
              <DayCard key={d.date} day={d} index={i} onClick={() => setModalDay(d)} />
            ))}
          </div>
          <Charts days={data.days} />
          <AISummary ai={data.ai} />
          <AnimatePresence>
            {modalDay && <DetailModal day={modalDay} onClose={() => setModalDay(null)} />}
          </AnimatePresence>
        </>
      )}
    </section>
  );
}
