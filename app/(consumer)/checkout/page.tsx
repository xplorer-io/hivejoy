'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Lock, Check, Package, User, MapPin } from 'lucide-react';

const australianStates = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' },
];

interface FormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
}

const initialFormData: FormData = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  suburb: '',
  state: '',
  postcode: '',
};

const steps = [
  { id: 1, name: 'Details', icon: User },
  { id: 2, name: 'Review', icon: Package },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shipping = 12.0;
  const gst = subtotal * 0.1;
  const total = subtotal + shipping;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (items.length === 0) {
    return null;
  }

  const handleSignOut = () => {
    logout();
    setFormData((prev) => ({
      ...prev,
      email: '',
      phone: '',
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.email.includes('@') &&
          formData.phone.length >= 8 &&
          formData.firstName.length > 0 &&
          formData.lastName.length > 0 &&
          formData.address.length > 0 &&
          formData.suburb.length > 0 &&
          formData.state.length > 0 &&
          formData.postcode.length === 4
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
      setError(null);
    } else {
      setError('Please fill in all required fields correctly.');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          customerInfo: {
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            suburb: formData.suburb,
            state: formData.state,
            postcode: formData.postcode,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container px-4 py-8">
      <Link
        href="/cart"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {!isAuthenticated && (
        <div className="mb-6 flex flex-col gap-2 rounded-lg border border-muted bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">You&apos;re checking out as a guest</p>
            <p className="text-xs text-muted-foreground">
              Sign in to save your details for next time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button size="sm">Sign in</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep > step.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : currentStep === step.id
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground/50'
                    }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground/50'
                    }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 md:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email">Email *</Label>
                        {isAuthenticated && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto px-0 text-xs"
                            onClick={handleSignOut}
                          >
                            Not you? Sign out
                          </Button>
                        )}
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        disabled={isAuthenticated}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0400 000 000"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="suburb">Suburb *</Label>
                      <Input
                        id="suburb"
                        value={formData.suburb}
                        onChange={(e) => updateFormData('suburb', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => updateFormData('state', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {australianStates.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => updateFormData('postcode', e.target.value)}
                        required
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={nextStep} className="gap-2">
                      Review Order
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formData.email}</p>
                  <p className="text-sm text-muted-foreground">{formData.phone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Shipping Address</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{formData.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.suburb}, {formData.state} {formData.postcode}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3">
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-muted shrink-0">
                        {item.product.photos[0] ? (
                          <Image
                            src={item.product.photos[0]}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            🍯
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.product.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant.size} × {item.quantity}
                        </p>
                        <p className="text-sm font-medium">
                          ${(item.variant.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleCheckout} disabled={isProcessing} className="gap-2">
                  <Lock className="h-4 w-4" />
                  {isProcessing ? 'Redirecting to payment...' : 'Proceed to Payment'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.product.photos[0] ? (
                        <Image
                          src={item.product.photos[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">
                          🍯
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs line-clamp-1">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.variant.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (included)</span>
                  <span>${gst.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">${total.toFixed(2)}</span>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Your payment is secured with Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

