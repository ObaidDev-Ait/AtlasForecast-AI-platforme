// === Global Theme Toggle (Light / Dark) ===
document.addEventListener('DOMContentLoaded', function () {
  try { setupGlobalThemeToggle(); } catch (e) { console.warn('Theme toggle init failed', e); }
});

function setupGlobalThemeToggle(){
  // Decide initial theme
  const saved = (localStorage.getItem('theme') || '').toLowerCase();
  let theme = saved === 'light' || saved === 'dark' ? saved : null;
  if (!theme){
    try{
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }catch(_){ theme = 'dark'; }
  }
  applyTheme(theme);

  // Ensure we have a container in header
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  let controls = document.querySelector('.nav-controls');
  if (!controls){
    controls = document.createElement('div');
    controls.className = 'nav-controls';
    navContainer.appendChild(controls);
  }

  // Avoid duplicate
  if (controls.querySelector('#themeToggle')) return;

  // Build toggle
  const btn = document.createElement('button');
  btn.id = 'themeToggle';
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.title = 'Basculer le thème';
  btn.setAttribute('aria-label', 'Basculer le thème');
  btn.innerHTML = `
    <span class="tt-track">
      <span class="tt-sky"></span>
      <span class="tt-stars"></span>
      <span class="tt-knob">
        <i class="fas fa-sun tt-sun"></i>
        <i class="fas fa-moon tt-moon"></i>
        <i class="fas fa-cloud tt-cloud"></i>
      </span>
    </span>
  `;
  controls.appendChild(btn);

  // Reflect current state
  reflectToggleVisual(theme);

  // Click handler
  btn.addEventListener('click', () => {
    const current = (document.documentElement.getAttribute('data-theme') || 'dark').toLowerCase();
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    reflectToggleVisual(next);
    try{ localStorage.setItem('theme', next); }catch(_){}
  });
}

function reflectToggleVisual(theme){
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.classList.toggle('is-light', theme === 'light');
  btn.classList.toggle('is-dark', theme !== 'light');
  btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
}

function applyTheme(theme){
  // Use data-theme to let CSS adapt and optionally load a light stylesheet
  if (theme === 'light'){
    document.documentElement.setAttribute('data-theme', 'light');
    ensureLightStylesheet(true);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    ensureLightStylesheet(false);
  }
}

function ensureLightStylesheet(enable){
  const id = 'lightThemeCSS';
  let link = document.getElementById(id);
  if (enable){
    if (!link){
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'css/light-theme.css';
      document.head.appendChild(link);
    }
  } else {
    if (link && link.parentNode){ link.parentNode.removeChild(link); }
  }
}
/**
 * AtlasForecast - Script Principal
 * Version: 2.0.0
 * Application météo professionnelle avec API OpenWeatherMap
 */

// ========================================
// CONFIGURATION ET VARIABLES GLOBALES
// ========================================

const API_KEY = '47c1019c93bf4a70c11537bebf481926'; // Remplacez par votre clé API OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
let CURRENT_UNITS = localStorage.getItem('units') || 'metric'; // 'metric' (°C) ou 'imperial' (°F)
let LAST_COORDS = null; // { lat, lon } dernière position consultée
let _radarMap = null; // instance Leaflet
let _countryLabelsLayer = null; // couche des libellés pays

// Villes du Maroc avec leurs coordonnées
const MOROCCO_CITIES = [
    { name: 'Casablanca', state: 'Casablanca-Settat', lat: 33.5731, lon: -7.5898 },
    { name: 'Rabat', state: 'Rabat-Salé-Kénitra', lat: 34.0209, lon: -6.8416 },
    { name: 'Marrakech', state: 'Marrakech-Safi', lat: 31.6295, lon: -7.9811 },
    { name: 'Fès', state: 'Fès-Meknès', lat: 34.0181, lon: -5.0078 },
    { name: 'Agadir', state: 'Souss-Massa', lat: 30.4278, lon: -9.5981 },
    { name: 'Tanger', state: 'Tanger-Tétouan-Al Hoceïma', lat: 35.7595, lon: -5.8340 },
    { name: 'Meknès', state: 'Fès-Meknès', lat: 33.8935, lon: -5.5473 },
    { name: 'Oujda', state: 'Oriental', lat: 34.6814, lon: -1.9086 },
    { name: 'Tétouan', state: 'Tanger-Tétouan-Al Hoceïma', lat: 35.5711, lon: -5.3684 },
    { name: 'Safi', state: 'Marrakech-Safi', lat: 32.2988, lon: -9.2376 },
    // Région Guelmim-Oued Noun — Ville d'Assa (province Assa‑Zag), affichée comme "Assa‑Zag"
    { name: 'Assa-Zag', state: 'Guelmim-Oued Noun', lat: 28.669, lon: -9.442 }
];

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function formatTemperatureValue(value) {
    const unitLabel = CURRENT_UNITS === 'imperial' ? '°F' : '°C';
    return `${Math.round(value)}${unitLabel}`;
}

// Fonction pour formater la température
function formatTemperature(kelvin) {
    const celsius = kelvin - 273.15;
    return Math.round(celsius);
}

// Fonction pour formater la date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateISO(isoDate) {
    const d = new Date(isoDate);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Fonction pour formater l'heure
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fonction pour obtenir l'icône météo appropriée
function getWeatherIcon(weatherCode) {
    const iconMap = {
        '01d': '☀️',
        '01n': '🌙',
        '02d': '⛅',
        '02n': '☁️',
        '03d': '☁️',
        '03n': '☁️',
        '04d': '☁️',
        '04n': '☁️',
        '09d': '🌧️',
        '09n': '🌧️',
        '10d': '🌦️',
        '10n': '🌧️',
        '11d': '⛈️',
        '11n': '⛈️',
        '13d': '❄️',
        '13n': '❄️',
        '50d': '🌫️',
        '50n': '🌫️'
    };
    return iconMap[weatherCode] || '🌤️';
}

// ========================================
// GESTION DES REQUÊTES API
// ========================================

// Fonction pour récupérer la météo actuelle
async function getCurrentWeather(city) {
    const response = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&lang=fr&units=${CURRENT_UNITS}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des données météo');
    return await response.json();
}

// Fonction pour récupérer les prévisions météo (OpenWeatherMap 5 jours / 3h)
async function getForecast(city) {
    const response = await fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&lang=fr&units=${CURRENT_UNITS}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des prévisions');
    return await response.json();
}

// Prévisions par coordonnées pour éviter les ambiguïtés de villes homonymes
async function getForecastByCoordinates(lat, lon) {
    const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=fr&units=${CURRENT_UNITS}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des prévisions (coords)');
    return await response.json();
}

// Fonction pour récupérer la météo par coordonnées
async function getWeatherByCoordinates(lat, lon) {
    const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=fr&units=${CURRENT_UNITS}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des données météo');
    return await response.json();
}

// Récupération de l'état/région et du pays par coordonnées (OpenWeather Geocoding Reverse)
async function reverseGeocode(lat, lon){
    try{
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
        const r = await fetch(url);
        if (!r.ok) return null;
        const arr = await r.json();
        return (arr && arr[0]) ? arr[0] : null;
    }catch(_){ return null; }
}

// Géocodage direct (ville -> pays/région) via OpenWeather Geocoding API
async function geocodeCity(city){
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Erreur géocodage');
    const results = await resp.json();
    return results && results.length ? results[0] : null;
}

// ========================================
// ENSEMBLE MULTI-MODÈLES (Open-Meteo)
// ========================================

/**
 * Récupère les prévisions multi-modèles (ECMWF, GFS, ICON, GRAPHCAST) via Open-Meteo Ensemble API
 * Retourne un objet { dates: string[], models: { [modelName]: number[] }, mean: number[] }
 */
async function getMultiModelForecast(lat, lon) {
    // Utiliser systématiquement la stratégie multi‑requêtes par modèle (plus fiable côté client)
    try{
        const result = await getMultiModelForecastFallback(lat, lon);
        if (!result) return null;
        // Harmoniser les longueurs des séries si nécessaire
        const minLen = Math.min(
            result.dates.length,
            ...Object.values(result.models).map(arr => (Array.isArray(arr) ? arr.length : 0))
        );
        const dates = result.dates.slice(0, minLen);
        const models = {};
        Object.entries(result.models).forEach(([k, arr]) => { models[k] = (arr || []).slice(0, minLen); });
        const mean = dates.map((_, idx) => {
            const vals = Object.values(models)
                .map(arr => (arr && arr[idx] != null ? Number(arr[idx]) : null))
                .filter(v => v != null);
            if (!vals.length) return null;
            const s = vals.reduce((a,b)=>a+b,0);
            return s / vals.length;
        });
        return { dates, models, mean };
    }catch(err){ console.warn('Multi-modèles indisponible:', err); return null; }
}

// Fallback multi-modèles: requête par modèle unique et agrégation
async function getMultiModelForecastFallback(lat, lon){
    const modelIds = ['ecmwf_ifs04','gfs_global','icon_global','graphcast','meteofrance_arpege_europe'];
    const endpoint = (model)=> `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_mean&forecast_days=16&timezone=auto&models=${model}`;
    const models = {};
    let dates = null;
    await Promise.all(modelIds.map(async (m) => {
        try{
            const r = await fetch(endpoint(m));
            if (!r.ok) return;
            const d = await r.json();
            const ds = d.daily?.time || [];
            const vals = d.daily?.temperature_2m_mean || [];
            if (!ds.length || !vals.length) return;
            if (!dates) dates = ds;
            const labelMap = { ecmwf_ifs04:'ECMWF', gfs_global:'GFS', icon_global:'ICON', graphcast:'GRAPHCAST', meteofrance_arpege_europe:'AIFS' };
            const label = labelMap[m] || m.toUpperCase();
            models[label] = vals.map(v => Number(v));
        }catch(_){ /* ignore */ }
    }));
    if (!dates || Object.keys(models).length === 0) return null;
    // mean sera calculée dans l'appelant pour gérer l'alignement
    return { dates, models, mean: [] };
}

// Prévisions quotidiennes Open-Meteo (max/min) pour plus de précision
async function getOpenMeteoDailyForecast(lat, lon){
    try{
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=5&timezone=auto`;
        const r = await fetch(url);
        if (!r.ok) throw new Error('Open-Meteo daily not available');
        const d = await r.json();
        const dates = d.daily && Array.isArray(d.daily.time) ? d.daily.time : [];
        const tmax = d.daily && Array.isArray(d.daily.temperature_2m_max) ? d.daily.temperature_2m_max : [];
        const tmin = d.daily && Array.isArray(d.daily.temperature_2m_min) ? d.daily.temperature_2m_min : [];
        return { dates, tmax, tmin };
    }catch(e){
        console.warn('Open-Meteo daily failed', e);
        return null;
    }
}

// Open-Meteo Daily 16 jours (icônes WMO + tmax/tmin/précip)
async function getOpenMeteoDaily16(lat, lon){
    try{
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=16&timezone=auto`;
        const r = await fetch(url);
        if (!r.ok) throw new Error('Open-Meteo daily16 not available');
        const d = await r.json();
        return {
            dates: d.daily?.time || [],
            weather_code: d.daily?.weather_code || [],
            tmax: d.daily?.temperature_2m_max || [],
            tmin: d.daily?.temperature_2m_min || [],
            precip: d.daily?.precipitation_sum || []
        };
    }catch(e){ console.warn('Open-Meteo daily16 failed', e); return null; }
}

function getIconFromWmo(wmo){
    const n = Number(wmo);
    if ([0].includes(n)) return '☀️';
    if ([1,2,3].includes(n)) return '⛅';
    if ([45,48].includes(n)) return '🌫️';
    if ([51,53,55,56,57].includes(n)) return '🌦️';
    if ([61,63,65,80,81,82].includes(n)) return '🌧️';
    if ([66,67].includes(n)) return '🌧️';
    if ([71,73,75,77,85,86].includes(n)) return '❄️';
    if ([95,96,99].includes(n)) return '⛈️';
    return '🌤️';
}

function toCurrentUnitsCelsius(tempC){
    if (tempC == null) return null;
    return CURRENT_UNITS === 'imperial' ? (tempC * 9/5 + 32) : tempC;
}

// ========================================
// AFFICHAGE DES DONNÉES MÉTÉO
// ========================================

