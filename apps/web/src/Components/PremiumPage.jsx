import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authFetch } from '../lib/api';
import '../css/premium.css';

export default function PremiumPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('copilot');

  // AI Copilot state
  const [copilotCategory, setCopilotCategory] = useState('travel');
  const [copilotCity, setCopilotCity] = useState('Marrakech');
  const [copilotAdvice, setCopilotAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Smart Alerts state
  const [alerts, setAlerts] = useState({
    rain: true,
    storm: true,
    heatwave: false
  });
  const [thresholds, setThresholds] = useState({
    rain: 60,
    wind: 45,
    temp: 36
  });
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    push: true,
    webhook: false
  });

  // Historical Analytics state
  const [analyticMetric, setAnalyticMetric] = useState('temp');
  const [analyticCity, setAnalyticCity] = useState('Casablanca');

  // API Access state
  const [apiKey, setApiKey] = useState('at_live_7a3d92e105cb8f9d0c641be2');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiSnippetLang, setApiSnippetLang] = useState('js');

  // Team Workspace state
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Alice Martin', email: 'alice@company.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jean Dupont', email: 'jean@company.com', role: 'Developer', status: 'Active' }
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Developer');

  // Subscription & Billing state
  const [subscription, setSubscription] = useState({ isPremium: false, plan: 'free', status: 'none' });
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const token = localStorage.getItem('access_token');
  const API_BASE_URL = 'http://localhost:4000';

  useEffect(() => {
    window.scrollTo(0, 0);
    if (token) {
      setLoadingSubscription(true);
      authFetch(`${API_BASE_URL}/billing/subscription`)
      .then(res => res.json())
      .then(data => {
        if (data && data.plan) {
          setSubscription(data);
        }
      })
      .catch(err => console.error("Error fetching subscription status:", err))
      .finally(() => setLoadingSubscription(false));
    } else {
      setLoadingSubscription(false);
    }
  }, [token]);

  const handleUpgrade = async (plan) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/billing/checkout`, {
        method: 'POST',
        body: JSON.stringify({
          plan,
          successUrl: window.location.origin + '/premium?success=true&plan=' + plan,
          cancelUrl: window.location.origin + '/premium'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error("Failed to upgrade:", err);
    }
  };

  // AI Copilot Advisory Database
  const advices = {
    travel: {
      Marrakech: "Sunny days ahead. Perfect weather for exploring the Medina. Keep hydrated in the afternoon as temperatures reach 34°C. High UV index, sunscreen recommended.",
      Casablanca: "Pleasant coastal breeze with clear skies. Ideal for sight-seeing the Hassan II Mosque. Evening temp drops to 19°C, carrying a light jacket is advised.",
      Rabat: "Mild and sunny. Excellent conditions for historic tours. Temperatures hover around 24°C with gentle winds. Perfect travel window."
    },
    hiking: {
      Marrakech: "Excellent visibility on High Atlas trails. Morning temperatures are cool (12°C at altitude), warming to 25°C. Wind gusts up to 15km/h. Standard mountain gear recommended.",
      Casablanca: "Moderate humidity near coastal paths. Clear trails with zero precipitation risk. Low wind speeds make it ideal for light hiking.",
      Rabat: "Forest trails are dry and stable. Temperature: 22°C. Low humidity and pleasant breeze make it a perfect day for outdoor trail walks."
    },
    agriculture: {
      Marrakech: "High evaporation rates. Evapotranspiration index: 6.2mm/day. Recommend scheduling drip irrigation early morning or post-sunset to conserve water resources.",
      Casablanca: "Optimal soil moisture level detected (45%). Favorable conditions for cereal crops seeding. Expect moderate morning dew. Soil temp: 18°C.",
      Rabat: "Stable conditions. Nitrogen absorption rate is high. Apply fertilizers before the minor light showers expected in late evenings."
    },
    event: {
      Marrakech: "Outdoor dinner events are highly favorable. Wind speeds will drop below 10km/h after 19:00. No precipitation risk. Ambient evening temp: 24°C.",
      Casablanca: "High humidity levels (82%) after sunset may cause light moisture on outdoor fabrics. Canopy or covered tents recommended for open-air venues.",
      Rabat: "Perfect evening conditions. Low breeze and stable temperature (20°C). Outdoor lighting and sound projection will face minimal atmospheric disturbance."
    }
  };

  const handleGenerateAdvice = () => {
    setLoadingAdvice(true);
    setTimeout(() => {
      const cityData = advices[copilotCategory][copilotCity] || advices[copilotCategory]['Marrakech'];
      setCopilotAdvice(cityData);
      setLoadingAdvice(false);
    }, 600);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) return;
    setTeamMembers([
      ...teamMembers,
      {
        id: Date.now(),
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        status: 'Pending'
      }
    ]);
    setNewMemberEmail('');
    setNewMemberName('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Chart data renderer (SVG lines/areas)
  const renderChart = () => {
    if (analyticMetric === 'temp') {
      return (
        <svg viewBox="0 0 500 200" className="dashboard-chart-svg">
          <defs>
            <linearGradient id="chart-glow-temp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="50" y1="30" x2="450" y2="30" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="80" x2="450" y2="80" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="130" x2="450" y2="130" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="170" x2="450" y2="170" stroke="var(--border-color)" strokeWidth="1" />
          
          {/* Chart Area */}
          <path d="M 50 130 Q 120 70, 190 90 T 330 40 T 450 60 L 450 170 L 50 170 Z" fill="url(#chart-glow-temp)" />
          
          {/* Chart Line */}
          <path d="M 50 130 Q 120 70, 190 90 T 330 40 T 450 60" fill="none" stroke="var(--accent-secondary)" strokeWidth="3" />
          
          {/* Data Points */}
          <circle cx="50" cy="130" r="4" fill="var(--bg-primary)" stroke="var(--accent-secondary)" strokeWidth="2" />
          <circle cx="150" cy="80" r="4" fill="var(--bg-primary)" stroke="var(--accent-secondary)" strokeWidth="2" />
          <circle cx="260" cy="65" r="4" fill="var(--bg-primary)" stroke="var(--accent-secondary)" strokeWidth="2" />
          <circle cx="370" cy="42" r="4" fill="var(--bg-primary)" stroke="var(--accent-secondary)" strokeWidth="2" />
          <circle cx="450" cy="60" r="4" fill="var(--bg-primary)" stroke="var(--accent-secondary)" strokeWidth="2" />
          
          {/* X Labels */}
          <text x="50" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Jan</text>
          <text x="150" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Mar</text>
          <text x="260" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">May</text>
          <text x="370" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Jul</text>
          <text x="450" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Sep</text>

          {/* Y Labels */}
          <text x="40" y="34" fill="var(--text-muted)" fontSize="9" textAnchor="end">40°C</text>
          <text x="40" y="84" fill="var(--text-muted)" fontSize="9" textAnchor="end">25°C</text>
          <text x="40" y="134" fill="var(--text-muted)" fontSize="9" textAnchor="end">10°C</text>
        </svg>
      );
    } else if (analyticMetric === 'rain') {
      return (
        <svg viewBox="0 0 500 200" className="dashboard-chart-svg">
          <defs>
            <linearGradient id="chart-glow-rain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="50" y1="30" x2="450" y2="30" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="80" x2="450" y2="80" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="130" x2="450" y2="130" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="170" x2="450" y2="170" stroke="var(--border-color)" strokeWidth="1" />
          
          {/* Area Chart */}
          <path d="M 50 160 C 100 120, 150 150, 200 70 C 250 80, 300 20, 350 140 C 400 120, 420 160, 450 170 L 450 170 L 50 170 Z" fill="url(#chart-glow-rain)" />
          {/* Path Line */}
          <path d="M 50 160 C 100 120, 150 150, 200 70 C 250 80, 300 20, 350 140 C 400 120, 420 160, 450 170" fill="none" stroke="var(--accent-primary)" strokeWidth="3" />
          
          <text x="50" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Mon</text>
          <text x="150" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Wed</text>
          <text x="250" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Fri</text>
          <text x="350" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Sun</text>
          
          <text x="40" y="34" fill="var(--text-muted)" fontSize="9" textAnchor="end">100mm</text>
          <text x="40" y="84" fill="var(--text-muted)" fontSize="9" textAnchor="end">50mm</text>
          <text x="40" y="134" fill="var(--text-muted)" fontSize="9" textAnchor="end">10mm</text>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 500 200" className="dashboard-chart-svg">
          <defs>
            <linearGradient id="chart-glow-humidity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="50" y1="30" x2="450" y2="30" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="80" x2="450" y2="80" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="130" x2="450" y2="130" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="50" y1="170" x2="450" y2="170" stroke="var(--border-color)" strokeWidth="1" />
          
          {/* Smooth spline curve */}
          <path d="M 50 110 S 130 90, 180 120 S 300 40, 380 90 S 420 100, 450 110 L 450 170 L 50 170 Z" fill="url(#chart-glow-humidity)" />
          <path d="M 50 110 S 130 90, 180 120 S 300 40, 380 90 S 420 100, 450 110" fill="none" stroke="#10b981" strokeWidth="3" />
          
          <text x="50" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Q1</text>
          <text x="180" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Q2</text>
          <text x="310" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Q3</text>
          <text x="450" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Q4</text>
          
          <text x="40" y="34" fill="var(--text-muted)" fontSize="9" textAnchor="end">100%</text>
          <text x="40" y="84" fill="var(--text-muted)" fontSize="9" textAnchor="end">50%</text>
          <text x="40" y="134" fill="var(--text-muted)" fontSize="9" textAnchor="end">20%</text>
        </svg>
      );
    }
  };

  const codeSnippets = {
    js: `// Fetch predictions & forecasts using AtlasForecast SDK
