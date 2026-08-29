import { useState, useEffect, useRef, useCallback } from 'react';

const CITIES = [
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lon: -6.8416 },
  { name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
  { name: 'Fès', lat: 34.0331, lon: -5.0003 },
  { name: 'Tanger', lat: 35.7595, lon: -5.8340 },
  { name: 'Agadir', lat: 30.4278, lon: -9.5981 },
  { name: 'Meknès', lat: 33.8935, lon: -5.5547 },
  { name: 'Oujda', lat: 34.6814, lon: -1.9086 },
  { name: 'Kénitra', lat: 34.2610, lon: -6.5802 },
  { name: 'Tétouan', lat: 35.5889, lon: -5.3626 },
  { name: 'Nador', lat: 35.1681, lon: -2.9335 },
  { name: 'Essaouira', lat: 31.5085, lon: -9.7595 },
  { name: 'Ouarzazate', lat: 30.9189, lon: -6.8936 },
  { name: 'Errachidia', lat: 31.9314, lon: -4.4288 },
  { name: 'Laâyoune', lat: 27.1536, lon: -13.2034 },
  { name: 'Dakhla', lat: 23.6848, lon: -15.9580 },
  { name: 'Beni Mellal', lat: 32.3394, lon: -6.3498 },
  { name: 'Taza', lat: 34.2133, lon: -4.0103 },
  { name: 'Safi', lat: 32.2994, lon: -9.2372 },
  { name: 'El Jadida', lat: 33.2316, lon: -8.5007 },
];

const ALERT_TYPES = {
  extremeHeat: { label: 'Chaleur Extrême', icon: 'fa-temperature-high', color: '#ef4444' },
  heatWave: { label: 'Vague de Chaleur', icon: 'fa-sun', color: '#f97316' },
  heavyRain: { label: 'Pluie Forte', icon: 'fa-cloud-showers-heavy', color: '#6366f1' },
  thunderstorm: { label: 'Orage Violent', icon: 'fa-bolt', color: '#a855f7' },
  strongWind: { label: 'Vents Forts', icon: 'fa-wind', color: '#06b6d4' },
  floodRisk: { label: 'Risque Inondation', icon: 'fa-water', color: '#3b82f6' },
  dustStorm: { label: 'Tempête de Sable', icon: 'fa-smog', color: '#d97706' },
  frost: { label: 'Gel / Givre', icon: 'fa-snowflake', color: '#67e8f9' },
  snow: { label: 'Chutes de Neige', icon: 'fa-snowflake', color: '#e0e7ff' },
  coastal: { label: 'Alerte Côtière', icon: 'fa-water', color: '#0ea5e9' },
  instability: { label: 'Instabilité Sévère', icon: 'fa-exclamation-triangle', color: '#fbbf24' },
};

function getSeverity(score) {
  if (score >= 90) return { level: 'extreme', label: 'Extrême', color: '#dc2626', glow: 'rgba(220,38,38,.4)' };
  if (score >= 70) return { level: 'red', label: 'Rouge', color: '#ef4444', glow: 'rgba(239,68,68,.35)' };
  if (score >= 50) return { level: 'orange', label: 'Orange', color: '#f97316', glow: 'rgba(249,115,22,.3)' };
  return { level: 'yellow', label: 'Jaune', color: '#eab308', glow: 'rgba(234,179,8,.25)' };
}

function analyzeCity(city, daily) {
  const alerts = [];
  const now = new Date();

  for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
    const tMax = daily.temperature_2m_max[i];
    const tMin = daily.temperature_2m_min[i];
    const precip = daily.precipitation_sum[i] || 0;
    const precipProb = daily.precipitation_probability_max?.[i] || 0;
    const wind = daily.windspeed_10m_max[i] || 0;
    const code = daily.weathercode[i];
    const date = daily.time[i];

    // Extreme Heat (>42°C)
    if (tMax >= 42) {
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'extremeHeat', score: Math.min(98, 80 + (tMax - 42) * 5), date, detail: `Température maximale de ${Math.round(tMax)}°C prévue`, tMax, tMin, precip, wind, code });
    }
    // Heat Wave (>32°C)
    else if (tMax >= 32) {
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'heatWave', score: Math.min(90, 40 + (tMax - 32) * 5), date, detail: `Pic de chaleur à ${Math.round(tMax)}°C attendu`, tMax, tMin, precip, wind, code });
    }

    // Heavy Rain (>5mm)
    if (precip >= 5) {
      const s = Math.min(95, 45 + precip * 2);
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'heavyRain', score: s, date, detail: `Cumul de ${precip.toFixed(1)} mm prévu`, tMax, tMin, precip, wind, code });
      if (precip >= 25) {
        alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'floodRisk', score: Math.min(96, s + 10), date, detail: `Risque d'inondation — cumul ${precip.toFixed(1)} mm`, tMax, tMin, precip, wind, code });
      }
    }

    // Thunderstorm (WMO 95-99)
    if (code >= 95) {
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'thunderstorm', score: code >= 96 ? 85 : 65, date, detail: `Orage${code >= 96 ? ' avec grêle' : ''} prévu`, tMax, tMin, precip, wind, code });
    }

    // Strong Wind (>40 km/h)
    if (wind >= 40) {
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'strongWind', score: Math.min(92, 45 + (wind - 40) * 2), date, detail: `Rafales jusqu'à ${Math.round(wind)} km/h`, tMax, tMin, precip, wind, code });
    }

    // Dust storm (hot + wind + dry)
    if (tMax >= 32 && wind >= 35 && precip < 1 && (code === 0 || code === 1)) {
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'dustStorm', score: 50 + Math.min(30, (wind - 35)), date, detail: `Conditions propices : ${Math.round(tMax)}°C, vent ${Math.round(wind)} km/h`, tMax, tMin, precip, wind, code });
    }

    // Frost
    if (tMin <= 0) {
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'frost', score: Math.min(80, 50 + Math.abs(tMin) * 8), date, detail: `Température minimale de ${Math.round(tMin)}°C`, tMax, tMin, precip, wind, code });
    }

    // Snow (WMO 71-77, 85-86)
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'snow', score: 60, date, detail: `Chutes de neige prévues`, tMax, tMin, precip, wind, code });
    }

    // Instability (big temp swing + precipitation)
    if (i > 0) {
      const prevMax = daily.temperature_2m_max[i - 1];
      if (Math.abs(tMax - prevMax) > 8 && precipProb > 60) {
        alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'instability', score: 55, date, detail: `Écart thermique de ${Math.abs(tMax - prevMax).toFixed(0)}°C, instabilité probable`, tMax, tMin, precip, wind, code });
      }
    }
  }

  // Coastal alerts for coastal cities
  const coastalCities = ['Casablanca', 'Rabat', 'Tanger', 'Agadir', 'Essaouira', 'El Jadida', 'Safi', 'Kénitra', 'Nador', 'Tétouan', 'Dakhla', 'Laâyoune'];
  if (coastalCities.includes(city.name)) {
    for (let i = 0; i < Math.min(daily.time.length, 3); i++) {
      const w = daily.windspeed_10m_max[i] || 0;
      if (w >= 35) {
        alerts.push({ city: city.name, lat: city.lat, lon: city.lon, type: 'coastal', score: Math.min(85, 45 + (w - 35)), date: daily.time[i], detail: `Vents côtiers de ${Math.round(w)} km/h — mer agitée`, tMax: daily.temperature_2m_max[i], tMin: daily.temperature_2m_min[i], precip: daily.precipitation_sum[i] || 0, wind: w, code: daily.weathercode[i] });
      }
    }
  }

  return alerts;
}

