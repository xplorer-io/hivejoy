'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DateTime } from 'luxon';
import { FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';

interface SellerApplication {
  id: string;
  business_name: string;
  full_legal_name?: string;
  primary_email?: string;
  application_status: string;
  application_submitted_at?: string;
  profiles?: {
    email: string;
  };
}

export default function SellerApplicationsPage() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch('/api/admin/seller-applications');
        const data = await response.json();
        
        if (data.success && data.applications) {
          setApplications(data.applications);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'changes_requested':
        return <Badge className="bg-orange-100 text-orange-800">Changes Requested</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Applications</h1>
        <p className="text-muted-foreground">
          Review and verify seller registration applications
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-muted-foreground">
              No pending seller applications to review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const submittedAt = application.application_submitted_at
              ? DateTime.fromISO(application.application_submitted_at)
              : null;

            return (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-lg">
                          {application.business_name}
                        </p>
                        {getStatusBadge(application.application_status)}
                      </div>
                      {application.full_legal_name && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {application.full_legal_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {application.primary_email || application.profiles?.email}
                      </p>
                      {submittedAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted {submittedAt.toRelative()}
                        </p>
                      )}
                    </div>
                    <Link href={`/admin/seller-applications/${application.id}`}>
                      <Button className="gap-2">
                        Review
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
