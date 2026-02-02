'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type MediaProps = {
  src?: string | null;
  alt: string;
  aspect?: 'square' | 'video' | 'wide';
  className?: string;
  priority?: boolean;
  fallback?: React.ReactNode;
};

const aspectClass: Record<NonNullable<MediaProps['aspect']>, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[16/10]',
};

export function Media({
  src,
  alt,
  aspect = 'square',
  className,
  priority,
  fallback,
}: MediaProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectClass[aspect],
        className,
      )}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          // Provide sizes when using fill for responsive performance. [web:21]
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          priority={priority}
          className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {fallback ?? <span className="text-4xl">🍯</span>}
        </div>
      )}

      {/* Gentle top highlight for premium depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
