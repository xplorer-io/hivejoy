'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * When Supabase redirects after an expired/invalid email link, the user can land
 * on / with ?error=access_denied&error_code=otp_expired&error_description=...
 * Redirect them to the sign-in page with a clear message.
 */
export function AuthErrorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (!error && !errorCode) return;

    const isExpiredOrInvalid =
      errorCode === 'otp_expired' ||
      /expired|invalid|invalid link/i.test(errorDescription || '') ||
      error === 'access_denied';

    if (!isExpiredOrInvalid) return;

    const message =
      errorCode === 'otp_expired' || /expired/i.test(errorDescription || '')
        ? 'This sign-in link has expired. Please request a new link.'
        : decodeURIComponent(errorDescription || error || 'Sign-in link is invalid. Please request a new link.');

    const params = new URLSearchParams({ error: message });
    router.replace(`/auth/consumer?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}
