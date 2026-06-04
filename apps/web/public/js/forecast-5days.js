
class Forecast5Days {
    constructor() {
        this.apiKey = '47c1019c93bf4a70c11537bebf481926'; // Clé API unifiée
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
        this.currentCity = null;
        this.currentUnit = 'metric';
        this.forecastData = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadLastSearch();
    }

    bindEvents() {
        // Écouteur pour le changement d'unités
        const unitSelect = document.getElementById('unit-select') || document.getElementById('unitSelect');
        if (unitSelect) {
            unitSelect.addEventListener('change', (e) => {
                this.currentUnit = e.target.value === 'imperial' ? 'imperial' : 'metric';
                if (this.forecastData) {
                    this.displayForecast(this.forecastData);
                }
            });
        }

        // Écouteur pour la recherche
        const searchInput = document.getElementById('citySearch') || document.getElementById('citySearchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchCity(searchInput.value.trim());
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchCity(searchInput.value.trim());
                }
            });
        }

        // Écouteur pour le bouton de retry
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('retry-btn')) {
                this.loadForecast(this.currentCity);
            }
        });
    }

    /**
     * Charge les prévisions pour une ville
     */
    async loadForecast(city) {
        if (!city) return;

        this.currentCity = city;
        this.showLoading();

        try {
            const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.currentUnit}&lang=fr`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const data = await response.json();
            this.forecastData = data;
            this.displayForecast(data);
            this.saveLastSearch(city);

        } catch (error) {
            console.error('Erreur lors du chargement des prévisions:', error);
            this.showError(error.message);
        }
    }

    /**
     * Affiche le message de chargement
     */
    showLoading() {
        const container = document.getElementById('forecast-5days-container');
        if (!container) return;

        container.innerHTML = `
            <div class="forecast-loading">
                <div class="loading-spinner"></div>
                <i class="fas fa-cloud-sun"></i>
                <h3>Chargement des prévisions...</h3>
                <p>Récupération des données météorologiques</p>
            </div>
        `;
    }

    /**
     * Affiche le message d'erreur
     */
    showError(message) {
        const container = document.getElementById('forecast-5days-container');
        if (!container) return;

        container.innerHTML = `
            <div class="forecast-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur de chargement</h3>
                <p>${message}</p>
                <button class="retry-btn">
                    <i class="fas fa-redo"></i>
                    Réessayer
                </button>
            </div>
        `;
    }

    /**
     * Affiche les prévisions 5 jours
     */
    displayForecast(data) {
        const container = document.getElementById('forecast-5days-container');
        if (!container) return;

        // Grouper les prévisions par jour
        const dailyForecasts = this.groupForecastsByDay(data.list);

        let html = `
            <div class="forecast-5days-section">
                <h2 class="forecast-5days-title">
                    <i class="fas fa-calendar-week"></i>
                    Prévisions 5 jours - ${data.city.name}, ${data.city.country}
                </h2>
                <div class="forecast-days-grid">
        `;

        dailyForecasts.forEach((dayData, index) => {
            html += this.createDayCard(dayData, index);
        });

        html += `
                </div>
                <div class="forecast-summary">
                    ${this.createForecastSummary(dailyForecasts)}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Animer les cartes
        setTimeout(() => {
            const cards = container.querySelectorAll('.forecast-day-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
    }

    /**
     * Groupe les prévisions par jour
     */
    groupForecastsByDay(forecasts) {
        const dailyData = {};

        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];

            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    date: date,
                    forecasts: [],
                    tempMin: forecast.main.temp_min,
                    tempMax: forecast.main.temp_max,
                    mainWeather: forecast.weather[0],
                    humidity: forecast.main.humidity,
                    windSpeed: forecast.wind.speed,
                    windDirection: forecast.wind.deg,
                    pressure: forecast.main.pressure,
                    rainProbability: 0,
                    rainAmount: 0
                };
            }

            dailyData[dateKey].forecasts.push(forecast);
            dailyData[dateKey].tempMin = Math.min(dailyData[dateKey].tempMin, forecast.main.temp_min);
            dailyData[dateKey].tempMax = Math.max(dailyData[dateKey].tempMax, forecast.main.temp_max);

            // Calculer la probabilité de pluie moyenne
            if (forecast.pop) {
                dailyData[dateKey].rainProbability = Math.max(dailyData[dateKey].rainProbability, forecast.pop * 100);
            }

            // Calculer les précipitations
            if (forecast.rain && forecast.rain['3h']) {
                dailyData[dateKey].rainAmount += forecast.rain['3h'];
            }
        });

        return Object.values(dailyData).slice(0, 5);
    }

    /**
     * Crée une carte pour un jour
     */
    createDayCard(dayData, index) {
        const date = dayData.date;
        const isToday = this.isToday(date);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        const dayName = this.getDayName(date, isToday);
        const dateStr = this.formatDate(date);
        const weatherIcon = this.getWeatherIcon(dayData.mainWeather.id);
        const tempMax = Math.round(dayData.tempMax);
        const tempMin = Math.round(dayData.tempMin);
        const tempClass = this.getTempClass(tempMax);

        return `
            <div class="forecast-day-card ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}" 
                 style="opacity: 0; transform: translateY(20px);">
                
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-date">${dateStr}</div>
                </div>
                
                <div class="day-weather-main">
                    <div class="weather-icon-large">
                        <i class="${weatherIcon}"></i>
                    </div>
                    
                    <div class="temperature-display">
                        <span class="temp-max ${tempClass}">${tempMax}°</span>
                        <span class="temp-separator">/</span>
                        <span class="temp-min">${tempMin}°</span>
                    </div>
                    
                    <div class="weather-description">
                        ${dayData.mainWeather.description}
                    </div>
                    
                    <div class="feels-like">
                        Ressenti ${Math.round(dayData.forecasts[0].main.feels_like)}°
                    </div>
                </div>
                
                <div class="day-weather-details">
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-tint detail-icon"></i>
                            Humidité
                        </span>
                        <span class="detail-value">${dayData.humidity}%</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-wind detail-icon"></i>
                            Vent
                        </span>
                        <span class="detail-value">${Math.round(dayData.windSpeed)} ${this.getWindUnit()}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-thermometer-half detail-icon"></i>
                            Pression
                        </span>
                        <span class="detail-value">${dayData.pressure} hPa</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-compass detail-icon"></i>
                            Direction
                        </span>
                        <span class="detail-value">${this.getWindDirection(dayData.windDirection)}</span>
                    </div>
                    
                    <div class="rain-probability">
                        <div class="rain-probability-label">
                            <span class="rain-label">
                                <i class="fas fa-cloud-rain detail-icon"></i>
                                Précipitations
                            </span>
                            <span class="rain-percentage">${Math.round(dayData.rainProbability)}%</span>
                        </div>
                        <div class="rain-bar">
                            <div class="rain-fill" style="width: ${dayData.rainProbability}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crée un résumé des prévisions
     */
    createForecastSummary(dailyForecasts) {
        const avgTemp = dailyForecasts.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / dailyForecasts.length;
        const avgHumidity = dailyForecasts.reduce((sum, day) => sum + day.humidity, 0) / dailyForecasts.length;
        const avgWind = dailyForecasts.reduce((sum, day) => sum + day.windSpeed, 0) / dailyForecasts.length;
        const rainyDays = dailyForecasts.filter(day => day.rainProbability > 50).length;

        return `
            <div class="forecast-summary-grid">
                <div class="summary-card">
                    <i class="fas fa-thermometer-half"></i>
                    <div class="summary-content">
                        <div class="summary-value">${Math.round(avgTemp)}°</div>
                        <div class="summary-label">Température moyenne</div>
                    </div>
                </div>
                
                <div class="summary-card">
                    <i class="fas fa-tint"></i>
                    <div class="summary-content">
                        <div class="summary-value">${Math.round(avgHumidity)}%</div>
                        <div class="summary-label">Humidité moyenne</div>
                    </div>
                </div>
                
                <div class="summary-card">
                    <i class="fas fa-wind"></i>
                    <div class="summary-content">
                        <div class="summary-value">${Math.round(avgWind)} ${this.getWindUnit()}</div>
                        <div class="summary-label">Vent moyen</div>
                    </div>
                </div>
                
                <div class="summary-card">
                    <i class="fas fa-cloud-rain"></i>
                    <div class="summary-content">
                        <div class="summary-value">${rainyDays}</div>
                        <div class="summary-label">Jours pluvieux</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Méthodes utilitaires

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getDayName(date, isToday) {
        if (isToday) return 'Aujourd\'hui';

        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return days[date.getDay()];
    }

    isTomorrow(date)
     {
        const tomorrow = new date();
        return date.toDateString() === tomorrow.toDateString();
    }

    formatDate(date) {
        const options = {
            day: 'numeric',
            month: 'short'
        };
        return date.toLocaleDateString('fr-FR', options);
    }

    getWeatherIcon(weatherId) {
        const iconMap = {
            200: 'fas fa-bolt', // Orage avec pluie légère
            201: 'fas fa-bolt', // Orage avec pluie
            202: 'fas fa-bolt', // Orage avec pluie forte
            210: 'fas fa-bolt', // Orage léger
            211: 'fas fa-bolt', // Orage
            212: 'fas fa-bolt', // Orage fort
            221: 'fas fa-bolt', // Orage irrégulier
            230: 'fas fa-bolt', // Orage avec bruine légère
            231: 'fas fa-bolt', // Orage avec bruine
            232: 'fas fa-bolt', // Orage avec bruine forte

            300: 'fas fa-cloud-drizzle', // Bruine légère
            301: 'fas fa-cloud-drizzle', // Bruine
            302: 'fas fa-cloud-drizzle', // Bruine forte
            310: 'fas fa-cloud-rain', // Bruine légère
            311: 'fas fa-cloud-rain', // Bruine
            312: 'fas fa-cloud-rain', // Bruine forte
            313: 'fas fa-cloud-rain', // Pluie et bruine
            314: 'fas fa-cloud-rain', // Pluie forte et bruine
            321: 'fas fa-cloud-rain', // Bruine

            500: 'fas fa-cloud-rain', // Pluie légère
            501: 'fas fa-cloud-rain', // Pluie modérée
            502: 'fas fa-cloud-rain', // Pluie forte
            503: 'fas fa-cloud-rain', // Pluie très forte
            504: 'fas fa-cloud-rain', // Pluie extrême
            511: 'fas fa-cloud-rain', // Pluie verglaçante
            520: 'fas fa-cloud-showers-heavy', // Averse légère
            521: 'fas fa-cloud-showers-heavy', // Averse
            522: 'fas fa-cloud-showers-heavy', // Averse forte
            531: 'fas fa-cloud-showers-heavy', // Averse irrégulière

            600: 'fas fa-snowflake', // Neige légère
            601: 'fas fa-snowflake', // Neige
            602: 'fas fa-snowflake', // Neige forte
            611: 'fas fa-cloud-meatball', // Grésil
            612: 'fas fa-cloud-meatball', // Grésil léger
            613: 'fas fa-cloud-meatball', // Grésil
            615: 'fas fa-cloud-meatball', // Pluie et neige légères
            616: 'fas fa-cloud-meatball', // Pluie et neige
            620: 'fas fa-snowflake', // Averse de neige légère
            621: 'fas fa-snowflake', // Averse de neige
            622: 'fas fa-snowflake', // Averse de neige forte

            701: 'fas fa-smog', // Brume
            711: 'fas fa-smog', // Fumée
            721: 'fas fa-smog', // Brume
            731: 'fas fa-smog', // Tourbillons de sable/poussière
            741: 'fas fa-smog', // Brouillard
            751: 'fas fa-smog', // Sable
            761: 'fas fa-smog', // Poussière
            762: 'fas fa-smog', // Cendres volcaniques
            771: 'fas fa-wind', // Rafales
            781: 'fas fa-tornado', // Tornade

            800: 'fas fa-sun', // Ciel clair
            801: 'fas fa-cloud-sun', // Peu nuageux
            802: 'fas fa-cloud-sun', // Partiellement nuageux
            803: 'fas fa-cloud', // Très nuageux
            804: 'fas fa-cloud' // Couvert
        };

        return iconMap[weatherId] || 'fas fa-cloud';
    }

    getTempClass(temp) {
        if (temp >= 35) return 'temp-very-hot';
        if (temp >= 30) return 'temp-hot';
        if (temp >= 25) return 'temp-warm';
        if (temp >= 15) return 'temp-mild';
        if (temp >= 5) return 'temp-cool';
        if (temp >= -5) return 'temp-cold';
        return 'temp-very-cold';
    }

    getWindUnit() {
        return this.currentUnit === 'imperial' ? 'mph' : 'm/s';
    }

    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    saveLastSearch(city) {
        localStorage.setItem('forecast5days_lastSearch', city);
    }

    loadLastSearch() {
        const lastSearch = localStorage.getItem('forecast5days_lastSearch');
        if (lastSearch) {
            this.loadForecast(lastSearch);
        }
    }

    // Méthodes publiques pour l'intégration

    /**
     * Charge les prévisions pour une ville (méthode publique)
     */
    searchCity(city) {
        this.loadForecast(city);
    }

    /**
     * Change l'unité de température
     */
    setUnit(unit) {
        this.currentUnit = unit;
        if (this.forecastData) {
            this.displayForecast(this.forecastData);
        }
    }

    /**
     * Rafraîchit les prévisions
     */
    refresh() {
        if (this.currentCity) {
            this.loadForecast(this.currentCity);
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.forecast5Days = new Forecast5Days();
});

// Export pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Forecast5Days;
}
