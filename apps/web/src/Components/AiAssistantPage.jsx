import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../lib/api';

const SUGGESTED_QUESTIONS = [
  'What should I wear today?',
  'Will it rain tomorrow?',
  'Is it good for hiking?',
  'Can I travel this weekend?'
];

const CITIES = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger', 'Agadir'];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [city, setCity] = useState('Marrakech');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = 'http://localhost:4000';

  // Load last 10 conversations from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('af_assistant_history');
      if (saved) {
        setMessages(JSON.parse(saved).slice(-10));
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  }, []);

  // Save last 10 conversations to localStorage when messages change
  const saveHistory = (updatedMessages) => {
    const last10 = updatedMessages.slice(-10);
    setMessages(last10);
    try {
      localStorage.setItem('af_assistant_history', JSON.stringify(last10));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    saveHistory(updatedMessages);

    setLoading(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/ai/weather-advice`, {
        method: 'POST',
        body: JSON.stringify({ city, question: query })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advice from assistant');
      }

      const data = await response.json();
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.advice,
        weather: data.currentWeather ? {
          temp: data.currentWeather.temp,
          description: data.currentWeather.description,
          city: data.city
        } : null
      };

      saveHistory([...updatedMessages, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `Désolé, une erreur s'est produite lors de la connexion à l'assistant. (${err.message})`,
        isError: true
      };
      saveHistory([...updatedMessages, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem('af_assistant_history');
  };

  return (
    <div className="container">
      <section className="af-page" style={{ display: 'flex', flexDirection: 'column', height: '80vh', minHeight: '600px' }}>
        {/* Top Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="af-page-title" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-1)', textAlign: 'left' }}>
              <i className="fas fa-robot"></i> Assistant Copilot AI
            </h1>
            <p className="af-page-subtitle" style={{ margin: 0, textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              Recommandations météo ultra-personnalisées par intelligence artificielle.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            {/* City Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ville :</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="af-select"
                style={{ width: 'auto', padding: 'var(--sp-2) var(--sp-6) var(--sp-2) var(--sp-3)', fontSize: 'var(--text-sm)', minHeight: '36px' }}
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button onClick={handleClearHistory} className="af-btn af-btn-ghost af-btn-sm">
              <i className="fas fa-trash"></i> Effacer
            </button>
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="af-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {/* Messages Container */}
          <div style={{ flex: 1, padding: 'var(--sp-6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', padding: 'var(--sp-8)', textAlign: 'center' }}>
                  <i className="fas fa-comments" style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: 'var(--sp-4)', opacity: 0.8 }} />
                  <h3 style={{ fontWeight: '900', color: 'var(--text-primary)', margin: 0, fontSize: 'var(--text-lg)' }}>Démarrer une conversation</h3>
                  <p style={{ marginTop: 'var(--sp-2)', maxWidth: '360px', fontSize: 'var(--text-sm)' }}>
                    Choisissez l'une des suggestions ci-dessous ou posez n'importe quelle question sur la météo à {city} !
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    initial="hidden" 
                    animate="visible" 
                    variants={fadeUp} 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                  >
                    {/* Bubble Container */}
                    <div className={msg.role === 'user' ? 'af-btn-primary' : 'af-card'} style={{
                      maxWidth: '75%',
                      padding: 'var(--sp-3) var(--sp-5)',
                      borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-glass-dark)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                      fontSize: 'var(--text-base)',
                      lineHeight: '1.5',
                      boxShadow: 'var(--shadow-sm)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)'
                    }}>
                      {msg.text}
                    </div>

                    {/* Inline Weather Card */}
                    {msg.weather && (
                      <div className="af-card" style={{
                        marginTop: 'var(--sp-2)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: 'var(--sp-2) var(--sp-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--sp-3)',
                        maxWidth: '280px',
                        borderRadius: 'var(--radius-lg)'
                      }}>
                        <div style={{ fontSize: '1.5rem', color: 'var(--weather-icon-color)' }}><i className="fas fa-cloud-sun"></i></div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>{msg.weather.city}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {msg.weather.temp}°C • {msg.weather.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {loading && (
              <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--bg-glass-dark)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', alignSelf: 'flex-start' }}>
                <i className="fas fa-spinner fa-spin" style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: '600' }}>Copilot AI réfléchit...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length === 0 && (
            <div style={{ padding: '0 var(--sp-6)', display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="af-chip"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar Container */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ padding: 'var(--sp-4) var(--sp-6)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 'var(--sp-3)', background: 'rgba(0,0,0,0.1)' }}>
            <input
              type="text"
              className="af-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Posez votre question sur la météo à ${city}...`}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="af-btn af-btn-primary"
              style={{ minWidth: '100px' }}
            >
              Poser
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
