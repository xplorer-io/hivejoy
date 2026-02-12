'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadImage } from '@/lib/cloudinary/upload';
import { useAuthStore } from '@/lib/stores';
import Image from 'next/image';

export default function TestIntegrationPage() {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [supabaseData, setSupabaseData] = useState<{
    id: string;
    businessName: string;
    bio: string;
    profileImage?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form data for producer
  const [businessName, setBusinessName] = useState('Test Honey Producer');
  const [bio, setBio] = useState('This is a test producer created to verify Cloudinary + Supabase integration.');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Single submit handler that does everything
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image');
      return;
    }

    if (!businessName.trim() || !bio.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Validate authentication first before uploading
    if (!user?.id) {
      setError('Please sign in first. The producer must be linked to a valid user account.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Upload image to Cloudinary
      const uploadResult = await uploadImage(file, 'producers');
      
      if (!uploadResult.success || !uploadResult.url) {
        setError(uploadResult.error || 'Failed to upload image to Cloudinary');
        return;
      }

      // Step 2: Save to Supabase with Cloudinary URL
      const userId = user.id;

      const response = await fetch('/dev/test/api/create-producer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          bio: bio.trim(),
          profileImage: uploadResult.url,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSupabaseData(data.producer);
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to save to Supabase');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setSupabaseData(null);
    setError(null);
    setSuccess(false);
    setBusinessName('Test Honey Producer');
    setBio('This is a test producer created to verify Cloudinary + Supabase integration.');
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cloudinary + Supabase Integration Test</CardTitle>
            <CardDescription>
              Upload an image and enter details. Everything will be saved automatically!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Profile Image</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {preview && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* User Info / Sign In Prompt */}
              {user ? (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                  <p className="text-green-800 dark:text-green-200">
                    ✅ Logged in as: <strong>{user.email}</strong>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    User ID: {user.id}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                    ⚠️ Please sign in first
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                    You need to be signed in to create a producer. The producer must be linked to a valid user account in the database.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = '/auth'}
                    className="w-full"
                  >
                    Go to Sign In
                  </Button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saving || !file}
                className="w-full"
              >
                {saving ? 'Uploading & Saving...' : 'Upload Image & Save to Supabase'}
              </Button>
            </form>

            {/* Success Message */}
            {success && supabaseData && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Success! Data saved to Supabase
                  </h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Producer ID:</strong> {supabaseData.id}</p>
                  <p><strong>Business Name:</strong> {supabaseData.businessName}</p>
                  <p><strong>Profile Image URL:</strong></p>
                  <code className="text-xs block break-all p-2 bg-background rounded">
                    {supabaseData.profileImage}
                  </code>
                  
                  {supabaseData.profileImage && (
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted mt-4">
                      <Image
                        src={supabaseData.profileImage}
                        alt="From Supabase"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                <Button onClick={handleReset} variant="outline" className="w-full">
                  Create Another
                </Button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">❌ {error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
