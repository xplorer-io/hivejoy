'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import type { Batch } from '@/types';
import { ChevronLeft, X, AlertCircle, Edit } from 'lucide-react';

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFloralSources, setSelectedFloralSources] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [suburb, setSuburb] = useState('');
  const [customRegion, setCustomRegion] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [extractionDate, setExtractionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Batch['status']>('active');

  // Fetch batch data
  useEffect(() => {
    async function fetchBatch() {
      if (!user?.id || !batchId) {
        setError('Invalid batch ID.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/batches/${batchId}`);
        const data = await response.json();

        if (!data.success || !data.batch) {
          setError('Batch not found.');
          setLoading(false);
          return;
        }

        const batch: Batch = data.batch;

        // Parse region (format: "Suburb, State")
        const regionParts = batch.region.split(', ');
        if (regionParts.length === 2) {
          setSuburb(regionParts[0]);
          const statePart = regionParts[1];
          if (australianRegions.includes(statePart)) {
            setRegion(statePart);
          } else {
            setRegion('custom');
            setCustomRegion(statePart);
          }
        } else {
          // Fallback if format is different
          setSuburb('');
          setRegion(batch.region);
        }

        setSelectedFloralSources(batch.floralSourceTags || []);
        setHarvestDate(batch.harvestDate);
        setExtractionDate(batch.extractionDate);
        setNotes(batch.notes || '');
        setStatus(batch.status);
      } catch (err) {
        console.error('Failed to fetch batch:', err);
        setError('Failed to load batch. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchBatch();
  }, [user, batchId]);

  const handleAddFloralSource = (source: string) => {
    if (source && !selectedFloralSources.includes(source)) {
      setSelectedFloralSources([...selectedFloralSources, source]);
    }
  };

  const handleRemoveFloralSource = (source: string) => {
    setSelectedFloralSources(selectedFloralSources.filter((s) => s !== source));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    if (!user) {
      setError('Please sign in to edit batch.');
      setSaving(false);
      return;
    }

    const finalRegion = region === 'custom' ? customRegion : region;

    if (!finalRegion || !suburb.trim()) {
      setError('Please fill in region and suburb.');
      setSaving(false);
      return;
    }

    if (selectedFloralSources.length === 0) {
      setError('Please select at least one floral source.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: `${suburb.trim()}, ${finalRegion}`,
          harvestDate,
          extractionDate,
          floralSourceTags: selectedFloralSources,
          notes: notes.trim() || undefined,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'Failed to update batch.';
        setError(errorMessage);
        setSaving(false);
        return;
      }

      // Success - exit edit mode and refresh
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update batch.');
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading batch...</p>
        </div>
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

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Batch Details</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isEditing ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Harvest Location & Dates</CardTitle>
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
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
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
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extractionDate">Extraction Date</Label>
                  <Input
                    id="extractionDate"
                    type="date"
                    value={extractionDate}
                    onChange={(e) => setExtractionDate(e.target.value)}
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this batch"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(value) => setStatus(value as Batch['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving || selectedFloralSources.length === 0}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                // Reload data to reset changes
                window.location.reload();
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Harvest Location & Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Region</Label>
                <p className="font-medium">{suburb ? `${suburb}, ${region === 'custom' ? customRegion : region}` : region}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Harvest Date</Label>
                  <p className="font-medium">{new Date(harvestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Extraction Date</Label>
                  <p className="font-medium">{new Date(extractionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Floral Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedFloralSources.length > 0 ? (
                  selectedFloralSources.map((source) => (
                    <Badge key={source} variant="secondary">
                      {source}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No floral sources specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={
                status === 'active' ? 'bg-green-100 text-green-800' :
                status === 'archived' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
