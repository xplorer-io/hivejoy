'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPendingListings, approveListing, rejectListing } from '@/lib/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';
import { CheckCircle, XCircle, Package } from 'lucide-react';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      const data = await getPendingListings();
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (productId: string) => {
    setProcessingId(productId);
    try {
      await approveListing(productId);
      setListings(listings.filter((l) => l.id !== productId));
    } catch (error) {
      console.error('Failed to approve listing:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (productId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessingId(productId);
    try {
      await rejectListing(productId, reason);
      setListings(listings.filter((l) => l.id !== productId));
    } catch (error) {
      console.error('Failed to reject listing:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Listing Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate product listings
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No pending listings</h2>
            <p className="text-muted-foreground">
              All listings have been reviewed. Check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((product) => {
            const isProcessing = processingId === product.id;
            const lowestPrice = Math.min(...product.variants.map((v) => v.price));

            return (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.photos[0] ? (
                        <Image
                          src={product.photos[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🍯
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Producer: {product.producerId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.variants.length} variant(s) from ${lowestPrice.toFixed(2)}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(product.id)}
                          disabled={isProcessing}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(product.id)}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

