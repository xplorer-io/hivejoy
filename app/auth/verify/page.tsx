'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { verifyOTP } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Firebase email links contain the email in localStorage or URL
    const email = typeof window !== 'undefined' 
      ? (window.localStorage.getItem('emailForSignIn') || searchParams.get('email'))
      : searchParams.get('email');
    
    if (!email) {
      setError('Email parameter missing');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyOTP(email, '');
        if (result.success && result.user) {
          setUser(result.user);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('emailForSignIn');
          }
          router.push('/');
        } else {
          setError(result.message);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, setUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Verifying...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verification Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push('/auth')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <p>Redirecting...</p>
    </div>
  );
}
