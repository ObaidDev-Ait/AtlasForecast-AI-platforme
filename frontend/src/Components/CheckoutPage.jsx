import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authFetch, API_BASE_URL } from '../lib/api';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const selectedPlan = searchParams.get('plan') || 'pro';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStartCheckout = async () => {
    if (!user) {
      navigate(`/login?redirect=/checkout&plan=${selectedPlan}`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          successUrl: `${window.location.origin}/premium?success=true&plan=${selectedPlan}`,
          cancelUrl: `${window.location.origin}/premium?cancel=true`,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Le paiement est temporairement indisponible.');
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de redirection introuvable.');
      }
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="af-page">
      <div className="container" style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div className="af-card af-card-elevated" style={{ padding: 'var(--sp-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: 'var(--sp-3)',
              }}
            >
              <i className="fas fa-lock" />
            </div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              Paiement Sécurisé Hébergé
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-2)' }}>
              Vous allez être redirigé vers la passerelle de paiement sécurisée conforme PCI-DSS pour finaliser votre abonnement.
            </p>
          </div>

          {errorMsg && (
            <div className="af-notice af-notice-error" style={{ marginBottom: 'var(--sp-6)' }}>
              <i className="fas fa-circle-exclamation" /> <span>{errorMsg}</span>
            </div>
          )}

          <div
            style={{
              background: 'var(--bg-glass-dark)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--sp-6)',
              marginBottom: 'var(--sp-6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                  {selectedPlan === 'enterprise' ? 'Plan Entreprise & API' : 'Plan Premium Pro'}
                </strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                  Facturation mensuelle sans engagement • Résiliation à tout moment
                </p>
              </div>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--accent-primary)' }}>
                {selectedPlan === 'enterprise' ? '499 MAD' : '99 MAD'}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleStartCheckout}
            className="af-btn af-btn-primary af-btn-block"
            style={{ minHeight: '52px', fontSize: 'var(--text-base)' }}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin" /> Redirection sécurisée en cours...</>
            ) : (
              <><i className="fas fa-shield-halved" /> Procéder au paiement sécurisé</>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: 'var(--sp-4)' }}>
            <Link to="/premium" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>
              <i className="fas fa-arrow-left" /> Revenir aux offres
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
