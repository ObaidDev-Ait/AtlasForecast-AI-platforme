import { initializePaddle } from '@paddle/paddle-js';

let paddleInstancePromise = null;

export async function getPaddleInstance() {
  if (paddleInstancePromise) {
    return paddleInstancePromise;
  }

  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
  const environment = import.meta.env.VITE_PADDLE_ENV || 'sandbox';

  if (!token) {
    console.warn('VITE_PADDLE_CLIENT_TOKEN is not configured in .env.');
    return null;
  }

  paddleInstancePromise = initializePaddle({
    environment: environment === 'production' ? 'production' : 'sandbox',
    token,
  });

  return paddleInstancePromise;
}

export async function openPaddleCheckout({ priceId, user, onCheckoutComplete, onCheckoutClose }) {
  const paddle = await getPaddleInstance();
  if (!paddle) {
    throw new Error('Le système de paiement Paddle n\'est pas encore configuré.');
  }

  if (!priceId) {
    throw new Error('Identifiant de prix Paddle invalide.');
  }

  const checkoutOptions = {
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      locale: 'fr',
      variant: 'one-page',
      successUrl: `${window.location.origin}/premium?success=true`,
    },
    items: [
      {
        priceId,
        quantity: 1,
      },
    ],
    customData: {
      userId: user?.id || '',
    },
  };

  if (user?.email) {
    checkoutOptions.customer = {
      email: user.email,
    };
  }

  if (onCheckoutComplete || onCheckoutClose) {
    checkoutOptions.eventCallback = (event) => {
      if (event.name === 'checkout.completed') {
        if (onCheckoutComplete) onCheckoutComplete(event);
      }
      if (event.name === 'checkout.closed') {
        if (onCheckoutClose) onCheckoutClose(event);
      }
    };
  }

  paddle.Checkout.open(checkoutOptions);
}
