'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { uploadImage } from '@/lib/cloudinary/upload';
import { floralSourceOptions } from '@/lib/api/mock-data';

interface FloralSource {
  id: string;
  name: string;
  region_exclusive: boolean;
  region_state: string[];
}

const REGISTERING_AUTHORITIES = [
  'NSW DPI',
  'Agriculture Victoria',
  'QLD Department of Agriculture',
  'PIRSA (SA)',
  'DPIRD (WA)',
  'Biosecurity Tasmania',
  'NT Department of Industry',
  'Other',
];

const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function SellerRegisterNewPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [floralSources, setFloralSources] = useState<FloralSource[]>([]);
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Step 1: Identity
  const [fullLegalName, setFullLegalName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [sellerType, setSellerType] = useState<'individual' | 'registered_business' | ''>('');
  const [abn, setAbn] = useState('');
  const [abnConfirmed, setAbnConfirmed] = useState(false);
  const [tradingName, setTradingName] = useState('');
  const [website, setWebsite] = useState('');
  const [socialProfile, setSocialProfile] = useState('');

  // Step 2: Contact Details
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secondaryContactName, setSecondaryContactName] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');

  // Step 3: Address
  const [physicalStreet, setPhysicalStreet] = useState('');
  const [physicalSuburb, setPhysicalSuburb] = useState('');
  const [physicalState, setPhysicalState] = useState('');
  const [physicalPostcode, setPhysicalPostcode] = useState('');
  const [shippingDifferent, setShippingDifferent] = useState(false);
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingSuburb, setShippingSuburb] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPostcode, setShippingPostcode] = useState('');

  // Step 4: Beekeeper Verification
  const [isRegisteredBeekeeper, setIsRegisteredBeekeeper] = useState(false);
  const [beekeeperRegNumber, setBeekeeperRegNumber] = useState('');
  const [registeringAuthority, setRegisteringAuthority] = useState('');
  const [registeringAuthorityOther, setRegisteringAuthorityOther] = useState('');
  const [registrationProofUrl, setRegistrationProofUrl] = useState('');
  const [apiaryPhotoUrl, setApiaryPhotoUrl] = useState('');
  const [declarationHiveOwner, setDeclarationHiveOwner] = useState(false);
  const [declarationOwnHives, setDeclarationOwnHives] = useState(false);
  const [declarationNoImported, setDeclarationNoImported] = useState(false);
  const [declarationRawNatural, setDeclarationRawNatural] = useState(false);

  // Step 5: Honey Production
  const [numberOfHives, setNumberOfHives] = useState('');
  const [selectedFloralSources, setSelectedFloralSources] = useState<string[]>([]);
  const [otherFloralSource, setOtherFloralSource] = useState('');
  const [harvestRegions, setHarvestRegions] = useState<string[]>([]);
  const [harvestRegionInput, setHarvestRegionInput] = useState('');
  const [typicalHarvestMonths, setTypicalHarvestMonths] = useState<string[]>([]);
  const [extractionMethod, setExtractionMethod] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);

  // Step 6: Compliance
  const [foodSafetyCompliant, setFoodSafetyCompliant] = useState(false);
  const [foodHandlingRegNumber, setFoodHandlingRegNumber] = useState('');
  const [localCouncilAuthority, setLocalCouncilAuthority] = useState('');
  const [declarationComplianceDocs, setDeclarationComplianceDocs] = useState(false);

  // Step 7: Payout Details (can be filled post-approval)
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankBSB, setBankBSB] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [gstRegistered, setGstRegistered] = useState(false);
  const [gstIncludedInPricing, setGstIncludedInPricing] = useState(false);

  // Step 8: Public Profile & Final Declarations
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [farmPhotos, setFarmPhotos] = useState<File[]>([]);
  const [farmPhotoUrls, setFarmPhotoUrls] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Load floral sources on mount
  useEffect(() => {
    async function loadFloralSources() {
      try {
        const response = await fetch('/api/floral-sources');
        const data = await response.json();
        if (data.success && data.floralSources && data.floralSources.length > 0) {
          setFloralSources(data.floralSources);
        } else {
          // Fallback: Use mock data if API fails or returns empty
          console.warn('Floral sources API returned empty or failed, using fallback list');
          const fallbackSources = floralSourceOptions.map((name, index) => ({
            id: `fallback-${index}`,
            name,
            region_exclusive: false,
            region_state: []
          }));
          setFloralSources(fallbackSources);
        }
      } catch (err) {
        console.error('Failed to load floral sources:', err);
        // Fallback on error: Use mock data
        const fallbackSources = floralSourceOptions.map((name, index) => ({
          id: `fallback-${index}`,
          name,
          region_exclusive: false,
          region_state: []
        }));
        setFloralSources(fallbackSources);
      }
    }
    loadFloralSources();
  }, []);

  // Set user email if available
  useEffect(() => {
    if (user?.email) {
      setPrimaryEmail(user.email);
    }
  }, [user]);

  // Check if user is already a verified seller
  useEffect(() => {
    async function checkSellerStatus() {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await fetch('/api/producers/me');
        const data = await response.json();
        
        if (data.success && data.producer) {
          const verificationStatus = data.producer.verificationStatus;
          if (verificationStatus === 'approved') {
            setIsVerifiedSeller(true);
          }
        }
      } catch (err) {
        console.error('Failed to check seller status:', err);
      } finally {
        setCheckingStatus(false);
      }
    }

    checkSellerStatus();
  }, [user]);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return fullLegalName.trim() !== '' && businessName.trim() !== '' && sellerType !== '' && 
               (sellerType === 'individual' || (abn.trim() !== '' && abnConfirmed));
      case 2:
        return primaryEmail.trim() !== '' && phoneNumber.trim() !== '';
      case 3:
        return physicalStreet.trim() !== '' && physicalSuburb.trim() !== '' && 
               physicalState !== '' && physicalPostcode.trim() !== '' &&
               (!shippingDifferent || (shippingStreet.trim() !== '' && shippingSuburb.trim() !== '' && 
                shippingState !== '' && shippingPostcode.trim() !== ''));
      case 4:
        return isRegisteredBeekeeper && beekeeperRegNumber.trim() !== '' && 
               registeringAuthority !== '' && registrationProofUrl !== '' && 
               apiaryPhotoUrl !== '' && declarationHiveOwner && declarationOwnHives && 
               declarationNoImported && declarationRawNatural;
      case 5:
        return numberOfHives !== '' && selectedFloralSources.length > 0 && 
               harvestRegions.length > 0 && typicalHarvestMonths.length > 0;
      case 6:
        return foodSafetyCompliant && declarationComplianceDocs;
      case 7:
        return true; // Optional, can be filled later
      default:
        return false;
    }
  };

  const handleFileUpload = async (file: File, type: 'registration' | 'apiary' | 'profile' | 'farm') => {
    setUploading(true);
    setError(null);

    try {
      let folder: 'verification' | 'producers' = 'verification';
      if (type === 'profile' || type === 'farm') {
        folder = 'producers';
      }

      const result = await uploadImage(file, folder);
      
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      switch (type) {
        case 'registration':
          setRegistrationProofUrl(result.url);
          break;
        case 'apiary':
          setApiaryPhotoUrl(result.url);
          break;
        case 'profile':
          setProfilePhotoUrl(result.url);
          break;
        case 'farm':
          setFarmPhotoUrls([...farmPhotoUrls, result.url]);
          break;
      }

      return result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in to register as a seller.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get IP and user agent
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => undefined);
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

      const response = await fetch('/api/producers/register-comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Identity
          fullLegalName: fullLegalName.trim(),
          businessName: businessName.trim(),
          sellerType,
          abn: abn.trim() || undefined,
          tradingName: tradingName.trim() || undefined,
          website: website.trim() || undefined,
          socialProfile: socialProfile.trim() || undefined,

          // Contact
          primaryEmail: primaryEmail.trim(),
          phoneNumber: phoneNumber.trim(),
          secondaryContactName: secondaryContactName.trim() || undefined,
          secondaryPhone: secondaryPhone.trim() || undefined,
          secondaryEmail: secondaryEmail.trim() || undefined,

          // Address
          physicalAddress: {
            street: physicalStreet.trim(),
            suburb: physicalSuburb.trim(),
            state: physicalState,
            postcode: physicalPostcode.trim(),
          },
          shippingAddress: shippingDifferent ? {
            street: shippingStreet.trim(),
            suburb: shippingSuburb.trim(),
            state: shippingState,
            postcode: shippingPostcode.trim(),
          } : undefined,

          // Beekeeper Verification
          isRegisteredBeekeeper,
          beekeeperRegistrationNumber: beekeeperRegNumber.trim(),
          registeringAuthority,
          registeringAuthorityOther: registeringAuthority === 'Other' ? registeringAuthorityOther.trim() : undefined,
          registrationProofUrl,
          apiaryPhotoUrl,
          declarations: {
            hiveOwner: declarationHiveOwner,
            ownHives: declarationOwnHives,
            noImported: declarationNoImported,
            rawNatural: declarationRawNatural,
          },

          // Production
          numberOfHives: parseInt(numberOfHives, 10),
          floralSourceIds: selectedFloralSources.filter(id => id !== 'other'), // Filter out 'other' string
          otherFloralSource: selectedFloralSources.includes('other') ? otherFloralSource.trim() || undefined : undefined,
          harvestRegions,
          typicalHarvestMonths,
          extractionMethod: extractionMethod.trim() || undefined,
          certifications: certifications.length > 0 ? certifications : undefined,

          // Compliance
          foodSafetyCompliant,
          foodHandlingRegistrationNumber: foodHandlingRegNumber.trim() || undefined,
          localCouncilAuthority: localCouncilAuthority.trim() || undefined,
          declarationComplianceDocuments: declarationComplianceDocs,

          // Payout (optional for now)
          bankAccountName: bankAccountName.trim() || undefined,
          bankBSB: bankBSB.trim() || undefined,
          bankAccountNumber: bankAccountNumber.trim() || undefined,
          gstRegistered,
          gstIncludedInPricing,

          // Profile (optional - can be added later)
          bio: bio.trim() || undefined,
          profileImageUrl: profilePhotoUrl || undefined,
          farmPhotoUrls: farmPhotoUrls.length > 0 ? farmPhotoUrls : undefined,

          // Metadata
          ipAddress,
          userAgent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Success - redirect to dashboard
      router.push('/seller/dashboard?application=submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addHarvestRegion = () => {
    if (harvestRegionInput.trim() && !harvestRegions.includes(harvestRegionInput.trim())) {
      setHarvestRegions([...harvestRegions, harvestRegionInput.trim()]);
      setHarvestRegionInput('');
    }
  };

  const removeHarvestRegion = (region: string) => {
    setHarvestRegions(harvestRegions.filter((r) => r !== region));
  };


  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">Checking your seller status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to register as a seller.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link href="/auth/consumer?next=/seller/register-new">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerifiedSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <Card className="w-full max-w-md">
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

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Become a Hive Joy Seller</CardTitle>
                <CardDescription>
                  Complete all sections to submit your application for review
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</div>
                <Progress value={progress} className="w-32 mt-2" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Identity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">A. Identity</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullLegalName">Full Legal Name *</Label>
                      <Input
                        id="fullLegalName"
                        value={fullLegalName}
                        onChange={(e) => setFullLegalName(e.target.value)}
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Golden Hive Apiaries"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sellerType">Seller Type *</Label>
                      <Select value={sellerType} onValueChange={(v) => setSellerType(v as 'individual' | 'registered_business' | '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seller type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual beekeeper</SelectItem>
                          <SelectItem value="registered_business">Registered business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {sellerType === 'registered_business' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="abn">ABN *</Label>
                          <Input
                            id="abn"
                            value={abn}
                            onChange={(e) => setAbn(e.target.value)}
                            placeholder="11 digits"
                            maxLength={11}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="abnConfirmed"
                            checked={abnConfirmed}
                            onCheckedChange={(checked) => setAbnConfirmed(checked === true)}
                          />
                          <Label htmlFor="abnConfirmed" className="text-sm cursor-pointer">
                            I confirm this ABN is correct
                          </Label>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="tradingName">Trading Name (Optional)</Label>
                      <Input
                        id="tradingName"
                        value={tradingName}
                        onChange={(e) => setTradingName(e.target.value)}
                        placeholder="As displayed to customers"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialProfile">Social Profile (Optional)</Label>
                        <Input
                          id="socialProfile"
                          value={socialProfile}
                          onChange={(e) => setSocialProfile(e.target.value)}
                          placeholder="@username or URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">B. Contact Details</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryEmail">Primary Email *</Label>
                        <Input
                          id="primaryEmail"
                          type="email"
                          value={primaryEmail}
                          onChange={(e) => setPrimaryEmail(e.target.value)}
                          disabled={!!user?.email}
                          required
                          className={user?.email ? 'bg-muted cursor-not-allowed' : ''}
                        />
                        {user?.email && (
                          <p className="text-xs text-muted-foreground">
                            Using your authenticated email address
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactName">Secondary Contact Name (Optional)</Label>
                      <Input
                        id="secondaryContactName"
                        value={secondaryContactName}
                        onChange={(e) => setSecondaryContactName(e.target.value)}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="secondaryPhone">Secondary Phone (Optional)</Label>
                        <Input
                          id="secondaryPhone"
                          type="tel"
                          value={secondaryPhone}
                          onChange={(e) => setSecondaryPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryEmail">Secondary Email (Optional)</Label>
                        <Input
                          id="secondaryEmail"
                          type="email"
                          value={secondaryEmail}
                          onChange={(e) => setSecondaryEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">C. Address Information</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Physical Address (Apiary/Farm Location) *</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="physicalStreet">Street Address *</Label>
                          <Input
                            id="physicalStreet"
                            value={physicalStreet}
                            onChange={(e) => setPhysicalStreet(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="physicalSuburb">Suburb *</Label>
                            <Input
                              id="physicalSuburb"
                              value={physicalSuburb}
                              onChange={(e) => setPhysicalSuburb(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="physicalState">State *</Label>
                            <Select value={physicalState} onValueChange={setPhysicalState}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {AUSTRALIAN_STATES.map((state) => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="physicalPostcode">Postcode *</Label>
                            <Input
                              id="physicalPostcode"
                              value={physicalPostcode}
                              onChange={(e) => setPhysicalPostcode(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="shippingDifferent"
                        checked={shippingDifferent}
                        onCheckedChange={(checked) => setShippingDifferent(checked === true)}
                      />
                      <Label htmlFor="shippingDifferent" className="cursor-pointer">
                        Shipping address is different from physical address
                      </Label>
                    </div>

                    {shippingDifferent && (
                      <div>
                        <h4 className="font-medium mb-4">Shipping / Dispatch Address *</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="shippingStreet">Street Address *</Label>
                            <Input
                              id="shippingStreet"
                              value={shippingStreet}
                              onChange={(e) => setShippingStreet(e.target.value)}
                              required
                            />
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="shippingSuburb">Suburb *</Label>
                              <Input
                                id="shippingSuburb"
                                value={shippingSuburb}
                                onChange={(e) => setShippingSuburb(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="shippingState">State *</Label>
                              <Select value={shippingState} onValueChange={setShippingState}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                  {AUSTRALIAN_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="shippingPostcode">Postcode *</Label>
                              <Input
                                id="shippingPostcode"
                                value={shippingPostcode}
                                onChange={(e) => setShippingPostcode(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Beekeeper Verification - This is the critical section */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">D. Beekeeper Verification (Critical Section)</h3>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You must be a registered Australian beekeeper to sell on Hive Joy.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isRegisteredBeekeeper"
                        checked={isRegisteredBeekeeper}
                        onCheckedChange={(checked) => setIsRegisteredBeekeeper(checked === true)}
                      />
                      <Label htmlFor="isRegisteredBeekeeper" className="cursor-pointer font-medium">
                        Are you a registered beekeeper in Australia? * (Must be Yes)
                      </Label>
                    </div>

                    {isRegisteredBeekeeper && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="beekeeperRegNumber">Beekeeper Registration Number *</Label>
                          <Input
                            id="beekeeperRegNumber"
                            value={beekeeperRegNumber}
                            onChange={(e) => setBeekeeperRegNumber(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="registeringAuthority">Registering Authority *</Label>
                          <Select value={registeringAuthority} onValueChange={setRegisteringAuthority}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select authority" />
                            </SelectTrigger>
                            <SelectContent>
                              {REGISTERING_AUTHORITIES.map((auth) => (
                                <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {registeringAuthority === 'Other' && (
                          <div className="space-y-2">
                            <Label htmlFor="registeringAuthorityOther">Please specify *</Label>
                            <Input
                              id="registeringAuthorityOther"
                              value={registeringAuthorityOther}
                              onChange={(e) => setRegisteringAuthorityOther(e.target.value)}
                              required
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Proof of Beekeeper Registration *</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleFileUpload(file, 'registration');
                                }
                              }}
                              disabled={uploading}
                            />
                            {registrationProofUrl && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Upload PDF or image of your registration certificate
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Photo of Apiary or Hives *</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleFileUpload(file, 'apiary');
                                }
                              }}
                              disabled={uploading}
                            />
                            {apiaryPhotoUrl && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Upload a photo showing your apiary or hives
                          </p>
                        </div>

                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium">Required Declarations *</h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Checkbox
                                id="declarationHiveOwner"
                                checked={declarationHiveOwner}
                                onCheckedChange={(checked) => setDeclarationHiveOwner(checked === true)}
                                className="mt-1"
                              />
                              <Label htmlFor="declarationHiveOwner" className="text-sm cursor-pointer">
                                I am the registered owner/manager of these hives
                              </Label>
                            </div>
                            <div className="flex items-start gap-2">
                              <Checkbox
                                id="declarationOwnHives"
                                checked={declarationOwnHives}
                                onCheckedChange={(checked) => setDeclarationOwnHives(checked === true)}
                                className="mt-1"
                              />
                              <Label htmlFor="declarationOwnHives" className="text-sm cursor-pointer">
                                All honey sold is produced from my own hives
                              </Label>
                            </div>
                            <div className="flex items-start gap-2">
                              <Checkbox
                                id="declarationNoImported"
                                checked={declarationNoImported}
                                onCheckedChange={(checked) => setDeclarationNoImported(checked === true)}
                                className="mt-1"
                              />
                              <Label htmlFor="declarationNoImported" className="text-sm cursor-pointer">
                                No imported or blended honey will be sold
                              </Label>
                            </div>
                            <div className="flex items-start gap-2">
                              <Checkbox
                                id="declarationRawNatural"
                                checked={declarationRawNatural}
                                onCheckedChange={(checked) => setDeclarationRawNatural(checked === true)}
                                className="mt-1"
                              />
                              <Label htmlFor="declarationRawNatural" className="text-sm cursor-pointer">
                                All honey sold is raw and natural, and is not processed, heated, or mixed with additives or syrups
                              </Label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Honey Production Details */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">E. Honey Production Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="numberOfHives">Number of Active Hives *</Label>
                      <Input
                        id="numberOfHives"
                        type="number"
                        min="1"
                        value={numberOfHives}
                        onChange={(e) => setNumberOfHives(e.target.value)}
                        placeholder="e.g., 50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Floral Sources * (Select all that apply)</Label>
                      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                        {floralSources.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Loading floral sources...</p>
                        ) : (
                          <div className="space-y-2">
                            {floralSources.map((source) => (
                              <div key={source.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={`floral-${source.id}`}
                                  checked={selectedFloralSources.includes(source.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedFloralSources([...selectedFloralSources, source.id]);
                                    } else {
                                      setSelectedFloralSources(selectedFloralSources.filter(id => id !== source.id));
                                    }
                                  }}
                                />
                                <Label htmlFor={`floral-${source.id}`} className="text-sm cursor-pointer">
                                  {source.name}
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Checkbox
                                id="floral-other"
                                checked={selectedFloralSources.includes('other')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedFloralSources([...selectedFloralSources, 'other']);
                                  } else {
                                    setSelectedFloralSources(selectedFloralSources.filter(id => id !== 'other'));
                                    setOtherFloralSource('');
                                  }
                                }}
                              />
                              <Label htmlFor="floral-other" className="text-sm cursor-pointer">Other</Label>
                            </div>
                            {selectedFloralSources.includes('other') && (
                              <Input
                                value={otherFloralSource}
                                onChange={(e) => setOtherFloralSource(e.target.value)}
                                placeholder="Specify other floral source"
                                className="ml-6"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Harvest Regions * (State + Locality)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={harvestRegionInput}
                          onChange={(e) => setHarvestRegionInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addHarvestRegion();
                            }
                          }}
                          placeholder="e.g., VIC - Beechworth"
                        />
                        <Button type="button" onClick={addHarvestRegion} variant="outline">
                          Add
                        </Button>
                      </div>
                      {harvestRegions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {harvestRegions.map((region) => (
                            <Badge key={region} variant="secondary" className="gap-1">
                              {region}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => removeHarvestRegion(region)} />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Typical Harvest Months * (Select all that apply)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((month) => (
                          <div key={month} className="flex items-center gap-2">
                            <Checkbox
                              id={`month-${month}`}
                              checked={typicalHarvestMonths.includes(month)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTypicalHarvestMonths([...typicalHarvestMonths, month]);
                                } else {
                                  setTypicalHarvestMonths(typicalHarvestMonths.filter(m => m !== month));
                                }
                              }}
                            />
                            <Label htmlFor={`month-${month}`} className="text-sm cursor-pointer">{month}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extractionMethod">Extraction Method (Optional)</Label>
                      <Input
                        id="extractionMethod"
                        value={extractionMethod}
                        onChange={(e) => setExtractionMethod(e.target.value)}
                        placeholder="e.g., Raw, cold-extracted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Certifications (Optional)</Label>
                      <div className="space-y-2">
                        {['Organic', 'Raw', 'Bio-dynamic'].map((cert) => (
                          <div key={cert} className="flex items-center gap-2">
                            <Checkbox
                              id={`cert-${cert}`}
                              checked={certifications.includes(cert)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCertifications([...certifications, cert]);
                                } else {
                                  setCertifications(certifications.filter(c => c !== cert));
                                }
                              }}
                            />
                            <Label htmlFor={`cert-${cert}`} className="text-sm cursor-pointer">{cert}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Compliance & Food Safety */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">F. Compliance & Food Safety</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="foodSafetyCompliant"
                        checked={foodSafetyCompliant}
                        onCheckedChange={(checked) => setFoodSafetyCompliant(checked === true)}
                      />
                      <Label htmlFor="foodSafetyCompliant" className="cursor-pointer font-medium">
                        I comply with Australian food safety regulations * (Must be Yes)
                      </Label>
                    </div>

                    {foodSafetyCompliant && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="foodHandlingRegNumber">Food Handling Registration Number (If applicable)</Label>
                          <Input
                            id="foodHandlingRegNumber"
                            value={foodHandlingRegNumber}
                            onChange={(e) => setFoodHandlingRegNumber(e.target.value)}
                            placeholder="Enter registration number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="localCouncilAuthority">Local Council or Authority Name *</Label>
                          <Input
                            id="localCouncilAuthority"
                            value={localCouncilAuthority}
                            onChange={(e) => setLocalCouncilAuthority(e.target.value)}
                            placeholder="e.g., City of Melbourne"
                            required
                          />
                        </div>

                        <div className="flex items-start gap-2 pt-4 border-t">
                          <Checkbox
                            id="declarationComplianceDocs"
                            checked={declarationComplianceDocs}
                            onCheckedChange={(checked) => setDeclarationComplianceDocs(checked === true)}
                            className="mt-1"
                          />
                          <Label htmlFor="declarationComplianceDocs" className="text-sm cursor-pointer">
                            I understand Hive Joy may request additional compliance documents at any time *
                          </Label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Payout & Commercial Details */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">G. Payout & Commercial Details</h3>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This information can be provided now or after approval. It&apos;s required before you can receive payouts.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountName">Bank Account Name</Label>
                      <Input
                        id="bankAccountName"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        placeholder="Account holder name"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankBSB">BSB</Label>
                        <Input
                          id="bankBSB"
                          value={bankBSB}
                          onChange={(e) => setBankBSB(e.target.value)}
                          placeholder="000-000"
                          maxLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNumber">Account Number</Label>
                        <Input
                          id="bankAccountNumber"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="Account number"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="gstRegistered"
                          checked={gstRegistered}
                          onCheckedChange={(checked) => setGstRegistered(checked === true)}
                        />
                        <Label htmlFor="gstRegistered" className="cursor-pointer">
                          Are you GST registered?
                        </Label>
                      </div>

                      {gstRegistered && (
                        <div className="flex items-center gap-2 ml-6">
                          <Checkbox
                            id="gstIncludedInPricing"
                            checked={gstIncludedInPricing}
                            onCheckedChange={(checked) => setGstIncludedInPricing(checked === true)}
                          />
                          <Label htmlFor="gstIncludedInPricing" className="text-sm cursor-pointer">
                            GST is included in my pricing
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {currentStep < totalSteps && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as FormStep)}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1) as FormStep)}
                  disabled={!canProceedToNextStep() || uploading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {currentStep === totalSteps && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1 as FormStep)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceedToNextStep() || loading || uploading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
