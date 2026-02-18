'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Batch, ProducerProfile } from '@/types';
import { DateTime } from 'luxon';
import { MapPin, Calendar, Flower2, Shield, Hash } from 'lucide-react';

interface ProvenanceDisplayProps {
  batch: Batch;
  producer: ProducerProfile;
  compact?: boolean;
}

export function ProvenanceDisplay({ batch, producer, compact = false }: ProvenanceDisplayProps) {
  const harvestDate = DateTime.fromISO(batch.harvestDate);
  const extractionDate = DateTime.fromISO(batch.extractionDate);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {((producer.badgeLevel || 'verified') !== 'none') && (
          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            <Shield className="h-3 w-3" />
            Verified Producer
          </Badge>
        )}
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {batch.region}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {harvestDate.toFormat('MMM yyyy')}
        </span>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Provenance
          </h3>
          {((producer.badgeLevel || 'verified') !== 'none') && (
            <Badge className="gap-1 bg-amber-500 hover:bg-amber-600">
              <Shield className="h-3 w-3" />
              {(producer.badgeLevel || 'verified') === 'premium' ? 'Premium Producer' : 'Verified Producer'}
            </Badge>
          )}
        </div>

        <Separator />

        <div className="grid gap-3">
          {/* Region */}
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium">Region</p>
              <p className="text-sm text-muted-foreground">{batch.region}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium">Harvest & Extraction</p>
              <p className="text-sm text-muted-foreground">
                Harvested {harvestDate.toFormat('d MMMM yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                Extracted {extractionDate.toFormat('d MMMM yyyy')}
              </p>
            </div>
          </div>

          {/* Floral Sources */}
          <div className="flex items-start gap-3">
            <Flower2 className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium">Floral Sources</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {batch.floralSourceTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Batch ID */}
          <div className="flex items-start gap-3">
            <Hash className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium">Batch ID</p>
              <p className="text-sm text-muted-foreground font-mono">{batch.id}</p>
            </div>
          </div>
        </div>

        {batch.notes && (
          <>
            <Separator />
            <p className="text-sm text-muted-foreground italic">{batch.notes}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

