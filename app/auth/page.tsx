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

function AuthPageContent() {
  const {
    step,
    email,
    otp,
    loading,
    error,
    setEmail,
    setOtp,
    setStep,
    handleSendOTP,
    handleVerifyOTP,
    handleSocialSignIn,
  } = useAuth();

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
          <CardTitle>{step === 'email' ? 'Sign In' : 'Enter Code'}</CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Enter your email to receive a verification code'
              : `We sent a code to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <div className="space-y-4">
              {/* Social Sign-In Buttons */}
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

              {/* Email OTP Form */}
              <form onSubmit={handleSendOTP} className="space-y-4">
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Code'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Enter the 8-digit code from your email
                </p>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="12345678"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
