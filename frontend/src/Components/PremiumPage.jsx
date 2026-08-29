import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authFetch, API_BASE_URL } from '../lib/api';
import { PREMIUM_PLANS } from '../config/paddle';
import { openPaddleCheckout } from '../lib/paddle';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function PremiumPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialPlan = searchParams.get('plan') === 'monthly' ? 'monthly' : 'yearly';
  const isSuccessUrl = searchParams.get('success') === 'true';

  const [selectedPlan, setSelectedPlan] = useState(initialPlan); // 'monthly' | 'yearly'
  const [subscription, setSubscription] = useState({ isPremium: false, plan: 'free', status: 'none' });
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [activationStatus, setActivationStatus] = useState(isSuccessUrl ? 'pending' : null); // null | 'pending' | 'activated' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const token = localStorage.getItem('access_token');

  // Fetch subscription status
  const fetchSubscription = async () => {
    if (!token) {
      setLoadingSubscription(false);
      return;
    }
    try {
      const res = await authFetch(`${API_BASE_URL}/billing/subscription`);
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
        if (data.isPremium) {
          setActivationStatus('activated');
        }
      }
    } catch (err) {
      console.warn('Subscription fetch error:', err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSubscription();
  }, [token]);

  // Polling for webhook activation after checkout
  useEffect(() => {
    let pollInterval = null;
    let attempts = 0;

    if (activationStatus === 'pending' && !subscription.isPremium) {
      pollInterval = setInterval(async () => {
        attempts++;
        if (token) {
          try {
            const res = await authFetch(`${API_BASE_URL}/billing/subscription`);
            if (res.ok) {
              const data = await res.json();
              if (data.isPremium) {
                setSubscription(data);
                setActivationStatus('activated');
                clearInterval(pollInterval);
              }
            }
          } catch (e) {
            console.error('Polling error:', e);
          }
        }

        if (attempts >= 10) {
          clearInterval(pollInterval);
          if (!subscription.isPremium) {
            setActivationStatus('pending_delayed');
          }
        }
      }, 2500);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activationStatus, subscription.isPremium, token]);

  const handleSelectPlan = async (planKey) => {
    if (!user) {
      // Encode the full destination (including plan) so it survives through Login → Register
      const destination = `/premium?plan=${planKey}`;
      navigate(`/login?redirect=${encodeURIComponent(destination)}`);
      return;
    }

    if (subscription.isPremium) return;

    setErrorMsg(null);
    setCheckoutLoading(true);

    try {
      const plan = PREMIUM_PLANS[planKey];
      await openPaddleCheckout({
        priceId: plan.priceId,
        user,
        onCheckoutComplete: () => {
          setActivationStatus('pending');
          setCheckoutLoading(false);
        },
        onCheckoutClose: () => {
          setCheckoutLoading(false);
        },
      });
    } catch (err) {
      setErrorMsg(err.message || 'Impossible d\'ouvrir le système de paiement sécurisé.');
      setCheckoutLoading(false);
    }
  };

  const plan = PREMIUM_PLANS[selectedPlan];

  return (
    <div className="af-page">
      <div className="container" style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div className="af-page-header" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="af-badge af-badge-primary" style={{ marginBottom: 'var(--sp-3)' }}>
            <i className="fas fa-crown" style={{ color: '#fbbf24' }} /> ATLASFORECAST PREMIUM
          </div>
          <h1 className="af-page-title">Débloquez toute la puissance d'AtlasForecast</h1>
          <p className="af-page-subtitle">
            Profitez de l'Assistant Copilot IA illimité, de prévisions multi-modèles à 14 jours et d'alertes instantanées.
          </p>
        </motion.div>

        {/* Notices */}
        <AnimatePresence>
          {activationStatus === 'activated' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="af-notice af-notice-success"
              style={{ maxWidth: '800px', margin: '0 auto var(--sp-6)' }}
            >
              <i className="fas fa-circle-check" style={{ fontSize: '1.25rem' }} />
              <div>
                <strong>Bienvenue dans AtlasForecast Premium !</strong>
                <p style={{ margin: 'var(--sp-1) 0 0', fontSize: 'var(--text-xs)' }}>
                  Votre abonnement est actif. Toutes les fonctionnalités avancées et l'Assistant IA sont débloqués.
                </p>
              </div>
            </motion.div>
          )}

          {activationStatus === 'pending' && !subscription.isPremium && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="af-notice af-notice-info"
              style={{ maxWidth: '800px', margin: '0 auto var(--sp-6)', background: 'rgba(59, 130, 246, 0.15)', borderColor: 'var(--accent-primary)' }}
            >
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }} />
              <div>
                <strong>Paiement reçu. Activation de votre abonnement en cours...</strong>
                <p style={{ margin: 'var(--sp-1) 0 0', fontSize: 'var(--text-xs)' }}>
                  Nous synchronisons votre compte avec notre passerelle de paiement sécurisée. Veuillez patienter quelques secondes.
                </p>
              </div>
            </motion.div>
          )}

          {activationStatus === 'pending_delayed' && !subscription.isPremium && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="af-notice af-notice-warning"
              style={{ maxWidth: '800px', margin: '0 auto var(--sp-6)' }}
            >
              <i className="fas fa-clock" style={{ fontSize: '1.25rem' }} />
              <div>
                <strong>Finalisation de votre transaction</strong>
                <p style={{ margin: 'var(--sp-1) 0 0', fontSize: 'var(--text-xs)' }}>
                  La confirmation par la passerelle de paiement prend quelques instants supplémentaires. Vous pouvez rafraîchir la page dans un instant.
                </p>
              </div>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="af-notice af-notice-error"
              style={{ maxWidth: '800px', margin: '0 auto var(--sp-6)' }}
            >
              <i className="fas fa-circle-exclamation" style={{ fontSize: '1.25rem' }} />
              <div>
                <strong>Information</strong>
                <p style={{ margin: 'var(--sp-1) 0 0', fontSize: 'var(--text-xs)' }}>{errorMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Plan Selector Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-10)' }}>
          <div
            style={{
              background: 'var(--bg-glass-dark)',
              padding: 'var(--sp-1)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
            }}
          >
            <button
              type="button"
              className={`af-chip ${selectedPlan === 'monthly' ? 'active' : ''}`}
              onClick={() => setSelectedPlan('monthly')}
              style={{
                background: selectedPlan === 'monthly' ? 'var(--gradient-primary)' : 'transparent',
                color: selectedPlan === 'monthly' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              Mensuel ($5 / mois)
            </button>
            <button
              type="button"
              className={`af-chip ${selectedPlan === 'yearly' ? 'active' : ''}`}
              onClick={() => setSelectedPlan('yearly')}
              style={{
                background: selectedPlan === 'yearly' ? 'var(--gradient-primary)' : 'transparent',
                color: selectedPlan === 'yearly' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                position: 'relative',
              }}
            >
              Annuel ($50 / an){' '}
              <span
                style={{
                  background: 'var(--accent-success)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  fontWeight: '800',
                  marginLeft: '4px',
                }}
              >
                2 mois offerts
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="af-grid af-grid-2" style={{ maxWidth: '960px', margin: '0 auto var(--sp-16)', alignItems: 'stretch' }}>
          {/* Monthly Plan Card */}
          <motion.div
            className={`af-card ${selectedPlan === 'monthly' ? 'af-card-elevated' : ''}`}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 'var(--sp-8)',
              border: selectedPlan === 'monthly' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              position: 'relative',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                  Plan Mensuel
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', minHeight: '36px', marginTop: 'var(--sp-2)' }}>
                Flexibilité sans engagement, renouvelable chaque mois.
              </p>

              <div style={{ margin: 'var(--sp-6) 0', display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)' }}>
                <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '900', color: 'var(--text-primary)' }}>
                  $5
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: '700' }}>
                  /mois
                </span>
              </div>

              <div className="af-divider" />

              <ul className="af-list" style={{ gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
                {PREMIUM_PLANS.monthly.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)' }}>
                    <i className="fas fa-circle-check" style={{ color: 'var(--accent-success)', fontSize: '1rem', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-primary)' }}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {subscription.isPremium ? (
                <button
                  type="button"
                  disabled
                  className="af-btn af-btn-ghost af-btn-block"
                  style={{ border: '1px solid var(--accent-success)', color: 'var(--accent-success)', fontWeight: '800' }}
                >
                  <i className="fas fa-crown" style={{ color: '#fbbf24' }} /> Vous êtes Premium
                </button>
              ) : !user ? (
                <button
                  type="button"
                  onClick={() => handleSelectPlan('monthly')}
                  className="af-btn af-btn-secondary af-btn-block"
                  style={{ minHeight: '48px' }}
                >
                  <i className="fas fa-arrow-right-to-bracket" /> Se connecter pour continuer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => handleSelectPlan('monthly')}
                  className="af-btn af-btn-secondary af-btn-block"
                  style={{ minHeight: '48px' }}
                >
                  Choisir le plan mensuel
                </button>
              )}
            </div>
          </motion.div>

          {/* Yearly Plan Card (Recommended) */}
          <motion.div
            className={`af-card af-card-elevated`}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 'var(--sp-8)',
              border: '2px solid var(--accent-primary)',
              boxShadow: '0 16px 40px rgba(59, 130, 246, 0.25)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '24px',
                background: 'var(--gradient-primary)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              }}
            >
              ⭐ Recommandé
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                Plan Annuel
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', minHeight: '36px', marginTop: 'var(--sp-2)' }}>
                La formule la plus avantageuse avec 2 mois offerts inclus.
              </p>

              <div style={{ margin: 'var(--sp-6) 0', display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)' }}>
                <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '900', color: 'var(--text-primary)' }}>
                  $50
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: '700' }}>
                  /an
                </span>
                <span style={{ color: 'var(--accent-success)', fontSize: 'var(--text-xs)', fontWeight: '800', marginLeft: 'var(--sp-2)' }}>
                  (Économisez $10)
                </span>
              </div>

              <div className="af-divider" />

              <ul className="af-list" style={{ gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
                {PREMIUM_PLANS.yearly.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)' }}>
                    <i className="fas fa-circle-check" style={{ color: 'var(--accent-success)', fontSize: '1rem', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: idx < 2 ? '700' : '500' }}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {subscription.isPremium ? (
                <button
                  type="button"
                  disabled
                  className="af-btn af-btn-ghost af-btn-block"
                  style={{ border: '1px solid var(--accent-success)', color: 'var(--accent-success)', fontWeight: '800' }}
                >
                  <i className="fas fa-crown" style={{ color: '#fbbf24' }} /> Vous êtes Premium (Plan Actif)
                </button>
              ) : !user ? (
                <button
                  type="button"
                  onClick={() => handleSelectPlan('yearly')}
                  className="af-btn af-btn-primary af-btn-block"
                  style={{ minHeight: '48px', fontSize: 'var(--text-base)' }}
                >
                  <i className="fas fa-arrow-right-to-bracket" /> Se connecter pour continuer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => handleSelectPlan('yearly')}
                  className="af-btn af-btn-primary af-btn-block"
                  style={{ minHeight: '48px', fontSize: 'var(--text-base)' }}
                >
                  {checkoutLoading ? (
                    <><i className="fas fa-spinner fa-spin" /> Préparation...</>
                  ) : (
                    'Choisir le plan annuel'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Security & Paddle Compliance Banner */}
        <div
          className="af-card"
          style={{
            background: 'var(--bg-glass-dark)',
            border: '1px solid var(--border-color)',
            padding: 'var(--sp-8)',
            marginBottom: 'var(--sp-12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--sp-6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-success)',
                fontSize: '1.75rem',
              }}
            >
              <i className="fas fa-shield-halved" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--text-primary)' }}>
                Paiement Sécurisé avec Paddle Billing
              </h4>
              <p style={{ margin: 'var(--sp-1) 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Vos paiements sont traités par Paddle (Merchant of Record certifié PCI-DSS). AtlasForecast ne stocke aucune coordonnée bancaire.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', color: 'var(--text-muted)', fontSize: '1.75rem' }}>
            <i className="fab fa-cc-visa" title="Visa" />
            <i className="fab fa-cc-mastercard" title="Mastercard" />
            <i className="fab fa-apple-pay" title="Apple Pay" />
            <i className="fab fa-google-pay" title="Google Pay" />
            <i className="fas fa-lock" title="Chiffrement TLS 256 bits" />
          </div>
        </div>
      </div>
    </div>
  );
}
