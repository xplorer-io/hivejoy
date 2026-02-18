'use client';

import * as React from 'react';
import { CardContent } from '@/components/ui/card';
import type { ProductWithDetails } from '@/types';
import { MapPin } from 'lucide-react';

import { CardFrame } from '@/components/marketing/cards/card-frame';
import { Media } from '@/components/marketing/cards/media';
import { MetaRow } from '@/components/marketing/cards/meta-row';
import { ProducerBadge } from '@/components/marketing/cards/producer-badge';

interface ProductCardProps {
  product: ProductWithDetails;
}

function getLowestPrice(product: ProductWithDetails) {
  const prices =
    product.variants?.map((v) => v.price).filter((n) => Number.isFinite(n)) ??
    [];
  return prices.length ? Math.min(...prices) : 0;
}

export function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = getLowestPrice(product);
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1;

  const photo = product.photos?.[0] ?? null;
  const region = product.batch?.region ?? 'Unknown region';
  const producerName = product.producer?.businessName ?? 'Unknown producer';
  const badgeLevel = product.producer?.badgeLevel;

  return (
    <CardFrame
      href={`/products/${product.id}`}
      aria-label={`View product: ${product.title}`}>
      <Media
        src={photo}
        alt={product.title}
        aspect="square"
        className="rounded-b-none"
        fallback={<span className="text-4xl">🍯</span>}
      />

      {(badgeLevel === 'premium' || badgeLevel === 'verified') && (
        <div className="absolute left-3 top-3">
          <ProducerBadge level={badgeLevel} />
        </div>
      )}

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold leading-snug tracking-tight text-foreground/95 line-clamp-2 transition-colors group-hover:text-primary">
            {product.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-1">
            {producerName}
          </p>

          <MetaRow icon={MapPin}>{region}</MetaRow>

          <div className="pt-2">
            <div className="flex items-baseline gap-2">
              {hasMultipleVariants ? (
                <span className="text-xs text-muted-foreground">from</span>
              ) : null}
              <span className="text-lg font-semibold tracking-tight text-foreground">
                ${lowestPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </CardFrame>
  );
}
