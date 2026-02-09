'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
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
          
          // Only auto-redirect if user is actually a producer and approved
          // Don't redirect consumers who are just applying
          if (status === 'approved' && user.role === 'producer') {
            router.push('/seller/dashboard');
            return;
          }
        } else {
          // No producer profile - user is a consumer applying to become a seller
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

  // Has profile but not approved
  if (hasProfile && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Application Status</CardTitle>
            <CardDescription>
              Your seller application is being reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your application has been submitted and is under review. You&apos;ll receive an email once it&apos;s approved.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Link href="/seller/register-new" className="flex-1">
                <Button variant="outline" className="w-full">View Application</Button>
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
