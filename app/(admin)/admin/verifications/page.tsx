'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVerificationQueue } from '@/lib/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { VerificationSubmission } from '@/types';
import { DateTime } from 'luxon';
import { FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerifications() {
      try {
        const data = await getVerificationQueue();
        setVerifications(data);
      } catch (error) {
        console.error('Failed to fetch verifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVerifications();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Producer Verifications</h1>
        <p className="text-muted-foreground">
          Review and verify producer applications
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
      ) : verifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-muted-foreground">
              No pending verifications to review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => {
            const submittedAt = DateTime.fromISO(verification.submittedAt);

            return (
              <Card key={verification.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">
                          Producer {verification.producerId}
                        </p>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending Review
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {submittedAt.toRelative()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {verification.documents.length} document(s) attached
                        </span>
                      </div>
                    </div>
                    <Link href={`/admin/verifications/${verification.id}`}>
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