async function displayWeather(weatherData, city = '') {
    const weatherSection = document.querySelector('.weather');
    if (!weatherSection) return;

    const cityName = city || weatherData.name;
    const temp = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const pressure = weatherData.main.pressure;
    const visibility = weatherData.visibility / 1000;
    const feelsLike = Math.round(weatherData.main.feels_like);

    weatherSection.innerHTML = `
        <div class="weather-icon">${getWeatherIcon(weatherData.weather[0].icon)}</div>
        <h1>${temp}${CURRENT_UNITS === 'imperial' ? '°F' : '°C'}</h1>
        <h2>${cityName}</h2>
        <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        <p>Humidité: ${humidity}%</p>
        <p>Vent: ${windSpeed} m/s</p>
        <div class="weather-icons-container">
            <div class="weather-icon-item">
                <div class="weather-icon-symbol visibility-icon">👁️</div>
                <div class="weather-icon-label">Visibilité</div>
                <div class="weather-icon-value">${visibility} km</div>
            </div>
            <div class="weather-icon-item">
                <div class="weather-icon-symbol feels-like-icon">🌡️</div>
                <div class="weather-icon-label">Ressenti</div>
                <div class="weather-icon-value">${feelsLike}${CURRENT_UNITS === 'imperial' ? '°F' : '°C'}</div>
            </div>
            <div class="weather-icon-item">
                <div class="weather-icon-symbol pressure-icon">📊</div>
                <div class="weather-icon-label">Pression</div>
                <div class="weather-icon-value">${pressure} hPa</div>
            </div>
        </div>
    `;

    animateWeatherIcons();
    // Mettre à jour la bannière d'emplacement si possible
    try{
        const banner = document.querySelector('.location-banner');
        if (banner){
            const c = document.querySelector('.location-city');
            const r = document.querySelector('.location-region');
            const p = document.querySelector('.location-country');
            // Préférence: utiliser les champs du jeu de données météo (sys.country), sinon géocoder
            const countryCode = weatherData.sys && weatherData.sys.country ? weatherData.sys.country : null;
            let regionName = weatherData.name || cityName || '';
            let countryName = countryCode || '';
            // Transformer code pays en nom lisible si possible (Intl.DisplayNames)
            if (countryName && countryName.length === 2 && typeof Intl !== 'undefined' && Intl.DisplayNames){
                try{
                    const dn = new Intl.DisplayNames(['fr'], { type: 'region' });
                    countryName = dn.of(countryName) || countryName;
                }catch(_){}
            }
            // Récupérer région via reverse geocoding (lon/lat) si disponible
            try{
                const lat = weatherData.coord && weatherData.coord.lat;
                const lon = weatherData.coord && weatherData.coord.lon;
                if (lat != null && lon != null){
                    const revUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
                    const rev = await fetch(revUrl);
                    if (rev.ok){
                        const arr = await rev.json();
                        if (arr && arr[0]){
                            regionName = arr[0].state || regionName;
                            if (!countryName && arr[0].country) countryName = arr[0].country;
                            if (countryName && countryName.length === 2 && typeof Intl !== 'undefined' && Intl.DisplayNames){
                                try{ const dn = new Intl.DisplayNames(['fr'], { type: 'region' }); countryName = dn.of(countryName) || countryName; }catch(_){}
                            }
                        }
                    }
                }
            }catch(_){}

            if (c) c.textContent = cityName || weatherData.name || '—';
            if (r) r.textContent = regionName || '—';
            if (p) p.textContent = countryName || '—';
        }
    }catch(_){}
}

function buildMultiModelSection() { return ''; }

// Max/Min quotidiens par fuseau (OpenWeather 3h)
function groupDailyHighLow(forecastList, tzOffsetSec){
    const byDay = {};
    forecastList.forEach(f => {
        const local = new Date((f.dt + tzOffsetSec) * 1000);
        const key = new Date(local.getFullYear(), local.getMonth(), local.getDate()).getTime();
        const t = f.main && typeof f.main.temp === 'number' ? f.main.temp : null;
        // OpenWeather 5-day/3h: temp_max/min ne sont pas fiables par tranche; on agrège sur 24h
        const tMax = f.main && typeof f.main.temp === 'number' ? f.main.temp : t;
        const tMin = f.main && typeof f.main.temp === 'number' ? f.main.temp : t;
        if (!byDay[key]) byDay[key] = { key, tmax: -Infinity, tmin: Infinity, precip: 0, icons: {}, descriptions: {} };
        if (tMax != null && tMax > byDay[key].tmax) byDay[key].tmax = tMax;
        if (tMin != null && tMin < byDay[key].tmin) byDay[key].tmin = tMin;
        const rain = f.rain && (f.rain['3h'] || f.rain['1h']) ? (f.rain['3h'] || f.rain['1h']) : 0;
        const snow = f.snow && (f.snow['3h'] || f.snow['1h']) ? (f.snow['3h'] || f.snow['1h']) : 0;
        byDay[key].precip += (rain + snow);
        const icon = f.weather && f.weather[0] && f.weather[0].icon ? f.weather[0].icon : '01d';
        const desc = f.weather && f.weather[0] && f.weather[0].description ? f.weather[0].description : '';
        byDay[key].icons[icon] = (byDay[key].icons[icon] || 0) + 1;
        byDay[key].descriptions[desc] = (byDay[key].descriptions[desc] || 0) + 1;
    });
    const pickMost = m => Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0];
    return Object.values(byDay).map(d => {
        const base = new Date(d.key); base.setHours(12,0,0,0);
        const localMidUtcSec = Math.floor(base.getTime()/1000) - tzOffsetSec;
        return {
            dateLocalMidUtcSec: localMidUtcSec,
            tmax: d.tmax === -Infinity ? 0 : d.tmax,
            tmin: d.tmin === Infinity ? 0 : d.tmin,
            precip: Math.round(d.precip*10)/10,
            icon: pickMost(d.icons) || '01d',
            description: pickMost(d.descriptions) || ''
        };
    }).sort((a,b)=>a.dateLocalMidUtcSec - b.dateLocalMidUtcSec);
}

