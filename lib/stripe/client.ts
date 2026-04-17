import "server-only";

import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("STRIPE_SECRET_KEY is not set");
    cached = new Stripe(secret, { apiVersion: "2026-03-25.dahlia" });
  }
  return cached;
}

export function priceIds() {
  const monthly = process.env.STRIPE_PRICE_MONTHLY;
  const yearly = process.env.STRIPE_PRICE_YEARLY;
  if (!monthly || !yearly) {
    throw new Error("STRIPE_PRICE_MONTHLY and STRIPE_PRICE_YEARLY must be set");
  }
  return { monthly, yearly };
}
