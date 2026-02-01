'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function ProductGallery(props: { title: string; photos: string[] }) {
  const photos = props.photos?.filter(Boolean) ?? [];
  const [active, setActive] = React.useState(0);

  const main = photos[active] ?? null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border bg-muted shadow-sm">
        {main ? (
          <Image
            src={main}
            alt={props.title}
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            🍯
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/40" />
      </div>

      {photos.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {photos.slice(0, 10).map((src, i) => {
            const selected = i === active;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-2xl border bg-muted shadow-sm transition',
                  'hover:-translate-y-[1px] hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  selected ? 'ring-2 ring-primary/30' : 'ring-0',
                )}
                aria-label={`View image ${i + 1}`}
                aria-pressed={selected}>
                <Image
                  src={src}
                  alt={`${props.title} thumbnail ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 10vw, 20vw"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