// Adapter l'affichage sur MAX/MIN
async function displayForecast(forecastData, ensemble = null) {
    const forecastContainer = document.querySelector('.forecast-container');
    if (!forecastContainer) return;

    // Certaines réponses Forecast by coords ne renvoient pas timezone: fallback +0 pour éviter NaN
    const tzOffsetSec = (forecastData.city && typeof forecastData.city.timezone === 'number') ? forecastData.city.timezone : 0;
    const daily = groupDailyHighLow(forecastData.list, tzOffsetSec).slice(0,5);

    // Essayer d'améliorer les max/min via Open-Meteo quotidien
    let omDaily = null;
    try{
        const cityCoord = forecastData.city && forecastData.city.coord ? forecastData.city.coord : null;
        if (cityCoord && typeof cityCoord.lat === 'number' && typeof cityCoord.lon === 'number'){
            omDaily = await getOpenMeteoDailyForecast(cityCoord.lat, cityCoord.lon);
        }
    }catch(_){ }

    let forecastHTML = `
        <div class="forecast-header">
            <h1>Prévisions Météo</h1>
            <p>Prévisions sur 5 jours pour ${forecastData.city.name}</p>
        </div>
        
        <div class="weather-charts">
            <div class="chart-container">
                <h3 class="chart-title">Températures (max)</h3>
                <canvas id="tempChart" height="300"></canvas>
            </div>
            <div class="chart-container">
                <h3 class="chart-title">Précipitations</h3>
                <canvas id="precipChart" height="300"></canvas>
            </div>
        </div>
        
        <div class="weather-details">
            <h3>Détails des Prévisions</h3>
            <div class="details-grid">
    `;

    daily.forEach((day, idx) => {
        const date = formatDateFromCityLocalMid(day.dateLocalMidUtcSec, tzOffsetSec);
        const tmax = Math.round(omDaily && omDaily.tmax && omDaily.tmax[idx] != null ? omDaily.tmax[idx] : day.tmax);
        const tmin = Math.round(omDaily && omDaily.tmin && omDaily.tmin[idx] != null ? omDaily.tmin[idx] : day.tmin);
        // Icône: choisir la tranche 12:00 locale la plus proche pour uniformiser entre villes
        const noonLocalHour = 12;
        const picksAtNoon = pickDailyAtCurrentHourByDay(
            forecastData.list,
            tzOffsetSec,
            noonLocalHour
        );
        const iconCode = picksAtNoon && picksAtNoon[idx] ? picksAtNoon[idx].icon : day.icon;
        const icon = getWeatherIcon(iconCode);
        forecastHTML += `
            <div class="detail-item">
                <div class="detail-icon">${icon}</div>
                <div class="detail-label">${date}</div>
                <div class="detail-value">${tmax}${CURRENT_UNITS === 'imperial' ? '°F' : '°C'}</div>
                <p>Min ${tmin}${CURRENT_UNITS === 'imperial' ? '°F' : '°C'} • ${day.description}</p>
            </div>
        `;
    });

    forecastHTML += `
            </div>
        </div>
    `;

    // Section Jour / Nuit (par jour)
    try{
        const dayNight = groupDayNightForecasts(forecastData.list, tzOffsetSec).slice(0,5);
        const dayNightCards = dayNight.map(entry => {
            const dateLabel = new Date(entry.keyMs).toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' }).toUpperCase();
            const d = entry.day; const n = entry.night;
            const dIcon = getWeatherIcon(d.icon); const nIcon = getWeatherIcon(n.icon);
            const dTemp = `${Math.round(d.tempMin)}–${Math.round(d.tempMax)}${CURRENT_UNITS === 'imperial' ? '°F' : '°C'}`;
            const nTemp = `${Math.round(n.tempMin)}–${Math.round(n.tempMax)}${CURRENT_UNITS === 'imperial' ? '°F' : '°C'}`;
            const dPrecip = `${d.precip} mm`;
            const nPrecip = `${n.precip} mm`;
            const dPop = (typeof d.popAvg === 'number') ? `${d.popAvg}%` : '—';
            const nPop = (typeof n.popAvg === 'number') ? `${n.popAvg}%` : '—';
            const speedUnit = 'km/h';
            const windToKmH = (w) => {
                const v = (w || 0);
                if (CURRENT_UNITS === 'imperial') return Math.round(v * 1.609);
                return Math.round(v * 3.6);
            };
            const dWind = `${windToKmH(d.windMax)} ${speedUnit}`;
            const nWind = `${windToKmH(n.windMax)} ${speedUnit}`;
            return `
                <div class="daynight-card">
                    <div class="daynight-date">${dateLabel}</div>
                    <div class="daynight-columns">
                        <div class="daynight-col">
                            <div class="daynight-col-title">Jour</div>
                            <div class="daynight-line"><span class="daynight-ico">${dIcon}</span><span>${d.description || ''}</span></div>
                            <div class="daynight-stats">
                                <div><span class="lbl">Temp</span><span class="val">${dTemp}</span></div>
                                <div><span class="lbl">Précip</span><span class="val">${dPrecip}</span></div>
                                <div><span class="lbl">PoP</span><span class="val">${dPop}</span></div>
                                <div><span class="lbl">Vent max</span><span class="val">${dWind}</span></div>
                            </div>
                        </div>
                        <div class="daynight-col">
                            <div class="daynight-col-title">Nuit</div>
                            <div class="daynight-line"><span class="daynight-ico">${nIcon}</span><span>${n.description || ''}</span></div>
                            <div class="daynight-stats">
                                <div><span class="lbl">Temp</span><span class="val">${nTemp}</span></div>
                                <div><span class="lbl">Précip</span><span class="val">${nPrecip}</span></div>
                                <div><span class="lbl">PoP</span><span class="val">${nPop}</span></div>
                                <div><span class="lbl">Vent max</span><span class="val">${nWind}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        forecastHTML += `
            <div class="daynight-section">
                <h3>Prévisions Jour / Nuit</h3>
                <div class="daynight-grid">${dayNightCards}</div>
            </div>
        `;
    }catch(_){ }

    // multi‑modèles supprimé

    forecastContainer.innerHTML = forecastHTML;

    const dailyForCharts = daily.map(d => ({ date: d.dateLocalMidUtcSec, temp: d.tmax, precip: d.precip }));
    renderCharts(dailyForCharts);
}

// Grouper les prévisions OpenWeather par jour
function groupForecastsByDay(forecastList) {
    const byDay = {};
    forecastList.forEach(f => {
        const d = new Date(f.dt * 1000);
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        if (!byDay[key]) {
            byDay[key] = {
                date: f.dt,
                temps: [],
                description: f.weather[0].description,
                icon: f.weather[0].icon
            };
        }
        byDay[key].temps.push(f.main.temp);
    });
    const days = Object.values(byDay).map(d => ({
        date: d.date,
        temp: d.temps.length ? (d.temps.reduce((a,b)=>a+b,0)/d.temps.length) : null,
        description: d.description,
        icon: d.icon
    }));
    return days;
}

function renderCharts(dailyForecastsForChart) {
    const tempCtx = document.getElementById('tempChart');
    const precipCtx = document.getElementById('precipChart');
    if (!tempCtx || !precipCtx) return;

    const labels = dailyForecastsForChart.map(d => new Date(d.date * 1000).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }));
    const temps = dailyForecastsForChart.map(d => Math.round(d.temp));
    const precs = dailyForecastsForChart.map(d => (d.precip || 0));

    // Détruire anciens graphiques si existent
    if (window._tempChart) { window._tempChart.destroy(); }
    if (window._precipChart) { window._precipChart.destroy(); }

    window._tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `Température moyenne (${CURRENT_UNITS === 'imperial' ? '°F' : '°C'})`,
                data: temps,
                tension: 0.35,
                fill: false,
                borderColor: '#60a5fa',
                backgroundColor: '#60a5fa',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary') } } },
            scales: {
                x: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });

    window._precipChart = new Chart(precipCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Précipitations (mm/jour)',
                data: precs,
                backgroundColor: 'rgba(59,130,246,0.5)',
                borderColor: 'rgba(59,130,246,1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary') } } },
            scales: {
                x: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { beginAtZero: true, ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
}

// =============== PREMIUM (16 jours + multi-modèles) ===============
function buildPremiumDayCard(dateISO, _summaryUnused, extra){
    const label = new Date(dateISO).toLocaleDateString('fr-FR', { weekday:'short', day:'2-digit', month:'short' });
    const unitLabel = CURRENT_UNITS === 'imperial' ? '°F' : '°C';
    const icon = extra && extra.icon ? extra.icon : '🌤️';
    const tmax = extra && extra.tmax != null ? Math.round(extra.tmax) + unitLabel : '—';
    const tmin = extra && extra.tmin != null ? Math.round(extra.tmin) + unitLabel : '—';
    const pr = extra && extra.precip != null ? `${extra.precip} mm` : '—';
    return `
        <div class="premium-day">
            <div class="hd">${label.toUpperCase()}</div>
            <div class="row big"><span class="ico">${icon}</span><span class="val">Max ${tmax} · Min ${tmin}</span></div>
            <div class="row"><span class="label">Précip.</span><span class="val">${pr}</span></div>
        </div>
    `;
}

async function renderPremiumForecast(lat, lon){
    try{
        const grid = document.getElementById('premiumGrid');
        const premiumContent = document.getElementById('premiumContent');
        const paywall = document.getElementById('paywallNotice');
        if (!grid) return;
        // Bloquer l'accès si non premium
        if (!isPremiumUser()){
            if (premiumContent) premiumContent.style.display = 'none';
            if (paywall) paywall.style.display = '';
            return;
        }
        if (premiumContent) premiumContent.style.display = '';
        if (paywall) paywall.style.display = 'none';
        // Prévisions 16 jours uniquement
        const daily16 = await getOpenMeteoDaily16(lat, lon);
        if (!daily16){ grid.innerHTML = '<p style="color:var(--text-secondary)">Prévisions 16 jours indisponibles pour le moment.</p>'; return; }
        const cards = daily16.dates.map((iso, idx) => {
            const tmax = toCurrentUnitsCelsius(daily16.tmax?.[idx]);
            const tmin = toCurrentUnitsCelsius(daily16.tmin?.[idx]);
            const precip = daily16.precip?.[idx] != null ? Math.round(daily16.precip[idx]*10)/10 : null;
            const icon = getIconFromWmo(daily16.weather_code?.[idx]);
            return buildPremiumDayCard(iso, null, { tmax, tmin, precip, icon });
        }).join('');
        grid.innerHTML = cards;
    }catch(e){ console.warn(e); }
}

// Charger automatiquement les 16 jours pour les villes du Maroc, style premium
async function loadPremiumForMoroccoCities(){
    try{
        const selector = document.querySelector('#premiumContent .morocco-cities-selector');
        if (!selector) return;
        // Réutilise l’affichage des cartes villes (mêmes classes/styles)
        displayMoroccoCities();
        // Brancher un clic pour chaque carte afin de rendre 16 jours multi‑modèles
        document.querySelectorAll('.city-card').forEach(card => {
            card.addEventListener('click', async () => {
                const lat = parseFloat(card.dataset.lat);
                const lon = parseFloat(card.dataset.lon);
                await renderPremiumForecast(lat, lon);
            });
        });
        // Charger par défaut la première ville
        const first = document.querySelector('.city-card');
        if (first){
            await renderPremiumForecast(parseFloat(first.dataset.lat), parseFloat(first.dataset.lon));
        }
    }catch(_){ }
}

function groupForecastsForChartsTZ(forecastList, tzOffsetSec){
    const byDay = {};
    forecastList.forEach(f => {
        const local = new Date((f.dt + tzOffsetSec) * 1000);
        const key = new Date(local.getFullYear(), local.getMonth(), local.getDate()).getTime();
        if (!byDay[key]) byDay[key] = { key, anyDt: f.dt, temps: [], precip: 0 };
        if (f.main && typeof f.main.temp === 'number') byDay[key].temps.push(f.main.temp);
        const rain = f.rain && (f.rain['3h'] || f.rain['1h']) ? (f.rain['3h'] || f.rain['1h']) : 0;
        const snow = f.snow && (f.snow['3h'] || f.snow['1h']) ? (f.snow['3h'] || f.snow['1h']) : 0;
        byDay[key].precip += (rain + snow);
    });
    return Object.values(byDay).sort((a,b)=>a.key-b.key).map(d => ({
        date: d.anyDt,
        temp: d.temps.length ? (d.temps.reduce((a,b)=>a+b,0)/d.temps.length) : 0,
        precip: Math.round(d.precip * 10) / 10
    }));
}

 // Adapter displayForecast pour invoquer renderCharts (éviter d'écraser la page forecast.html)
(function(){
    const hasForecastGrid = document.getElementById('forecastGrid'); // propre à forecast.html
    const hasForecastContainer = document.querySelector('.forecast-container'); // propre aux autres pages
    if (!hasForecastGrid && hasForecastContainer) {
        const _displayForecast_orig = displayForecast;
        displayForecast = function(forecastData, ensemble = null) {
            _displayForecast_orig(forecastData, ensemble);
            try {
                const tzOffsetSec = (forecastData.city && typeof forecastData.city.timezone === 'number') ? forecastData.city.timezone : 0;
                const dailyForCharts = groupForecastsForChartsTZ(forecastData.list, tzOffsetSec).slice(0,5);
                renderCharts(dailyForCharts);
            } catch (e) {
                console.warn('Charts error:', e);
            }
        };
    }
})();

// --- Helpers fuseau horaire et agrégation quotidienne ---
function groupByDayWithTimezone(forecastList, tzOffsetSec) {
    const byDay = {};
    forecastList.forEach(f => {
        const local = new Date((f.dt + tzOffsetSec) * 1000); // date locale de la ville
        const key = new Date(local.getFullYear(), local.getMonth(), local.getDate()).getTime();
        if (!byDay[key]) {
            byDay[key] = { localKeyMs: key, dts: [], temps: [], tempMin: Infinity, tempMax: -Infinity, precip: 0, icons: {}, descriptions: {} };
        }
        const temp = f.main && typeof f.main.temp === 'number' ? f.main.temp : null;
        if (temp != null) {
            byDay[key].temps.push(temp);
            if (temp < byDay[key].tempMin) byDay[key].tempMin = temp;
            if (temp > byDay[key].tempMax) byDay[key].tempMax = temp;
        }
        // précipitations 3h (mm)
        const rain = f.rain && (f.rain['3h'] || f.rain['1h']) ? (f.rain['3h'] || f.rain['1h']) : 0;
        const snow = f.snow && (f.snow['3h'] || f.snow['1h']) ? (f.snow['3h'] || f.snow['1h']) : 0;
        byDay[key].precip += (rain + snow);
        // icônes et descriptions les plus fréquentes
        const icon = f.weather && f.weather[0] && f.weather[0].icon ? f.weather[0].icon : '01d';
        const desc = f.weather && f.weather[0] && f.weather[0].description ? f.weather[0].description : '';
        byDay[key].icons[icon] = (byDay[key].icons[icon] || 0) + 1;
        byDay[key].descriptions[desc] = (byDay[key].descriptions[desc] || 0) + 1;
        byDay[key].dts.push(f.dt);
    });

    const pickMostFrequent = (map) => Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0];

    return Object.values(byDay).map(d => {
        const avg = d.temps.length ? d.temps.reduce((a,b)=>a+b,0)/d.temps.length : 0;
        const icon = pickMostFrequent(d.icons) || '01d';
        const description = pickMostFrequent(d.descriptions) || '';
        // prendre midi local approximatif
        const localDate = new Date(d.localKeyMs);
        localDate.setHours(12,0,0,0);
        const localMiddayUtcSec = Math.floor(localDate.getTime()/1000) - tzOffsetSec;
        return {
            dateLocalMidUtcSec: localMiddayUtcSec,
            tempAvg: avg,
            tempMin: d.tempMin === Infinity ? avg : d.tempMin,
            tempMax: d.tempMax === -Infinity ? avg : d.tempMax,
            precip: Math.round(d.precip * 10)/10,
            icon,
            description
        };
    }).sort((a,b)=>a.dateLocalMidUtcSec - b.dateLocalMidUtcSec);
}

function formatDateFromCityLocalMid(utcSec, tzOffsetSec){
    const local = new Date((utcSec + tzOffsetSec) * 1000);
    return local.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase();
}

// Sélection par jour de la température au même horaire local que maintenant
function pickDailyAtCurrentHourByDay(forecastList, tzOffsetSec, targetHourOpt){
    // heure locale actuelle dans la ville
    const nowUtcSec = Math.floor(Date.now()/1000);
    const nowLocal = new Date((nowUtcSec + tzOffsetSec) * 1000);
    const targetHour = (typeof targetHourOpt === 'number' && targetHourOpt >= 0 && targetHourOpt <= 23)
        ? targetHourOpt
        : nowLocal.getHours();

    const perDay = {};
    forecastList.forEach(f => {
        const local = new Date((f.dt + tzOffsetSec) * 1000);
        const key = new Date(local.getFullYear(), local.getMonth(), local.getDate()).getTime();
        if (!perDay[key]) perDay[key] = [];
        perDay[key].push({ f, localHour: local.getHours() });
    });

    const picks = Object.keys(perDay).map(key => {
        const items = perDay[key];
        // choisir l'heure la plus proche de targetHour
        items.sort((a,b)=> Math.abs(a.localHour - targetHour) - Math.abs(b.localHour - targetHour));
        const chosen = items[0].f;
        const icon = chosen.weather && chosen.weather[0] ? chosen.weather[0].icon : '01d';
        const desc = chosen.weather && chosen.weather[0] ? chosen.weather[0].description : '';
        const temp = chosen.main && typeof chosen.main.temp === 'number' ? chosen.main.temp : 0;
        // prendre midi local pour l'étiquette
        const baseDate = new Date(parseInt(key,10));
        baseDate.setHours(12,0,0,0);
        const localMidUtcSec = Math.floor(baseDate.getTime()/1000) - tzOffsetSec;
        return { dateLocalMidUtcSec: localMidUtcSec, temp, icon, description: desc };
    }).sort((a,b)=> a.dateLocalMidUtcSec - b.dateLocalMidUtcSec);

    return picks;
}

// Regrouper par périodes Jour (06-18h) et Nuit (18-06h) en heure locale
function groupDayNightForecasts(forecastList, tzOffsetSec){
    const byKey = {};
    const ensureKey = (keyMs) => {
        if (!byKey[keyMs]){
            byKey[keyMs] = {
                keyMs,
                day: { temps: [], precip: 0, pops: [], windMax: 0, icons: {}, descriptions: {} },
                night: { temps: [], precip: 0, pops: [], windMax: 0, icons: {}, descriptions: {} }
            };
        }
        return byKey[keyMs];
    };

    forecastList.forEach(f => {
        const local = new Date((f.dt + tzOffsetSec) * 1000);
        const localMidnight = new Date(local.getFullYear(), local.getMonth(), local.getDate());
        const baseKeyMs = localMidnight.getTime();
        const hour = local.getHours();

        // Périodes: <06h = Nuit du jour précédent; 06-18h = Jour du jour courant; >=18h = Nuit du jour courant
        if (hour < 6){
            const prevKeyMs = baseKeyMs - 24*3600*1000;
            const bucket = ensureKey(prevKeyMs).night;
            collectIntoPeriodBucket(bucket, f);
        } else if (hour < 18){
            const bucket = ensureKey(baseKeyMs).day;
            collectIntoPeriodBucket(bucket, f);
        } else {
            const bucket = ensureKey(baseKeyMs).night;
            collectIntoPeriodBucket(bucket, f);
        }
    });

    // Transformer en tableau trié par jour
    const pickMost = (m) => Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0];
    const results = Object.values(byKey).sort((a,b)=>a.keyMs - b.keyMs).map(entry => {
        const toSummary = (p) => {
            const tempMin = p.temps.length ? Math.min(...p.temps) : 0;
            const tempMax = p.temps.length ? Math.max(...p.temps) : 0;
            const icon = pickMost(p.icons) || '01d';
            const description = pickMost(p.descriptions) || '';
            const popAvg = p.pops.length ? Math.round((p.pops.reduce((s,v)=>s+v,0)/p.pops.length)*100) : null; // en %
            const windMax = Math.max(0, p.windMax || 0);
            return { tempMin, tempMax, precip: Math.round(p.precip*10)/10, icon, description, popAvg, windMax };
        };
        return {
            keyMs: entry.keyMs,
            day: toSummary(entry.day),
            night: toSummary(entry.night)
        };
    });

    return results;
}

function collectIntoPeriodBucket(bucket, f){
    try{
        const temp = f.main && typeof f.main.temp === 'number' ? f.main.temp : null;
        if (temp != null) bucket.temps.push(temp);
        const rain = f.rain && (f.rain['3h'] || f.rain['1h']) ? (f.rain['3h'] || f.rain['1h']) : 0;
        const snow = f.snow && (f.snow['3h'] || f.snow['1h']) ? (f.snow['3h'] || f.snow['1h']) : 0;
        bucket.precip += (rain + snow);
        const pop = (typeof f.pop === 'number') ? f.pop : null; // 0..1
        if (pop != null) bucket.pops.push(pop);
        const wind = f.wind && typeof f.wind.speed === 'number' ? f.wind.speed : 0;
        if (wind > bucket.windMax) bucket.windMax = wind;
        const icon = f.weather && f.weather[0] && f.weather[0].icon ? f.weather[0].icon : '01d';
        const desc = f.weather && f.weather[0] && f.weather[0].description ? f.weather[0].description : '';
        bucket.icons[icon] = (bucket.icons[icon] || 0) + 1;
        bucket.descriptions[desc] = (bucket.descriptions[desc] || 0) + 1;
    }catch(_){ }
}

// ========================================
// GESTION DE LA RECHERCHE
// ========================================

async function handleSearch() {
    const searchInput = document.querySelector('.search input');
    const city = searchInput ? searchInput.value.trim() : '';
    if (!city) { showError("Veuillez entrer le nom d'une ville"); return; }

    hideError();
    showLoading();
    try {
        // Choisir le meilleur candidat partout dans le monde (ville[, état][, pays])
        let chosen = null;
        try{
            const suggestions = await geocodeSuggest(city);
            chosen = chooseBestGeocodeCandidate(city, suggestions);
        }catch(_){}

        // Si pas de géocodage, fallback sur la météo par nom
        let lat, lon, weatherData;
        if (chosen){
            lat = chosen.lat; lon = chosen.lon;
            weatherData = await getWeatherByCoordinates(lat, lon);
        } else {
            weatherData = await getCurrentWeather(city);
            lat = weatherData.coord.lat; lon = weatherData.coord.lon;
        }
        // Utiliser les coordonnées pour des prévisions exactes
        const forecastData = await getForecastByCoordinates(lat, lon);

        // Multi-modèles via Open-Meteo
        const ensemble = await getMultiModelForecast(lat, lon);

        // Afficher immédiatement la météo actuelle (température, ressentie, etc.)
        displayWeather(weatherData, chosen ? (chosen.name || city) : city);
        // Mémoriser les coordonnées pour le radar (global) et recadrer la carte si présente
        LAST_COORDS = { lat, lon };
        updateRadarMapCenter(lat, lon);
        // Si disponible, enrichir la bannière avec géocodage (ville/région/pays)
        try{
            const geo = await geocodeCity(city);
            const banner = document.querySelector('.location-banner');
            if (geo && banner){
                const c = document.querySelector('.location-city');
                const r = document.querySelector('.location-region');
                const p = document.querySelector('.location-country');
                if (c) c.textContent = geo.name || city;
                if (r) r.textContent = geo.state || (forecastData && forecastData.city && forecastData.city.name) || '—';
                let countryName = geo.country || '';
                if (countryName && countryName.length === 2 && typeof Intl !== 'undefined' && Intl.DisplayNames){
                    try{ const dn = new Intl.DisplayNames(['fr'], { type: 'region' }); countryName = dn.of(countryName) || countryName; }catch(_){}
                }
                if (p) p.textContent = countryName || '—';
            }
        }catch(_){}
        // Puis les prévisions et graphiques
        displayForecast(forecastData, ensemble);
        hideLoading();

        localStorage.setItem('lastSearchedCity', city);
    } catch (error) {
        hideLoading();
        showError('Ville non trouvée ou erreur de connexion');
    }
}

// ========================================
// GESTION DES VILLES DU MAROC
// ========================================

function displayMoroccoCities() {
    const citiesSelector = document.querySelector('.morocco-cities-selector');
    if (!citiesSelector) return;

    let citiesHTML = `
        <h2>Villes du Maroc</h2>
        <div class="cities-grid">
    `;

    MOROCCO_CITIES.forEach(city => {
        citiesHTML += `
            <div class="city-card" data-lat="${city.lat}" data-lon="${city.lon}" data-state="${city.state || ''}">
                <div class="city-name">${city.name} <span class="city-region">${city.state ? '• ' + city.state : ''}</span></div>
                <div class="city-temp">--°C</div>
                <div class="city-description">Chargement...</div>
            </div>
        `;
    });

    citiesHTML += '</div>';
    citiesSelector.innerHTML = citiesHTML;

    addCityCardEvents();
    loadAllCitiesWeather();
}

function addCityCardEvents() {
    const cityCards = document.querySelectorAll('.city-card');
    cityCards.forEach(card => {
        card.addEventListener('click', async () => {
            const lat = parseFloat(card.dataset.lat);
            const lon = parseFloat(card.dataset.lon);
            const cityName = card.querySelector('.city-name').textContent;
            try {
                const weatherData = await getWeatherByCoordinates(lat, lon);
                const state = card.getAttribute('data-state') || '';
                const cleanCity = cityName.replace(/\s*•.*$/, '');
                displayWeather(weatherData, cleanCity);
                LAST_COORDS = { lat, lon };
                updateRadarMapCenter(lat, lon);
                updateRadarMapCenter(lat, lon);
                // Mettre à jour la bannière via reverse geocoding
                try{
                    const revUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
                    const rev = await fetch(revUrl);
                    const banner = document.querySelector('.location-banner');
                    if (rev.ok && banner){
                        const arr = await rev.json();
                        const c = document.querySelector('.location-city');
                        const r = document.querySelector('.location-region');
                        const p = document.querySelector('.location-country');
                        if (c) c.textContent = cleanCity;
                        const stateName = state || (arr && arr[0] && arr[0].state) || '';
                        if (r) r.textContent = stateName || '—';
                        let countryName = (arr && arr[0] && arr[0].country) ? arr[0].country : '';
                        if (countryName && countryName.length === 2 && typeof Intl !== 'undefined' && Intl.DisplayNames){
                            try{ const dn = new Intl.DisplayNames(['fr'], { type: 'region' }); countryName = dn.of(countryName) || countryName; }catch(_){ }
                        }
                        if (p) p.textContent = countryName || '—';
                    }
                }catch(_){ }
                // Charger aussi les prévisions par coordonnées pour exactitude
                try{
                    const forecastData = await getForecastByCoordinates(lat, lon);
                    const ensemble = await getMultiModelForecast(lat, lon);
                    displayForecast(forecastData, ensemble);
                }catch(_){ }

                document.querySelectorAll('.city-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            } catch (error) {
                console.error('Erreur lors du chargement de la ville:', error);
            }
        });
    });
}

async function loadAllCitiesWeather() {
    const cityCards = document.querySelectorAll('.city-card');
    for (let i = 0; i < cityCards.length; i++) {
        const card = cityCards[i];
        const lat = parseFloat(card.dataset.lat);
        const lon = parseFloat(card.dataset.lon);
        try {
            const weatherData = await getWeatherByCoordinates(lat, lon);
            updateCityCard(card, weatherData);
            // compléter la région/pays automatiquement si absent
            const stateFromData = card.getAttribute('data-state');
            if (!stateFromData){
                const info = await reverseGeocode(lat, lon);
                if (info && info.state){
                    card.setAttribute('data-state', info.state);
                    const nameEl = card.querySelector('.city-name');
                    if (nameEl){
                        const baseName = nameEl.textContent.replace(/\s*•.*$/, '');
                        nameEl.innerHTML = `${baseName} <span class="city-region">• ${info.state}</span>`;
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error('Erreur pour la ville:', card.querySelector('.city-name').textContent, error);
        }
    }
}

function updateCityCard(card, weatherData) {
    const temp = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    card.querySelector('.city-temp').textContent = `${temp}${CURRENT_UNITS === 'imperial' ? '°F' : '°C'}`;
    card.querySelector('.city-description').textContent = description;
}

// ========================================
// UI
// ========================================

function showLoading() {
    const loading = document.querySelector('.loading');
    const error = document.querySelector('.error');
    if (loading) loading.style.display = 'flex';
    if (error) error.style.display = 'none';
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) loading.style.display = 'none';
}

function showError(message) {
    const error = document.querySelector('.error');
    const loading = document.querySelector('.loading');
    if (error) {
        error.innerHTML = `<p>${message}</p>`;
        error.style.display = 'block';
    }
    if (loading) loading.style.display = 'none';
}

function hideError() {
    const error = document.querySelector('.error');
    if (error) error.style.display = 'none';
}

// =============== ALERTES / VIGILANCES ===============
async function getMarineData(lat, lon){
    try{
        const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wind_wave_height&timezone=auto`;
        const r = await fetch(url);
        if (!r.ok) throw new Error('Marine unavailable');
        return await r.json();
    }catch(_){ return null; }
}

function assessAlertLevels(forecast, marine){
    // Seuils simples (adaptables): chaleur >=38, très chaud >=42; froid <=3, <=0; pluie forte >=20 mm/24h; vent fort >=60 km/h; vagues hautes >=3m; inondation si pluie >=40mm/24h
    const levels = [];
    try{
        // Agréger par jour local
        const tz = (forecast.city && typeof forecast.city.timezone === 'number') ? forecast.city.timezone : 0;
        const days = groupByDayWithTimezone(forecast.list, tz);
        days.forEach(d => {
            const date = new Date((d.dateLocalMidUtcSec + tz) * 1000).toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' });
            const dayAlerts = [];
            if (d.tempMax >= 42) dayAlerts.push({ type:'Vague de chaleur', level:'red', text:`Température max ${Math.round(d.tempMax)}°C` });
            else if (d.tempMax >= 38) dayAlerts.push({ type:'Chaleur', level:'orange', text:`Température max ${Math.round(d.tempMax)}°C` });
            if (d.tempMin <= 0) dayAlerts.push({ type:'Vague de froid', level:'red', text:`Température min ${Math.round(d.tempMin)}°C` });
            else if (d.tempMin <= 3) dayAlerts.push({ type:'Froid', level:'orange', text:`Température min ${Math.round(d.tempMin)}°C` });
        
            // Pluie (nous avons d.precip par jour)
            if (d.precip >= 40) dayAlerts.push({ type:'Alerte inondation', level:'red', text:`Précipitations prévues ${d.precip} mm/24h` });
            else if (d.precip >= 20) dayAlerts.push({ type:'Fortes pluies', level:'orange', text:`Précipitations ${d.precip} mm/24h` });

            // Vent: approx à partir des pas 3h (max sur le jour)
            const day3h = forecast.list.filter(f => {
                const local = new Date((f.dt + tz) * 1000);
                const key = new Date(local.getFullYear(), local.getMonth(), local.getDate()).getTime();
                const midKey = new Date(new Date((d.dateLocalMidUtcSec + tz) * 1000).getFullYear(), new Date((d.dateLocalMidUtcSec + tz) * 1000).getMonth(), new Date((d.dateLocalMidUtcSec + tz) * 1000).getDate()).getTime();
                return key === midKey;
            });
            const maxWind = Math.max(...day3h.map(f => f.wind && typeof f.wind.speed === 'number' ? f.wind.speed : 0));
            const maxWindKmH = Math.round(maxWind * 3.6);
            if (maxWindKmH >= 80) dayAlerts.push({ type:'Vent violent', level:'red', text:`Rafales ~ ${maxWindKmH} km/h` });
            else if (maxWindKmH >= 60) dayAlerts.push({ type:'Fort vent', level:'orange', text:`Rafales ~ ${maxWindKmH} km/h` });

            // Marine (vagues)
            if (marine && marine.hourly && Array.isArray(marine.hourly.wave_height)){
                const maxWave = Math.round((Math.max(...marine.hourly.wave_height) || 0) * 10) / 10;
                if (maxWave >= 5) dayAlerts.push({ type:'Très hautes vagues', level:'red', text:`Vagues jusqu'à ${maxWave} m` });
                else if (maxWave >= 3) dayAlerts.push({ type:'Hautes vagues', level:'orange', text:`Vagues jusqu'à ${maxWave} m` });
            }

            if (dayAlerts.length){
                levels.push({ date, alerts: dayAlerts });
            }
        });
    }catch(_){ }
    return levels;
}

function renderAlerts(levels){
    const container = document.querySelector('.alerts-container');
    if (!container) return;
    if (!levels || !levels.length){ container.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Aucune alerte significative prévue.</p>'; return; }
    container.innerHTML = levels.map(day => {
        const items = day.alerts.map(a => `
            <div class="alert-card">
                <div class="alert-icon">${a.level==='red'?'🚨':a.level==='orange'?'⚠️':'ℹ️'}</div>
                <div>
                    <div class="alert-title">${a.type} <span class="alert-level level-${a.level}">${a.level.toUpperCase()}</span></div>
                    <div class="alert-detail">${a.text}</div>
                </div>
            </div>
        `).join('');
        return `<div>
            <h3 style="margin:.5rem 0 1rem">${day.date.toUpperCase()}</h3>
            <div class="alerts-container">${items}</div>
        </div>`;
    }).join('');
}

async function handleAlertsSearch(){
    const input = document.querySelector('.search input');
    const q = input ? input.value.trim() : '';
    if (!q){ showError(); return; }
    hideError(); showLoading();
    try{
        // Géocodage + météo/forecast
        let chosen=null; try{ const s=await geocodeSuggest(q); chosen = chooseBestGeocodeCandidate(q,s);}catch(_){ }
        let lat,lon, weatherData, forecastData, marine;
        if (chosen){ lat=chosen.lat; lon=chosen.lon; weatherData = await getWeatherByCoordinates(lat,lon); forecastData = await getForecastByCoordinates(lat,lon); }
        else { weatherData = await getCurrentWeather(q); lat=weatherData.coord.lat; lon=weatherData.coord.lon; forecastData = await getForecastByCoordinates(lat,lon); }
        marine = await getMarineData(lat, lon);
        const levels = assessAlertLevels(forecastData, marine);
        renderAlerts(levels);
        // MAJ bannière
        if (weatherData){ await displayWeather(weatherData, chosen ? (chosen.name||q) : q); }
        hideLoading();
    }catch(e){ hideLoading(); showError('Impossible de générer les alertes'); }
}

function animateWeatherIcons() {
    const icons = document.querySelectorAll('.weather-icon-symbol');
    icons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.5}s`;
    });
}

function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    if (window.scrollY > 100) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
}

function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    e.preventDefault();
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            });
        });
    }

// ========================================
// INITIALISATION
// ========================================

function init() {
    initSmoothScrolling();
    window.addEventListener('scroll', handleHeaderScroll);

    const searchForm = document.querySelector('.search');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Sur premium.html: déclencher un rendu 16 jours
            const premiumGrid = document.getElementById('premiumGrid');
            if (premiumGrid){
                (async () => {
                    const input = searchForm.querySelector('input');
                    const q = input ? input.value.trim() : '';
                    if (!q){ showError('Veuillez entrer une ville'); return; }
                    showLoading();
                    try{
                        let chosen=null; try{ const s=await geocodeSuggest(q); chosen = chooseBestGeocodeCandidate(q,s);}catch(_){ }
                        let lat,lon;
                        if (chosen){ lat=chosen.lat; lon=chosen.lon; }
                        else {
                            const w = await getCurrentWeather(q);
                            lat = w.coord.lat; lon = w.coord.lon;
                        }
                        await renderPremiumForecast(lat, lon);
                        hideLoading();
                    }catch(e){ hideLoading(); showError('Ville introuvable'); }
                })();
                return;
            }
            // Sur alerts.html, on déclenche handleAlertsSearch si la section existe
            if (document.querySelector('.alerts-container')) handleAlertsSearch();
            else handleSearch();
        });
        // Autocomplétion sur saisie
        const input = searchForm.querySelector('input');
        if (input){
            let debounceTimer = null;
            input.addEventListener('input', () => {
                const q = input.value.trim();
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    if (q.length < 2){ closeGeoSuggestions(); return; }
                    try{ const items = await geocodeSuggest(q); renderGeoSuggestions(items); }catch{ closeGeoSuggestions(); }
                }, 250);
            });
            input.addEventListener('blur', () => setTimeout(closeGeoSuggestions, 200));
        }
    }

    displayMoroccoCities();
    // Sur premium.html, initialiser la grille villes + 16 jours
    try{
        if (document.getElementById('premiumGrid')){
            loadPremiumForMoroccoCities();
        }
    }catch(_){ }

    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        const searchInput = document.querySelector('.search input');
        if (searchInput) {
            searchInput.value = lastCity;
        }
    }

    // Initialiser l’état du toggle d’unités et les handlers
    try{
        const btnC = document.querySelector('.unit-c');
        const btnF = document.querySelector('.unit-f');
        if (btnC && btnF){
            const setActive = () => {
                btnC.classList.toggle('active', CURRENT_UNITS === 'metric');
                btnF.classList.toggle('active', CURRENT_UNITS === 'imperial');
            };
            setActive();
            btnC.addEventListener('click', async () => {
                if (CURRENT_UNITS === 'metric') return;
                CURRENT_UNITS = 'metric';
                localStorage.setItem('units', CURRENT_UNITS);
                setActive();
                await reloadDataAfterUnitChange();
            });
            btnF.addEventListener('click', async () => {
                if (CURRENT_UNITS === 'imperial') return;
                CURRENT_UNITS = 'imperial';
                localStorage.setItem('units', CURRENT_UNITS);
                setActive();
                await reloadDataAfterUnitChange();
            });
        }
    }catch(_){}

    // Initialiser la carte radar/satellite si l'élément existe
    try{
        const mapContainer = document.getElementById('radarMap');
        const nasaContainer = document.getElementById('nasaMap');
        if (mapContainer && typeof L !== 'undefined' && !_radarMap){
            _radarMap = L.map('radarMap', { zoomControl: true });
            const center = LAST_COORDS ? [LAST_COORDS.lat, LAST_COORDS.lon] : [31.7917, -7.0926];
            _radarMap.setView(center, 6);
            const base = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                maxZoom: 18,
                attribution: '&copy; OpenStreetMap contributors, © CARTO'
            }).addTo(_radarMap);

            // Libellé personnalisé "Royaume du Maroc" au centre du pays
            try{
                L.marker([31.7917, -7.0926], {
                    icon: L.divIcon({
                        className: 'map-country-label',
                        html: 'Royaume du Maroc',
                        iconSize: [0, 0]
                    }),
                    interactive: false
                }).addTo(_radarMap);
            }catch(_){ }

            // OpenWeather Weather Maps 2.0 layers (static tiles)
            const owPrecip = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
                opacity: 0.7,
                zIndex: 50,
                attribution: 'Weather layers © OpenWeather'
            }).addTo(_radarMap);

            const owClouds = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
                opacity: 0.6,
                zIndex: 49,
                attribution: 'Weather layers © OpenWeather'
            });

            // Préparer une couche Overlay pour le Radar animé (RainViewer)
            const radarOverlay = L.layerGroup();

            const layersControl = L.control.layers({ 'Fond (sans étiquettes)': base }, {
                'Précipitations (OWM)': owPrecip,
                'Nuages (OWM)': owClouds,
                'Radar (animé)': radarOverlay
            }).addTo(_radarMap);

            // Animation Radar (RainViewer) avec contrôles CSS/JS
            const radarFrames = { nowcast: [], past: [] };
            const radarLayers = [];
            let radarIndex = 0;
            let radarTimer = null;
            let radarEnabled = false;
            const slider = document.getElementById('radarSlider');
            const btnPlay = document.getElementById('radarPlay');
            const timestampEl = document.getElementById('radarTimestamp');

            async function loadRainviewerMeta(){
                try{
                    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                    const meta = await res.json();
                    radarFrames.past = (meta && meta.radar && Array.isArray(meta.radar.past)) ? meta.radar.past : [];
                    radarFrames.nowcast = (meta && meta.radar && Array.isArray(meta.radar.nowcast)) ? meta.radar.nowcast : [];
                    const all = [...radarFrames.past, ...radarFrames.nowcast];
                    if (slider){ slider.max = Math.max(all.length - 1, 0); slider.value = String(all.length - 1); }
                    radarLayers.length = 0;
                    all.forEach(f => {
                        const layer = L.tileLayer(`https://tilecache.rainviewer.com/v2/radar/${f.path}/256/{z}/{x}/{y}/2/1_1.png`, {
                            opacity: 0.7,
                            zIndex: 60,
                            pane: 'overlayPane'
                        });
                        radarLayers.push(layer);
                    });
                    radarIndex = all.length - 1;
                    if (radarEnabled) updateFrame();
                }catch(_){ }
            }

            function updateFrame(){
                if (!radarEnabled) return;
                // Retirer toutes les frames précédentes
                radarLayers.forEach(l => { if (_radarMap.hasLayer(l)) _radarMap.removeLayer(l); });
                const layer = radarLayers[radarIndex];
                if (layer) layer.addTo(_radarMap);
                const all = [...radarFrames.past, ...radarFrames.nowcast];
                if (timestampEl && all[radarIndex]){
                    const ts = new Date(all[radarIndex].time * 1000);
                    timestampEl.textContent = ts.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', weekday: 'short' });
                }
                if (slider) slider.value = String(radarIndex);
            }

            function play(){
                if (!radarEnabled) return;
                if (radarTimer) return;
                radarTimer = setInterval(() => {
                    const allCount = radarLayers.length;
                    radarIndex = (radarIndex + 1) % (allCount || 1);
                    updateFrame();
                }, 800);
                if (btnPlay) btnPlay.textContent = '⏸';
            }
            function pause(){
                if (radarTimer){ clearInterval(radarTimer); radarTimer = null; }
                if (btnPlay) btnPlay.textContent = '▶';
            }

            if (btnPlay){
                btnPlay.addEventListener('click', () => {
                    if (!radarEnabled){ radarEnabled = true; updateFrame(); }
                    if (radarTimer) pause(); else play();
                });
            }
            if (slider){
                slider.addEventListener('input', () => {
                    const v = parseInt(slider.value, 10);
                    if (!Number.isNaN(v)) { radarIndex = v; updateFrame(); }
                });
            }

            _radarMap.on('overlayadd', (e) => {
                if (e.layer === radarOverlay){
                    radarEnabled = true;
                    // Assurer le chargement des frames si pas déjà
                    if (radarLayers.length === 0) loadRainviewerMeta();
                    // Ajouter la frame courante
                    updateFrame();
                }
            });
            _radarMap.on('overlayremove', (e) => {
                if (e.layer === radarOverlay){
                    radarEnabled = false;
                    pause();
                    radarLayers.forEach(l => { if (_radarMap.hasLayer(l)) _radarMap.removeLayer(l); });
                }
            });

            // Précharger silencieusement la méta pour réactivité
            loadRainviewerMeta();

            // Ajouter les libellés de tous les pays sauf la RASD (Western Sahara)
            async function loadCountryLabels(){
                try{
                    if (_countryLabelsLayer){ _radarMap.removeLayer(_countryLabelsLayer); }
                    _countryLabelsLayer = L.layerGroup();
                    const url = 'https://geojson.xyz/world/countries.geojson';
                    const r = await fetch(url);
                    if (!r.ok) return;
                    const geo = await r.json();
                    const feats = Array.isArray(geo.features) ? geo.features : [];
                    feats.forEach(f => {
                        const props = f && f.properties ? f.properties : {};
                        const rawName = props.name || props.ADMIN || props.admin || '';
                        const name = String(rawName || '').trim();
                        if (!name) return;
                        const n = name.toLowerCase();
                        // Exclure RASD / Western Sahara et éviter doublon Maroc (on a un libellé personnalisé)
                        if (
                            n.includes('western sahara') ||
                            n.includes('sahrawi') ||
                            n.includes('sahraoui') ||
                            n.includes('sahraouie') ||
                            n.includes('république arabe sahraouie')
                        ) return;
                        if (n === 'morocco' || n === 'maroc') return;
                        try{
                            const tmp = L.geoJSON(f);
                            const layer = tmp.getLayers()[0];
                            if (!layer || !layer.getBounds) return;
                            const center = layer.getBounds().getCenter();
                            L.marker([center.lat, center.lng], {
                                icon: L.divIcon({
                                    className: 'map-country-label country',
                                    html: name,
                                    iconSize: [0,0]
                                }),
                                interactive: false
                            }).addTo(_countryLabelsLayer);
                        }catch(_){ }
                    });
                    _countryLabelsLayer.addTo(_radarMap);
                }catch(_){ }
            }
            loadCountryLabels();
        } else if (mapContainer && _radarMap && LAST_COORDS){
            _radarMap.setView([LAST_COORDS.lat, LAST_COORDS.lon], 7);
        }
    }catch(_){ }
}

