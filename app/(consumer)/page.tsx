import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard, ProducerCard } from '@/components/shared';
import { getFeaturedProducts, getFeaturedProducers } from '@/lib/api';
import { ArrowRight, Shield, Truck, Leaf, MapPin } from 'lucide-react';

export default async function HomePage() {
  const [featuredProducts, featuredProducers] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedProducers(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
        <div className="absolute inset-0 bg-[url('/honeycomb-pattern.svg')] opacity-5" />
        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              🇦🇺 100% Australian Honey
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Pure Honey,{' '}
              <span className="text-primary">Direct from</span>{' '}
              the Source
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Discover verified Australian honey producers. Every jar is traceable 
              to its origin – know your beekeeper, know your honey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Browse Honey
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/producers">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Meet Our Producers
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative honey drip */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-yellow-400/10 to-amber-400/10 rounded-full blur-3xl" />
      </section>

      {/* Trust Badges */}
      <section className="border-b bg-background">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Verified Producers</p>
                <p className="text-xs text-muted-foreground">Every seller checked</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Traceable Origin</p>
                <p className="text-xs text-muted-foreground">Batch provenance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Direct Shipping</p>
                <p className="text-xs text-muted-foreground">Farm to your door</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Pure & Natural</p>
                <p className="text-xs text-muted-foreground">No additives</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Featured Honey</h2>
            <p className="text-muted-foreground mt-1">Hand-picked selections from our producers</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Producers */}
      <section className="bg-muted/30">
        <div className="container px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Meet Our Producers</h2>
              <p className="text-muted-foreground mt-1">Verified Australian beekeepers</p>
            </div>
            <Link href="/producers">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducers.map((producer) => (
              <ProducerCard key={producer.id} producer={producer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-8 md:p-12">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Are You a Honey Producer?
            </h2>
            <p className="text-amber-100 mb-6">
              Join Hive Joy and connect directly with customers who value authentic, 
              traceable Australian honey. No middlemen, just you and your bees.
            </p>
            <Link href="/seller/apply">
              <Button variant="secondary" size="lg" className="gap-2">
                Apply to Sell
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>
      </section>
    </div>
  );
}

