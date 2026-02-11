'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

/**
 * Seller application landing page
 * Redirects authenticated users to registration, or shows login prompt
 */
export default function SellerApplyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      if (!isAuthenticated || !user) {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/producers/me');
        const data = await res.json();
        
        if (data.success && data.producer) {
          setHasProfile(true);
          const status = data.producer.application_status || data.producer.verificationStatus;
          setIsApproved(status === 'approved');
        } else {
          // No producer profile found (404 or error)
          setHasProfile(false);
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Failed to check producer status:', error);
        // On error, assume no profile (consumer applying)
        setHasProfile(false);
        setIsApproved(false);
      } finally {
        setChecking(false);
      }
    }

    checkStatus();
  }, [user, isAuthenticated, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Become a Hive Joy Seller</CardTitle>
            <CardDescription>
              Join our marketplace and connect directly with customers who value authentic, traceable Australian honey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to start your seller application.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Link href="/auth/consumer?next=/seller/register-new" className="flex-1">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show verified seller message if user is actually in producer mode
  // Consumers should always see the registration form, even if they have a producer profile
  if (hasProfile && isApproved && user.role === 'producer') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">You are already a verified seller</CardTitle>
                <CardDescription>
                  Your seller account is active and ready to use.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You can start creating listings, managing batches, and receiving orders right away.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Link href="/seller/dashboard" className="block">
                <Button className="w-full" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/seller/listings" className="block">
                <Button variant="outline" className="w-full">
                  View Your Products
                </Button>
              </Link>
              <Link href="/seller/batches" className="block">
                <Button variant="outline" className="w-full">
                  Manage Batches
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For consumers, always show the registration form (even if they have a producer profile)
  // They can apply or continue their application

  // Has profile but not approved - show application processing message
  if (hasProfile && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">Your Application is Being Processed</CardTitle>
                <CardDescription>
                  We&apos;re reviewing your seller application.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Thank you for submitting your application to become a Hive Joy seller. Our team is currently reviewing your application and will notify you via email once a decision has been made. This process typically takes 2-3 business days.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Link href="/seller/register-new" className="block">
                <Button variant="outline" className="w-full">
                  View Your Application
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No profile - show registration CTA
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Become a Hive Joy Seller</CardTitle>
          <CardDescription>
            Complete your seller registration to start selling on Hive Joy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>As a verified seller, you&apos;ll be able to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create and manage product listings</li>
              <li>Track your batches and harvests</li>
              <li>Receive direct orders from customers</li>
              <li>Get paid securely through our platform</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Link href="/seller/register-new" className="flex-1">
              <Button className="w-full">Start Application</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
