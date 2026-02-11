'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Removed getProductsByProducer import - using API endpoint instead
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';
import { Plus, Package, Edit } from 'lucide-react';

const statusColors: Record<Product['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<Product['status'], string> = {
  draft: 'Draft',
  pending_approval: 'Pending',
  approved: 'Live',
  rejected: 'Rejected',
  archived: 'Archived',
};

export default function ListingsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get producer profile
        const producerResponse = await fetch('/api/producers/me');
        
        if (!producerResponse.ok) {
          // No producer found - that's okay, just show empty list
          setProducts([]);
          setLoading(false);
          return;
        }
        
        const producerData = await producerResponse.json();

        if (!producerData.success || !producerData.producer) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch all products for this producer via API
        const productsResponse = await fetch(`/api/producers/${producerData.producer.id}/products`);
        const productsData = await productsResponse.json();
        
        if (productsData.success && productsData.products) {
          setProducts(productsData.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listings</h1>
          <p className="text-muted-foreground">Manage your product listings</p>
        </div>
        <Link href="/seller/listings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first product listing to start selling.
            </p>
            <Link href="/seller/listings/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const lowestPrice = Math.min(...product.variants.map((v) => v.price));
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

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
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.variants.length} variant(s) • {totalStock} in stock
                          </p>
                        </div>
                        <Badge className={statusColors[product.status]}>
                          {statusLabels[product.status]}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="font-semibold">From ${lowestPrice.toFixed(2)}</p>
                        <Link href={`/seller/listings/${product.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
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

