import { useState, useEffect, useRef, useCallback } from 'react';

const CACHE_KEY = 'af_forecast14';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_RETRIES = 3;

// Weather code → description + icon mapping (WMO standard)
const WMO_CODES = {
  0: { desc: 'Ciel dégagé', icon: 'fa-sun', severity: 0 },
  1: { desc: 'Principalement dégagé', icon: 'fa-sun', severity: 0 },
  2: { desc: 'Partiellement nuageux', icon: 'fa-cloud-sun', severity: 0 },
  3: { desc: 'Couvert', icon: 'fa-cloud', severity: 1 },
  45: { desc: 'Brouillard', icon: 'fa-smog', severity: 1 },
  48: { desc: 'Brouillard givrant', icon: 'fa-smog', severity: 2 },
  51: { desc: 'Bruine légère', icon: 'fa-cloud-rain', severity: 1 },
  53: { desc: 'Bruine modérée', icon: 'fa-cloud-rain', severity: 1 },
  55: { desc: 'Bruine dense', icon: 'fa-cloud-showers-heavy', severity: 2 },
  61: { desc: 'Pluie légère', icon: 'fa-cloud-rain', severity: 1 },
  63: { desc: 'Pluie modérée', icon: 'fa-cloud-showers-heavy', severity: 2 },
  65: { desc: 'Pluie forte', icon: 'fa-cloud-showers-heavy', severity: 3 },
  71: { desc: 'Neige légère', icon: 'fa-snowflake', severity: 2 },
  73: { desc: 'Neige modérée', icon: 'fa-snowflake', severity: 2 },
  75: { desc: 'Neige forte', icon: 'fa-snowflake', severity: 3 },
  77: { desc: 'Grains de neige', icon: 'fa-snowflake', severity: 2 },
  80: { desc: 'Averses légères', icon: 'fa-cloud-sun-rain', severity: 1 },
  81: { desc: 'Averses modérées', icon: 'fa-cloud-showers-heavy', severity: 2 },
  82: { desc: 'Averses violentes', icon: 'fa-cloud-showers-heavy', severity: 3 },
  85: { desc: 'Averses de neige légères', icon: 'fa-snowflake', severity: 2 },
  86: { desc: 'Averses de neige fortes', icon: 'fa-snowflake', severity: 3 },
  95: { desc: 'Orage', icon: 'fa-bolt', severity: 3 },
  96: { desc: 'Orage avec grêle légère', icon: 'fa-bolt', severity: 4 },
  99: { desc: 'Orage avec forte grêle', icon: 'fa-bolt', severity: 4 },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: 'Inconnu', icon: 'fa-question', severity: 0 };
}

