'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { floralSourceOptions, australianRegions } from '@/lib/api/mock-data';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, X, AlertCircle } from 'lucide-react';

export default function NewBatchPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingProducer, setCheckingProducer] = useState(true);
  const [selectedFloralSources, setSelectedFloralSources] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [customRegion, setCustomRegion] = useState('');

  // Skip producer profile check - assume verified seller
  useEffect(() => {
    if (!user) {
      setCheckingProducer(false);
      return;
    }
    // Auto-set as ready - producer profile will be auto-created if needed
    setCheckingProducer(false);
  }, [user]);

  const handleAddFloralSource = (source: string) => {
    if (source && !selectedFloralSources.includes(source)) {
      setSelectedFloralSources([...selectedFloralSources, source]);
    }
  };

  const handleRemoveFloralSource = (source: string) => {
    setSelectedFloralSources(selectedFloralSources.filter((s) => s !== source));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Please sign in to create a batch.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const finalRegion = region === 'custom' ? customRegion : region;

    if (!finalRegion) {
      setError('Please select a region.');
      setLoading(false);
      return;
    }

    if (selectedFloralSources.length === 0) {
      setError('Please select at least one floral source.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/batches/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: `${formData.get('suburb')}, ${finalRegion}`,
          harvestDate: formData.get('harvestDate') as string,
          extractionDate: formData.get('extractionDate') as string,
          floralSourceTags: selectedFloralSources,
          notes: formData.get('notes') as string || undefined,
        }),
      });

      const data = await response.json();

      console.log('[NewBatchPage] Batch creation response:', data);

      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'Failed to create batch';
        
        // If producer profile not found, redirect to registration
        if (errorMessage.includes('Producer profile not found')) {
          router.push('/seller/register');
          return;
        }
        
        throw new Error(errorMessage);
      }

      // Show success message
      setError(null);
      setSuccess(true);
      
      // Wait a bit longer to ensure batch is fully committed to database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to batches page
      router.push('/seller/batches');
      router.refresh();
    } catch (err) {
      console.error('Failed to create batch:', err);
      setError(err instanceof Error ? err.message : 'Failed to create batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingProducer) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Checking producer profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to create a batch.
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
    <div className="max-w-2xl mx-auto">
      <Link
        href="/seller/batches"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to batches
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create New Batch</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Batch created successfully! Redirecting to batches page...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Harvest Location & Dates</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Where was this honey harvested? (This is different from your business address)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">State/Region</Label>
                <Select value={region} onValueChange={setRegion} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {australianRegions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Other (specify)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suburb">Suburb/Area</Label>
                <Input
                  id="suburb"
                  name="suburb"
                  placeholder="e.g., Beechworth"
                  required
                />
              </div>
            </div>

            {region === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customRegion">Custom Region</Label>
                <Input
                  id="customRegion"
                  value={customRegion}
                  onChange={(e) => setCustomRegion(e.target.value)}
                  placeholder="Enter region name"
                  required
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date</Label>
                <Input
                  id="harvestDate"
                  name="harvestDate"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extractionDate">Extraction Date</Label>
                <Input
                  id="extractionDate"
                  name="extractionDate"
                  type="date"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Floral Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add Floral Sources</Label>
              <Select onValueChange={handleAddFloralSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floral source" />
                </SelectTrigger>
                <SelectContent>
                  {floralSourceOptions
                    .filter((s) => !selectedFloralSources.includes(s))
                    .map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFloralSources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFloralSources.map((source) => (
                  <Badge
                    key={source}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => handleRemoveFloralSource(source)}
                  >
                    {source}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes about this batch (flavor profile, special characteristics, etc.)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || selectedFloralSources.length === 0}>
            {loading ? 'Creating...' : 'Create Batch'}
          </Button>
          <Link href="/seller/batches">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