// ======================
// Autocomplétion Geocoding
// ======================
async function geocodeSuggest(query){
    if (!query || query.length < 2) return [];
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8&appid=${API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const list = await r.json();
    return Array.isArray(list) ? list : [];
}

function parseLocationQuery(query){
    const parts = String(query || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return { city: '', state: '', country: '' };
    let city = parts[0] || '';
    let state = parts.length === 3 ? parts[1] : '';
    let country = parts.length >= 2 ? parts[parts.length-1] : '';
    return { city, state, country };
}

function countryMatches(queryCountry, itemCountryCode){
    if (!queryCountry) return false;
    const q = queryCountry.toLowerCase();
    if (q.length <= 3 && q.replace(/\./g,'') === String(itemCountryCode || '').toLowerCase()) return true; // codes courts (FR, US, MA)
    try{
        const dn = new Intl.DisplayNames(['fr','en'], { type: 'region' });
        const name = (dn.of(itemCountryCode) || '').toLowerCase();
        if (name && (name === q || name.includes(q) || q.includes(name))) return true;
    }catch(_){ /* ignore */ }
    return false;
}

function chooseBestGeocodeCandidate(query, items){
    if (!Array.isArray(items) || !items.length) return null;
    const { state: qState, country: qCountry } = parseLocationQuery(query);
    // 1) Si pays demandé, filtrer par code/pays
    let filtered = items;
    if (qCountry){
        filtered = items.filter(it => countryMatches(qCountry, it.country));
        if (!filtered.length) filtered = items; // fallback
    }
    // 2) Si état/région précisé, tenter un match sur state
    if (qState){
        const byState = filtered.filter(it => String(it.state || '').toLowerCase().includes(qState.toLowerCase()));
        if (byState.length) filtered = byState;
    }
    // 3) Retourner le premier (API trie déjà par pertinence/population)
    return filtered[0] || items[0];
}

function renderGeoSuggestions(items){
    const container = document.querySelector('.geo-suggestions');
    if (!container) return;
    if (!container.querySelector('.geo-panel')){
        const panel = document.createElement('div');
        panel.className = 'geo-panel';
        container.appendChild(panel);
    }
    const panel = container.querySelector('.geo-panel');
    const makeCountryName = (code)=>{
        if (!code) return '';
        try{ const dn = new Intl.DisplayNames(['fr'], { type: 'region' }); return dn.of(code) || code; }catch{ return code; }
    };
    const rows = [];
    rows.push(`<div class="geo-current" data-current="1"><i class="fas fa-location-arrow"></i> Utiliser le lieu actuel</div>`);
    items.forEach((item, idx) => {
        const title = `${item.name}`;
        const region = item.state ? `${item.state}` : '';
        const country = makeCountryName(item.country);
        rows.push(
            `<div class="geo-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${title}">
                <div class="geo-title">${title}</div>
                <div class="geo-sub" data-sub="${idx}">${region ? region + ', ' : ''}${country}</div>
            </div>`
        );
    });
    panel.innerHTML = rows.join('');
    container.classList.toggle('open', true);

    panel.querySelectorAll('.geo-item').forEach(el => {
        el.addEventListener('click', async () => {
            const lat = parseFloat(el.getAttribute('data-lat'));
            const lon = parseFloat(el.getAttribute('data-lon'));
            const name = el.getAttribute('data-name');
            try{
                const weatherData = await getWeatherByCoordinates(lat, lon);
                await displayWeather(weatherData, name);
                const forecastData = await getForecastByCoordinates(lat, lon);
                const ensemble = await getMultiModelForecast(lat, lon);
                displayForecast(forecastData, ensemble);
                localStorage.setItem('lastSearchedCity', name);
                LAST_COORDS = { lat, lon };
            }catch(e){ console.warn(e); }
            container.classList.remove('open');
        });
    });

    const currentBtn = panel.querySelector('.geo-current');
    if (currentBtn){
        currentBtn.addEventListener('click', () => useCurrentLocation());
    }

    // Enrichir dynamiquement les suggestions sans région via reverse geocoding
    items.forEach(async (item, idx) => {
        if (!item.state){
            try{
                const info = await reverseGeocode(item.lat, item.lon);
                if (info && info.state){
                    const subEl = panel.querySelector(`.geo-sub[data-sub="${idx}"]`);
                    if (subEl){
                        const country = makeCountryName(item.country);
                        subEl.textContent = `${info.state}, ${country}`;
                    }
                }
            }catch(_){ /* ignore */ }
        }
    });
}

function closeGeoSuggestions(){
    const container = document.querySelector('.geo-suggestions');
    if (container){ container.classList.remove('open'); }
}

function useCurrentLocation(){
    if (!navigator.geolocation){ return; }
    navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try{
            const weatherData = await getWeatherByCoordinates(lat, lon);
            await displayWeather(weatherData, weatherData.name);
            const forecastData = await getForecastByCoordinates(lat, lon);
            const ensemble = await getMultiModelForecast(lat, lon);
            displayForecast(forecastData, ensemble);
            localStorage.setItem('lastSearchedCity', weatherData.name);
        }catch(e){ console.warn(e); }
        closeGeoSuggestions();
    }, () => closeGeoSuggestions());
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(init, 100);
    // Initialiser la carte NASA GIBS si présente
    try{
        const el = document.getElementById('nasaMap');
        if (el && typeof L !== 'undefined'){
            const nasaMap = L.map('nasaMap', { zoomControl: true }).setView([31.7917, -7.0926], 5);
            // Fond sans labels
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                maxZoom: 18,
                attribution: '&copy; OpenStreetMap contributors, © CARTO'
            }).addTo(nasaMap);

            // NASA GIBS VIIRS Corrected Reflectance (True Color), quotidien (date au format YYYY-MM-DD)
            function formatYMD(d){
                const y = d.getUTCFullYear();
                const m = String(d.getUTCMonth()+1).padStart(2,'0');
                const dd = String(d.getUTCDate()).padStart(2,'0');
                return `${y}-${m}-${dd}`;
            }
            const today = new Date();
            // Décaler d'1 jour si nécessaire (les tuiles du jour courant peuvent être incomplètes)
            const target = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()-1));
            const dateStr = formatYMD(target);
            const nasaDateEl = document.getElementById('nasaDate');
            if (nasaDateEl) nasaDateEl.textContent = dateStr;

            const gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
            L.tileLayer(gibsUrl, {
                maxZoom: 9,
                opacity: 0.9,
                attribution: 'Imagery © NASA Blue Marble, GIBS'
            }).addTo(nasaMap);
        }
    }catch(_){ }
});

