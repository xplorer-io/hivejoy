'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { sendOTP, verifyOTP, signInWithGoogle, signInWithFacebook } from '@/lib/api/auth';
import type { UserRole } from '@/types';

export function useAuth(role?: UserRole) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const id = setInterval(() => {
      setCooldownSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownSeconds]);

  // Check for OAuth errors in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;
    setLoading(true);
    setError('');

    try {
      const result = await sendOTP(email);
      if (result.success) {
        setStep('otp');
        setCooldownSeconds(60); // 1 min cooldown before requesting another code
      } else {
        setError(result.message);
        const isRateLimit = /too many requests|rate limit/i.test(result.message);
        if (isRateLimit) setCooldownSeconds(300); // 5 min when rate limited (Supabase 60s per-user; this is for “too many requests”)
      }
    } catch {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(email, otp);
      if (result.success && result.user) {
        setUser(result.user);
        router.push('/');
      } else {
        setError(result.message ?? 'Invalid or expired code. Please try again.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');

    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
      }

      if (!result.success && result.error) {
        // Check if provider is not enabled
        if (result.error.includes('not enabled') || result.error.includes('Unsupported provider')) {
          setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not enabled. Please enable it in Supabase dashboard: Authentication → Providers → ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
        } else {
          setError(result.error);
        }
        setLoading(false);
      }
      // If successful, user will be redirected to OAuth provider
      // Then redirected back to /auth/callback
    } catch {
      setError('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return {
    step,
    email,
    otp,
    loading,
    error,
    cooldownSeconds,
    setEmail,
    setOtp,
    setStep,
    handleSendCode,
    handleVerifyOTP,
    handleSocialSignIn,
  };
}
