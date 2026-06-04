// API Configuration
export const API_KEY = import.meta.env.VITE_OWM_API_KEY || '47c1019c93bf4a70c11537bebf481926'
export const BASE_URL = 'https://api.openweathermap.org/data/2.5'
export const MOROCCO_CITIES = [
  { name: 'Casablanca', state: 'Casablanca-Settat', lat: 33.5731, lon: -7.5898 },
  { name: 'Rabat', state: 'Rabat-Salé-Kénitra', lat: 34.0209, lon: -6.8416 },
  { name: 'Marrakech', state: 'Marrakech-Safi', lat: 31.6295, lon: -7.9811 },
  { name: 'Fès', state: 'Fès-Meknès', lat: 34.0181, lon: -5.0078 },
  { name: 'Agadir', state: 'Souss-Massa', lat: 30.4278, lon: -9.5981 },
  { name: 'Tanger', state: 'Tanger-Tétouan-Al Hoceïma', lat: 35.7595, lon: -5.8340 },
]
export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=61578902663416&locale=fr_FR',
  whatsapp: 'https://wa.me/212645508349',
  instagram: 'https://www.instagram.com/obaid.sr46/',
  linkedin: 'https://www.linkedin.com/in/obaid-ait-mattou-2b058130b',
  github: 'https://github.com/Obaid-dev-rebelesto'
}
export const NAV_LINKS = [
  { to: '/', label: 'Accueil', icon: 'fas fa-home' },
  { to: '/weather', label: 'Météo', icon: 'fas fa-cloud-sun' },
  { to: '/forecast', label: 'Prévisions', icon: 'fas fa-chart-line' },
  { to: '/alerts', label: 'Alertes', icon: 'fas fa-bell' },
  { to: '/about', label: 'À propos', icon: 'fas fa-info-circle' },
  { to: '/contact', label: 'Contact', icon: 'fas fa-envelope' }
]
// Weather API helpers
export async function getWeatherByCoordinates(lat, lon, units = 'metric') {
  const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=fr&units=${units}`)
  if (!res.ok) throw new Error('Erreur météo'); 
  return res.json()
}
export async function geocodeCity(city) {
  const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`)
  if (!res.ok) throw new Error('Erreur géocodage'); 
  return res.json()
}
export async function getForecastByCoordinates(lat, lon, units = 'metric') {
  const res = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=fr&units=${units}`)
  if (!res.ok) throw new Error('Erreur prévisions'); 
  return res.json()
}
export async function getOpenMeteoDailyForecast(lat, lon) {
  try { const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=5&timezone=auto`); 
  if (!r.ok) return null; const d = await r.json(); return { dates: d.daily?.time||[], tmax: d.daily?.temperature_2m_max||[], tmin: d.daily?.temperature_2m_min||[] }
 } catch { return null }
}
export function getWeatherFAIcon(code) {
  const m = {'01d':'fa-sun','01n':'fa-moon','02d':'fa-cloud-sun','02n':'fa-cloud-moon','03d':'fa-cloud','03n':'fa-cloud','04d':'fa-cloud','04n':'fa-cloud','09d':'fa-cloud-showers-heavy','09n':'fa-cloud-showers-heavy','10d':'fa-cloud-sun-rain','10n':'fa-cloud-moon-rain','11d':'fa-bolt','11n':'fa-bolt','13d':'fa-snowflake','13n':'fa-snowflake','50d':'fa-smog','50n':'fa-smog'}
  return m[code] || 'fa-cloud-sun'
}
export function getWeatherIcon(code) {
  const m = {'01d':'☀️','01n':'🌙','02d':'⛅','02n':'☁️','03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️','09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌧️','11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️','50d':'🌫️','50n':'🌫️'}
  return m[code] || '🌤️'
}
export function formatTime(ts) { return new Date(ts * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }

export function formatDateFromCityLocalMid(utcSec, tz) { const l = new Date((utcSec + tz) * 1000); return l.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase() }

export function getCountryName(code) { if (!code || code.length !== 2) return code || ''; try { return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) || code } catch { return code } }
export function groupDailyHighLow(list, tz) {
  const byDay = {}


  list.forEach(f => { const l = new Date((f.dt + tz) * 1000); const k = new Date(l.getFullYear(), l.getMonth(), l.getDate()).getTime(); const t = f.main?.temp; if (!byDay[k]) byDay[k] = { key: k, tmax: -Infinity, tmin: Infinity, precip: 0, icons: {},
   descs: {} }; if (t != null && t > byDay[k].tmax) byDay[k].tmax = t;
   
   if (t != null && t < byDay[k].tmin) byDay[k].tmin = t; byDay[k].precip += (f.rain?.['3h']||0) + (f.snow?.['3h']||0); 
   const ic = f.weather?.[0]?.icon||'01d';
   
   const dc = f.weather?.[0]?.description||''; byDay[k].icons[ic] = (byDay[k].icons[ic]||0)+1; byDay[k].descs[dc] = (byDay[k].descs[dc]||0)+1 })


  const pick = m => Object.entries(m).sort((a,b) => b[1]-a[1])[0]?.[0]

  
  return Object.values(byDay).map(d => { const b = new Date(d.key); b.setHours(12,0,0,0); 
    
    return { dateLocalMidUtcSec: Math.floor(b.getTime()/1000)-tz, tmax: d.tmax===-Infinity?0:d.tmax, tmin: d.tmin===Infinity?0:d.tmin, precip: Math.round(d.precip*10)/10, icon: pick(d.icons)||'01d', description: pick(d.descs)||'' } }).sort((a,b) => a.dateLocalMidUtcSec-b.dateLocalMidUtcSec)
}
