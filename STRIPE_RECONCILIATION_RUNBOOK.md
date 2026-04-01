# Stripe Reconciliation Runbook

## Purpose
Use this runbook when a customer payment succeeded in Stripe but order/payment state appears missing or delayed in the app.

## Preconditions
- `STRIPE_SECRET_KEY` is configured in the environment.
- Webhook endpoint is configured in Stripe and healthy.
- You have the Stripe checkout `session_id` from the customer URL or Stripe dashboard.

## Step 1: Confirm webhook readiness
Run:

```bash
curl http://localhost:3000/api/checkout/webhook/health
```

Expected:
- HTTP `200`
- payload includes `"ok": true`

If not healthy, fix the missing configuration first.

## Step 2: Inspect checkout session directly
Run:

```bash
curl "http://localhost:3000/api/checkout/reconcile?session_id=cs_xxx"
```

Validate:
- `isPaidAndComplete` is `true`
- `paymentStatus` is `paid`
- `status` is `complete`

If not paid/complete, wait for Stripe async completion or investigate payment method flow.

## Step 3: Re-deliver Stripe webhook event
From Stripe dashboard:
- open the relevant event (`checkout.session.completed` or `checkout.session.async_payment_succeeded`)
- use **Re-send**

Then verify customer-facing status again from `/orders`.

## Step 4: Verify order visibility
- Open the buyer orders page with an authenticated session.
- Confirm the new purchase appears and remains after refresh.

## Step 5: Incident follow-up
- Record root cause (for example wrong webhook URL, expired secret, transient DB error).
- Add the `session_id` and Stripe event ID in the incident notes.
- If recurring, add alerting/monitoring for webhook failures.