// Geocoding search
export async function searchCity(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=fr&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(r => ({
      name: r.name,
      country: r.country || '',
      admin: r.admin1 || '',
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch { return []; }
}

// Generate AI insights from forecast data
function generateAIInsights(days) {
  if (!days || days.length < 7) return null;

  const insights = [];
  let confidence = 85;
  let riskLevel = 'low';

  // Temperature trend analysis
  const temps = days.map(d => (d.tempMax + d.tempMin) / 2);
  const firstWeekAvg = temps.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const secondWeekAvg = temps.slice(7).reduce((a, b) => a + b, 0) / Math.max(1, temps.slice(7).length);
  const tempDiff = secondWeekAvg - firstWeekAvg;

  if (tempDiff > 4) {
    insights.push({ type: 'heat', text: `Anomalie de chaleur détectée : hausse de +${tempDiff.toFixed(1)}°C attendue en seconde semaine.`, icon: 'fa-temperature-high', color: '#ef4444' });
    riskLevel = 'moderate';
  } else if (tempDiff < -4) {
    insights.push({ type: 'cold', text: `Refroidissement significatif prévu : baisse de ${tempDiff.toFixed(1)}°C en seconde semaine.`, icon: 'fa-temperature-low', color: '#3b82f6' });
    riskLevel = 'moderate';
  } else {
    insights.push({ type: 'stable', text: `Températures stables sur la période, écart moyen de ${Math.abs(tempDiff).toFixed(1)}°C entre les deux semaines.`, icon: 'fa-thermometer-half', color: '#10b981' });
  }

  // Precipitation analysis
  const totalPrecip = days.reduce((s, d) => s + d.precipSum, 0);
  const rainyDays = days.filter(d => d.precipProb > 50).length;
  const heavyRainDays = days.filter(d => d.precipSum > 10).length;

  if (heavyRainDays >= 2) {
    insights.push({ type: 'rain', text: `${heavyRainDays} jours de précipitations intenses prévus. Cumul total : ${totalPrecip.toFixed(1)} mm.`, icon: 'fa-cloud-showers-heavy', color: '#6366f1' });
    riskLevel = 'high';
    confidence -= 5;
  } else if (rainyDays >= 5) {
    insights.push({ type: 'rain', text: `Période humide : ${rainyDays} jours avec probabilité de pluie >50%. Cumul : ${totalPrecip.toFixed(1)} mm.`, icon: 'fa-cloud-rain', color: '#8b5cf6' });
    riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
  } else {
    insights.push({ type: 'dry', text: `Période sèche prédominante avec seulement ${rainyDays} jour(s) de pluie probable.`, icon: 'fa-sun', color: '#f59e0b' });
  }

  // Storm risk
  const stormDays = days.filter(d => d.severity >= 3);
  if (stormDays.length > 0) {
    const stormDates = stormDays.map(d => d.dayName).join(', ');
    insights.push({ type: 'storm', text: `Risque orageux détecté : ${stormDates}. Vigilance recommandée.`, icon: 'fa-bolt', color: '#ef4444' });
    riskLevel = 'high';
    confidence -= 8;
  }

  // Wind analysis
  const maxWind = Math.max(...days.map(d => d.windMax));
  if (maxWind > 50) {
    insights.push({ type: 'wind', text: `Vents forts attendus jusqu'à ${Math.round(maxWind)} km/h. Sécurisez les objets en extérieur.`, icon: 'fa-wind', color: '#06b6d4' });
    riskLevel = 'high';
  }

  // Unstable period detection
  const unstablePeriods = [];
  for (let i = 1; i < days.length; i++) {
    const tempSwing = Math.abs(days[i].tempMax - days[i - 1].tempMax);
    if (tempSwing > 6 || (days[i].severity >= 2 && days[i - 1].severity <= 1)) {
      unstablePeriods.push(days[i].dayName);
    }
  }
  if (unstablePeriods.length >= 2) {
    insights.push({ type: 'unstable', text: `Instabilité atmosphérique probable : ${unstablePeriods.slice(0, 3).join(', ')}. Changements brusques possibles.`, icon: 'fa-exclamation-triangle', color: '#f97316' });
    confidence -= 5;
  }

  // Model confidence decreases over time
  confidence = Math.max(60, Math.min(95, confidence - Math.floor(days.length / 3)));

  return { insights, confidence, riskLevel };
}

// Normalize Open-Meteo daily data
function normalizeData(raw) {
  const daily = raw.daily;
  const days = [];
  const dayNamesFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNamesFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  for (let i = 0; i < daily.time.length && i < 14; i++) {
    const date = new Date(daily.time[i]);
    const info = getWeatherInfo(daily.weathercode[i]);
    days.push({
      date: daily.time[i],
      dayName: dayNamesFr[date.getDay()],
      dayNum: date.getDate(),
      month: monthNamesFr[date.getMonth()],
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      precipSum: daily.precipitation_sum[i] || 0,
      precipProb: daily.precipitation_probability_max?.[i] || 0,
      windMax: Math.round(daily.windspeed_10m_max[i] || 0),
      humidityMax: daily.relative_humidity_2m_max?.[i] || 0,
      humidityMin: daily.relative_humidity_2m_min?.[i] || 0,
      pressureMax: daily.pressure_msl_max?.[i] || 1013,
      pressureMin: daily.pressure_msl_min?.[i] || 1013,
      cloudCover: daily.cloudcover_mean?.[i] || 0,
      sunrise: daily.sunrise?.[i] || '',
      sunset: daily.sunset?.[i] || '',
      weatherCode: daily.weathercode[i],
      description: info.desc,
      icon: info.icon,
      severity: info.severity,
    });
  }

  const ai = generateAIInsights(days);
  return { days, ai, location: raw._location || {}, fetchedAt: Date.now() };
}

export default function useForecast14(lat = 33.5731, lon = -7.5898) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const retryCount = useRef(0);

  const fetchForecast = useCallback(async (latitude, longitude, retry = 0) => {
    // Check cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL &&
          Math.abs(cached.location.lat - latitude) < 0.01 &&
          Math.abs(cached.location.lon - longitude) < 0.01) {
        setData(cached);
        setLoading(false);
        return;
      }
    } catch {}

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Primary: Open-Meteo (free, no CORS, no key)
      const params = new URLSearchParams({
        latitude, longitude,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,relative_humidity_2m_max,relative_humidity_2m_min,pressure_msl_max,pressure_msl_min,cloudcover_mean,weathercode,sunrise,sunset',
        forecast_days: '14',
        timezone: 'auto',
      });

      // Try Kachelmannwetter first if key is available
      const kKey = import.meta.env.VITE_KACHELMANN_API_KEY;
      let raw;

      if (kKey) {
        try {
          const kRes = await fetch(
            `https://api.kachelmannwetter.com/v02/forecast/${latitude}/${longitude}/trend14days?units=metric`,
            { headers: { 'Accept': 'application/json', 'X-API-Key': kKey }, signal: abortRef.current.signal }
          );
          if (kRes.ok) {
            raw = await kRes.json();
            raw._location = { lat: latitude, lon: longitude };
            // Kachelmannwetter data would need its own normalizer
            // For now, fall through to Open-Meteo
          }
        } catch {}
      }

      // Fallback / primary: Open-Meteo
      if (!raw) {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          { signal: abortRef.current.signal }
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        raw = await res.json();
        raw._location = { lat: latitude, lon: longitude };
      }

      const normalized = normalizeData(raw);
      setData(normalized);
      setError(null);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(normalized)); } catch {}
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (retry < MAX_RETRIES) {
        retryCount.current = retry + 1;
        setTimeout(() => fetchForecast(latitude, longitude, retry + 1), 1000 * (retry + 1));
        return;
      }
      setError(err.message || 'Erreur de chargement des prévisions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast(lat, lon);
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [lat, lon, fetchForecast]);

  return { data, loading, error, refetch: () => fetchForecast(lat, lon) };
}
