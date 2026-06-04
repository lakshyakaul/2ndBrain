import Stripe from 'stripe';

// During build, STRIPE_SECRET_KEY may not be set; use a placeholder key
// that prevents the constructor from throwing but won't make real calls.
const key = process.env.STRIPE_SECRET_KEY || 'sk_placeholder_for_build';

export const stripe = new Stripe(key, {
  apiVersion: '2026-04-22.dahlia',
  appInfo: {
    name: 'Space App',
    version: '0.1.0',
  },
});
