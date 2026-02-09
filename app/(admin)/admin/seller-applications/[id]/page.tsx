'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ChevronLeft, FileText, MapPin, Building, Phone, Mail, User, Calendar, Flower2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface SellerApplication {
  producer: any;
  floralSources: any[];
  applicationLog: any[];
}

export default function SellerApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [data, setData] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/admin/seller-applications/${applicationId}`);
        const result = await response.json();
        
        if (!result.success || !result.application) {
          setError('Application not found');
          return;
        }
        
        setData(result.application);
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError('Failed to load application');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [applicationId]);

  const handleAction = async (action: 'approve' | 'reject' | 'request_changes') => {
    if (action === 'reject' && !notes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/seller-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to process application');
        setProcessing(false);
        return;
      }

      // Success - redirect to list
      router.push('/admin/seller-applications');
      router.refresh();
    } catch (err) {
      console.error('Failed to process application:', err);
      setError('Failed to process application. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/admin/seller-applications" className="mt-4 inline-block">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    );
  }

  if (!data || !data.producer) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Application not found</h2>
        <Link href="/admin/seller-applications">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const producer = data.producer;
  const status = producer.application_status || producer.verification_status || 'pending';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/seller-applications"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to applications
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Seller Application Review</h1>
        <Badge className={
          status === 'approved' ? 'bg-green-100 text-green-800' :
          status === 'rejected' ? 'bg-red-100 text-red-800' :
          status === 'changes_requested' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800'
        }>
          {status === 'pending_review' ? 'Pending Review' :
           status === 'changes_requested' ? 'Changes Requested' :
           status === 'approved' ? 'Approved' :
           status === 'rejected' ? 'Rejected' : status}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Section A: Identity */}
      <Card>
        <CardHeader>
          <CardTitle>A. Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Full Legal Name</Label>
              <p className="font-medium">{producer.full_legal_name || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Business Name</Label>
              <p className="font-medium">{producer.business_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Seller Type</Label>
              <p className="font-medium">
                {producer.seller_type === 'individual' ? 'Individual beekeeper' : 
                 producer.seller_type === 'registered_business' ? 'Registered business' : 
                 'Not specified'}
              </p>
            </div>
            {producer.abn && (
              <div>
                <Label className="text-muted-foreground">ABN</Label>
                <p className="font-medium">{producer.abn}</p>
              </div>
            )}
            {producer.trading_name && (
              <div>
                <Label className="text-muted-foreground">Trading Name</Label>
                <p className="font-medium">{producer.trading_name}</p>
              </div>
            )}
            {producer.website && (
              <div>
                <Label className="text-muted-foreground">Website</Label>
                <p className="font-medium">
                  <a href={producer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {producer.website}
                  </a>
                </p>
              </div>
            )}
            {producer.social_profile && (
              <div>
                <Label className="text-muted-foreground">Social Profile</Label>
                <p className="font-medium">{producer.social_profile}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section B: Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle>B. Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Primary Email</Label>
              <p className="font-medium">{producer.primary_email || producer.profiles?.email || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone Number</Label>
              <p className="font-medium">{producer.phone_number || 'Not provided'}</p>
            </div>
            {producer.secondary_contact_name && (
              <div>
                <Label className="text-muted-foreground">Secondary Contact</Label>
                <p className="font-medium">{producer.secondary_contact_name}</p>
              </div>
            )}
            {(producer.secondary_phone || producer.secondary_email) && (
              <div>
                <Label className="text-muted-foreground">Secondary Contact Details</Label>
                <p className="font-medium">
                  {producer.secondary_phone && `Phone: ${producer.secondary_phone}`}
                  {producer.secondary_phone && producer.secondary_email && ' • '}
                  {producer.secondary_email && `Email: ${producer.secondary_email}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section C: Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>C. Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Physical Address (Apiary/Farm)</Label>
            <div className="flex items-start gap-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>
                {producer.physical_address_street || producer.street}<br />
                {producer.physical_address_suburb || producer.suburb}, {producer.physical_address_state || producer.state} {producer.physical_address_postcode || producer.postcode}<br />
                {producer.country || 'Australia'}
              </p>
            </div>
          </div>
          {producer.shipping_address_different && (
            <div>
              <Label className="text-muted-foreground">Shipping Address (Different)</Label>
              <div className="flex items-start gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p>
                  {producer.shipping_address_street}<br />
                  {producer.shipping_address_suburb}, {producer.shipping_address_state} {producer.shipping_address_postcode}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section D: Beekeeper Verification */}
      <Card>
        <CardHeader>
          <CardTitle>D. Beekeeper Verification (Critical)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Registered Beekeeper</Label>
              <p className="font-medium">
                {producer.is_registered_beekeeper ? 'Yes' : 'No'}
              </p>
            </div>
            {producer.beekeeper_registration_number && (
              <div>
                <Label className="text-muted-foreground">Registration Number</Label>
                <p className="font-medium">{producer.beekeeper_registration_number}</p>
              </div>
            )}
            {producer.registering_authority && (
              <div>
                <Label className="text-muted-foreground">Registering Authority</Label>
                <p className="font-medium">
                  {producer.registering_authority}
                  {producer.registering_authority_other && ` - ${producer.registering_authority_other}`}
                </p>
              </div>
            )}
          </div>

          {/* Declarations */}
          <div className="pt-4 border-t">
            <Label className="text-muted-foreground mb-2 block">Required Declarations</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {producer.declaration_hive_owner ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">I am the registered owner/manager of these hives</span>
              </div>
              <div className="flex items-center gap-2">
                {producer.declaration_own_hives ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">All honey sold is produced from my own hives</span>
              </div>
              <div className="flex items-center gap-2">
                {producer.declaration_no_imported ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">No imported or blended honey will be sold</span>
              </div>
              <div className="flex items-center gap-2">
                {producer.declaration_raw_natural ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">All honey sold is raw and natural</span>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="pt-4 border-t">
            <Label className="text-muted-foreground mb-2 block">Uploaded Documents</Label>
            <div className="space-y-2">
              {producer.registration_proof_url && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Proof of Beekeeper Registration</span>
                  </div>
                  <a href={producer.registration_proof_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">View</Button>
                  </a>
                </div>
              )}
              {producer.apiary_photo_url && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Apiary Photo</span>
                  </div>
                  <a href={producer.apiary_photo_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">View</Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section E: Honey Production Details */}
      <Card>
        <CardHeader>
          <CardTitle>E. Honey Production Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {producer.number_of_hives && (
              <div>
                <Label className="text-muted-foreground">Number of Active Hives</Label>
                <p className="font-medium">{producer.number_of_hives}</p>
              </div>
            )}
            {producer.extraction_method && (
              <div>
                <Label className="text-muted-foreground">Extraction Method</Label>
                <p className="font-medium">{producer.extraction_method}</p>
              </div>
            )}
          </div>

          {data.floralSources && data.floralSources.length > 0 && (
            <div>
              <Label className="text-muted-foreground mb-2 block">Primary Floral Sources</Label>
              <div className="flex flex-wrap gap-2">
                {data.floralSources.map((fs: any) => (
                  <Badge key={fs.id} variant="secondary">
                    {fs.floral_sources?.name || fs.other_floral_source || 'Unknown'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {producer.harvest_regions && producer.harvest_regions.length > 0 && (
            <div>
              <Label className="text-muted-foreground mb-2 block">Harvest Regions</Label>
              <div className="flex flex-wrap gap-2">
                {producer.harvest_regions.map((region: string, idx: number) => (
                  <Badge key={idx} variant="outline">{region}</Badge>
                ))}
              </div>
            </div>
          )}

          {producer.typical_harvest_months && producer.typical_harvest_months.length > 0 && (
            <div>
              <Label className="text-muted-foreground mb-2 block">Typical Harvest Months</Label>
              <div className="flex flex-wrap gap-2">
                {producer.typical_harvest_months.map((month: string, idx: number) => (
                  <Badge key={idx} variant="outline">{month}</Badge>
                ))}
              </div>
            </div>
          )}

          {producer.certifications && producer.certifications.length > 0 && (
            <div>
              <Label className="text-muted-foreground mb-2 block">Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {producer.certifications.map((cert: string, idx: number) => (
                  <Badge key={idx}>{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section F: Compliance & Food Safety */}
      <Card>
        <CardHeader>
          <CardTitle>F. Compliance & Food Safety</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Food Safety Compliant</Label>
              <p className="font-medium">
                {producer.food_safety_compliant ? 'Yes' : 'No'}
              </p>
            </div>
            {producer.food_handling_registration_number && (
              <div>
                <Label className="text-muted-foreground">Food Handling Registration Number</Label>
                <p className="font-medium">{producer.food_handling_registration_number}</p>
              </div>
            )}
            {producer.local_council_authority && (
              <div>
                <Label className="text-muted-foreground">Local Council/Authority</Label>
                <p className="font-medium">{producer.local_council_authority}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            {producer.declaration_compliance_documents ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">Understands Hive Joy may request additional compliance documents</span>
          </div>
        </CardContent>
      </Card>

      {/* Section G: Payout & Commercial Details */}
      {(producer.bank_account_name || producer.gst_registered !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>G. Payout & Commercial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {producer.bank_account_name && (
                <div>
                  <Label className="text-muted-foreground">Bank Account Name</Label>
                  <p className="font-medium">{producer.bank_account_name}</p>
                </div>
              )}
              {producer.bank_bsb && (
                <div>
                  <Label className="text-muted-foreground">BSB</Label>
                  <p className="font-medium">{producer.bank_bsb}</p>
                </div>
              )}
              {producer.bank_account_number && (
                <div>
                  <Label className="text-muted-foreground">Account Number</Label>
                  <p className="font-medium">***{producer.bank_account_number.slice(-4)}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">GST Registered</Label>
                <p className="font-medium">{producer.gst_registered ? 'Yes' : 'No'}</p>
              </div>
              {producer.gst_registered && (
                <div>
                  <Label className="text-muted-foreground">GST Included in Pricing</Label>
                  <p className="font-medium">{producer.gst_included_in_pricing ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section H: Public Profile */}
      <Card>
        <CardHeader>
          <CardTitle>H. Public Seller Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {producer.bio && (
            <div>
              <Label className="text-muted-foreground">Bio</Label>
              <p className="mt-1 whitespace-pre-wrap">{producer.bio}</p>
            </div>
          )}
          {producer.profile_image && (
            <div>
              <Label className="text-muted-foreground mb-2 block">Profile Photo</Label>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={producer.profile_image}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Section */}
      {status === 'pending_review' || status === 'changes_requested' ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes {status === 'changes_requested' ? '(Optional)' : '(Required for rejection)'}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this application..."
                rows={4}
              />
            </div>

            <Separator />

            <div className="flex gap-4">
              <Button
                onClick={() => handleAction('approve')}
                disabled={processing}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                {processing ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                onClick={() => handleAction('request_changes')}
                disabled={processing}
                variant="outline"
                className="gap-2"
              >
                Request Changes
              </Button>
              <Button
                onClick={() => handleAction('reject')}
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This application has been {status === 'approved' ? 'approved' : 'rejected'}.
              {producer.rejection_reason && status === 'rejected' && (
                <span className="block mt-2">Reason: {producer.rejection_reason}</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application Log */}
      {data.applicationLog && data.applicationLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Application History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.applicationLog.map((log: any, idx: number) => (
                <div key={idx} className="text-sm border-l-2 pl-4 py-2">
                  <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                    {log.notes && ` • ${log.notes}`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
