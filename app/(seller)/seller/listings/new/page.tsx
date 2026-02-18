'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// Removed getBatchesByProducer import - now using API endpoint
import { uploadImages } from '@/lib/cloudinary/upload';
import { useAuthStore } from '@/lib/stores';
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
import { ChevronLeft, Upload, X, AlertCircle } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [producerId, setProducerId] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [weight, setWeight] = useState('');

  // Get producer ID and fetch batches (producer profile will be auto-created if needed)
  useEffect(() => {
    async function fetchProducerData() {
      if (!user?.id) {
        setError('Please sign in to create a listing.');
        return;
      }

      try {
        // Try to get producer profile, but don't error if it doesn't exist
        // It will be auto-created when creating a listing
        const response = await fetch('/api/producers/me');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.producer) {
            setProducerId(data.producer.id);
          }
        } else {
          // 404 is expected if no producer exists yet - that's okay
          console.log('[NewListingPage] No producer profile found (will be auto-created)');
        }
        
        // Fetch batches for this producer via API
        const batchesResponse = await fetch('/api/batches');
        const batchesResult = await batchesResponse.json();
        
        if (batchesResult.success && batchesResult.batches) {
          setBatches(batchesResult.batches.filter((b: Batch) => b.status === 'active'));
        } else {
          setBatches([]);
        }
      } catch (err) {
        console.error('Failed to fetch producer data:', err);
        // Don't set error - allow user to proceed, profile will be auto-created
      }
    }

    fetchProducerData();
  }, [user]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Please select only image files.');
      return;
    }

    // Limit to 5 photos
    const totalPhotos = photoFiles.length + validFiles.length;
    if (totalPhotos > 5) {
      setError('Maximum 5 photos allowed.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Cloudinary
      const uploadResults = await uploadImages(validFiles, 'products');
      
      const successfulUploads = uploadResults.filter((r) => r.success);
      const failedUploads = uploadResults.filter((r) => !r.success);
      
      if (successfulUploads.length === 0) {
        // Show specific error messages if available
        const errorMessages = failedUploads
          .map((r) => r.error)
          .filter((e): e is string => !!e);
        const errorMessage = errorMessages.length > 0
          ? `Failed to upload photos: ${errorMessages.join(', ')}`
          : 'Failed to upload photos. Please check your Cloudinary configuration and try again.';
        setError(errorMessage);
        return;
      }

      // Update state with successful uploads
      const newUrls = successfulUploads.map((r) => r.url!);
      setPhotos([...photos, ...newUrls]);
      setPhotoFiles([...photoFiles, ...validFiles.slice(0, successfulUploads.length)]);
      
      // Show warning if some uploads failed
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads
          .map((r) => r.error)
          .filter((e): e is string => !!e);
        console.warn('Some photos failed to upload:', errorMessages);
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form
      if (!title.trim() || !description.trim()) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (photos.length === 0) {
        setError('Please upload at least one photo.');
        setLoading(false);
        return;
      }

      if (!selectedBatch) {
        setError('Please select a batch.');
        setLoading(false);
        return;
      }

      // Validate price, stock, and weight
      if (!price || !stock || !weight) {
        setError('Please fill in price, stock, and weight.');
        setLoading(false);
        return;
      }

      console.log('[NewListingPage] Submitting listing with data:', {
        batchId: selectedBatch,
        title: title.trim(),
        description: description.trim(),
        photosCount: photos.length,
      });

      // Submit to API
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatch,
          title: title.trim(),
          description: description.trim(),
          photos,
          variants: [{
            price: price,
            stock: stock,
            weight: weight,
          }],
        }),
      });

      const data = await response.json();

      console.log('[NewListingPage] API response:', data);

      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'Failed to create listing.';
        console.error('[NewListingPage] Error creating listing:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      console.log('[NewListingPage] Listing created successfully:', data.product?.id);

      // Success - redirect to listings page
      router.push('/seller/listings');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
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

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Yellow Box Raw Honey"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your honey - flavor profile, characteristics, suggested uses..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Link to Batch *</Label>
              <Select 
                value={selectedBatch} 
                onValueChange={setSelectedBatch} 
                required
                disabled={batches.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={batches.length === 0 ? "No active batches" : "Select a batch"} />
                </SelectTrigger>
                <SelectContent>
                  {batches.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No active batches available
                    </div>
                  ) : (
                    batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.region} - {new Date(batch.harvestDate).toLocaleDateString()}
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
            <CardTitle>Photos *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                uploading
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <p className="text-muted-foreground">Uploading...</p>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground mb-1">
                    Click to upload photos (max 5)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 10MB each
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Details *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="18.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Stock *</Label>
                <Input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (g) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="250"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || uploading || !producerId || !selectedBatch}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
          <Link href="/seller/listings">
            <Button type="button" variant="outline" disabled={loading || uploading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