function generateAISummary(allAlerts) {
  if (!allAlerts.length) return { text: 'Aucune alerte significative détectée. Conditions météorologiques normales sur l\'ensemble du Maroc.', confidence: 95, risk: 'low' };

  const byType = {};
  allAlerts.forEach(a => { byType[a.type] = (byType[a.type] || 0) + 1; });
  const maxScore = Math.max(...allAlerts.map(a => a.score));
  const redAlerts = allAlerts.filter(a => a.score >= 70);
  const affectedCities = [...new Set(allAlerts.map(a => a.city))];

  const lines = [];
  if (byType.extremeHeat || byType.heatWave) {
    const heatCities = [...new Set(allAlerts.filter(a => a.type === 'extremeHeat' || a.type === 'heatWave').map(a => a.city))];
    lines.push(`Conditions de chaleur dangereuses détectées sur ${heatCities.slice(0, 4).join(', ')}${heatCities.length > 4 ? ` et ${heatCities.length - 4} autres villes` : ''}.`);
  }
  if (byType.heavyRain || byType.floodRisk) {
    const rainCities = [...new Set(allAlerts.filter(a => a.type === 'heavyRain' || a.type === 'floodRisk').map(a => a.city))];
    lines.push(`Précipitations intenses prévues sur ${rainCities.slice(0, 3).join(', ')}.`);
  }
  if (byType.thunderstorm) lines.push(`Activité orageuse significative à surveiller.`);
  if (byType.strongWind) lines.push(`Épisode venteux notable sur plusieurs régions.`);
  if (!lines.length) lines.push(`${allAlerts.length} alertes mineures détectées sur ${affectedCities.length} villes.`);

  return {
    text: lines.join(' '),
    confidence: maxScore >= 90 ? 92 : maxScore >= 70 ? 85 : 78,
    risk: maxScore >= 90 ? 'critical' : maxScore >= 70 ? 'high' : maxScore >= 50 ? 'moderate' : 'low',
    totalAlerts: allAlerts.length,
    redAlerts: redAlerts.length,
    affectedCities: affectedCities.length,
  };
}

const CACHE_KEY = 'af_weather_alerts';
const CACHE_TTL = 20 * 60 * 1000;

export { CITIES, ALERT_TYPES, getSeverity, generateAISummary };

export default function useWeatherAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);

  const fetchAlerts = useCallback(async () => {
    // Check cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setAlerts(cached.alerts);
        setProgress(100);
        setLoading(false);
        return;
      }
    } catch { }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null); setProgress(0);

    try {
      const allAlerts = [];
      // Fetch cities sequentially to avoid rate limiting
      for (let i = 0; i < CITIES.length; i++) {
        const city = CITIES[i];
        try {
          const params = new URLSearchParams({
            latitude: city.lat, longitude: city.lon,
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode',
            forecast_days: '7', timezone: 'auto',
          });
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: abortRef.current.signal });
          if (res.ok) {
            const data = await res.json();
            allAlerts.push(...analyzeCity(city, data.daily));
          }
        } catch { }
        setProgress(Math.round(((i + 1) / CITIES.length) * 100));
        // Delay between requests to respect rate limits
        if (i < CITIES.length - 1) await new Promise(r => setTimeout(r, 350));
      }

      // Sort by severity score descending
      allAlerts.sort((a, b) => b.score - a.score);
      setAlerts(allAlerts);
      setProgress(100);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ alerts: allAlerts, ts: Date.now() })); } catch { }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Erreur de chargement des alertes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchAlerts]);

  return { alerts, loading, error, progress, refetch: fetchAlerts };
}
