import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function OurStoryPage() {
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
              <span>Our Story</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Our Story
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              The journey behind Hive Joy and why we exist
            </p>

            {/* Meet Ziad Section */}
            <div className="mt-12 rounded-2xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-amber-100/40 p-8 md:p-10 dark:border-amber-800/60 dark:from-amber-950/40 dark:to-amber-900/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-white dark:bg-amber-500">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Meet Our Founder – <span className="text-amber-600 dark:text-amber-400">Ziad</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                    I&apos;m Ziad, a beekeeper working hands-on with my own hives, closely connected to the bees and the honey they produce.
                  </p>

                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                    For me, honey has never been just another product. It is natural, seasonal, and shaped by the landscape around it. Every jar reflects the environment, the flowering seasons, and the care taken in the hive.
                  </p>

                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Beekeeping has given me a deep respect for the integrity of honey — how it is harvested, handled, and shared.
                  </p>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-amber-200/60 shadow-lg dark:border-amber-800/60">
                  <Image
                    src="/images/ziad-founder.png"
                    alt="Ziad, founder of Hive Joy, holding honey jars at an outdoor event"
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority
                  />
                </div>
              </div>
            </div>

            <Card className="mt-8 border-amber-200/60 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20">
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-amber dark:prose-invert max-w-none">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                      Why Hive Joy Exists
                    </h2>
                  </div>

                  <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                    As I spent more time producing real, beekeeper-managed honey, I began to notice growing issues in the broader market.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Honey labelled as &quot;pure&quot; did not always reflect how it had actually been handled. Products that had been overheated, heavily processed, or blended were sitting on shelves beside genuine beekeeper honey — with no clear way for customers to tell the difference.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Most consumers simply want honest, natural honey. Yet many are unsure about what they are buying. This lack of transparency affects everyone — especially beekeepers who are committed to maintaining high standards.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    The issue was not only about honey quality.
                  </p>

                  <div className="mt-6 rounded-lg border-2 border-amber-300/50 bg-amber-50/70 p-6 dark:border-amber-700/50 dark:bg-amber-950/30">
                    <p className="text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
                      It was about distance.
                    </p>
                  </div>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Distance between the beekeeper and the customer.
                    <br />
                    Distance created by layers of distribution, bulk handling, repackaging, and anonymous supply chains.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    As honey moves further from the hive, transparency is often lost along the way.
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                    Hive Joy was created to restore that connection — bringing producers and consumers closer together through direct, traceable sourcing.
                  </p>

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
    </main>
  );
}
