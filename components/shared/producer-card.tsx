'use client';

import * as React from 'react';
import Image from 'next/image';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ProducerProfile } from '@/types';
import { MapPin } from 'lucide-react';

import { CardFrame } from '@/components/marketing/cards/card-frame';
import { ProducerBadge } from '@/components/marketing/cards/producer-badge';

interface ProducerCardProps {
  producer: ProducerProfile;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function ProducerCard({ producer }: ProducerCardProps) {
  const initials = getInitials(producer.businessName || 'Producer');
  const state = producer.address?.state ?? 'Australia';

  return (
    <CardFrame
      href={`/producers/${producer.id}`}
      aria-label={`View producer: ${producer.businessName}`}>
      {/* Cover */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-amber-200 to-amber-400">
        {producer.coverImage ? (
          <Image
            src={producer.coverImage}
            alt={`${producer.businessName} cover`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 to-black/20" />
      </div>

      <CardContent className="relative p-4 pt-0">
        {/* Avatar row */}
        <div className="flex items-start justify-between gap-3">
          <Avatar className="-mt-8 h-16 w-16 border-4 border-background shadow-sm ring-1 ring-inset ring-border/40">
            <AvatarImage
              src={producer.profileImage ?? ''}
              alt={producer.businessName}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="pt-3">
            <ProducerBadge level={producer.badgeLevel as any} />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <h3 className="text-sm font-semibold tracking-tight line-clamp-1 transition-colors group-hover:text-primary">
            {producer.businessName}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{state}</span>
          </div>

          {producer.bio ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {producer.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Small-batch honey producer with traceable local harvests.
            </p>
          )}
        </div>
      </CardContent>
    </CardFrame>
  );
}
