import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProduct } from '@/lib/api';
import { ProvenanceDisplay } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddToCartButton } from './add-to-cart-button';
import { ChevronLeft, Shield, Star } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const { producer, batch } = product;

  const initials = producer.businessName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container px-4 py-8">
      {/* Back Link */}
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-muted">
            {product.photos[0] ? (
              <Image
                src={product.photos[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🍯
              </div>
            )}
          </div>
          {product.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.photos.slice(1, 5).map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square relative rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={photo}
                    alt={`${product.title} ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Title & Badge */}
          <div>
            {producer.badgeLevel !== 'none' && (
              <Badge className="mb-3 gap-1 bg-amber-500 hover:bg-amber-600">
                <Shield className="h-3 w-3" />
                {producer.badgeLevel === 'premium' ? 'Premium Producer' : 'Verified Producer'}
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{product.title}</h1>
          </div>

          {/* Producer Info */}
          <Link
            href={`/producers/${producer.id}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <Avatar>
              <AvatarImage src={producer.profileImage} alt={producer.businessName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{producer.businessName}</p>
              <p className="text-sm text-muted-foreground">{producer.address.state}</p>
            </div>
          </Link>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <Separator />

          {/* Add to Cart */}
          <AddToCartButton product={product} />

          <Separator />

          {/* Provenance */}
          <ProvenanceDisplay batch={batch} producer={producer} />
        </div>
      </div>
    </div>
  );
}

