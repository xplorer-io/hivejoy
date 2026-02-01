import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroSearch } from './hero-search';

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden border-b bg-gradient-to-b from-amber-50 via-background to-background dark:from-amber-950/40">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(245,158,11,0.22),transparent_60%),radial-gradient(50%_35%_at_90%_15%,rgba(249,115,22,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[url('/honeycomb-pattern.svg')] opacity-[0.04] dark:opacity-[0.06]" />
      </div>

      <div className="fluid-container relative py-16 md:py-24">
        {/* Optional: make it feel less “empty” on wide screens by using a 2-col layout */}
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6 xl:col-span-5">
            <Badge className="mb-5 rounded-full border border-amber-200/60 bg-amber-100/70 px-3 py-1 text-amber-900 dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-100">
              🇦🇺 100% Australian Honey
            </Badge>

            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              Pure honey,{' '}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                direct from
              </span>{' '}
              the source.
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground md:text-xl">
              Discover verified Australian honey producers. Every jar is
              traceable to its origin—know your beekeeper, know your honey.
            </p>

            <p className="mt-3 max-w-xl text-base font-medium text-foreground/90 md:text-lg">
              No resellers. No imports. Just pure Australian honey.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/products">
                <Button
                  size="lg"
                  className="h-11 gap-2 rounded-full px-6 shadow-sm transition will-change-transform hover:-translate-y-[1px] hover:shadow-md active:translate-y-0">
                  Browse honey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/producers">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full px-6 shadow-sm transition hover:bg-muted">
                  Meet our producers
                </Button>
              </Link>
            </div>

            <div className="mt-7 max-w-md">
              <HeroSearch />
            </div>
          </div>

          {/* Right side “balance” panel (keeps hero from feeling left-heavy on wide screens) */}
          <div className="hidden lg:col-span-6 lg:block xl:col-span-7">
            <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border bg-white/40 shadow-sm backdrop-blur dark:bg-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_30%,rgba(245,158,11,0.22),transparent_60%)]" />
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl" />
              <div className="absolute inset-0 ring-1 ring-inset ring-border/40" />
            </div>
          </div>
        </div>
      </div>

      {/* edge glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/4 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />
    </section>
  );
}
