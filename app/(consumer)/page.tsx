import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getFeaturedProducts, getFeaturedProducers } from '@/lib/api';
import { ProductCard } from '@/components/shared/product-card';
import { ProducerCard } from '@/components/shared/producer-card';

import { Hero } from '@/components/marketing/home/hero';
import { TrustRow } from '@/components/marketing/home/trust-row';
import { FoundersStory } from '@/components/marketing/home/founders-story';
import { GradientCta } from '@/components/marketing/home/gradient-cta';

export default async function HomePage() {
  const [featuredProducts, featuredProducers] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedProducers(),
  ]);

  return (
    <main className="flex flex-col">
      <Hero />
      <TrustRow />

      <section className="fluid-container py-14 md:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Featured honey
            </h2>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Hand-picked selections from our producers
            </p>
          </div>
          <Link href="/products">
            <Button
              variant="ghost"
              className="gap-2 rounded-full px-3 text-sm hover:bg-muted">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="fluid-container py-14 md:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Meet our producers
              </h2>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                Verified Australian beekeepers
              </p>
            </div>
            <Link href="/producers">
              <Button
                variant="ghost"
                className="gap-2 rounded-full px-3 text-sm hover:bg-muted">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredProducers.map((producer) => (
              <ProducerCard key={producer.id} producer={producer} />
            ))}
          </div>
        </div>
      </section>

      <FoundersStory />

      <section className="fluid-container py-14 md:py-20">
        <GradientCta />
      </section>
    </main>
  );
}
