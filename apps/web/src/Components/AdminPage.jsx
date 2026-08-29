import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authFetch, API_BASE_URL as API_URL } from '../lib/api'
import '../Styles/AdminPage.css'

export default function AdminPage() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roleAction, setRoleAction] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  const fetchStats = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/admin/stats`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStats(await res.json())
    } catch (e) {
      setError(`Stats error: ${e.message}`)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/admin/users`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(`Users error: ${e.message}`)
    }
  }, [])

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/admin/subscriptions`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSubscriptions(await res.json())
    } catch (e) {
      setError(`Subscriptions error: ${e.message}`)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      await Promise.all([fetchStats(), fetchUsers(), fetchSubscriptions()])
      setLoading(false)
    }
    load()
  }, [fetchStats, fetchUsers, fetchSubscriptions])

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (userId === user?.id && newRole === 'user') {
      alert('Vous ne pouvez pas révoquer vos propres droits administrateur.')
      return
    }
    const confirmed = window.confirm(
      `Voulez-vous ${newRole === 'admin' ? 'promouvoir' : 'rétrograder'} cet utilisateur ?`
    )
    if (!confirmed) return

    setRoleAction((prev) => ({ ...prev, [userId]: true }))
    try {
      const res = await authFetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } catch (e) {
      alert(`Erreur: ${e.message}`)
    } finally {
      setRoleAction((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      !searchTerm ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Chargement du tableau de bord…</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <div className="admin-badge">
              <i className="fas fa-shield-alt"></i>
              <span>ADMIN</span>
            </div>
            <div>
              <h1 className="admin-title">Tableau de bord administrateur</h1>
              <p className="admin-subtitle">
                Connecté en tant que <strong>{profile?.email || user?.email}</strong>
              </p>
            </div>
          </div>
          <div className="admin-header-right">
            <button className="admin-refresh-btn" onClick={() => { fetchStats(); fetchUsers(); fetchSubscriptions() }}>
              <i className="fas fa-sync-alt"></i>
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-error-banner">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <nav className="admin-tabs">
        {[
          { id: 'overview', icon: 'fas fa-chart-bar', label: 'Vue d\'ensemble' },
          { id: 'users', icon: 'fas fa-users', label: `Utilisateurs (${users.length})` },
          { id: 'subscriptions', icon: 'fas fa-credit-card', label: 'Abonnements' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="admin-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-stats-grid">
              <StatCard
                icon="fas fa-users"
                label="Utilisateurs total"
                value={stats.overview.totalUsers}
                color="blue"
              />
              <StatCard
                icon="fas fa-crown"
                label="Abonnés Premium"
                value={stats.overview.premiumUsers}
                color="gold"
              />
              <StatCard
                icon="fas fa-user-slash"
                label="Utilisateurs gratuits"
                value={stats.overview.freeUsers}
                color="gray"
              />
              <StatCard
                icon="fas fa-shield-alt"
                label="Administrateurs"
                value={stats.overview.adminsCount}
                color="purple"
              />
            </div>

            <div className="admin-info-grid">
              <div className="admin-card">
                <h3 className="admin-card-title">
                  <i className="fas fa-dollar-sign"></i>
                  Revenus estimés
                </h3>
                <div className="admin-revenue">
                  <span className="admin-mrr">
                    ${stats.revenue?.estimatedMRR?.toFixed(2) || '0.00'}
                  </span>
                  <span className="admin-mrr-label">MRR estimé</span>
                </div>
              </div>

              <div className="admin-card">
                <h3 className="admin-card-title">
                  <i className="fas fa-server"></i>
                  Système
                </h3>
                <div className="admin-system-info">
                  <div className="admin-system-row">
                    <span>Statut</span>
                    <span className={`admin-status-badge ${stats.system.status}`}>
                      <i className="fas fa-circle"></i>
                      {stats.system.status === 'healthy' ? 'En bonne santé' : stats.system.status}
                    </span>
                  </div>
                  <div className="admin-system-row">
                    <span>Environnement</span>
                    <span className="admin-env-badge">{stats.system.environment}</span>
                  </div>
                  <div className="admin-system-row">
                    <span>Uptime</span>
                    <span>{Math.floor(stats.system.serverUptimeSeconds / 60)}m {stats.system.serverUptimeSeconds % 60}s</span>
                  </div>
                  <div className="admin-system-row">
                    <span>Dernière vérification</span>
                    <span>{new Date(stats.system.timestamp).toLocaleTimeString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="admin-users-toolbar">
              <div className="admin-search-wrapper">
                <i className="fas fa-search"></i>
                <input
                  id="admin-search"
                  type="text"
                  className="admin-search"
                  placeholder="Rechercher par email ou nom…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <span className="admin-users-count">
                {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Plan</th>
                    <th>Inscrit le</th>
                    <th>Dernière connexion</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={u.id === user?.id ? 'admin-table-current-user' : ''}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {u.avatar_url
                              ? <img src={u.avatar_url} alt={u.full_name} />
                              : <span>{(u.full_name || u.email || '?')[0].toUpperCase()}</span>
                            }
                          </div>
                          <div>
                            <div className="admin-user-name">
                              {u.full_name || 'Sans nom'}
                              {u.id === user?.id && <span className="admin-you-badge">Vous</span>}
                            </div>
                            <div className="admin-user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-role-badge ${u.role}`}>
                          <i className={u.role === 'admin' ? 'fas fa-shield-alt' : 'fas fa-user'}></i>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-confirmed-badge ${u.email_confirmed ? 'confirmed' : 'pending'}`}>
                          <i className={u.email_confirmed ? 'fas fa-check-circle' : 'fas fa-clock'}></i>
                          {u.email_confirmed ? 'Confirmé' : 'En attente'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-plan-badge ${u.is_premium ? 'premium' : 'free'}`}>
                          {u.is_premium ? <><i className="fas fa-crown"></i> Premium</> : 'Gratuit'}
                        </span>
                      </td>
                      <td className="admin-date">{formatDate(u.created_at)}</td>
                      <td className="admin-date">{formatDate(u.last_sign_in_at)}</td>
                      <td>
                        <button
                          className={`admin-role-btn ${u.role === 'admin' ? 'demote' : 'promote'}`}
                          onClick={() => handleRoleChange(u.id, u.role)}
                          disabled={roleAction[u.id]}
                          title={u.role === 'admin' ? 'Rétrograder en utilisateur' : 'Promouvoir en admin'}
                        >
                          {roleAction[u.id]
                            ? <i className="fas fa-spinner fa-spin"></i>
                            : u.role === 'admin'
                              ? <><i className="fas fa-arrow-down"></i> Rétrograder</>
                              : <><i className="fas fa-arrow-up"></i> Promouvoir</>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="admin-empty">
                        <i className="fas fa-search"></i>
                        <span>Aucun utilisateur trouvé</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && subscriptions && (
          <div className="admin-subscriptions">
            <div className="admin-card">
              <h3 className="admin-card-title">
                <i className="fas fa-crown"></i>
                Abonnés actifs ({subscriptions.totalActive})
              </h3>
              {subscriptions.activeSubscribers.length === 0 ? (
                <div className="admin-empty">
                  <i className="fas fa-inbox"></i>
                  <span>Aucun abonné premium pour le moment</span>
                </div>
              ) : (
                <div className="admin-sub-list">
                  {subscriptions.activeSubscribers.map((sub) => (
                    <div key={sub.id} className="admin-sub-item">
                      <div className="admin-sub-info">
                        <span className="admin-sub-name">{sub.full_name || 'Utilisateur'}</span>
                        <span className="admin-sub-email">{sub.email}</span>
                      </div>
                      <span className={`admin-plan-badge premium`}>
                        <i className="fas fa-crown"></i>
                        {sub.plan_name || 'pro'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`admin-stat-card admin-stat-${color}`}>
      <div className="admin-stat-icon">
        <i className={icon}></i>
      </div>
      <div className="admin-stat-content">
        <div className="admin-stat-value">{value ?? '—'}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  )
}
