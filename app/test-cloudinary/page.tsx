'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadImage } from '@/lib/cloudinary/upload';
import Image from 'next/image';

export default function TestCloudinaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setResult({ success: false, error: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const uploadResult = await uploadImage(file, 'products');
      setResult(uploadResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Cloudinary Upload Test</CardTitle>
            <CardDescription>
              Test uploading an image to Cloudinary. Select an image and click Upload.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Input */}
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">
                Select Image
              </label>
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  cursor-pointer"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
            </Button>

            {/* Result */}
            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                }`}
              >
                <h3 className="font-semibold mb-2">
                  {result.success ? '✅ Upload Successful!' : '❌ Upload Failed'}
                </h3>
                
                {result.success && result.url && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Cloudinary URL:</p>
                      <p className="text-sm break-all text-muted-foreground">{result.url}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Uploaded Image:</p>
                      <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={result.url}
                          alt="Uploaded"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded text-xs font-mono break-all">
                      {result.url}
                    </div>
                  </div>
                )}

                {!result.success && result.error && (
                  <div>
                    <p className="text-sm font-medium mb-1">Error:</p>
                    <p className="text-sm text-destructive">{result.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Environment Check */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Environment Variables Check:</h4>
              <ul className="text-xs space-y-1 font-mono">
                <li>
                  CLOUD_NAME:{' '}
                  {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                    <span className="text-green-600 dark:text-green-400">✓ Set</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✗ Missing</span>
                  )}
                </li>
                <li>
                  API_KEY:{' '}
                  {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? (
                    <span className="text-green-600 dark:text-green-400">✓ Set</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✗ Missing</span>
                  )}
                </li>
                <li>
                  UPLOAD_PRESET:{' '}
                  {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? (
                    <span className="text-green-600 dark:text-green-400">✓ Set</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✗ Missing</span>
                  )}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
