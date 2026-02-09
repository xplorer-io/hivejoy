import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
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
              <Sparkles className="h-5 w-5" />
              <span>Founder&apos;s Story</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Why Hive Joy Exists
            </h1>

            <Card className="mt-8 border-amber-200/60 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20">
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-amber dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                    I&apos;m a beekeeper, working hands on with my own hives and closely connected to the bees and honey they produce. For me, honey has never just been another product. It is something natural, seasonal, and shaped by the landscape around it.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    But the more time I spent producing real honey, the more I noticed a growing issue in the market.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Honey labelled as &quot;pure&quot; that did not reflect how it was actually handled. Products that had been overheated, heavily processed, or blended, sitting on shelves beside genuine beekeeper honey, with no clear way for customers to tell the difference.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Most people simply want honest, natural honey. But many are not confident about what they are buying, and that lack of trust affects everyone, especially beekeepers who are committed to doing things properly.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    I came to realise the problem was not just about honey quality.
                    <br />
                    <span className="font-semibold text-foreground">It was about distance.</span>
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Distance between the beekeeper and the customer. Distance created by layers of distribution, bulk handling, repackaging, and anonymous supply chains. As honey moves further from the hive, transparency often gets lost along the way.
                  </p>

                  <p className="mt-6 text-lg font-semibold leading-relaxed text-foreground md:text-xl">
                    Hive Joy was created to bring that connection back.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    The marketplace directly connects customers with registered Australian beekeepers, people who manage their own hives and stand behind what they produce. Every product is traceable to the producer, the apiary, and the region it comes from.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Hive Joy works exclusively with Australian beekeepers.
                    <br />
                    All sellers are verified to ensure their honey is locally produced, traceable, and compliant with Australian standards.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    No unnecessary middle layers. Just direct, transparent sourcing.
                  </p>

                  <Separator className="my-8" />

                  <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Our Principles
                  </h2>

                  <p className="mt-4 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    At its core, Hive Joy is built on three principles:
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Quality assurance</h3>
                        <p className="mt-1 text-base text-foreground/80">
                          Every producer is verified, and every product is traceable to its source.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Protecting both consumers and genuine beekeepers</h3>
                        <p className="mt-1 text-base text-foreground/80">
                          We ensure consumers get authentic honey while supporting beekeepers who do the right thing.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Maintaining market integrity</h3>
                        <p className="mt-1 text-base text-foreground/80">
                          We act as the bridge between beekeepers and consumers, ensuring transparency and trust.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Our Mission
                  </h2>

                  <p className="mt-4 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    The role of Hive Joy team is to act as the bridge between both sides:
                  </p>

                  <ul className="mt-4 space-y-2 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>Supporting beekeepers who do the right thing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>Protecting consumers who want genuine honey they can trust</span>
                    </li>
                  </ul>

                  <div className="mt-8 rounded-lg border border-amber-200/60 bg-amber-50/70 p-6 dark:border-amber-800/60 dark:bg-amber-950/30">
                    <p className="text-xl font-semibold italic leading-relaxed text-foreground md:text-2xl">
                      Because when customers know who produced their honey, where it came from, and how it was handled, trust comes naturally.
                    </p>
                  </div>

                  <p className="mt-8 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Hive Joy exists to support local beekeepers, strengthen transparency, and give Australians confidence in the honey they bring home.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-center">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  Browse Authentic Honey <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
