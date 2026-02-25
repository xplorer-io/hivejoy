'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function TestSendGridPage() {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ recipient?: string } | null>(null);

  const [businessName, setBusinessName] = useState('Test Honey Farm');
  const [email, setEmail] = useState('seller@example.com');
  const [abn, setAbn] = useState('12345678901');
  const [street, setStreet] = useState('123 Honey Lane');
  const [suburb, setSuburb] = useState('Beeville');
  const [state, setState] = useState('VIC');
  const [postcode, setPostcode] = useState('3000');
  const [country, setCountry] = useState('Australia');
  const [bio, setBio] = useState('We are a family-owned honey farm producing authentic Australian honey.');
  const [producerId, setProducerId] = useState('test-producer-id-123');
  const [userId, setUserId] = useState('test-user-id-456');
  const [agentEmail, setAgentEmail] = useState('adarsha.aryal653@gmail.com');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(false);
    setResult(null);

    try {
      const response = await fetch('/api/test/send-seller-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          email,
          abn: abn || undefined,
          address: { street, suburb, state, postcode, country },
          bio,
          producerId,
          userId,
          agentEmail: agentEmail || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setResult(data);
      } else {
        setError(data.error || 'Failed to send email');
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test SendGrid Email</CardTitle>
            <CardDescription>
              Test the seller registration email functionality. Fill in the form below and click &quot;Send Test Email&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Seller Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abn">ABN (Optional)</Label>
                  <Input id="abn" value={abn} onChange={(e) => setAbn(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input id="suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Business Bio *</Label>
                <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} required />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">IDs (for testing)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="producerId">Producer ID *</Label>
                    <Input id="producerId" value={producerId} onChange={(e) => setProducerId(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID *</Label>
                    <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentEmail">Agent Email (Optional)</Label>
                <Input
                  id="agentEmail"
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  placeholder="adarsha.aryal653@gmail.com"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            </form>

            {success && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200">✅ Email Sent Successfully!</h4>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Error</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
                {(error.includes('sender') || error.includes('from') || error.includes('verified')) && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 How to Fix:</p>
                    <ol className="text-xs text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                      <li>Go to SendGrid Dashboard → Settings → Sender Authentication</li>
                      <li>Click &quot;Verify an Address&quot; in the Single Sender Verification section</li>
                      <li>Enter your email and complete the verification</li>
                      <li>Update SENDGRID_FROM_EMAIL in .env.local with the verified email</li>
                    </ol>
                  </div>
                )}
                {(error.includes('API key') || error.includes('403') || error.includes('401')) && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 How to Fix:</p>
                    <ol className="text-xs text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                      <li>Go to SendGrid Dashboard → Settings → API Keys</li>
                      <li>Create a new API key with &quot;Mail Send&quot; permissions</li>
                      <li>Add it to .env.local: SENDGRID_API_KEY=SG.your_key_here and restart the dev server</li>
                    </ol>
                  </div>
                )}
                {result && (
                  <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
