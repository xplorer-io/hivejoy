type CheckoutItemSnapshot = {
  productId: string;
  variantId: string;
  quantity: number;
};

type CheckoutSnapshot = {
  nonce: string;
  customerEmail: string;
  items: CheckoutItemSnapshot[];
  createdAt: number;
};

// @TODO: migrate this logic to a database, in memory is not scalable and reliable
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours
const pendingCheckouts = new Map<string, CheckoutSnapshot>();
const verifiedSessions = new Set<string>();

export function registerCheckout(sessionId: string, snapshot: CheckoutSnapshot) {
  pendingCheckouts.set(sessionId, snapshot);
}

export function getCheckoutSnapshot(sessionId: string) {
  const snapshot = pendingCheckouts.get(sessionId);
  if (!snapshot) {
    return null;
  }

  if (Date.now() - snapshot.createdAt > MAX_AGE_MS) {
    pendingCheckouts.delete(sessionId);
    verifiedSessions.delete(sessionId);
    return null;
  }

  return snapshot;
}

export function markSessionVerified(sessionId: string) {
  verifiedSessions.add(sessionId);
}

export function isSessionVerified(sessionId: string) {
  return verifiedSessions.has(sessionId);
}

export function clearCheckout(sessionId: string) {
  pendingCheckouts.delete(sessionId);
  verifiedSessions.delete(sessionId);
}
