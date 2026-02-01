import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';

import { getProducts } from '@/lib/api';
import { ProductCard } from '@/components/shared';
import { ProductFilters } from './product-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import type { ProductFilters as ProductFiltersType } from '@/types';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    region?: string;
    floralSource?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  }>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-24 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const sp = await searchParams;

  const filters: ProductFiltersType = {
    search: sp.search,
    region: sp.region,
    floralSource: sp.floralSource,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    page: sp.page ? Number(sp.page) : 1,
    sort: sp.sort ?? 'relevance',
  } as any;

  const { data: products, total, page, pageSize } = await getProducts(filters);

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  return (
    <main className="flex flex-col">
      {/* Mobile-only sticky filter bar */}
      <div className="sticky top-16 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="fluid-container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>

          {/* Mobile trigger only */}
          <ProductFilters mode="sheet" />
        </div>
      </div>

      <section className="fluid-container py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Desktop-only sidebar */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <ProductFilters mode="sidebar" />
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Browse honey
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {total === 0
                    ? 'No results.'
                    : `Showing ${showingFrom}–${showingTo} of ${total} products.`}
                </p>
              </div>

              <Link href="/products">
                <Button
                  variant="ghost"
                  className="gap-2 rounded-full px-3 text-sm hover:bg-muted">
                  Clear all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Suspense fallback={<ProductGridSkeleton />}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