const AtlasForecast = require('@atlasforecast/sdk');
const client = new AtlasForecast.Client({ apiKey: '${apiKey}' });

client.forecasts.get({
  city: 'Marrakech',
  extended: true
}).then(forecast => {
  console.log(\`Predicted high: \${forecast.days[0].tempMax}°C\`);
});`,
    curl: `curl -X GET "https://api.atlasforecast.com/v1/forecasts?city=Marrakech" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`,
    python: `# Fetch weather analytics with python
import atlasforecast

client = atlasforecast.Client(api_key="${apiKey}")
data = client.analytics.get_trends(
    city="Marrakech",
    metric="temperature",
    years=5
)
print(f"Historical trend line: {data.trend_index}")`
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      {/* Dashboard Top Banner */}
      <div className="premium-dashboard-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>Premium Portal</h1>
            <span className="premium-status-badge" style={{ background: subscription.plan && subscription.plan !== 'free' ? 'var(--gradient-primary)' : 'var(--bg-tertiary)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '20px', letterSpacing: '0.5px' }}>
              {subscription.plan ? subscription.plan.toUpperCase() + ' PLAN' : 'FREE PLAN'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0', fontWeight: '500' }}>Manage workspace, configure integrations, and leverage predictions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className="dashboard-last-sync" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-glass-light)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="fas fa-arrows-spin fa-spin" style={{ color: 'var(--accent-primary)' }} /> Live Data Synced
          </span>
        </div>
      </div>

      {/* Main SaaS Dashboard Container */}
      <div className="premium-dashboard-layout" style={{ display: 'flex', gap: '2rem', minHeight: '650px' }}>
        {/* Navigation Sidebar */}
        <aside className="premium-sidebar" style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ background: 'var(--bg-glass-dark)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 10px 30px var(--shadow-color)' }}>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`sidebar-tab-btn ${activeTab === 'copilot' ? 'active' : ''}`}
            >
              <i className="fas fa-robot"></i> AI Weather Copilot
            </button>
            
            <button
              onClick={() => setActiveTab('alerts')}
              className={`sidebar-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
            >
              <i className="fas fa-bell"></i> Smart Alerts
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`sidebar-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <i className="fas fa-chart-line"></i> Historical Analytics
            </button>
            
            <button
              onClick={() => setActiveTab('ml')}
              className={`sidebar-tab-btn ${activeTab === 'ml' ? 'active' : ''}`}
            >
              <i className="fas fa-brain"></i> ML Predictions
            </button>
            
            <button
              onClick={() => setActiveTab('api')}
              className={`sidebar-tab-btn ${activeTab === 'api' ? 'active' : ''}`}
            >
              <i className="fas fa-code"></i> API Access
            </button>
            
            <button
              onClick={() => setActiveTab('workspace')}
              className={`sidebar-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
            >
              <i className="fas fa-users"></i> Team Workspace
            </button>
            
            <button
              onClick={() => setActiveTab('billing')}
              className={`sidebar-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            >
              <i className="fas fa-credit-card"></i> Billing & Plans
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="premium-main-content" style={{ flex: 1 }}>
          <div style={{ background: 'var(--bg-glass-dark)', border: '1px solid var(--border-color)', borderRadius: '22px', padding: '2.5rem', minHeight: '100%', boxShadow: '0 15px 35px var(--shadow-color)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* TAB 1: AI Weather Copilot */}
            {activeTab === 'copilot' && (
              <div className="tab-view-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>🤖 AI Weather Copilot</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Get tailored weather recommendations for travel, agriculture, and outdoor events.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="premium-control-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ADVISORY TYPE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button onClick={() => { setCopilotCategory('travel'); setCopilotAdvice(null); }} className={`copilot-cat-btn ${copilotCategory === 'travel' ? 'active' : ''}`}><i className="fas fa-plane"></i> Travel</button>
                      <button onClick={() => { setCopilotCategory('hiking'); setCopilotAdvice(null); }} className={`copilot-cat-btn ${copilotCategory === 'hiking' ? 'active' : ''}`}><i className="fas fa-hiking"></i> Hiking</button>
                      <button onClick={() => { setCopilotCategory('agriculture'); setCopilotAdvice(null); }} className={`copilot-cat-btn ${copilotCategory === 'agriculture' ? 'active' : ''}`}><i className="fas fa-wheat-awn"></i> Agri</button>
                      <button onClick={() => { setCopilotCategory('event'); setCopilotAdvice(null); }} className={`copilot-cat-btn ${copilotCategory === 'event' ? 'active' : ''}`}><i className="fas fa-calendar-check"></i> Event</button>
                    </div>
                  </div>
                  
                  <div className="premium-control-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LOCATION</label>
                    <select
                      value={copilotCity}
                      onChange={(e) => { setCopilotCity(e.target.value); setCopilotAdvice(null); }}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '700' }}
                    >
                      <option value="Marrakech">Marrakech</option>
                      <option value="Casablanca">Casablanca</option>
                      <option value="Rabat">Rabat</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAdvice}
                  className="btn btn-primary"
                  style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.9rem 2rem', fontWeight: 800 }}
                  disabled={loadingAdvice}
                >
                  {loadingAdvice ? <><i className="fas fa-spinner fa-spin" /> Analyzing conditions...</> : <><i className="fas fa-wand-magic-sparkles" /> Generate Custom Advice</>}
                </button>

                {/* Advice Output Panel */}
                <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {loadingAdvice ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <i className="fas fa-brain fa-spin" style={{ fontSize: '2rem', color: 'var(--accent-secondary)', marginBottom: '0.5rem', display: 'block' }} />
                      Running atmospheric copilot models...
                    </div>
                  ) : copilotAdvice ? (
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', color: 'var(--accent-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>
                        <i className="fas fa-circle-check" /> COPILOT ADVISORY FOR {copilotCity.toUpperCase()}
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.6', fontWeight: 500 }}>
                        {copilotAdvice}
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Select a category and location to retrieve predictive AI advisory notes.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Smart Alerts */}
            {activeTab === 'alerts' && (
              <div className="tab-view-pane" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>🔔 Smart Alerts Setup</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Configure real-time automated warnings triggered directly by climatic forecasts.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                  {/* Alert Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>Trigger Types</h3>
                    
                    <div className="alert-toggle-row">
                      <span>Rain Alerts</span>
                      <button
                        onClick={() => setAlerts({ ...alerts, rain: !alerts.rain })}
                        className={`mini-toggle-btn ${alerts.rain ? 'active' : ''}`}
                      />
                    </div>
                    
                    <div className="alert-toggle-row">
                      <span>Storm Warnings</span>
                      <button
                        onClick={() => setAlerts({ ...alerts, storm: !alerts.storm })}
                        className={`mini-toggle-btn ${alerts.storm ? 'active' : ''}`}
                      />
                    </div>
                    
                    <div className="alert-toggle-row">
                      <span>Heatwave Safeguards</span>
                      <button
                        onClick={() => setAlerts({ ...alerts, heatwave: !alerts.heatwave })}
                        className={`mini-toggle-btn ${alerts.heatwave ? 'active' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Notification Channels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>Channels</h3>
                    
                    <div className="alert-toggle-row">
                      <span>Email Notifications</span>
                      <button
                        onClick={() => setChannels({ ...channels, email: !channels.email })}
                        className={`mini-toggle-btn ${channels.email ? 'active' : ''}`}
                      />
                    </div>
                    
                    <div className="alert-toggle-row">
                      <span>SMS Broadcasts</span>
                      <button
                        onClick={() => setChannels({ ...channels, sms: !channels.sms })}
                        className={`mini-toggle-btn ${channels.sms ? 'active' : ''}`}
                      />
                    </div>

                    <div className="alert-toggle-row">
                      <span>Webhooks (Slack, Discord)</span>
                      <button
                        onClick={() => setChannels({ ...channels, webhook: !channels.webhook })}
                        className={`mini-toggle-btn ${channels.webhook ? 'active' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Thresholds Slider Config */}
                <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Threshold Settings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700 }}>Rain Trigger Probability</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{thresholds.rain}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={thresholds.rain}
                        onChange={(e) => setThresholds({ ...thresholds, rain: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                      />
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700 }}>Wind Speed Boundary</span>
                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 800 }}>{thresholds.wind} km/h</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        value={thresholds.wind}
                        onChange={(e) => setThresholds({ ...thresholds, wind: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-secondary)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Historical Analytics */}
            {activeTab === 'analytics' && (
              <div className="tab-view-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>📊 Climatic Analytics Hub</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Plot temperature, humidity, and rainfall patterns using historical databanks.</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setAnalyticMetric('temp')} className={`metric-select-btn ${analyticMetric === 'temp' ? 'active' : ''}`}>Temperature</button>
                    <button onClick={() => setAnalyticMetric('rain')} className={`metric-select-btn ${analyticMetric === 'rain' ? 'active' : ''}`}>Rainfall</button>
                    <button onClick={() => setAnalyticMetric('humidity')} className={`metric-select-btn ${analyticMetric === 'humidity' ? 'active' : ''}`}>Humidity</button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>FILTER CITY:</span>
                  <select
                    value={analyticCity}
                    onChange={(e) => setAnalyticCity(e.target.value)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: '700' }}
                  >
                    <option value="Casablanca">Casablanca</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Rabat">Rabat</option>
                  </select>
                </div>

                {/* Analytics Chart Container */}
                <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {analyticMetric === 'temp' ? 'Monthly Average Temp (°C)' : analyticMetric === 'rain' ? 'Precipitation Volumes (mm)' : 'Atmospheric Humidity (%)'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {analyticCity}</span>
                  </div>
                  
                  {/* Render the selected SVG chart */}
                  {renderChart()}
                </div>
              </div>
            )}

            {/* TAB 4: ML Predictions */}
            {activeTab === 'ml' && (
              <div className="tab-view-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>🔮 ML Predictions Engine</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Probability factors computed by multi-layered neural models.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  {/* Gauge 1 */}
                  <div className="ml-metric-card">
                    <span className="ml-card-label">RAIN PROBABILITY</span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', margin: '0.5rem 0' }}>84.3%</div>
                    <div className="ml-progress-bar-bg">
                      <div className="ml-progress-bar-fill" style={{ width: '84.3%', background: 'var(--accent-primary)' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Probability of &gt;2mm rain today.</span>
                  </div>
                  
                  {/* Gauge 2 */}
                  <div className="ml-metric-card">
                    <span className="ml-card-label">STORM RISK</span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-secondary)', margin: '0.5rem 0' }}>12.8%</div>
                    <div className="ml-progress-bar-bg">
                      <div className="ml-progress-bar-fill" style={{ width: '12.8%', background: 'var(--accent-secondary)' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lightning and micro-burst chance.</span>
                  </div>

                  {/* Gauge 3 */}
                  <div className="ml-metric-card">
                    <span className="ml-card-label">HEATWAVE HAZARD</span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', margin: '0.5rem 0' }}>65.0%</div>
                    <div className="ml-progress-bar-bg">
                      <div className="ml-progress-bar-fill" style={{ width: '65%', background: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk of temps over 38°C.</span>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <i className="fas fa-circle-nodes" style={{ color: 'var(--accent-success)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Model Core Version: <strong style={{ color: 'var(--text-primary)' }}>MLP-Core-v4.1.2</strong></span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verification Accuracy: 96.8%</span>
                </div>
              </div>
            )}

            {/* TAB 5: API Access */}
            {activeTab === 'api' && (
              <div className="tab-view-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>🔑 API Keys & Docs</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Integrate meteorological intelligence directly into your external code structures.</p>
                </div>

                {/* API Key Box */}
                <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>YOUR API SECRET KEY</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type={apiKeyVisible ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      style={{ flex: 1, padding: '0.8rem 1rem', background: 'var(--bg-glass-dark)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}
                    />
                    
                    <button onClick={() => setApiKeyVisible(!apiKeyVisible)} className="dashboard-action-btn" title="View Key">
                      <i className={`fas ${apiKeyVisible ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                    
                    <button onClick={copyToClipboard} className="dashboard-action-btn" title="Copy Key">
                      <i className={copiedKey ? 'fas fa-check' : 'fas fa-copy'} style={copiedKey ? { color: 'var(--accent-success)' } : {}} />
                    </button>
                  </div>
                </div>

                {/* Code Snippets Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Integration Examples</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => setApiSnippetLang('js')} className={`lang-tab-btn ${apiSnippetLang === 'js' ? 'active' : ''}`}>NodeJS</button>
                      <button onClick={() => setApiSnippetLang('curl')} className={`lang-tab-btn ${apiSnippetLang === 'curl' ? 'active' : ''}`}>cURL</button>
                      <button onClick={() => setApiSnippetLang('python')} className={`lang-tab-btn ${apiSnippetLang === 'python' ? 'active' : ''}`}>Python</button>
                    </div>
                  </div>

                  <pre style={{ margin: 0, padding: '1.25rem', background: '#0b0c10', border: '1px solid var(--border-color)', borderRadius: '14px', overflowX: 'auto', color: '#8892b0', fontFamily: 'Courier New, monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {codeSnippets[apiSnippetLang]}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 6: Team Workspace */}
            {activeTab === 'workspace' && (
              <div className="tab-view-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>👥 Team Workspace</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Invite team developers and administrators to manage key access.</p>
                </div>

                {/* Invite Form */}
                <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    required
                    style={{ flex: 1, minWidth: '150px', padding: '0.75rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    required
                    style={{ flex: 1, minWidth: '180px', padding: '0.75rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                  />
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    style={{ padding: '0.75rem 1.2rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: '700' }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Developer">Developer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', fontWeight: 800 }}>Invite</button>
                </form>

                {/* Members List */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>NAME</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>EMAIL</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>ROLE</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{m.email}</td>
                          <td style={{ padding: '1rem', fontWeight: 700 }}><span style={{ color: m.role === 'Admin' ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>{m.role}</span></td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: m.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: m.status === 'Active' ? '#10b981' : '#f59e0b'
                            }}>{m.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 7: Billing & Plans */}
            {activeTab === 'billing' && (
              <div className="tab-view-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>💳 Billing & Plans</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Manage subscription tier configurations and limits.</p>
                </div>

                <div className="billing-plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
                  {/* Plan 1 */}
                  <div className="plan-saas-card" style={subscription.plan === 'free' ? { border: '2px solid var(--accent-primary)' } : {}}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>STANDARD TIER</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0.25rem 0 0.8rem', color: 'var(--text-primary)' }}>Free Plan</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>$0 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mo</span></div>
                    <ul className="plan-bullet-list">
                      <li>5-day standard forecast</li>
                      <li>Single location alerts</li>
                      <li>Basic search parameters</li>
                    </ul>
                    <button className="btn btn-secondary" style={{ marginTop: 'auto', padding: '0.7rem' }} disabled={subscription.plan === 'free'}>
                      {subscription.plan === 'free' ? 'Active Plan' : 'Free Tier'}
                    </button>
                  </div>
                  
                  {/* Plan 2 */}
                  <div className="plan-saas-card pro recommended" style={{ border: subscription.plan === 'pro' ? '2px solid var(--accent-success)' : '2px solid var(--accent-secondary)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      RECOMMENDED <i className="fas fa-crown" />
                    </span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0.25rem 0 0.8rem', color: 'var(--text-primary)' }}>Pro Plan</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>$19 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mo</span></div>
                    <ul className="plan-bullet-list">
                      <li>14-day premium forecast</li>
                      <li>ML Predictions Engine</li>
                      <li>API Access token key</li>
                      <li>AI Weather Copilot</li>
                    </ul>
                    <button onClick={() => handleUpgrade('pro')} className="btn btn-primary" style={{ marginTop: 'auto', padding: '0.7rem' }} disabled={subscription.plan === 'pro'}>
                      {subscription.plan === 'pro' ? 'Active Plan' : 'Upgrade to Pro'}
                    </button>
                  </div>

                  {/* Plan 3 */}
                  <div className="plan-saas-card" style={subscription.plan === 'enterprise' ? { border: '2px solid var(--accent-success)' } : {}}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>CUSTOM SERVICE</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0.25rem 0 0.8rem', color: 'var(--text-primary)' }}>Enterprise</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>Custom</div>
                    <ul className="plan-bullet-list">
                      <li>Unlimited API requests</li>
                      <li>SLA priority assistance</li>
                      <li>Dedicated sub-servers</li>
                    </ul>
                    <button onClick={() => handleUpgrade('enterprise')} className="btn btn-secondary" style={{ marginTop: 'auto', padding: '0.7rem' }} disabled={subscription.plan === 'enterprise'}>
                      {subscription.plan === 'enterprise' ? 'Active Plan' : 'Contact Sales'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
