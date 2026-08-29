export const PADDLE_PRODUCT_ID = 'pro_01m148k6rxz3emnt9t1sq19yst';

export const PADDLE_PRICES = {
  monthly: 'pri_01m1490gc2x3anabr2ypkfe5bq',
  yearly: 'pri_01m1499pcrz3ak3jvt5v77snpm',
};

export const PREMIUM_PLANS = {
  monthly: {
    id: 'monthly',
    plan: 'pro',
    priceId: PADDLE_PRICES.monthly,
    amount: 5,
    formattedPrice: '$5',
    periodText: '/mois',
    interval: 'month',
    name: 'Plan Mensuel',
    tagline: 'Flexibilité totale avec reconduction mensuelle.',
    features: [
      'Assistant Copilot IA météo illimité',
      'Prévisions multi-modèles étendues à 14 jours',
      'Alertes climatiques personnalisées (SMS & Email)',
      'Villes sauvegardées illimitées',
      'Radar satellite haute résolution',
      'Historique météorologique complet',
      'Support prioritaire 7j/7',
    ],
  },
  yearly: {
    id: 'yearly',
    plan: 'pro',
    priceId: PADDLE_PRICES.yearly,
    amount: 50,
    formattedPrice: '$50',
    periodText: '/an',
    interval: 'year',
    name: 'Plan Annuel',
    tagline: 'La formule la plus avantageuse (2 mois offerts).',
    savingsBadge: '2 mois offerts (-17%)',
    recommended: true,
    features: [
      'Toutes les fonctionnalités du plan mensuel',
      'Assistant Copilot IA météo illimité',
      'Prévisions multi-modèles étendues à 14 jours',
      'Alertes climatiques personnalisées (SMS & Email)',
      'Villes sauvegardées illimitées',
      'Radar satellite haute résolution',
      'Historique météorologique complet',
      'Support prioritaire 7j/7',
    ],
  },
};
