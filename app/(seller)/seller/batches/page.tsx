'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Removed getBatchesByProducer import - using API endpoint instead
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Batch } from '@/types';
import { DateTime } from 'luxon';
import { Plus, MapPin, Calendar, Flower2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusColors: Record<Batch['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

interface ProductUsingBatch {
  id: string;
  title: string;
  status: string;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productsUsingBatch, setProductsUsingBatch] = useState<{
    batchId: string;
    products: ProductUsingBatch[];
  } | null>(null);
  const [justDeleted, setJustDeleted] = useState(false);

  useEffect(() => {
    async function fetchBatches() {
      try {
        console.log('[BatchesPage] Fetching batches...');
        // Add cache-busting to ensure fresh data
        const response = await fetch('/api/batches?t=' + Date.now(), {
          cache: 'no-store',
        });
        const data = await response.json();
        
        console.log('[BatchesPage] Response:', data);
        
        if (data.success && data.batches) {
          console.log('[BatchesPage] Setting batches:', data.batches.length);
          setBatches(data.batches);
        } else {
          console.log('[BatchesPage] No batches found or error:', data);
          setBatches([]);
        }
      } catch (error) {
        console.error('[BatchesPage] Failed to fetch batches:', error);
        setBatches([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBatches();
    
    // Refresh batches when page becomes visible (e.g., after navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden && !justDeleted) {
        fetchBatches();
      }
    };
    
    // Also listen for focus events (when user switches back to tab)
    const handleFocus = () => {
      if (!justDeleted) {
        fetchBatches();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [justDeleted]);

  const handleDelete = async (batchId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDeletingId(batchId);
    setJustDeleted(true);

    try {
      const response = await fetch(`/api/batches/${batchId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      console.log('[BatchesPage] Delete response:', response.status, data);

      if (response.ok && data.success) {
        // Optimistically remove from list
        setBatches(batches.filter((b) => b.id !== batchId));
        
        // Verify deletion by re-fetching after a short delay
        setTimeout(async () => {
          const verifyResponse = await fetch('/api/batches?t=' + Date.now(), {
            cache: 'no-store',
          });
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success && verifyData.batches) {
            const stillExists = verifyData.batches.some((b: Batch) => b.id === batchId);
            if (stillExists) {
              console.warn('[BatchesPage] Batch still exists after deletion!');
              alert('Batch deletion may have failed. Refreshing list...');
              setBatches(verifyData.batches);
            } else {
              console.log('[BatchesPage] Batch successfully deleted');
              setBatches(verifyData.batches);
            }
          }
          setJustDeleted(false);
        }, 500);
      } else {
        setJustDeleted(false);
        // If products are using the batch, show them
        if (data.products && data.products.length > 0) {
          setProductsUsingBatch({
            batchId,
            products: data.products,
          });
        } else {
          alert(data.error || 'Failed to delete batch');
        }
        // Refresh the list to show current state
        const refreshResponse = await fetch('/api/batches?t=' + Date.now(), {
          cache: 'no-store',
        });
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.batches) {
          setBatches(refreshData.batches);
        }
      }
    } catch (error) {
      console.error('Failed to delete batch:', error);
      alert('Failed to delete batch. Please try again.');
      setJustDeleted(false);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveBatchFromProducts = async (productIds: string[]) => {
    if (!productsUsingBatch) return;

    try {
      const response = await fetch(`/api/batches/${productsUsingBatch.batchId}/products`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Batch removed from ${productIds.length} product(s). You can now delete the batch.`);
        setProductsUsingBatch(null);
        // Refresh batches list
        const refreshResponse = await fetch('/api/batches?t=' + Date.now(), {
          cache: 'no-store',
        });
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.batches) {
          setBatches(refreshData.batches);
        }
      } else {
        alert(data.error || 'Failed to remove batch from products');
      }
    } catch (error) {
      console.error('Failed to remove batch from products:', error);
      alert('Failed to remove batch from products. Please try again.');
    }
  };

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

      {/* Products Using Batch Dialog */}
      {productsUsingBatch && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Cannot Delete Batch
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This batch is being used by {productsUsingBatch.products.length} product(s). 
                  Remove the batch reference from these products first.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProductsUsingBatch(null)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-2 mb-4">
              {productsUsingBatch.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {product.status}
                    </p>
                  </div>
                  <Link href={`/seller/listings/${product.id}`}>
                    <Button variant="outline" size="sm">
                      View Product
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const productIds = productsUsingBatch.products.map((p) => p.id);
                  handleRemoveBatchFromProducts(productIds);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Remove Batch from All Products
              </Button>
              <Button
                variant="outline"
                onClick={() => setProductsUsingBatch(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

            return (
              <Card key={batch.id} className="hover:shadow-md transition-shadow h-full relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-muted-foreground mb-1">
                        {batch.id}
                      </p>
                      <Badge className={statusColors[batch.status]}>
                        {batch.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/seller/batches/${batch.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={deletingId === batch.id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this batch? This action cannot be undone. 
                              If this batch is being used by any products, you&apos;ll need to remove or reassign those products first.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => handleDelete(batch.id, e)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === batch.id ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <Link href={`/seller/batches/${batch.id}`}>
                    <div className="space-y-3 cursor-pointer">
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
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

