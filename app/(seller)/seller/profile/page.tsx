'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Upload } from 'lucide-react';

export default function SellerProfilePage() {
  // Mock producer data
  const producer = {
    businessName: 'Golden Hive Apiaries',
    abn: '12345678901',
    email: 'producer@goldenhive.com.au',
    phone: '0423456789',
    street: '123 Honey Lane',
    suburb: 'Beechworth',
    state: 'VIC',
    postcode: '3747',
    bio: "Family-owned apiary in the heart of Victorian high country. We've been producing premium raw honey for over 30 years.",
    profileImage: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400',
    verificationStatus: 'approved' as const,
    badgeLevel: 'verified' as const,
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

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={producer.profileImage} alt={producer.businessName} />
              <AvatarFallback className="text-2xl">GH</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload New Photo
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
              <Input id="businessName" defaultValue={producer.businessName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abn">ABN</Label>
              <Input id="abn" defaultValue={producer.abn} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={producer.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue={producer.phone} />
            </div>
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
            <Input id="street" defaultValue={producer.street} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="suburb">Suburb</Label>
              <Input id="suburb" defaultValue={producer.suburb} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" defaultValue={producer.state} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" defaultValue={producer.postcode} />
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
              defaultValue={producer.bio}
              placeholder="Tell customers about your apiary, your story, and what makes your honey special..."
            />
            <p className="text-sm text-muted-foreground">
              This will be displayed on your public producer profile.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button>Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
}

