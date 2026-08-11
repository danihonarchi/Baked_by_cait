import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw at import time in dev — surface a clear error when it's
  // actually used instead, so `next dev` doesn't crash before you've set env vars.
  console.warn("STRIPE_SECRET_KEY is not set. Checkout will fail until it is.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-04-10",
});
