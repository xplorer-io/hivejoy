import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function FoundersStory() {
  return (
    <section className="border-t bg-gradient-to-b from-background to-amber-50/30 dark:to-amber-950/10">
      <div className="fluid-container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Why Hive Joy Exists</span>
          </div>

          <Card className="border-amber-200/60 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20">
            <CardContent className="p-8 md:p-10">
              <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                The founder, Ziad, is a local beekeeper working hands on with his own hives and closely connected to the bees and honey they produce. For him, honey has never just been another product. It is something natural, seasonal, and shaped by the landscape around it.
              </p>

              <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                But the more time the founder spent producing real honey, the more he began to notice growing issues in the market—and he strongly disliked what he was seeing.
              </p>

              <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                Honey labelled as &quot;pure&quot; that did not reflect how it was actually handled. Products that had been overheated, heavily processed, or blended, sitting on shelves beside genuine beekeeper honey, with no clear way for customers to tell the difference.
              </p>

              <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                Most people simply want honest, natural honey. But many are not confident about what they are buying, and that lack of trust affects everyone, especially beekeepers who are committed to doing things properly.
              </p>

              <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                The founder came to realise the problem was not just about honey quality.
                <br />
                <span className="font-medium text-foreground">It was about distance.</span>
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

              <div className="mt-8 space-y-3">
                <p className="text-base font-medium text-foreground">Hive Joy is built on three principles:</p>
                <ul className="space-y-2 text-base text-foreground/90">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                    <span>Quality assurance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                    <span>Protecting both consumers and genuine beekeepers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                    <span>Maintaining market integrity</span>
                  </li>
                </ul>
              </div>

              <p className="mt-8 text-lg italic leading-relaxed text-foreground/80 md:text-xl">
                Because when customers know who produced their honey, where it came from, and how it was handled, trust comes naturally.
              </p>

              <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                Hive Joy exists to support local beekeepers, strengthen transparency, and give Australians confidence in the honey they bring home.
              </p>

              <div className="mt-8">
                <Link href="/about">
                  <Button variant="outline" className="gap-2">
                    Read the full story <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
