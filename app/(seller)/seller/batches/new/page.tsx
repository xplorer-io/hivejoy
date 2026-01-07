'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBatch, floralSourceOptions, australianRegions } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, X } from 'lucide-react';

export default function NewBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFloralSources, setSelectedFloralSources] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [customRegion, setCustomRegion] = useState('');

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

    const formData = new FormData(e.currentTarget);
    const finalRegion = region === 'custom' ? customRegion : region;

    try {
      await createBatch({
        producerId: 'producer-1', // Mock producer ID
        region: `${formData.get('suburb')}, ${finalRegion}`,
        harvestDate: formData.get('harvestDate') as string,
        extractionDate: formData.get('extractionDate') as string,
        floralSourceTags: selectedFloralSources,
        notes: formData.get('notes') as string || undefined,
        status: 'active',
      });

      router.push('/seller/batches');
    } catch (error) {
      console.error('Failed to create batch:', error);
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Location & Dates</CardTitle>
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

