import { Suspense } from 'react';
import { getProducts } from '@/lib/api';
import { ProductCard } from '@/components/shared';
import { ProductFilters } from './product-filters';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductFilters as ProductFiltersType } from '@/types';

interface ProductsPageProps {
    searchParams: Promise<{
        search?: string;
        region?: string;
        floralSource?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    }>;
}

function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            ))}
        </div>
    );
}

async function ProductGrid({ filters, page }: { filters: ProductFiltersType; page: number }) {
    const { data: products, total, totalPages } = await getProducts(filters, page, 12);

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-xl font-medium mb-2">No products found</p>
                <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <>
            <p className="text-sm text-muted-foreground mb-6">
                Showing {products.length} of {total} products
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {/* TODO: Add pagination */}
        </>
    );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;

    const filters: ProductFiltersType = {
        search: params.search,
        region: params.region,
        floralSource: params.floralSource,
        minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    };

    const page = params.page ? parseInt(params.page) : 1;

    return (
        <div className="container px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Browse Honey</h1>
                <p className="text-muted-foreground">
                    Discover pure Australian honey from verified producers
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="w-full lg:w-64 shrink-0">
                    <ProductFilters />
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductGrid filters={filters} page={page} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

