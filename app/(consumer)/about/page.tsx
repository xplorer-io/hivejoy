import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getFeaturedProducers } from '@/lib/api';
import { ProducerCard } from '@/components/shared/producer-card';

export default async function AboutPage() {
  const featuredProducers = await getFeaturedProducers();
  return (
    <main className="flex flex-col">
      <section className="border-b bg-gradient-to-b from-amber-50 via-background to-background dark:from-amber-950/40">
        <div className="fluid-container py-12 md:py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span>About Us</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              About Hive Joy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Connecting Australian beekeepers directly with consumers
            </p>

            <Card className="mt-12 border-amber-200/60 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20">
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-amber dark:prose-invert max-w-none">

                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                      What Hive Joy Does
                    </h2>
                  </div>

                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Hive Joy is a marketplace that directly connects customers with registered Australian beekeepers — people who manage their own hives and stand behind what they produce.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Every product listed on Hive Joy is traceable to:
                  </p>

                  <ul className="mt-4 space-y-2 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>The producer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>The apiary</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>The region it comes from</span>
                    </li>
                  </ul>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Hive Joy works exclusively with Australian beekeepers. All sellers are verified to ensure their honey is locally produced, traceable, and compliant with Australian standards.
                  </p>

                  <div className="mt-8 rounded-lg border border-amber-200/60 bg-amber-50/50 p-6 dark:border-amber-800/60 dark:bg-amber-950/20">
                    <p className="text-lg font-medium leading-relaxed text-foreground md:text-xl">
                      There are no unnecessary middle layers.
                      <br />
                      <span className="text-amber-700 dark:text-amber-300">Just direct, transparent sourcing.</span>
                    </p>
                  </div>

                  <Separator className="my-10" />

                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                      Our Principles
                    </h2>
                  </div>

                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl mb-8">
                    Hive Joy is built on three core principles:
                  </p>

                  <div className="mt-6 grid gap-6 md:grid-cols-1">
                    <div className="flex items-start gap-4 rounded-lg border border-amber-200/40 bg-white/50 p-6 dark:border-amber-800/40 dark:bg-amber-950/10">
                      <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          1. Quality Assurance
                        </h3>
                        <p className="text-base leading-relaxed text-foreground/80">
                          Every producer is verified, and every product is traceable to its source.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg border border-amber-200/40 bg-white/50 p-6 dark:border-amber-800/40 dark:bg-amber-950/10">
                      <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          2. Protecting Consumers &amp; Genuine Beekeepers
                        </h3>
                        <p className="text-base leading-relaxed text-foreground/80">
                          Hive Joy ensures consumers receive authentic honey while supporting beekeepers who are committed to ethical and responsible practices.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg border border-amber-200/40 bg-white/50 p-6 dark:border-amber-800/40 dark:bg-amber-950/10">
                      <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          3. Market Integrity
                        </h3>
                        <p className="text-base leading-relaxed text-foreground/80">
                          Hive Joy acts as a trusted bridge between beekeeper and customer, maintaining transparency and strengthening trust across the marketplace.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-10" />

                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                      Our Mission
                    </h2>
                  </div>

                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Hive Joy exists to:
                  </p>

                  <ul className="mt-4 space-y-2 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>Support local Australian beekeepers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>Strengthen transparency in the honey market</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>Protect the integrity of genuine, hive-to-jar honey</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>Give Australians confidence in the honey they bring home</span>
                    </li>
                  </ul>

                  <div className="mt-8 rounded-lg border-2 border-amber-200/60 bg-amber-50/70 p-6 dark:border-amber-800/60 dark:bg-amber-950/30">
                    <p className="text-xl font-semibold italic leading-relaxed text-foreground md:text-2xl">
                      When customers know who produced their honey, where it came from, and how it was handled, trust comes naturally.
                    </p>
                  </div>

                  <p className="mt-8 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Hive Joy was created to make that trust possible — simply, directly, and transparently.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Producers Section */}
      <section className="border-t bg-muted/20">
        <div className="fluid-container py-14 md:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Our Producers
            </h2>
            <p className="mt-2 text-base text-muted-foreground md:text-lg">
              Meet the verified Australian beekeepers behind your honey
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducers.map((producer) => (
                <ProducerCard key={producer.id} producer={producer} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link href="/producers">
                <Button variant="outline" size="lg" className="gap-2">
                  View All Producers <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
