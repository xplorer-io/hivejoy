'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Edit2, Save, X, XCircle } from 'lucide-react';
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
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  interface ApplicationData {
    producer: {
      id: string;
      [key: string]: string | number | boolean | string[] | null | undefined;
    };
    floralSources?: Array<{
      floral_source_id: string | null;
      other_floral_source: string | null;
      floral_sources?: { name: string } | null;
    }>;
  }
  
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string | number | boolean | string[] | null | undefined>>({});
  const [saving, setSaving] = useState(false);

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
          setApplicationStatus(data.producer.application_status || data.producer.verificationStatus);
          
          // Fetch application status details (notes, changed fields)
          if (status && status !== 'approved') {
            try {
              const statusRes = await fetch('/api/producers/application-status');
              const statusData = await statusRes.json();
              if (statusData.success) {
                setAdminNotes(statusData.latestNote);
                setChangedFields(statusData.latestChangedFields || statusData.changesRequestedFields || []);
              }
              
              // Fetch full application details
              setLoadingApplication(true);
              const appRes = await fetch('/api/producers/my-application');
              const appData = await appRes.json();
              if (appData.success && appData.application) {
                setApplicationData(appData.application);
              }
            } catch (statusError) {
              console.error('Failed to fetch application details:', statusError);
            } finally {
              setLoadingApplication(false);
            }
          }
        } else {
          // No producer profile found (404 or error)
          setHasProfile(false);
          setIsApproved(false);
          setApplicationStatus(null);
        }
      } catch (error) {
        console.error('Failed to check producer status:', error);
        // On error, assume no profile (consumer applying)
        setHasProfile(false);
        setIsApproved(false);
        setApplicationStatus(null);
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

  // Has profile but not approved - show application status
  if (hasProfile && !isApproved) {
    const isRejected = applicationStatus === 'rejected';
    const isChangesRequested = applicationStatus === 'changes_requested';
    const producer = applicationData?.producer;
    
    const handleEdit = (field: string, currentValue: string | number | boolean | string[] | null | undefined) => {
      setEditingField(field);
      setEditValues({ [field]: currentValue });
    };

    const handleSave = async (field: string) => {
      if (!producer?.id) return;
      
      setSaving(true);
      try {
        // Map field names to API format
        const fieldMap: Record<string, string> = {
          'fullLegalName': 'fullLegalName',
          'businessName': 'businessName',
          'sellerType': 'sellerType',
          'abn': 'abn',
          'tradingName': 'tradingName',
          'website': 'website',
          'socialProfile': 'socialProfile',
          'primaryEmail': 'primaryEmail',
          'phoneNumber': 'phoneNumber',
          'secondaryContactName': 'secondaryContactName',
          'secondaryPhone': 'secondaryPhone',
          'secondaryEmail': 'secondaryEmail',
          'bio': 'bio',
          'foodHandlingRegistrationNumber': 'foodHandlingRegistrationNumber',
          'localCouncilAuthority': 'localCouncilAuthority',
        };

        const apiField = fieldMap[field] || field;
        const payload: Record<string, string | number | boolean | string[] | null | undefined> = {
          producerId: producer.id,
        };

        // Handle nested address fields
        if (field.startsWith('physicalAddress.')) {
          const addressField = field.replace('physicalAddress.', '');
          payload.physicalAddress = {
            street: producer.physical_address_street || producer.street || '',
            suburb: producer.physical_address_suburb || producer.suburb || '',
            state: producer.physical_address_state || producer.state || '',
            postcode: producer.physical_address_postcode || producer.postcode || '',
            [addressField]: editValues[field],
          };
        } else if (field.startsWith('shippingAddress.')) {
          const addressField = field.replace('shippingAddress.', '');
          payload.shippingAddress = {
            street: producer.shipping_address_street || '',
            suburb: producer.shipping_address_suburb || '',
            state: producer.shipping_address_state || '',
            postcode: producer.shipping_address_postcode || '',
            [addressField]: editValues[field],
          };
          payload.shippingAddressDifferent = true;
        } else {
          payload[apiField] = editValues[field];
        }

        const response = await fetch('/api/producers/update-application', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.success) {
          // Reload application data
          const appRes = await fetch('/api/producers/my-application');
          const appData = await appRes.json();
          if (appData.success && appData.application) {
            setApplicationData(appData.application);
          }
          setEditingField(null);
          setEditValues({});
        } else {
          throw new Error(data.error || 'Failed to update');
        }
      } catch (error) {
        console.error('Failed to update field:', error);
        alert('Failed to update. Please try again.');
      } finally {
        setSaving(false);
      }
    };

    const handleCancel = () => {
      setEditingField(null);
      setEditValues({});
    };

    const FieldDisplayLocal = ({ label, field, value, type = 'text' }: { label: string; field: string; value: string | number | boolean | string[] | null | undefined; type?: 'text' | 'textarea' | 'email' | 'tel' }) => {
      const isEditing = editingField === field;
      const displayValue = value || 'Not provided';

      if (isEditing) {
        return (
          <div className="space-y-2">
            <Label>{label}</Label>
            {type === 'textarea' ? (
              <Textarea
                value={editValues[field] || ''}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                rows={3}
              />
            ) : (
              <Input
                type={type}
                value={editValues[field] || ''}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              />
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSave(field)} disabled={saving}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-start justify-between group">
          <div className="flex-1">
            <Label className="text-muted-foreground text-sm">{label}</Label>
            <p className="font-medium mt-1">{displayValue}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleEdit(field, value)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      );
    };
    
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isRejected
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : isChangesRequested 
                  ? 'bg-orange-100 dark:bg-orange-900/30' 
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {isRejected ? (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                ) : isChangesRequested ? (
                  <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                ) : (
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {isRejected 
                    ? 'Application Not Approved' 
                    : isChangesRequested 
                    ? 'Changes Requested' 
                    : 'Your Application is Being Processed'}
                </CardTitle>
                <CardDescription>
                  {isRejected
                    ? 'Your seller application was not approved at this time.'
                    : isChangesRequested 
                    ? 'Please update your application with the requested information.'
                    : "We're reviewing your seller application."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRejected ? (
              <>
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    We regret to inform you that your seller application was not approved. Please review the reason below.
                  </AlertDescription>
                </Alert>
                {adminNotes && (
                  <div className="bg-muted p-4 rounded-lg border-l-4 border-red-500">
                    <h3 className="font-semibold mb-2">Rejection Reason:</h3>
                    <p className="text-sm whitespace-pre-wrap">{adminNotes}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Link href="/seller/register-new" className="block">
                    <Button variant="outline" className="w-full">
                      Submit New Application
                    </Button>
                  </Link>
                  <Link href="/" className="block">
                    <Button variant="ghost" className="w-full">
                      Return to Home
                    </Button>
                  </Link>
                </div>
              </>
            ) : isChangesRequested ? (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Our team has reviewed your application and requires some additional information or changes before we can proceed.
                  </AlertDescription>
                </Alert>
                {adminNotes && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Admin Notes:</h3>
                    <p className="text-sm whitespace-pre-wrap">{adminNotes}</p>
                  </div>
                )}
                {changedFields.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Fields that need attention:</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {changedFields.map((field, idx) => (
                        <li key={idx}>{field}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Thank you for submitting your application to become a Hive Joy seller. Our team is currently reviewing your application and will notify you via email once a decision has been made. This process typically takes 2-3 business days.
                </AlertDescription>
              </Alert>
            )}
            {!isRejected && (
              <div className="space-y-2">
                <Link href="/seller/register-new" className="block">
                  <Button className="w-full" variant={isChangesRequested ? 'default' : 'outline'}>
                    {isChangesRequested ? 'Update Application' : 'View Your Application'}
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="ghost" className="w-full">
                    Return to Home
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Application Details - Only show if not rejected */}
        {applicationData && producer && !isRejected && (
          <Card>
            <CardHeader>
              <CardTitle>Your Application Details</CardTitle>
              <CardDescription>
                Review and edit your application information. Hover over any field to edit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section A: Identity */}
              <div>
                <h3 className="text-lg font-semibold mb-4">A. Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldDisplayLocal label="Full Legal Name" field="fullLegalName" value={producer.full_legal_name} />
                  <FieldDisplayLocal label="Business Name" field="businessName" value={producer.business_name} />
                  <FieldDisplayLocal label="Seller Type" field="sellerType" value={producer.seller_type} />
                  {producer.seller_type === 'registered_business' && (
                    <FieldDisplayLocal label="ABN" field="abn" value={producer.abn} />
                  )}
                  <FieldDisplayLocal label="Trading Name (Optional)" field="tradingName" value={producer.trading_name} />
                  <FieldDisplayLocal label="Website (Optional)" field="website" value={producer.website} type="text" />
                  <FieldDisplayLocal label="Social Profile (Optional)" field="socialProfile" value={producer.social_profile} />
                </div>
              </div>

              <Separator />

              {/* Section B: Contact Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">B. Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldDisplayLocal label="Primary Email" field="primaryEmail" value={producer.primary_email} type="email" />
                  <FieldDisplayLocal label="Phone Number" field="phoneNumber" value={producer.phone_number} type="tel" />
                  {producer.secondary_contact_name && (
                    <FieldDisplayLocal label="Secondary Contact Name" field="secondaryContactName" value={producer.secondary_contact_name} />
                  )}
                  {producer.secondary_phone && (
                    <FieldDisplayLocal label="Secondary Phone" field="secondaryPhone" value={producer.secondary_phone} type="tel" />
                  )}
                  {producer.secondary_email && (
                    <FieldDisplayLocal label="Secondary Email" field="secondaryEmail" value={producer.secondary_email} type="email" />
                  )}
                </div>
              </div>

              <Separator />

              {/* Section C: Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4">C. Physical Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldDisplayLocal label="Street" field="physicalAddress.street" value={producer.physical_address_street || producer.street} />
                  <FieldDisplayLocal label="Suburb" field="physicalAddress.suburb" value={producer.physical_address_suburb || producer.suburb} />
                  <FieldDisplayLocal label="State" field="physicalAddress.state" value={producer.physical_address_state || producer.state} />
                  <FieldDisplayLocal label="Postcode" field="physicalAddress.postcode" value={producer.physical_address_postcode || producer.postcode} />
                </div>
                {producer.shipping_address_different && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-medium mb-3">Shipping Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldDisplayLocal label="Shipping Street" field="shippingAddress.street" value={producer.shipping_address_street} />
                      <FieldDisplayLocal label="Shipping Suburb" field="shippingAddress.suburb" value={producer.shipping_address_suburb} />
                      <FieldDisplayLocal label="Shipping State" field="shippingAddress.state" value={producer.shipping_address_state} />
                      <FieldDisplayLocal label="Shipping Postcode" field="shippingAddress.postcode" value={producer.shipping_address_postcode} />
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Section D: Beekeeper Verification */}
              <div>
                <h3 className="text-lg font-semibold mb-4">D. Beekeeper Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Registered Beekeeper</Label>
                    <p className="font-medium mt-1">{producer.is_registered_beekeeper ? 'Yes' : 'No'}</p>
                  </div>
                  {producer.is_registered_beekeeper && (
                    <>
                      <FieldDisplayLocal label="Beekeeper Registration Number" field="beekeeperRegistrationNumber" value={producer.beekeeper_registration_number} />
                      <FieldDisplayLocal label="Registering Authority" field="registeringAuthority" value={producer.registering_authority} />
                      {producer.registering_authority === 'Other' && (
                        <FieldDisplayLocal label="Other Authority" field="registeringAuthorityOther" value={producer.registering_authority_other} />
                      )}
                      {producer.registration_proof_url && (
                        <div className="col-span-2">
                          <Label className="text-muted-foreground text-sm">Registration Proof</Label>
                          <a href={producer.registration_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mt-1">
                            View Document
                          </a>
                        </div>
                      )}
                      {producer.apiary_photo_url && (
                        <div className="col-span-2">
                          <Label className="text-muted-foreground text-sm">Apiary Photo</Label>
                          <a href={producer.apiary_photo_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mt-1">
                            View Photo
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Section E: Honey Production */}
              <div>
                <h3 className="text-lg font-semibold mb-4">E. Honey Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Number of Hives</Label>
                    <p className="font-medium mt-1">{producer.number_of_hives || 'Not provided'}</p>
                  </div>
                  {producer.harvest_regions && producer.harvest_regions.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground text-sm">Harvest Regions</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {producer.harvest_regions.map((region: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{region}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {producer.typical_harvest_months && producer.typical_harvest_months.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground text-sm">Typical Harvest Months</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {producer.typical_harvest_months.map((month: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{month}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {producer.extraction_method && (
                    <div>
                      <Label className="text-muted-foreground text-sm">Extraction Method</Label>
                      <p className="font-medium mt-1">{producer.extraction_method}</p>
                    </div>
                  )}
                  {applicationData.floralSources && applicationData.floralSources.length > 0 && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground text-sm">Floral Sources</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {applicationData.floralSources?.map((fs, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {fs.floral_sources?.name || fs.other_floral_source || 'Unknown'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Section F: Compliance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">F. Food Safety & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Food Safety Compliant</Label>
                    <p className="font-medium mt-1">{producer.food_safety_compliant ? 'Yes' : 'No'}</p>
                  </div>
                  {producer.food_handling_registration_number && (
                    <FieldDisplayLocal label="Food Handling Registration Number" field="foodHandlingRegistrationNumber" value={producer.food_handling_registration_number} />
                  )}
                  {producer.local_council_authority && (
                    <FieldDisplayLocal label="Local Council Authority" field="localCouncilAuthority" value={producer.local_council_authority} />
                  )}
                </div>
              </div>

              <Separator />

              {/* Section H: Public Profile */}
              {producer.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">H. Public Profile</h3>
                  <FieldDisplayLocal label="Bio" field="bio" value={producer.bio} type="textarea" />
                </div>
              )}

              <Separator />

              <div className="flex gap-4 pt-4">
                <Link href="/seller/register-new" className="flex-1">
                  <Button className="w-full">
                    Edit Full Application
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {loadingApplication && (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading application details...</p>
            </CardContent>
          </Card>
        )}
        </div>
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
