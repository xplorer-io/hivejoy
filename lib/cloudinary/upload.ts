'use client';

// Note: We use Cloudinary REST API directly instead of the SDK
// because the SDK requires Node.js modules that aren't available in the browser

export type UploadFolder = 'products' | 'producers' | 'verification' | 'batches';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload a single image to Cloudinary
 * @param file - File or Blob to upload
 * @param folder - Folder path in Cloudinary (e.g., 'products', 'producers')
 * @param options - Optional transformation and publicId
 * @returns Upload result with URL or error
 */
export async function uploadImage(
  file: File | Blob,
  folder: UploadFolder,
  options?: {
    transformation?: string;
    publicId?: string;
  }
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', `hivejoy/${folder}`);

    if (options?.transformation) {
      formData.append('transformation', options.transformation);
    }

    if (options?.publicId) {
      formData.append('public_id', options.publicId);
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return {
        success: false,
        error: 'Cloudinary cloud name is not configured',
      };
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'Upload failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of files to upload
 * @param folder - Folder path in Cloudinary
 * @returns Array of upload results
 */
export async function uploadImages(
  files: File[],
  folder: UploadFolder
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary (calls server API route)
 * @param publicId - Cloudinary public ID of the image to delete
 * @returns Success status and optional error message
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });

    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
