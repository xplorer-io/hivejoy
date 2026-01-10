import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductCard, ProducerCard } from '@/components/shared';
import { getFeaturedProducts, getFeaturedProducers } from '@/lib/api';
import { ArrowRight, Shield, Truck, Leaf, MapPin, Search, AlertCircle } from 'lucide-react';

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
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-xl">
              Discover verified Australian honey producers. Every jar is traceable 
              to its origin – know your beekeeper, know your honey.
            </p>
            <p className="text-base md:text-lg font-semibold text-foreground mb-8 max-w-xl">
              No resellers. No imports. Just pure Australian honey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            {/* Quick Search */}
            <div className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search honey..."
                  className="pl-10 h-12 bg-background/80 backdrop-blur border-2"
                />
              </div>
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

      {/* Problem Statement */}
      <section className="bg-muted/50 py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem with Honey Today</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Imported and blended honey dominates retail shelves, often misleading customers. 
              Local producers lack a platform to sell directly, while consumers struggle to find 
              genuine, traceable Australian honey.
            </p>
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
              <div className="p-6 bg-background rounded-lg border">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4 mx-auto">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Counterfeit Products</h3>
                <p className="text-sm text-muted-foreground">
                  Imported honey often mislabeled as Australian
                </p>
              </div>
              <div className="p-6 bg-background rounded-lg border">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">No Direct Access</h3>
                <p className="text-sm text-muted-foreground">
                  Producers can't reach consumers directly
                </p>
              </div>
              <div className="p-6 bg-background rounded-lg border">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Lack of Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  No way to verify origin or authenticity
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Hive Joy Works</h2>
          <p className="text-lg text-muted-foreground">Simple, transparent, trusted</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2 text-lg">Verified Producers</h3>
            <p className="text-sm text-muted-foreground">
              Only Australian beekeepers who produce their own honey
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2 text-lg">Traceable Batches</h3>
            <p className="text-sm text-muted-foreground">
              Every jar linked to its source region, harvest date, and beekeeper
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2 text-lg">Direct to You</h3>
            <p className="text-sm text-muted-foreground">
              Farm-fresh honey delivered directly from producer to consumer
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-primary/5 py-16">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">20,000+</div>
              <div className="text-sm md:text-base text-muted-foreground">Australian Beekeepers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">$300M</div>
              <div className="text-sm md:text-base text-muted-foreground">Domestic Honey Market</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm md:text-base text-muted-foreground">Verified Producers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">🇦🇺</div>
              <div className="text-sm md:text-base text-muted-foreground">Australian Only</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hive Joy Seal */}
      <section className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Hive Joy Seal</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Every producer on our platform is verified and certified. Look for the 
            Hive Joy Seal to ensure you're buying authentic Australian honey directly 
            from the source.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Shield className="h-5 w-5 text-primary" />
            <span>Verified Producer Badge</span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
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