window.AtlasForecast = {
    getCurrentWeather,
    getForecast,
    displayWeather,
    displayForecast,
    handleSearch,
    init
};

// Rechargement des données après changement d'unités
async function reloadDataAfterUnitChange(){
    try{
        showLoading();
        const searchInput = document.querySelector('.search input');
        const city = (searchInput && searchInput.value.trim()) || localStorage.getItem('lastSearchedCity') || null;
        if (city){
            // Re-géocoder pour obtenir coordonnées et éviter les homonymes
            let chosen = null;
            try{
                const suggestions = await geocodeSuggest(city);
                chosen = chooseBestGeocodeCandidate(city, suggestions);
            }catch(_){ }
            let lat, lon, weatherData;
            if (chosen){
                lat = chosen.lat; lon = chosen.lon;
                weatherData = await getWeatherByCoordinates(lat, lon);
            } else {
                weatherData = await getCurrentWeather(city);
                lat = weatherData.coord.lat; lon = weatherData.coord.lon;
            }
            const forecastData = await getForecastByCoordinates(lat, lon);
            const ensemble = await getMultiModelForecast(lat, lon);
            await displayWeather(weatherData, chosen ? (chosen.name || city) : city);
            displayForecast(forecastData, ensemble);
            hideLoading();
        } else {
            // rafraîchir seulement les cartes des villes
            displayMoroccoCities();
            hideLoading();
        }
    }catch(e){
        hideLoading();
        console.warn('Reload units failed:', e);
    }
}

