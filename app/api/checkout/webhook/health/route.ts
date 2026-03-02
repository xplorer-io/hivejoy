import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getHealth() {
  const checks = {
    stripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    appBaseUrl: Boolean(process.env.APP_BASE_URL),
    stripePublishableKey: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  };
  const missing = Object.entries(checks)
    .filter(([, isPresent]) => !isPresent)
    .map(([key]) => key);
  const ok = missing.length === 0;

  return { ok, missing, checks };
}

export async function GET() {
  const health = getHealth();
  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
  });
}
