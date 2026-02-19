'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon, FacebookIcon } from '@/components/shared/icons';
import { useAuth } from '@/hooks/useAuth';

function ConsumerAuthContent() {
  const {
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
  } = useAuth();
  const cooldownMin = Math.floor(cooldownSeconds / 60);
  const cooldownSec = cooldownSeconds % 60;
  const cooldownLabel = cooldownSeconds > 0 ? `${cooldownMin}:${cooldownSec.toString().padStart(2, '0')}` : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl">🍯</span>
            </div>
            <span className="text-2xl font-bold">Hive Joy</span>
          </Link>
          <CardTitle className="text-center">
            {step === 'email' ? 'Sign in' : `We sent a code to ${email}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                >
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignIn('facebook')}
                  disabled={loading}
                >
                  <FacebookIcon className="mr-2 h-4 w-4" />
                  Continue with Facebook
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {cooldownSeconds > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground text-center">
                      You can request another code in {cooldownLabel}.
                    </p>
                    {error && /too many requests/i.test(error) && (
                      <p className="text-sm text-muted-foreground text-center">
                        Or sign in with Google or Facebook above to avoid the wait.
                      </p>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || cooldownSeconds > 0}
                >
                  {loading ? 'Sending...' : cooldownSeconds > 0 ? `Wait ${cooldownLabel}` : 'Send code'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Enter the 8-digit code from your email
                </p>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="12345678"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={8}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={() => setStep('email')}
              >
                <ArrowLeft className="h-4 w-4" />
                Use different email
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default function ConsumerAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConsumerAuthContent />
    </Suspense>
  );
}