function updateRadarMapCenter(lat, lon){
    try{
        if (_radarMap && typeof lat === 'number' && typeof lon === 'number'){
            _radarMap.setView([lat, lon], Math.max(_radarMap.getZoom(), 5));
        }
    }catch(_){ }
}

// Améliorations UX basiques pour la page Login (toggle mot de passe)
document.addEventListener('DOMContentLoaded', function(){
    try{
        const pwd = document.getElementById('password');
        const toggleBtn = document.getElementById('passwordToggle');
        if (pwd && toggleBtn){
            toggleBtn.addEventListener('click', () => {
                const type = pwd.getAttribute('type') === 'password' ? 'text' : 'password';
                pwd.setAttribute('type', type);
                const icon = toggleBtn.querySelector('i');
                if (icon){ icon.classList.toggle('fa-eye'); icon.classList.toggle('fa-eye-slash'); }
            });
        }
        // Gestion login/register
        const loginForm = document.getElementById('loginForm');
        if (loginForm){
            loginForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                const email = document.getElementById('email')?.value || '';
                const password = document.getElementById('password')?.value || '';
                if (!/.+@.+\..+/.test(email) || password.length < 6){ alert('Vérifiez vos informations.'); return; }
                try{ localStorage.setItem('userEmail', email); }catch(_){ }
                alert('Connexion réussie.');
                window.location.href = 'index.html';
            });
            // Mot de passe oublié
            const forgot = document.querySelector('.forgot-password');
            if (forgot){
                forgot.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href = 'forgot-password.html'; });
            }
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm){
            registerForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                const email = document.getElementById('email')?.value || '';
                const pwd1 = document.getElementById('password')?.value || '';
                const pwd2 = document.getElementById('confirmPassword')?.value || '';
                if (!/.+@.+\..+/.test(email) || pwd1.length < 6 || pwd1 !== pwd2){ alert('Vérifiez vos informations.'); return; }
                try{ localStorage.setItem('userEmail', email); }catch(_){ }
                alert('Inscription réussie.');
                window.location.href = 'login.html';
            });
        }

        // Connexion/Inscription via réseaux sociaux (simulation OAuth)
        function attachSocialAuth(){
            const allSocial = document.querySelectorAll('.social-btn');
            allSocial.forEach(btn => {
                let provider = 'social';
                if (btn.classList.contains('google-btn')) provider = 'Google';
                else if (btn.classList.contains('facebook-btn')) provider = 'Facebook';
                else if (btn.classList.contains('twitter-btn')) provider = 'Twitter';
                btn.addEventListener('click', (e)=>{
                    e.preventDefault();
                    // Rediriger vers pages dédiées
                    if (provider === 'Google') window.location.href = '/auth-google';
                    else if (provider === 'Facebook') window.location.href = '/auth-facebook';
                    else window.location.href = '/auth-x';
                });
            });
        }
        attachSocialAuth();
    }catch(_){ }
});

