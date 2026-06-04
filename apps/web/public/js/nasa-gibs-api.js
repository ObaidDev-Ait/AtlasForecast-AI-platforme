
class NASAGIBSMap {
    constructor() {
        this.map = null;
        this.gibsLayer = null;
        this.currentLayer = 'MODIS_Terra_CorrectedReflectance_TrueColor';
        this.currentDate = new Date().toISOString().slice(0, 10);
        
        // Plages de dates pour chaque couche
        this.layerDates = {
            'MODIS_Terra_CorrectedReflectance_TrueColor': {
                start: '2000-02-24',
                end: new Date().toISOString().slice(0, 10),
                step: 1
            },
            'MODIS_Aqua_CorrectedReflectance_TrueColor': {
                start: '2002-07-04',
                end: new Date().toISOString().slice(0, 10),
                step: 1
            },
            'VIIRS_SNPP_CorrectedReflectance_TrueColor': {
                start: '2012-01-19',
                end: new Date().toISOString().slice(0, 10),
                step: 1
            },
            'VIIRS_NOAA20_CorrectedReflectance_TrueColor': {
                start: '2018-01-01',
                end: new Date().toISOString().slice(0, 10),
                step: 1
            },
            'BlueMarble_ShadedRelief': {
                start: '2004-01-01',
                end: '2004-12-01',
                step: 30
            }
        };
        
        this.init();
    }
    
    init() {
        this.initializeMap();
        this.initializeControls();
        this.loadInitialLayer();
    }
    
    initializeMap() {
        // Vérifier que Leaflet est chargé
        if (typeof L === 'undefined') {
            console.error('Leaflet n\'est pas chargé');
            return;
        }
        
        // Créer la carte
        this.map = L.map('gibsMap', {
            center: [31.63, -7.99], // Marrakech
            zoom: 5,
            zoomControl: true,
            attributionControl: false
        });
        
        // Ajouter la couche de base OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);
        
        console.log('Carte NASA GIBS initialisée');
    }
    
    initializeControls() {
        // Récupérer les éléments DOM
        this.layerSelect = document.getElementById('gibsLayerSelect');
        this.dateInput = document.getElementById('gibsDateInput');
        this.rangeHint = document.getElementById('gibsRangeHint');
        this.prevBtn = document.getElementById('gibsPrevBtn');
        this.nextBtn = document.getElementById('gibsNextBtn');
        this.fullscreenBtn = document.getElementById('gibsFullscreenBtn');
        
        // Configurer les contrôles
        if (this.layerSelect) {
            this.layerSelect.addEventListener('change', (e) => {
                this.changeLayer(e.target.value);
            });
        }
        
        if (this.dateInput) {
            this.dateInput.addEventListener('change', (e) => {
                this.changeDate(e.target.value);
            });
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousDay());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextDay());
        }
        
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Initialiser la date
        if (this.dateInput) {
            this.dateInput.value = this.currentDate;
            this.updateDateRange();
        }
    }
    
    updateDateRange() {
        const layerInfo = this.layerDates[this.currentLayer];
        if (layerInfo && this.dateInput) {
            this.dateInput.min = layerInfo.start;
            this.dateInput.max = layerInfo.end;
            
            if (this.rangeHint) {
                this.rangeHint.textContent = 
                    `Archives: ${layerInfo.start} → ${layerInfo.end} (pas: ${layerInfo.step} jour${layerInfo.step > 1 ? 's' : ''})`;
            }
        }
    }
    
    changeLayer(layerId) {
        this.currentLayer = layerId;
        this.updateDateRange();
        this.loadLayer();
    }
    
    changeDate(dateStr) {
        this.currentDate = dateStr;
        this.loadLayer();
    }
    
    previousDay() {
        const layerInfo = this.layerDates[this.currentLayer];
        if (layerInfo) {
            const currentDate = new Date(this.currentDate);
            currentDate.setDate(currentDate.getDate() - layerInfo.step);
            const newDate = currentDate.toISOString().slice(0, 10);
            
            if (newDate >= layerInfo.start) {
                this.currentDate = newDate;
                if (this.dateInput) this.dateInput.value = this.currentDate;
                this.loadLayer();
            }
        }
    }
    
    nextDay() {
        const layerInfo = this.layerDates[this.currentLayer];
        if (layerInfo) {
            const currentDate = new Date(this.currentDate);
            currentDate.setDate(currentDate.getDate() + layerInfo.step);
            const newDate = currentDate.toISOString().slice(0, 10);
            
            if (newDate <= layerInfo.end) {
                this.currentDate = newDate;
                if (this.dateInput) this.dateInput.value = this.currentDate;
                this.loadLayer();
            }
        }
    }
    
    toggleFullscreen() {
        const mapContainer = document.getElementById('gibsMap');
        if (!mapContainer) return;

        if (!document.fullscreenElement) {
            if (mapContainer.requestFullscreen) {
                mapContainer.requestFullscreen();
            } else if (mapContainer.webkitRequestFullscreen) { /* Safari */
                mapContainer.webkitRequestFullscreen();
            } else if (mapContainer.msRequestFullscreen) { /* IE11 */
                mapContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    }
    
    loadLayer() {
        if (!this.map) return;
        
        // Supprimer l'ancienne couche
        if (this.gibsLayer) {
            this.map.removeLayer(this.gibsLayer);
            this.gibsLayer = null;
        }
        
        // Créer l'URL de la couche NASA GIBS
        const gibsUrl = this.createGibsUrl(this.currentLayer, this.currentDate);
        
        // Créer et ajouter la nouvelle couche
        this.gibsLayer = L.tileLayer(gibsUrl, {
            attribution: '© NASA GIBS',
            opacity: 0.8,
            minZoom: 1,
            maxZoom: 9,
            tileSize: 256,
            crossOrigin: true
        });
        
        this.gibsLayer.addTo(this.map);
        
        console.log(`Couche chargée: ${this.currentLayer} pour ${this.currentDate}`);
        console.log(`URL: ${gibsUrl}`);
        
        // Mettre à jour l'interface
        this.updateUI();
    }
    
    createGibsUrl(layer, date) {
        // Format URL NASA GIBS standard
        return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    }
    
    updateUI() {
        // Mettre à jour l'indicateur de couche actuelle
        if (this.layerSelect) {
            const selectedOption = this.layerSelect.querySelector(`option[value="${this.currentLayer}"]`);
            if (selectedOption) {
                const layerName = selectedOption.textContent;
                console.log(`Couche active: ${layerName}`);
            }
        }
    }
    
    loadInitialLayer() {
        // Charger la couche initiale après un délai
        setTimeout(() => {
            this.loadLayer();
        }, 1000);
    }
    
    // Méthode pour tester une URL spécifique
    testUrl(layer, date, z = 5, y = 16, x = 12) {
        const url = this.createGibsUrl(layer, date);
        const testUrl = url.replace('{z}', z).replace('{y}', y).replace('{x}', x);
        console.log('URL de test:', testUrl);
        return testUrl;
    }
    
    // Méthode pour obtenir les informations de la couche
    getLayerInfo(layerId) {
        const layerInfo = this.layerDates[layerId];
        if (layerInfo) {
            return {
                name: layerId,
                startDate: layerInfo.start,
                endDate: layerInfo.end,
                stepDays: layerInfo.step,
                totalDays: Math.ceil((new Date(layerInfo.end) - new Date(layerInfo.start)) / (1000 * 60 * 60 * 24))
            };
        }
        return null;
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.nasaGibsMap = new NASAGIBSMap();
    }, 1000);
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NASAGIBSMap;
}
