'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Layers,
  User,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const sidebarLinks = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/batches', label: 'Batches', icon: Layers },
  { href: '/seller/listings', label: 'Listings', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/seller/profile', label: 'Profile', icon: User },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg">🍯</span>
          </div>
          <div>
            <span className="font-bold">Hive Joy</span>
            <span className="text-xs text-muted-foreground block">Seller Portal</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkVerification() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // If user is already a producer (role === 'producer'), skip verification check
      // They are already registered and verified
      if (user.role === 'producer') {
        setVerificationStatus('approved');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/producers/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.producer) {
            // Check application_status (new field) or verification_status (legacy)
            const status = data.producer.application_status || data.producer.verificationStatus;
            setVerificationStatus(status);
            // Check profile status (active, suspended, banned)
            setProfileStatus(data.producer.profileStatus || 'active');
          } else {
            // No producer profile - needs to register
            setVerificationStatus('not_registered');
            setProfileStatus(null);
          }
        }
      } catch (error) {
        console.error('Failed to check verification:', error);
      } finally {
        setLoading(false);
      }
    }

    checkVerification();
  }, [user]);

  // Allow access to registration/apply pages for any authenticated user (consumers can become sellers)
  const pathname = usePathname();
  const isRegistrationPage = pathname?.startsWith('/seller/register') || pathname?.startsWith('/seller/apply');
  
  // Early return: Always allow access to registration/apply pages
  if (isRegistrationPage) {
    return (
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - hidden on registration pages */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/30">
          <SidebarContent />
        </aside>

        {/* Mobile Header */}
        <div className="flex-1 flex flex-col">
          <header className="lg:hidden flex items-center justify-between p-4 border-b">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg">🍯</span>
              </div>
              <span className="font-bold">Seller Portal</span>
            </Link>

            <div className="w-10" /> {/* Spacer for centering */}
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    );
  }
  
  // Check role - block consumers from other seller pages
  if (user && user.role !== 'producer' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Producer Access Required</h1>
          <p className="text-muted-foreground mb-4">
            This area is only accessible to verified producers.
          </p>
          <Link href="/seller/apply">
            <Button className="mb-2">Become a Seller</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check profile status - block suspended/banned sellers
  if (!loading && profileStatus && (profileStatus === 'suspended' || profileStatus === 'banned')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">
            {profileStatus === 'suspended' ? 'Account Suspended' : 'Account Banned'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {profileStatus === 'suspended'
              ? 'Your seller account has been suspended. Please contact support for more information.'
              : 'Your seller account has been banned. Please contact support if you believe this is an error.'}
          </p>
          <Link href="/">
            <Button>Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check verification status - but skip if user is already a producer
  if (!loading && verificationStatus && user?.role !== 'producer') {
    if (verificationStatus === 'not_registered' || verificationStatus === 'draft') {
      // Not registered or draft - redirect to registration
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Seller Verification Required</h1>
            <p className="text-muted-foreground mb-4">
              You need to complete your seller registration and get verified before accessing the seller dashboard.
            </p>
            <Link href="/seller/register-new">
              <Button>Complete Registration</Button>
            </Link>
          </div>
        </div>
      );
    } else if (verificationStatus === 'pending_review' || verificationStatus === 'submitted' || verificationStatus === 'under_review' || verificationStatus === 'changes_requested') {
      // Pending review - show status message
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Application Under Review</h1>
            <p className="text-muted-foreground mb-4">
              Your seller application is being reviewed by our team. You&apos;ll receive an email once your application is approved.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Status: {verificationStatus === 'changes_requested' ? 'Changes Requested' : 'Pending Review'}
            </p>
            {verificationStatus === 'changes_requested' && (
              <Link href="/seller/register-new">
                <Button>Update Application</Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="mt-2">Return to Store</Button>
            </Link>
          </div>
        </div>
      );
    } else if (verificationStatus === 'rejected') {
      // Rejected
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Application Rejected</h1>
            <p className="text-muted-foreground mb-4">
              Your seller application was not approved. Please contact support for more information.
            </p>
            <Link href="/">
              <Button>Return to Store</Button>
            </Link>
          </div>
        </div>
      );
    } else if (verificationStatus !== 'approved') {
      // Any other status - not approved
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Verification Required</h1>
            <p className="text-muted-foreground mb-4">
              Your seller account needs to be verified before you can access the dashboard.
            </p>
            <Link href="/seller/register-new">
              <Button>Complete Registration</Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/30">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between p-4 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg">🍯</span>
            </div>
            <span className="font-bold">Seller Portal</span>
          </Link>

          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

