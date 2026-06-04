import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import useForecast14, { searchCity } from './useForecast14';
import '../Styles/PremiumForecast14.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [.4,0,.2,1] } }),
};

function makeChart(days, field, label, color, bgA, bgB) {
  return {
    labels: days.map(d => `${d.dayName} ${d.dayNum}`),
    datasets: [{
      label, data: days.map(d => d[field]), borderColor: color,
      backgroundColor: ctx => {
        if (!ctx.chart.chartArea) return bgA;
        const g = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom);
        g.addColorStop(0, bgA); g.addColorStop(1, bgB); return g;
      },
      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: color, borderWidth: 2.5,
    }],
  };
}

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e1b4b', titleColor: '#e2e8f0', bodyColor: '#cbd5e1', borderColor: 'rgba(99,102,241,.3)', borderWidth: 1, cornerRadius: 10, padding: 10 } },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 10, weight: 600 } }, grid: { color: 'rgba(255,255,255,.04)' } },
    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,.04)' } },
  },
};

function DayCard7({ day, index, onClick }) {
  return (
    <motion.div className="pf14-day-card" variants={cardAnim} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index} onClick={onClick}>
      <div className="pf14-card-header">
        <div><div className="pf14-card-date">{day.dayName}</div><div className="pf14-card-datenum">{day.dayNum} {day.month}</div></div>
        <i className={`fas ${day.icon} pf14-card-icon`} />
      </div>
      <div className="pf14-card-temps"><span className="pf14-card-tmax">{day.tempMax}°</span><span className="pf14-card-tmin">{day.tempMin}°</span></div>
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

function DetailModal7({ day, onClose }) {
  if (!day) return null;
  const sr = day.sunrise ? new Date(day.sunrise).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--';
  const ss = day.sunset ? new Date(day.sunset).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--';
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
          <div className="pf14-modal-stat"><div className="pf14-modal-stat-icon"><i className="fas fa-cloud" /></div><div className="pf14-modal-stat-val">{Math.round(day.cloudCover)}%</div><div className="pf14-modal-stat-label">Nuages</div></div>
        </div>
        <div className="pf14-modal-sun">
          <div className="pf14-modal-sun-item"><i className="fas fa-sun" /> {sr}</div>
          <div className="pf14-modal-sun-item"><i className="fas fa-moon" /> {ss}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Forecast7Days({ lat, lon, cityName }) {
  const [modalDay, setModalDay] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const { data, loading, error, refetch } = useForecast14(lat || 33.5731, lon || -7.5898);

  // Slice to 7 days
  const days = data?.days?.slice(0, 7) || [];

  if (loading) {
    return (
      <div className="pf14-module">
        <div className="pf14-skeleton pf14-skel-timeline" />
        <div className="pf14-cards-grid">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="pf14-skeleton pf14-skel-card" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pf14-module">
        <div className="pf14-error">
          <i className="fas fa-exclamation-triangle" />
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button className="pf14-error-btn" onClick={refetch}><i className="fas fa-redo" /> Réessayer</button>
        </div>
      </div>
    );
  }

  if (!days.length) return null;

  const tempData = makeChart(days, 'tempMax', 'Température °C', '#f59e0b', 'rgba(245,158,11,.25)', 'rgba(245,158,11,.02)');
  const precipData = makeChart(days, 'precipSum', 'Précipitations mm', '#6366f1', 'rgba(99,102,241,.25)', 'rgba(99,102,241,.02)');

  return (
    <section className="pf14-module">
      {/* Timeline */}
      <div className="pf14-timeline-wrap">
        <div className="pf14-timeline">
          {days.map((d, i) => (
            <motion.div key={i} className={`pf14-tl-item ${i === activeDay ? 'active' : ''}`} onClick={() => setActiveDay(i)} whileTap={{ scale: 0.95 }}>
              <span className="pf14-tl-day">{d.dayName}</span>
              <span className="pf14-tl-num">{d.dayNum}</span>
              <i className={`fas ${d.icon} pf14-tl-icon`} />
              <span className="pf14-tl-temp">{d.tempMax}°</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="pf14-cards-grid">
        {days.map((d, i) => (
          <DayCard7 key={d.date} day={d} index={i} onClick={() => setModalDay(d)} />
        ))}
      </div>

      {/* Charts */}
      <div className="pf14-charts">
        <motion.div className="pf14-chart-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="pf14-chart-title"><i className="fas fa-temperature-high" /> Température 7 Jours</div>
          <div className="pf14-chart-canvas"><Line data={tempData} options={chartOpts} /></div>
        </motion.div>
        <motion.div className="pf14-chart-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <div className="pf14-chart-title"><i className="fas fa-cloud-rain" /> Précipitations 7 Jours</div>
          <div className="pf14-chart-canvas"><Line data={precipData} options={chartOpts} /></div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {modalDay && <DetailModal7 day={modalDay} onClose={() => setModalDay(null)} />}
      </AnimatePresence>
    </section>
  );
}
