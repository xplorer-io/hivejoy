'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBatchesByProducer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Batch } from '@/types';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

interface Variant {
  id: string;
  size: string;
  price: string;
  stock: string;
  weight: string;
}

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [variants, setVariants] = useState<Variant[]>([
    { id: '1', size: '250g', price: '', stock: '', weight: '250' },
  ]);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const data = await getBatchesByProducer('producer-1');
        setBatches(data.filter((b) => b.status === 'active'));
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      }
    }

    fetchBatches();
  }, []);

  const addVariant = () => {
    const newId = String(variants.length + 1);
    setVariants([
      ...variants,
      { id: newId, size: '', price: '', stock: '', weight: '' },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter((v) => v.id !== id));
    }
  };

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push('/seller/listings');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/seller/listings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to listings
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Yellow Box Raw Honey"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your honey - flavor profile, characteristics, suggested uses..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Link to Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.length === 0 ? (
                    <SelectItem value="" disabled>
                      No active batches - create one first
                    </SelectItem>
                  ) : (
                    batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.id} - {batch.region}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {batches.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  <Link href="/seller/batches/new" className="text-primary hover:underline">
                    Create a batch
                  </Link>{' '}
                  first to link your listing for provenance.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-2">
                Drag and drop photos here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                (Photo upload is disabled in demo mode)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Variants & Pricing</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="grid grid-cols-5 gap-4 p-4 rounded-lg bg-muted/50"
              >
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input
                    value={variant.size}
                    onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                    placeholder="250g"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                    placeholder="18.50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (g)</Label>
                  <Input
                    type="number"
                    value={variant.weight}
                    onChange={(e) => updateVariant(variant.id, 'weight', e.target.value)}
                    placeholder="250"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(variant.id)}
                    disabled={variants.length === 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !selectedBatch}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
          <Link href="/seller/listings">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

