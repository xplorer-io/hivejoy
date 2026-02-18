'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Upload, Loader2, Save, X } from 'lucide-react';
import { uploadImage } from '@/lib/cloudinary/upload';

interface ProducerData {
  id: string;
  businessName: string;
  abn?: string;
  fullLegalName?: string;
  sellerType?: string;
  tradingName?: string;
  website?: string;
  socialProfile?: string;
  primaryEmail?: string;
  phoneNumber?: string;
  secondaryContactName?: string;
  secondaryPhone?: string;
  secondaryEmail?: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
  };
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  verificationStatus: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  applicationStatus?: string;
  badgeLevel: 'none' | 'verified' | 'premium';
  profileStatus: 'active' | 'suspended' | 'banned';
}

export default function SellerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [producer, setProducer] = useState<ProducerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ProducerData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducerData() {
      try {
        const response = await fetch('/api/producers/me');
        const data = await response.json();

        if (data.success && data.producer) {
          setProducer(data.producer);
          // Initialize form data with producer data
          setFormData({
            businessName: data.producer.businessName || '',
            bio: data.producer.bio || '',
            phoneNumber: data.producer.phoneNumber || '',
            primaryEmail: data.producer.primaryEmail || '',
            website: data.producer.website || '',
            socialProfile: data.producer.socialProfile || '',
            tradingName: data.producer.tradingName || '',
            secondaryContactName: data.producer.secondaryContactName || '',
            secondaryPhone: data.producer.secondaryPhone || '',
            secondaryEmail: data.producer.secondaryEmail || '',
            address: {
              street: data.producer.address.street || '',
              suburb: data.producer.address.suburb || '',
              state: data.producer.address.state || '',
              postcode: data.producer.address.postcode || '',
              country: data.producer.address.country || 'Australia',
            },
            profileImage: data.producer.profileImage || '',
            coverImage: data.producer.coverImage || '',
          });
          setCoverImagePreview(data.producer.coverImage || null);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Failed to fetch producer data:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducerData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !producer) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your producer profile and settings</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Profile not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      setFormData((prev) => ({
        ...prev,
        address: {
          ...(prev.address || producer?.address || {}),
          [addressField]: value,
        } as ProducerData['address'],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadImage(file, 'producers');
      
      if (result.success && result.url) {
        setFormData((prev) => ({
          ...prev,
          profileImage: result.url,
        }));
        setSuccess('Profile image uploaded successfully. Click Save Changes to update your profile.');
      } else {
        setError(result.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadImage(file, 'producers');
      
      if (result.success && result.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: result.url,
        }));
        setCoverImagePreview(result.url);
        setSuccess('Cover image uploaded successfully. Click Save Changes to update your profile.');
      } else {
        setError(result.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Cover image upload error:', err);
      setError('Failed to upload cover image. Please try again.');
    } finally {
      setUploading(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!producer?.id) {
      setError('Producer ID not found');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/producers/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producerId: producer.id,
          businessName: formData.businessName,
          bio: formData.bio,
          phoneNumber: formData.phoneNumber,
          primaryEmail: formData.primaryEmail,
          website: formData.website,
          socialProfile: formData.socialProfile,
          tradingName: formData.tradingName,
          secondaryContactName: formData.secondaryContactName,
          secondaryPhone: formData.secondaryPhone,
          secondaryEmail: formData.secondaryEmail,
          street: formData.address?.street,
          suburb: formData.address?.suburb,
          state: formData.address?.state,
          postcode: formData.address?.postcode,
          profileImage: formData.profileImage,
          coverImage: formData.coverImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        // Reload producer data
        const refreshResponse = await fetch('/api/producers/me');
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.producer) {
          setProducer(refreshData.producer);
          setCoverImagePreview(refreshData.producer.coverImage || null);
        }
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original producer data
    if (producer) {
      setFormData({
        businessName: producer.businessName || '',
        bio: producer.bio || '',
        phoneNumber: producer.phoneNumber || '',
        primaryEmail: producer.primaryEmail || '',
        website: producer.website || '',
        socialProfile: producer.socialProfile || '',
        tradingName: producer.tradingName || '',
        secondaryContactName: producer.secondaryContactName || '',
        secondaryPhone: producer.secondaryPhone || '',
        secondaryEmail: producer.secondaryEmail || '',
        address: {
          street: producer.address.street || '',
          suburb: producer.address.suburb || '',
          state: producer.address.state || '',
          postcode: producer.address.postcode || '',
          country: producer.address.country || 'Australia',
        },
        profileImage: producer.profileImage || '',
        coverImage: producer.coverImage || '',
      });
      setCoverImagePreview(producer.coverImage || null);
    }
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your producer profile and settings</p>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Verified Producer
            </Badge>
            <span className="text-sm text-muted-foreground">
              Your account has been verified and is in good standing.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-gradient-to-br from-amber-200 to-amber-400">
              <img
                src={coverImagePreview || formData.coverImage || producer.coverImage || '/images/AI_generated_honey.jpg'}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Cover Image'}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Recommended: Wide image, at least 1200x400px. This appears at the top of your producer profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.profileImage || producer.profileImage} alt={producer.businessName} />
              <AvatarFallback className="text-2xl">
                {producer.businessName ? getInitials(producer.businessName) : 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload New Photo'}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Recommended: Square image, at least 400x400px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName ?? producer.businessName ?? ''}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
              />
            </div>
            {producer.abn && (
              <div className="space-y-2">
                <Label htmlFor="abn">ABN</Label>
                <Input id="abn" value={producer.abn} readOnly className="bg-muted" />
              </div>
            )}
          </div>
          {producer.fullLegalName && (
            <div className="space-y-2">
              <Label htmlFor="fullLegalName">Full Legal Name</Label>
              <Input id="fullLegalName" value={producer.fullLegalName} readOnly className="bg-muted" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="tradingName">Trading Name (Optional)</Label>
            <Input
              id="tradingName"
              value={formData.tradingName ?? producer.tradingName ?? ''}
              onChange={(e) => handleInputChange('tradingName', e.target.value)}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Primary Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.primaryEmail ?? producer.primaryEmail ?? ''}
                onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber ?? producer.phoneNumber ?? ''}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.website ?? producer.website ?? ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialProfile">Social Profile (Optional)</Label>
            <Input
              id="socialProfile"
              value={formData.socialProfile ?? producer.socialProfile ?? ''}
              onChange={(e) => handleInputChange('socialProfile', e.target.value)}
              placeholder="Instagram, Facebook, or other social media handle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Business Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.address?.street ?? producer.address.street ?? ''}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="suburb">Suburb</Label>
              <Input
                id="suburb"
                value={formData.address?.suburb ?? producer.address.suburb ?? ''}
                onChange={(e) => handleInputChange('address.suburb', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.address?.state ?? producer.address.state ?? ''}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={formData.address?.postcode ?? producer.address.postcode ?? ''}
                onChange={(e) => handleInputChange('address.postcode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>About Your Business</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio ?? producer.bio ?? ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell customers about your apiary, your story, and what makes your honey special..."
            />
            <p className="text-sm text-muted-foreground">
              This will be displayed on your public producer profile.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving || uploading}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleCancel} disabled={saving || uploading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

