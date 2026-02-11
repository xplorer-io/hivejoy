'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getVerification, approveVerification, rejectVerification } from '@/lib/api/admin';
import { useAuthStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { VerificationSubmission, ProducerProfile } from '@/types';
import { DateTime } from 'luxon';
import {
  ChevronLeft,
  FileText,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export default function VerificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [data, setData] = useState<{
    submission: VerificationSubmission;
    producer: ProducerProfile;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  const id = params.id as string;

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getVerification(id);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch verification:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      await approveVerification(id, user.id, notes || undefined);
      router.push('/admin/verifications');
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user || !notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    try {
      await rejectVerification(id, user.id, notes);
      router.push('/admin/verifications');
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Verification not found</h2>
        <Link href="/admin/verifications">
          <Button>Back to Verifications</Button>
        </Link>
      </div>
    );
  }

  const { submission, producer } = data;
  const submittedAt = DateTime.fromISO(submission.submittedAt);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/verifications"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to verifications
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verification Review</h1>
        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      </div>

      {/* Producer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Producer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Business Name</Label>
              <p className="font-medium">{producer.businessName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">ABN</Label>
              <p className="font-medium">{producer.abn || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Address</Label>
            <div className="flex items-start gap-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>
                {producer.address.street}, {producer.address.suburb},{' '}
                {producer.address.state} {producer.address.postcode}
              </p>
            </div>
          </div>
          {producer.bio && (
            <div>
              <Label className="text-muted-foreground">Bio</Label>
              <p className="mt-1">{producer.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submitted Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {submission.documents.map((doc) => {
              const uploadedAt = DateTime.fromISO(doc.uploadedAt);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.type.replace(/_/g, ' ')} • Uploaded {uploadedAt.toRelative()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Decision */}
      <Card>
        <CardHeader>
          <CardTitle>Your Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (required for rejection)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this verification..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="flex gap-4">
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              {processing ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing}
              variant="destructive"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              {processing ? 'Processing...' : 'Reject'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Submitted {submittedAt.toFormat('d MMMM yyyy')} at {submittedAt.toFormat('h:mm a')}
      </p>
    </div>
  );
}

