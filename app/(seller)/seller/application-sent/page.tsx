'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Edit } from 'lucide-react';

/**
 * Shown after a user successfully submits their seller application.
 * Provides clear success message and actions: return home or edit application.
 */
export default function ApplicationSentPage() {
  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Application successfully sent</CardTitle>
          <CardDescription className="text-base mt-2">
            Your seller application has been submitted. Our team will review it and get back to you by email—usually within 2–3 business days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button className="w-full gap-2" size="lg">
                <Home className="h-4 w-4" />
                Return to home
              </Button>
            </Link>
            <Link href="/seller/register-new" className="flex-1">
              <Button variant="outline" className="w-full gap-2" size="lg">
                <Edit className="h-4 w-4" />
                Edit application
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
