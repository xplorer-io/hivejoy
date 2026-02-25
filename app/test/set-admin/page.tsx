'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestSetAdminPage() {
  const [email, setEmail] = useState('adarsha.aryal653@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSetAdmin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult({
        success: data.success,
        message: data.message || data.error || 'Unknown error',
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to set admin',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Admin Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <Button
            onClick={handleSetAdmin}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? 'Setting Admin...' : 'Set as Admin'}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            <p>After setting admin role:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Log out</li>
              <li>Log back in</li>
              <li>You should see &quot;Admin&quot; role in your profile</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
