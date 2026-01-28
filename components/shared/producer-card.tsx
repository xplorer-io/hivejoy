'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ProducerProfile } from '@/types';
import { Shield, MapPin } from 'lucide-react';

interface ProducerCardProps {
  producer: ProducerProfile;
}

export function ProducerCard({ producer }: ProducerCardProps) {
  const initials = producer.businessName
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/producers/${producer.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        {/* Cover Image */}
        <div className="h-24 relative overflow-hidden bg-gradient-to-br from-amber-200 to-amber-400">
          {producer.coverImage && (
            <Image
              src={producer.coverImage}
              alt={producer.businessName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>

        <CardContent className="p-4 pt-0 relative">
          {/* Avatar */}
          <Avatar className="h-16 w-16 -mt-8 border-4 border-background ring-2 ring-primary/20">
            <AvatarImage src={producer.profileImage} alt={producer.businessName} />
            <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="mt-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {producer.businessName}
              </h3>
              {producer.badgeLevel !== 'none' && (
                <Badge 
                  variant="secondary" 
                  className={`shrink-0 gap-1 ${
                    producer.badgeLevel === 'premium' 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {producer.badgeLevel === 'premium' ? 'Premium' : 'Verified'}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{producer.address.state}</span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {producer.bio}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

