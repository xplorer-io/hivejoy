'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProductWithDetails } from '@/types';
import { Shield, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = Math.min(...product.variants.map(v => v.price));
  const hasMultipleVariants = product.variants.length > 1;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {product.photos[0] ? (
            <Image
              src={product.photos[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🍯
            </div>
          )}
          {product.producer.badgeLevel !== 'none' && (
            <Badge className="absolute top-2 left-2 gap-1 bg-amber-500/90 hover:bg-amber-500">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.producer.businessName}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{product.batch.region}</span>
          </div>
          <div className="flex items-baseline gap-1 pt-2">
            <span className="text-lg font-bold text-primary">
              ${lowestPrice.toFixed(2)}
            </span>
            {hasMultipleVariants && (
              <span className="text-xs text-muted-foreground">
                from
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

