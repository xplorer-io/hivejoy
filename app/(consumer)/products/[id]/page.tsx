import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft, Shield, Truck, Leaf } from 'lucide-react';

import { getProduct } from '@/lib/api';
import { ProvenanceDisplay } from '@/components/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { AddToCartButton } from './add-to-cart-button';
import { ProductGallery } from './product-gallery';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function ProducerInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const { producer, batch } = product;
  const initials = ProducerInitials(producer.businessName);

  return (
    <main className="flex flex-col">
      {/* Top breadcrumb bar */}
      <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="fluid-container py-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">
            <ChevronLeft className="h-4 w-4" />
            Back to products
          </Link>
        </div>
      </div>

      <section className="fluid-container py-8 md:py-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              title={product.title}
              photos={product.photos ?? []}
            />
          </div>

          {/* Buy box */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Title + badge */}
              <div>
                {producer.badgeLevel !== 'none' ? (
                  <Badge className="mb-3 gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-white hover:bg-amber-500">
                    <Shield className="h-3.5 w-3.5" />
                    {producer.badgeLevel === 'premium'
                      ? 'Premium producer'
                      : 'Verified producer'}
                  </Badge>
                ) : null}

                <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                  {product.title}
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  Single-origin Australian honey, direct from{' '}
                  {producer.businessName}.
                </p>
              </div>

              {/* Micro trust row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border bg-card p-3 text-center shadow-sm">
                  <Shield className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-2 text-xs font-medium">Verified</p>
                </div>
                <div className="rounded-2xl border bg-card p-3 text-center shadow-sm">
                  <Truck className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-2 text-xs font-medium">Direct ship</p>
                </div>
                <div className="rounded-2xl border bg-card p-3 text-center shadow-sm">
                  <Leaf className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-2 text-xs font-medium">Pure</p>
                </div>
              </div>

              {/* Add to cart (primary conversion area above the fold) */}
              <div className="rounded-3xl border bg-card p-5 shadow-sm">
                <AddToCartButton product={product} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Secure checkout • Variant pricing updates instantly
                </p>
              </div>

              {/* Producer card */}
              <Link
                href={`/producers/${producer.id}`}
                className="group flex items-center justify-between gap-3 rounded-3xl border bg-card p-4 shadow-sm transition
                           hover:-translate-y-[1px] hover:shadow-md
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-11 w-11 ring-1 ring-inset ring-border/50">
                    <AvatarImage
                      src={producer.profileImage ?? ''}
                      alt={producer.businessName}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold tracking-tight">
                      {producer.businessName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {producer.address.state}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="rounded-full"
                  tabIndex={-1}
                  aria-hidden="true">
                  View
                </Button>
              </Link>

              {/* Description */}
              {product.description ? (
                <div className="rounded-3xl border bg-card p-5 shadow-sm">
                  <h2 className="text-sm font-semibold">About this honey</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        <Separator className="my-10" />

        {/* Provenance / traceability (below fold, but still premium) */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold tracking-tight">
                Traceability
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Batch-level provenance and producer verification details.
              </p>
              <div className="mt-6">
                <ProvenanceDisplay batch={batch} producer={producer} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border bg-muted/20 p-6">
              <h3 className="text-sm font-semibold">Shipping & handling</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Delivered directly from the producer. Packaging may vary by
                batch.
              </p>
              <Separator className="my-4" />
              <h3 className="text-sm font-semibold">Returns</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                If there’s an issue with your order, contact support and we’ll
                make it right.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