// ==========================
// Widget Compte (email, premium, logout)
// ==========================
document.addEventListener('DOMContentLoaded', function(){
    try{
        const widget = document.getElementById('accountWidget');
        if (!widget) return;
        const email = localStorage.getItem('userEmail') || '';
        const emailSpan = document.getElementById('accountEmail');
        const emailSpan2 = document.getElementById('accountEmail2');
        const statusDot = document.getElementById('accountStatus');
        const planSpan = document.getElementById('accountPlan');
        if (email){
            widget.style.display = '';
            if (emailSpan) emailSpan.textContent = email;
            if (emailSpan2) emailSpan2.textContent = email;
        }
        const badge = document.getElementById('accountBadge');
        const panel = document.getElementById('accountPanel');
        if (badge && panel){ badge.addEventListener('click', ()=>{ panel.classList.toggle('show'); }); }
        const premium = isPremiumUser();
        if (planSpan) planSpan.textContent = premium ? 'Premium' : 'Visiteur';
        if (statusDot){ statusDot.classList.toggle('premium', premium); }

        const logout = document.getElementById('logoutBtn');
        if (logout){
            logout.addEventListener('click', ()=>{
                try{
                    localStorage.removeItem('userEmail');
                    setPremiumUnlocked(false);
                }catch(_){ }
                window.location.href = 'index.html';
            });
        }
    }catch(_){ }
});

// Soumission des pages provider (démo)
document.addEventListener('DOMContentLoaded', function(){
    const gaForm = document.getElementById('googleAuthForm');
    if (gaForm){
        gaForm.addEventListener('submit', (e)=>{ e.preventDefault(); const email = document.getElementById('gaEmail')?.value||''; if(!/.+@.+\..+/.test(email)) return; localStorage.setItem('userEmail', email); localStorage.setItem('authProvider','Google'); window.location.href='/'; });
    }
    const fbForm = document.getElementById('fbAuthForm');
    if (fbForm){
        fbForm.addEventListener('submit', (e)=>{ e.preventDefault(); const email = document.getElementById('fbEmail')?.value||''; if(!/.+@.+\..+/.test(email)) return; localStorage.setItem('userEmail', email); localStorage.setItem('authProvider','Facebook'); window.location.href='/'; });
    }
    const xForm = document.getElementById('xAuthForm');
    if (xForm){
        xForm.addEventListener('submit', (e)=>{ e.preventDefault(); const email = document.getElementById('xEmail')?.value||''; if(!/.+@.+\..+/.test(email)) return; localStorage.setItem('userEmail', email); localStorage.setItem('authProvider','X'); window.location.href='/'; });
    }
});

// ==========================
// Flux Forgot Password (3 étapes)
// ==========================
document.addEventListener('DOMContentLoaded', function(){
    const forgotForm = document.getElementById('forgotForm');
    const verifyForm = document.getElementById('verifyForm');
    const resetForm = document.getElementById('resetForm');
    if (!forgotForm && !verifyForm && !resetForm) return;
    try{
        const fpError = document.getElementById('fpError');
        const fpSuccess = document.getElementById('fpSuccess');
        const fvError = document.getElementById('fvError');
        const frError = document.getElementById('frError');
        let emailForReset = '';
        let demoCode = '123456';

        if (forgotForm){
            forgotForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                fpError.textContent = ''; fpSuccess.textContent = '';
                const email = document.getElementById('fpEmail')?.value || '';
                if (!/.+@.+\..+/.test(email)){ fpError.textContent = 'Email invalide.'; return; }
                emailForReset = email;
                fpSuccess.textContent = 'Code envoyé à '+email+' (démo).';
                forgotForm.style.display = 'none';
                if (verifyForm) verifyForm.style.display = '';
            });
        }

        if (verifyForm){
            verifyForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                fvError.textContent = '';
                const code = document.getElementById('fpCode')?.value || '';
                if (code !== demoCode){ fvError.textContent = 'Code incorrect.'; return; }
                verifyForm.style.display = 'none';
                if (resetForm) resetForm.style.display = '';
            });
        }

        if (resetForm){
            resetForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                frError.textContent = '';
                const n1 = document.getElementById('fpNew')?.value || '';
                const n2 = document.getElementById('fpConfirm')?.value || '';
                if (n1.length < 6 || n1 !== n2){ frError.textContent = 'Les mots de passe ne correspondent pas.'; return; }
                alert('Mot de passe réinitialisé pour '+emailForReset+' (simulation).');
                window.location.href = 'login.html';
            });
        }
    }catch(_){ }
});

// ==========================
// Gestion accès Premium & paiements (demo)
// ==========================
const PREMIUM_FREE_EMAILS = [
    'rebelestoobaid@gmail.com',
    'obaidrebe@gmail.com',
    'obaidaitmattou2024@gmail.com'
];
function isFreePremiumEmail(email){
    // Désactivé: aucun accès premium gratuit par email
    return false;
}

function isPremiumUser(){
    try{
        const unlocked = localStorage.getItem('premiumUnlocked') === '1';
        if (!unlocked) return false;
        const untilStr = localStorage.getItem('premiumUntil');
        const until = untilStr ? parseInt(untilStr, 10) : 0;
        if (!until || Date.now() >= until) return false;
        return true;
    }catch(_){ return false; }
}
function setPremiumUnlocked(v){
    try{
        localStorage.setItem('premiumUnlocked', v ? '1' : '0');
        if (!v){ localStorage.removeItem('premiumUntil'); }
    }catch(_){ }
}

function activatePremiumForDays(days){
    try{
        const ms = Math.max(1, Number(days)) * 24 * 3600 * 1000;
        const until = Date.now() + ms;
        localStorage.setItem('premiumUnlocked', '1');
        localStorage.setItem('premiumUntil', String(until));
    }catch(_){ }
}

function deactivatePremium(){
    try{
        localStorage.setItem('premiumUnlocked', '0');
        localStorage.removeItem('premiumUntil');
    }catch(_){ }
}

document.addEventListener('DOMContentLoaded', function(){
    try{
        const email = localStorage.getItem('userEmail');
        if (email && isFreePremiumEmail(email)){ setPremiumUnlocked(true); }

        const statusEl = document.getElementById('premiumStatus');
        const pricing = document.getElementById('pricingSection');
        const premiumContent = document.getElementById('premiumContent');
        const paywall = document.getElementById('paywallNotice');
        if (statusEl){
            if (isPremiumUser()){
                const untilStr = localStorage.getItem('premiumUntil');
                const until = untilStr ? parseInt(untilStr, 10) : 0;
                const label = until ? new Date(until).toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'2-digit' }) : '';
                statusEl.textContent = label ? `Premium actif — expire le ${label}.` : 'Premium actif.';
                if (pricing) pricing.style.display = 'none';
                if (premiumContent) premiumContent.style.display = '';
                if (paywall) paywall.style.display = 'none';
            } else {
                statusEl.textContent = 'Version visiteur — abonnez-vous pour accéder aux prévisions Premium.';
                if (premiumContent) premiumContent.style.display = 'none';
                if (paywall) paywall.style.display = '';
            }
        }

        // PayPal Buttons (mode sandbox par défaut — client-id=sb)
        try{
            if (window.paypal && document.getElementById('paypal-buttons')){
                window.paypal.Buttons({
                    style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'subscribe' },
                    createSubscription: function(data, actions) {
                        return actions.subscription.create({
                            plan_id: 'P-TEST16DAY-PLAN' // à remplacer par votre plan réel dans PayPal
                        });
                    },
                    onApprove: function(data, actions) {
                        activatePremiumForDays(30);
                        alert('Paiement confirmé. Premium activé pour 30 jours sur ce navigateur.');
                        if (pricing) pricing.style.display = 'none';
                        if (statusEl){
                            const untilStr = localStorage.getItem('premiumUntil');
                            const until = untilStr ? parseInt(untilStr, 10) : 0;
                            const label = until ? new Date(until).toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'2-digit' }) : '';
                            statusEl.textContent = label ? `Premium actif — expire le ${label}.` : 'Premium actif — merci !';
                        }
                        if (premiumContent) premiumContent.style.display = '';
                        if (paywall) paywall.style.display = 'none';
                    },
                    onError: function(err){ console.warn('PayPal error', err); alert('Paiement non abouti.'); }
                }).render('#paypal-buttons');
            }
        }catch(_){ }

        // Stripe Payment Link (redirection)
        try{
            const stripeBtn = document.getElementById('stripePayBtn');
            if (stripeBtn){
                stripeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Remplacez par votre Payment Link Stripe
                    const paymentLink = 'https://buy.stripe.com/test_1234567890abcdefghijkl';
                    window.location.href = paymentLink;
                });
            }
        }catch(_){ }
    }catch(_){ }
});

// ==========================
// Redirection vers page de paiement (checkout)
// ==========================
document.addEventListener('DOMContentLoaded', function(){
    try{
        const cardBtn = document.getElementById('cardPayBtn');
        const mcBtn = document.getElementById('mcPayBtn');
        const paypalBtn = document.getElementById('paypalPayBtn');
        if (cardBtn){ cardBtn.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href = 'checkout.html?method=card'; }); }
        if (mcBtn){ mcBtn.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href = 'checkout.html?method=mastercard'; }); }
        if (paypalBtn){ paypalBtn.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href = 'checkout.html?method=paypal'; }); }
    }catch(_){ }
});

// ==========================
// Page de paiement (checkout)
// ==========================
function luhnValid(number){
    try{
        const value = String(number||'').replace(/\D/g,'');
        let sum = 0, dbl = false;
        for (let i = value.length - 1; i >= 0; i--){
            let d = parseInt(value[i], 10);
            if (dbl){ d *= 2; if (d > 9) d -= 9; }
            sum += d; dbl = !dbl;
        }
        return (sum % 10) === 0 && value.length >= 13 && value.length <= 19;
    }catch(_){ return false; }
}

document.addEventListener('DOMContentLoaded', function(){
    const checkout = document.getElementById('checkoutForm');
    if (!checkout) return;
    try{
        const params = new URLSearchParams(window.location.search);
        const method = (params.get('method')||'card').toLowerCase();
        const methodLabel = document.getElementById('checkoutMethod');
        if (methodLabel){
            methodLabel.textContent = method === 'paypal' ? 'PayPal' : 'Carte bancaire';
        }
        // Toggle forms
        const cardBlock = document.getElementById('cardBlock');
        const paypalBlock = document.getElementById('paypalBlock');
        if (cardBlock && paypalBlock){
            if (method === 'paypal'){ cardBlock.style.display = 'none'; paypalBlock.style.display = ''; }
            else { cardBlock.style.display = ''; paypalBlock.style.display = 'none'; }
        }

        const submitBtn = document.getElementById('checkoutSubmit');
        const errorEl = document.getElementById('checkoutError');
        const spinner = document.getElementById('checkoutSpinner');
        function setLoading(v){ if (submitBtn){ submitBtn.disabled = v; } if (spinner){ spinner.style.display = v ? '' : 'none'; } }

        checkout.addEventListener('submit', (e)=>{
            e.preventDefault();
            if (errorEl) errorEl.textContent = '';
            let ok = false;
            if (method === 'paypal'){
                const email = document.getElementById('ppEmail')?.value || '';
                const pwd = document.getElementById('ppPassword')?.value || '';
                ok = /.+@.+\..+/.test(email) && pwd.length >= 6;
                if (ok){ try{ localStorage.setItem('userEmail', email); }catch(_){ } }
            } else {
                const name = document.getElementById('ccName')?.value || '';
                const number = document.getElementById('ccNumber')?.value || '';
                const exp = document.getElementById('ccExp')?.value || '';
                const cvc = document.getElementById('ccCvc')?.value || '';
                const email = document.getElementById('ccEmail')?.value || '';
                const expOk = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(exp);
                ok = name.length >= 2 && luhnValid(number) && expOk && /\d{3,4}/.test(cvc) && /.+@.+\..+/.test(email);
                if (ok){ try{ localStorage.setItem('userEmail', email); }catch(_){ } }
            }
            if (!ok){ if (errorEl) errorEl.textContent = 'Informations de paiement invalides. Veuillez réessayer.'; return; }

            setLoading(true);
            setTimeout(()=>{
                // Simuler succès 85% du temps
                const success = Math.random() < 0.85;
                setLoading(false);
                if (success){
                    activatePremiumForDays(30);
                    window.location.href = 'premium.html#activated';
                } else {
                    if (errorEl) errorEl.textContent = 'Paiement refusé par l’établissement. Vérifiez vos informations et réessayez.';
                }
            }, 1200);
        });
    }catch(_){ }
});

