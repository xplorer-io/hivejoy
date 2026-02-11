'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import type { Batch, ProductWithDetails } from '@/types';
import { ChevronLeft, Plus, Trash2, Upload, X, AlertCircle } from 'lucide-react';

interface Variant {
  id: string;
  size: string;
  price: string;
  stock: string;
  weight: string;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<Variant[]>([
    { id: '1', size: '250g', price: '', stock: '', weight: '250' },
  ]);

  // Fetch product data and batches
  useEffect(() => {
    async function fetchData() {
      if (!user?.id || !productId) {
        setError('Invalid product ID.');
        setLoading(false);
        return;
      }

      try {
        // Fetch product
        const productResponse = await fetch(`/api/products/${productId}`);
        const productData = await productResponse.json();

        if (!productData.success || !productData.product) {
          setError('Product not found.');
          setLoading(false);
          return;
        }

        const product: ProductWithDetails = productData.product;

        // Pre-fill form with existing data
        setTitle(product.title);
        setDescription(product.description || '');
        setPhotos(product.photos || []);
        setSelectedBatch(product.batchId);
        
        // Convert variants to form format
        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((v, index) => ({
              id: String(index + 1),
              size: v.size,
              price: String(v.price),
              stock: String(v.stock),
              weight: String(v.weight),
            }))
          );
        }

        // Fetch batches
        const batchesResponse = await fetch('/api/batches');
        const batchesResult = await batchesResponse.json();
        
        if (batchesResult.success && batchesResult.batches) {
          setBatches(batchesResult.batches.filter((b: Batch) => b.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to fetch product data:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, productId]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Please select only image files.');
      return;
    }

    const totalPhotos = photoFiles.length + photos.length + validFiles.length;
    if (totalPhotos > 5) {
      setError('Maximum 5 photos allowed.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadResults = await uploadImages(validFiles, 'products');
      const successfulUploads = uploadResults.filter((r) => r.success);
      
      if (successfulUploads.length === 0) {
        setError('Failed to upload photos. Please try again.');
        return;
      }

      const newUrls = successfulUploads.map((r) => r.url!);
      setPhotos([...photos, ...newUrls]);
      setPhotoFiles([...photoFiles, ...validFiles.slice(0, successfulUploads.length)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos.');
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
    setError(null);
    setSaving(true);

    try {
      if (!title.trim() || !description.trim()) {
        setError('Please fill in all required fields.');
        setSaving(false);
        return;
      }

      if (photos.length === 0) {
        setError('Please upload at least one photo.');
        setSaving(false);
        return;
      }

      if (!selectedBatch) {
        setError('Please select a batch.');
        setSaving(false);
        return;
      }

      const invalidVariants = variants.some(
        (v) => !v.size.trim() || !v.price || !v.stock || !v.weight
      );
      if (invalidVariants) {
        setError('Please fill in all variant fields.');
        setSaving(false);
        return;
      }

      // Update product
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatch,
          title: title.trim(),
          description: description.trim(),
          photos,
          variants: variants.map((v) => ({
            size: v.size.trim(),
            price: parseFloat(v.price),
            stock: parseInt(v.stock, 10),
            weight: parseFloat(v.weight),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'Failed to update listing.';
        setError(errorMessage);
        setSaving(false);
        return;
      }

      // Success - redirect to listings page
      router.push('/seller/listings');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/seller/listings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to listings
      </Link>

      <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>

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
                      sizes="(max-width: 768px) 100vw, 33vw"
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
            <div className="flex items-center justify-between">
              <CardTitle>Variants & Pricing *</CardTitle>
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
                  <Label>Size *</Label>
                  <Input
                    value={variant.size}
                    onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                    placeholder="250g"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                    placeholder="18.50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (g) *</Label>
                  <Input
                    type="number"
                    min="0"
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
            disabled={saving || uploading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Link href="/seller/listings">
            <Button type="button" variant="outline" disabled={saving || uploading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
