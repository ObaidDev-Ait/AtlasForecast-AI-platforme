import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authFetch, API_BASE_URL } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const SUGGESTED_QUESTIONS = [
  { text: 'Que devrais-je porter aujourd\'hui ?', icon: 'fa-shirt' },
  { text: 'Va-t-il pleuvoir dans les prochaines 24h ?', icon: 'fa-cloud-rain' },
  { text: 'Conditions idéales pour une randonnée dans l\'Atlas ?', icon: 'fa-person-hiking' },
  { text: 'Conseils agricoles & prévision d\'irrigation ?', icon: 'fa-wheat-awn' },
  { text: 'Recommandations pour un événement en extérieur ?', icon: 'fa-calendar-day' },
]

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda', 'Laâyoune', 'Ifrane', 'Ouarzazate']

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export default function AiAssistantPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [city, setCity] = useState('Casablanca')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('af_assistant_history')
      if (saved) {
        setMessages(JSON.parse(saved).slice(-10))
      }
    } catch (e) {
      console.error('Failed to load chat history:', e)
    }
  }, [])

  const saveHistory = (updatedMessages) => {
    const last10 = updatedMessages.slice(-10)
    setMessages(last10)
    try {
      localStorage.setItem('af_assistant_history', JSON.stringify(last10))
    } catch (e) {
      console.error('Failed to save chat history:', e)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    if (!user) {
      const userMsg = { id: Date.now(), role: 'user', text: query }
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Veuillez vous connecter pour utiliser l\'Assistant Copilot IA.',
        isError: true,
        action: 'login',
      }
      saveHistory([...messages, userMsg, errMsg])
      setInput('')
      return
    }

    setInput('')
    const userMsg = { id: Date.now(), role: 'user', text: query }
    const updatedMessages = [...messages, userMsg]
    saveHistory(updatedMessages)

    setLoading(true)

    try {
      const response = await authFetch(`${API_BASE_URL}/ai/weather-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, question: query }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Veuillez vous connecter pour utiliser l\'assistant Copilot IA.')
        }
        if (response.status === 403) {
          throw new Error('L\'Assistant Copilot IA est une fonctionnalité Premium. Rendez-vous sur la page Premium pour l\'activer.')
        }
        if (response.status === 429) {
          throw new Error('Limite de requêtes atteinte (5 requêtes par minute). Veuillez patienter quelques instants.')
        }
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Erreur lors de la communication avec l\'assistant')
      }

      const data = await response.json()
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.advice,
        weather: data.currentWeather
          ? {
              temp: data.currentWeather.temp,
              description: data.currentWeather.description,
              city: data.city,
            }
          : null,
      }

      saveHistory([...updatedMessages, aiMsg])
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: err.message || 'Désolé, une erreur s\'est produite lors de la connexion à l\'assistant.',
        isError: true,
      }
      saveHistory([...updatedMessages, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    setMessages([])
    localStorage.removeItem('af_assistant_history')
  }

  return (
    <div className="container">
      <section
        className="af-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - var(--header-h) - 40px)',
          minHeight: '620px',
        }}
      >
        {/* Header Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--sp-4)',
            flexWrap: 'wrap',
            gap: 'var(--sp-3)',
          }}
        >
          <div>
            <div className="af-badge af-badge-info" style={{ marginBottom: 'var(--sp-1)' }}>
              <i className="fas fa-robot"></i> COPILOT IA CLIMATIQUE 2026
            </div>
            <h1
              className="af-page-title"
              style={{
                fontSize: 'clamp(1.5rem, 1.2rem + 1vw, 2.2rem)',
                margin: 0,
                textAlign: 'left',
              }}
            >
              Assistant Météo Intelligent
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Ville :
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="af-select"
                style={{
                  width: 'auto',
                  padding: '0.4rem 1.75rem 0.4rem 0.75rem',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                }}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleClearHistory} className="btn btn-ghost btn-sm">
              <i className="fas fa-trash-can"></i> Effacer
            </button>
          </div>
        </div>

        {/* Main Chat Box */}
        <div
          className="af-card"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
          }}
        >
          {/* Message List */}
          <div
            style={{
              flex: 1,
              padding: 'var(--sp-6)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-4)',
            }}
          >
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--text-secondary)',
                    padding: 'var(--sp-8)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-xl)',
                      background:
                        'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      color: 'var(--accent-cyan)',
                      marginBottom: 'var(--sp-4)',
                      boxShadow: 'var(--shadow-glow-cyan)',
                    }}
                  >
                    <i className="fas fa-sparkles"></i>
                  </div>
                  <h3
                    style={{
                      fontWeight: 900,
                      color: 'var(--text-primary)',
                      margin: 0,
                      fontSize: '1.25rem',
                    }}
                  >
                    Prêt à vous conseiller sur la météo à {city}
                  </h3>
                  <p
                    style={{
                      marginTop: 'var(--sp-2)',
                      maxWidth: '440px',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Posez vos questions sur la pluie, les températures, les activités
                    extérieures ou choisissez l'une des suggestions ci-dessous.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Bubble */}
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '0.85rem 1.25rem',
                        borderRadius:
                          msg.role === 'user'
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                        background:
                          msg.role === 'user'
                            ? 'var(--gradient-primary)'
                            : 'var(--bg-glass-heavy)',
                        color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                        fontSize: 'var(--text-sm)',
                        lineHeight: '1.6',
                        boxShadow: 'var(--shadow-sm)',
                        border:
                          msg.role === 'user'
                            ? 'none'
                            : '1px solid var(--border-color)',
                      }}
                    >
                      {msg.text}
                      {msg.action === 'login' && (
                        <div style={{ marginTop: 'var(--sp-3)' }}>
                          <Link to="/login" className="btn btn-primary btn-sm">
                            <i className="fas fa-sign-in-alt"></i> Se connecter
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Inline Weather Preview Card */}
                    {msg.weather && (
                      <div
                        style={{
                          marginTop: 'var(--sp-2)',
                          background: 'var(--bg-glass-light)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.4rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <i
                          className="fas fa-cloud-sun"
                          style={{ color: '#fbbf24', fontSize: '1.1rem' }}
                        ></i>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          {msg.weather.city} • {msg.weather.temp}°C ({msg.weather.description})
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {loading && (
              <div
                style={{
                  display: 'inline-flex',
                  gap: 'var(--sp-2)',
                  alignItems: 'center',
                  padding: '0.6rem 1rem',
                  background: 'var(--bg-glass-heavy)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  alignSelf: 'flex-start',
                }}
              >
                <i className="fas fa-spinner fa-spin" style={{ color: 'var(--accent-cyan)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  Analyse des conditions climatiques...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length === 0 && (
            <div
              style={{
                padding: '0 var(--sp-6)',
                display: 'flex',
                gap: 'var(--sp-2)',
                flexWrap: 'wrap',
                marginBottom: 'var(--sp-4)',
              }}
            >
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(q.text)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <i className={`fas ${q.icon}`} style={{ color: 'var(--accent-primary)' }}></i>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Field Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            style={{
              padding: 'var(--sp-4) var(--sp-6)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: 'var(--sp-3)',
              background: 'rgba(0, 0, 0, 0.08)',
            }}
          >
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
              className="btn btn-primary"
              style={{ minWidth: '110px' }}
            >
              <i className="fas fa-paper-plane"></i>
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
