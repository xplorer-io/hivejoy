'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBatchesByProducer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Batch } from '@/types';
import { DateTime } from 'luxon';
import { Plus, MapPin, Calendar, Flower2 } from 'lucide-react';

const statusColors: Record<Batch['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBatches() {
      try {
        // Use mock producer ID for demo
        const data = await getBatchesByProducer('producer-1');
        setBatches(data);
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBatches();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Batches</h1>
          <p className="text-muted-foreground">
            Manage your honey batches for traceability
          </p>
        </div>
        <Link href="/seller/batches/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Batch
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : batches.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Flower2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No batches yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first batch to start listing products with provenance.
            </p>
            <Link href="/seller/batches/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Batch
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {batches.map((batch) => {
            const harvestDate = DateTime.fromISO(batch.harvestDate);
            const extractionDate = DateTime.fromISO(batch.extractionDate);

            return (
              <Link key={batch.id} href={`/seller/batches/${batch.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-mono text-sm text-muted-foreground mb-1">
                          {batch.id}
                        </p>
                        <Badge className={statusColors[batch.status]}>
                          {batch.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{batch.region}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Harvested {harvestDate.toFormat('d MMM yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Flower2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {batch.floralSourceTags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {batch.floralSourceTags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{batch.floralSourceTags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

