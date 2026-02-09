'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';

interface Declarations {
  declaration1: boolean;
  declaration2: boolean;
  declaration3: boolean;
  declaration4: boolean;
  declaration5: boolean;
  declaration6: boolean;
  declaration7: boolean;
  declaration8: boolean;
}

export default function SellerRegisterPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [abn, setAbn] = useState('');
  const [street, setStreet] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [bio, setBio] = useState('');

  // Declarations
  const [declarations, setDeclarations] = useState<Declarations>({
    declaration1: false,
    declaration2: false,
    declaration3: false,
    declaration4: false,
    declaration5: false,
    declaration6: false,
    declaration7: false,
    declaration8: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const allDeclarationsAccepted = Object.values(declarations).every((val) => val === true) && termsAccepted;

  const handleDeclarationChange = (key: keyof Declarations, value: boolean) => {
    setDeclarations((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in to register as a seller.');
      return;
    }

    // Validate all declarations are accepted
    if (!allDeclarationsAccepted) {
      setError('All declarations and terms must be accepted to submit your application.');
      return;
    }

    // Validate required fields
    if (!businessName.trim() || !street.trim() || !suburb.trim() || !state.trim() || !postcode.trim() || !bio.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Get IP address and user agent for legal archive
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => undefined);
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

      const response = await fetch('/api/producers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          abn: abn.trim() || undefined,
          address: {
            street: street.trim(),
            suburb: suburb.trim(),
            state: state.trim(),
            postcode: postcode.trim(),
            country: 'Australia',
          },
          bio: bio.trim(),
          declarations: {
            declaration1: declarations.declaration1,
            declaration2: declarations.declaration2,
            declaration3: declarations.declaration3,
            declaration4: declarations.declaration4,
            declaration5: declarations.declaration5,
            declaration6: declarations.declaration6,
            declaration7: declarations.declaration7,
            declaration8: declarations.declaration8,
          },
          termsAccepted: termsAccepted,
          ipAddress,
          userAgent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to register as seller');
      }

      // Redirect to seller dashboard
      router.push('/seller/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <Link href="/auth/producer">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Become a Hive Joy Seller</CardTitle>
            <CardDescription>
              Register your apiary and start selling authentic Australian honey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Golden Hive Apiaries"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abn">ABN (Optional)</Label>
                    <Input
                      id="abn"
                      value={abn}
                      onChange={(e) => setAbn(e.target.value)}
                      placeholder="11 digits"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Address</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 Honey Lane"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="suburb">Suburb *</Label>
                      <Input
                        id="suburb"
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        placeholder="Beechworth"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="VIC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="3747"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">About Your Business</h3>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell customers about your apiary, your story, and what makes your honey special..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Seller Declarations */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Seller Declarations</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  All declarations must be accepted to submit your application.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration1"
                      checked={declarations.declaration1}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration1', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration1" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>declare</strong> that I am a registered Australian beekeeper and that all information provided in this application is true, accurate, and not misleading.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration2"
                      checked={declarations.declaration2}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration2', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration2" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>declare</strong> that I am the registered owner, or an authorised manager, of the hives listed in this application and have full authority to sell honey produced from those hives.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration3"
                      checked={declarations.declaration3}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration3', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration3" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>declare</strong> that all honey sold through the Hive Joy platform is produced exclusively from my own hives.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration4"
                      checked={declarations.declaration4}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration4', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration4" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>declare</strong> that no imported, blended, adulterated, or third-party honey will be sold through the Hive Joy platform.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration5"
                      checked={declarations.declaration5}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration5', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration5" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>declare</strong> that all honey sold through the Hive Joy platform is raw and natural, and has not been processed, heated or mixed with additives, syrups, or other substances.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration6"
                      checked={declarations.declaration6}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration6', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration6" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>declare</strong> that I comply with all applicable Australian laws and regulations relating to food safety, biosecurity, labelling, and the production and sale of honey.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration7"
                      checked={declarations.declaration7}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration7', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration7" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>acknowledge</strong> and <strong>agree</strong> that Hive Joy may, at its discretion, request additional documentation, honey samples, or independent laboratory testing to verify authenticity, floral source, and regulatory compliance.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration8"
                      checked={declarations.declaration8}
                      onCheckedChange={(checked) => handleDeclarationChange('declaration8', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="declaration8" className="text-sm leading-relaxed cursor-pointer">
                      I <strong>acknowledge</strong> that any false, misleading, or incomplete information, or any breach of these declarations or the Seller Terms and Conditions, may result in suspension or termination of my seller account, removal of product listings, and other enforcement action by Hive Joy.
                    </Label>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      By submitting this application, you <strong>confirm</strong> that the above declarations are true and correct and that you <strong>agree</strong> to be legally bound by the{' '}
                      <Link href="/terms/seller" className="text-primary underline hover:no-underline" target="_blank">
                        Hive Joy Seller Terms & Conditions
                      </Link>
                      .
                    </Label>
                  </div>
                </div>

                {!allDeclarationsAccepted && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      All 8 declarations and the Terms & Conditions must be accepted to submit your application.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !allDeclarationsAccepted} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Link href="/seller/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
