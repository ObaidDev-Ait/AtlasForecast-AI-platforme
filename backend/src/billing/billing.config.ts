export interface PlanConfig {
  id: string;
  plan: 'free' | 'pro' | 'enterprise';
  priceId?: string;
  name: string;
  tagline: string;
  price: number;
  unitAmount: number; // in cents
  currency: string;
  interval?: 'month' | 'year';
  formattedPrice: string;
  periodText?: string;
  savingsText?: string;
  features: string[];
  excluded?: string[];
}

export const PADDLE_PRODUCT_ID = 'pro_01m148k6rxz3emnt9t1sq19yst';

export const PADDLE_PRICES = {
  monthly: 'pri_01m1490gc2x3anabr2ypkfe5bq',
  yearly: 'pri_01m1499pcrz3ak3jvt5v77snpm',
};

export const BILLING_PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    plan: 'free',
    name: 'Standard',
    tagline: 'L’essentiel de la météo au quotidien pour tous.',
    price: 0,
    unitAmount: 0,
    currency: 'usd',
    formattedPrice: 'Gratuit',
    features: [
      'Conditions météo mondiales en temps réel',
      'Prévisions standard à 5 jours',
      'Recherche géocodée et géolocalisation',
      'Jusqu’à 3 villes sauvegardées',
      'Alertes météo publiques de vigilance',
    ],
    excluded: [
      'Assistant IA Copilot météo',
      'Prévisions étendues 14 jours & multi-modèles',
      'Alertes personnalisées par SMS / Email',
      'Radar satellite haute résolution',
      'Clé API météo & export CSV/JSON',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    plan: 'pro',
    priceId: PADDLE_PRICES.monthly,
    name: 'AtlasForecast Premium (Mensuel)',
    tagline: 'Intelligence météo complète et Copilot IA illimité.',
    price: 5,
    unitAmount: 500,
    currency: 'usd',
    interval: 'month',
    formattedPrice: '$5',
    periodText: '/mois',
    features: [
      'Toutes les fonctionnalités Standard',
      'Assistant IA Copilot météo illimité',
      'Prévisions étendues à 14 jours (Ensemble multi-modèles)',
      'Villes sauvegardées illimitées',
      'Alertes météo personnalisées (SMS, Email & Push)',
      'Radar satellite & cartes atmosphériques HD',
      'Historique météorologique sur 30 jours',
      'Support client prioritaire 7j/7',
    ],
    excluded: [
      'Clé API météo dédiée pour développeurs',
    ],
  },
  pro_yearly: {
    id: 'pro_yearly',
    plan: 'pro',
    priceId: PADDLE_PRICES.yearly,
    name: 'AtlasForecast Premium (Annuel)',
    tagline: 'Intelligence météo complète et Copilot IA illimité.',
    price: 50,
    unitAmount: 5000,
    currency: 'usd',
    interval: 'year',
    formattedPrice: '$50',
    periodText: '/an',
    savingsText: '2 mois offerts (-17%)',
    features: [
      'Toutes les fonctionnalités Standard',
      'Assistant IA Copilot météo illimité',
      'Prévisions étendues à 14 jours (Ensemble multi-modèles)',
      'Villes sauvegardées illimitées',
      'Alertes météo personnalisées (SMS, Email & Push)',
      'Radar satellite & cartes atmosphériques HD',
      'Historique météorologique sur 30 jours',
      'Support client prioritaire 7j/7',
    ],
    excluded: [
      'Clé API météo dédiée pour développeurs',
    ],
  },
};