// ==========================
// Premium signup → rediriger vers checkout
// ==========================
document.addEventListener('DOMContentLoaded', function(){
    const psForm = document.getElementById('premiumSignupForm');
    if (!psForm) return;
    try{
        psForm.addEventListener('submit', (e)=>{
            e.preventDefault();
            const email = document.getElementById('psEmail')?.value || '';
            if (/.+@.+\..+/.test(email)){
                try{ localStorage.setItem('userEmail', email); }catch(_){ }
                window.location.href = 'checkout.html?method=card';
            }
        });
    }catch(_){ }
});

// === Weather page compatibility adapter ===
document.addEventListener('DOMContentLoaded', function () {
    try { initWeatherPageCompatibility(); } catch (e) { console.warn(e); }
});

function initWeatherPageCompatibility() {
    const input = document.getElementById('citySearchInput');
    const btn = document.getElementById('searchBtn');
    const unitSel = document.getElementById('unitSelect');

    // Only run on weather.html
    if (!input || !btn) return;

    // Initialize unit selector from CURRENT_UNITS
    if (unitSel) {
        unitSel.value = (CURRENT_UNITS === 'imperial') ? 'imperial' : 'metric';
        unitSel.addEventListener('change', (e) => {
            CURRENT_UNITS = e.target.value === 'imperial' ? 'imperial' : 'metric';
            try { localStorage.setItem('units', CURRENT_UNITS); } catch (_) {}
        });
    }

    // Search triggers
    btn.addEventListener('click', () => performWeatherPageSearch(input.value.trim()));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performWeatherPageSearch(input.value.trim());
        }
    });

    // Restore last searched city if exists
    try {
        const last = localStorage.getItem('lastSearchedCity');
        if (last) input.value = last;
    } catch (_) {}
}

async function performWeatherPageSearch(q) {
    if (!q) { weatherPageShowError('Veuillez entrer une ville'); return; }
    weatherPageShowLoading(true);
    weatherPageShowError(null);
    try {
        // Use best geocode candidate worldwide
        let chosen = null;
        try { const s = await geocodeSuggest(q); chosen = chooseBestGeocodeCandidate(q, s); } catch (_) {}

        let lat, lon, name = q;
        let weatherData, forecastData;

        if (chosen) {
            lat = chosen.lat; lon = chosen.lon; name = chosen.name || q;
            weatherData = await getWeatherByCoordinates(lat, lon);
            forecastData = await getForecastByCoordinates(lat, lon);
        } else {
            weatherData = await getCurrentWeather(q);
            lat = weatherData.coord.lat; lon = weatherData.coord.lon;
            forecastData = await getForecastByCoordinates(lat, lon);
        }

        await renderWeatherPageData(name, weatherData, forecastData);
        LAST_COORDS = { lat, lon };
        updateRadarMapCenter(lat, lon);
        weatherPageShowLoading(false);
        try { localStorage.setItem('lastSearchedCity', name); } catch (_) {}
    } catch (e) {
        weatherPageShowLoading(false);
        weatherPageShowError('Ville non trouvée ou erreur réseau');
        console.warn('Weather page search failed:', e);
    }
}

async function renderWeatherPageData(name, weatherData, forecastData) {
    // Reveal display block
    const display = document.getElementById('weatherDisplay');
    if (display) display.style.display = '';

    // Elements
    const cityEl = document.getElementById('cityName');
    const regionEl = document.getElementById('region');
    const countryEl = document.getElementById('country');
    const coordEl = document.getElementById('coordinates');
    const tempEl = document.getElementById('temperature');
    const unitEl = document.getElementById('tempUnit');
    const descEl = document.getElementById('weatherDescription');
    const feelsEl = document.getElementById('feelsLike');
    const tminEl = document.getElementById('tempMin');
    const tmaxEl = document.getElementById('tempMax');
    const humEl = document.getElementById('humidity');
    const windEl = document.getElementById('windSpeed');
    const windUnitEl = document.getElementById('windUnit');
    const pressEl = document.getElementById('pressure');
    const visEl = document.getElementById('visibility');
    const iconEl = document.getElementById('weatherIcon');

    // City/coords
    if (cityEl) cityEl.textContent = name || (weatherData && weatherData.name) || '--';
    if (coordEl && weatherData && weatherData.coord) {
        try { coordEl.textContent = `${Number(weatherData.coord.lat).toFixed(2)}, ${Number(weatherData.coord.lon).toFixed(2)}`; } catch (_) {}
    }

    // Region/country via reverse geocode if possible
    let region = '';
    let country = weatherData && weatherData.sys && weatherData.sys.country ? weatherData.sys.country : '';
    try {
        const info = await reverseGeocode(weatherData.coord.lat, weatherData.coord.lon);
        if (info) {
            region = info.state || region;
            country = info.country || country;
        }
    } catch (_) {}
    try {
        if (country && country.length === 2 && typeof Intl !== 'undefined' && Intl.DisplayNames) {
            const dn = new Intl.DisplayNames(['fr'], { type: 'region' });
            country = dn.of(country) || country;
        }
    } catch (_) {}
    if (regionEl) regionEl.textContent = region || '—';
    if (countryEl) countryEl.textContent = country || '—';

    // Weather main
    const unitLabel = (CURRENT_UNITS === 'imperial') ? '°F' : '°C';
    if (unitEl) unitEl.textContent = unitLabel;
    if (tempEl && weatherData && weatherData.main) tempEl.textContent = Math.round(weatherData.main.temp);
    if (feelsEl && weatherData && weatherData.main) feelsEl.textContent = Math.round(weatherData.main.feels_like) + unitLabel;
    if (descEl && weatherData && weatherData.weather && weatherData.weather[0]) {
        const d = weatherData.weather[0].description || '';
        descEl.textContent = d;
    }

    // Min/Max (use current if available, else fallback to forecast window)
    let tmin = weatherData?.main?.temp_min;
    let tmax = weatherData?.main?.temp_max;
    if (tmin == null || tmax == null) {
        try {
            if (forecastData && Array.isArray(forecastData.list) && forecastData.list.length) {
                const temps = forecastData.list.map(f => (f.main && typeof f.main.temp === 'number') ? f.main.temp : null).filter(v => v != null);
                if (temps.length) {
                    tmin = Math.min(...temps);
                    tmax = Math.max(...temps);
                }
            }
        } catch (_) {}
    }
    if (tminEl && tmin != null) tminEl.textContent = Math.round(tmin) + unitLabel;
    if (tmaxEl && tmax != null) tmaxEl.textContent = Math.round(tmax) + unitLabel;

    // Details
    if (humEl && weatherData?.main?.humidity != null) humEl.textContent = weatherData.main.humidity + '%';
    if (pressEl && weatherData?.main?.pressure != null) pressEl.textContent = weatherData.main.pressure + ' hPa';

    const windMps = weatherData?.wind?.speed || 0;
    let windDisplay = windMps;
    let windUnit = 'm/s';
    if (CURRENT_UNITS === 'imperial') { windDisplay = Math.round(windMps); windUnit = 'mph'; }
    else { windDisplay = Math.round(windMps * 3.6); windUnit = 'km/h'; }
    if (windEl) windEl.textContent = String(windDisplay);
    if (windUnitEl) windUnitEl.textContent = windUnit;

    const visKm = weatherData?.visibility ? Math.round(weatherData.visibility / 1000) : 0;
    if (visEl) visEl.textContent = visKm + ' km';

    // Icon
    if (iconEl) {
        const code = weatherData?.weather?.[0]?.icon || '';
        iconEl.className = faIconFromOwm(code);
    }
}

function faIconFromOwm(code) {
    const map = {
        '01d': 'fas fa-sun', '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun', '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud', '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud', '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-showers-heavy', '09n': 'fas fa-cloud-showers-heavy',
        '10d': 'fas fa-cloud-rain', '10n': 'fas fa-cloud-rain',
        '11d': 'fas fa-bolt', '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake', '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog', '50n': 'fas fa-smog'
    };
    return map[code] || 'fas fa-cloud';
}

function weatherPageShowLoading(v) {
    const s = document.getElementById('loadingSection');
    if (s) s.style.display = v ? '' : 'none';
}
function weatherPageShowError(msg) {
    const sec = document.getElementById('errorSection');
    const el = document.getElementById('errorMessage');
    if (!sec) return;
    if (!msg) { sec.style.display = 'none'; return; }
    if (el) el.textContent = msg;
    sec.style.display = '';
}

// === Weather page suggestions adapter ===
document.addEventListener('DOMContentLoaded', function () {
    try { initWeatherSuggestions(); } catch (e) { console.warn(e); }
});

function debounce(fn, wait) {
    let t = null;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

function initWeatherSuggestions() {
    const input = document.getElementById('citySearchInput');
    const panel = document.getElementById('searchSuggestions');
    const btn = document.getElementById('searchBtn');
    if (!input || !panel) return;

    // Prevent double-binding
    if (input.dataset.wpBound === '1') return;
    input.dataset.wpBound = '1';

    // Live suggestions
    const fetchAndRender = debounce(async () => {
        const q = (input.value || '').trim();
        if (q.length < 2) { wpHideSuggestions(); return; }
        try {
            const items = await geocodeSuggest(q);
            wpRenderSuggestions(items, panel);
        } catch {
            wpHideSuggestions();
        }
    }, 250);

    input.addEventListener('input', fetchAndRender);
    input.addEventListener('focus', fetchAndRender);

    // Click outside closes
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== input) {
            wpHideSuggestions();
        }
    });

    // Ensure clicking search also closes suggestions
    if (btn) {
        btn.addEventListener('click', () => wpHideSuggestions());
    }
}

function wpRenderSuggestions(items, panel) {
    if (!panel) return;
    if (!Array.isArray(items)) items = [];
    if (!items.length) {
        panel.innerHTML = '<div class="no-results">Aucune ville trouvée</div>';
        panel.style.display = 'block';
        return;
    }

    const makeRow = (item, idx) => {
        const name = item.name || '';
        const country = item.country || '';
        const lat = item.lat;
        const lon = item.lon;
        const code = String(country || '').toUpperCase();
        return `
            <div class="suggestion-item" data-lat="${lat}" data-lon="${lon}" data-name="${name}" data-idx="${idx}"
                 style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:1rem;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;">
                <div class="suggestion-content">
                    <div class="city-name" style="font-weight:800">${name}</div>
                    <div class="city-country" style="color:var(--text-secondary);font-weight:700">${code}</div>
                </div>
                <button class="suggestion-pin" title="Choisir"
                        style="border:none;background:transparent;color:var(--accent-primary);font-size:1.05rem;cursor:pointer">
                    <i class="fas fa-map-marker-alt"></i>
                </button>
            </div>`;
    };

    const currentLoc = `
        <div class="suggestion-item current" data-current="1"
             style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:1rem;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;">
            <div class="suggestion-content">
                <div class="city-name" style="font-weight:800">Utiliser ma position actuelle</div>
                <div class="city-country" style="color:var(--text-secondary);font-weight:700">GPS</div>
            </div>
            <button class="suggestion-pin" title="Localiser"
                    style="border:none;background:transparent;color:var(--accent-primary);font-size:1.05rem;cursor:pointer">
                <i class="fas fa-location-arrow"></i>
            </button>
        </div>`;

    panel.innerHTML = currentLoc + items.map(makeRow).join('');
    panel.style.display = 'block';

    // Bind clicks
    panel.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();
            const useCurrent = el.getAttribute('data-current') === '1';
            if (useCurrent) {
                wpHideSuggestions();
                useCurrentLocation();
                return;
            }
            const lat = parseFloat(el.getAttribute('data-lat'));
            const lon = parseFloat(el.getAttribute('data-lon'));
            const name = el.getAttribute('data-name') || '';
            try {
                const weatherData = await getWeatherByCoordinates(lat, lon);
                const forecastData = await getForecastByCoordinates(lat, lon);
                await renderWeatherPageData(name, weatherData, forecastData);
                LAST_COORDS = { lat, lon };
                updateRadarMapCenter(lat, lon);
                try { localStorage.setItem('lastSearchedCity', name); } catch (_) {}
            } catch (err) {
                console.warn(err);
            }
            wpHideSuggestions();
        });
    });
}

function wpHideSuggestions() {
    const panel = document.getElementById('searchSuggestions');
    if (panel) panel.style.display = 'none';
}
