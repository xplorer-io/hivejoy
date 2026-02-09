import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function RefundReturnsPolicyPage() {
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
              <FileText className="h-5 w-5" />
              <span>Refund & Returns Policy</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl mb-8">
              Hive Joy — Refund & Returns Policy
            </h1>

            <Card>
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-amber dark:prose-invert max-w-none">
                  {/* Section 1 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Policy Overview</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      This Refund & Returns Policy outlines the conditions under which customers may request refunds, replacements, or returns for products purchased through the Hive Joy marketplace.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      As honey and hive products are classified as food items, returns are subject to food safety regulations in addition to Australian Consumer Law (ACL).
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 2 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Change-of-Mind Returns</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Hive Joy does not accept returns or provide refunds for change-of-mind purchases.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      This includes situations where the customer:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>No longer wants the product</li>
                      <li>Ordered the wrong item</li>
                      <li>Does not like the taste, texture, or crystallisation</li>
                      <li>Found the product cheaper elsewhere</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Food products cannot be resold once dispatched due to hygiene and safety requirements.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 3 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Eligible Refund & Replacement Scenarios</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Refunds, replacements, or store credits may be issued where products are:
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Damaged in Transit</h3>
                        <ul className="list-disc pl-6 space-y-1 text-base text-foreground/90">
                          <li>Broken jars</li>
                          <li>Leaking containers</li>
                          <li>Crushed packaging affecting product integrity</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">Incorrect Items</h3>
                        <ul className="list-disc pl-6 space-y-1 text-base text-foreground/90">
                          <li>Wrong floral source</li>
                          <li>Wrong size or product sent</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">Missing Items</h3>
                        <p className="text-base text-foreground/90">Items paid for but not delivered</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">Faulty or Unsafe</h3>
                        <ul className="list-disc pl-6 space-y-1 text-base text-foreground/90">
                          <li>Contamination</li>
                          <li>Foreign matter</li>
                          <li>Spoilage inconsistent with raw honey norms</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">Not as Described</h3>
                        <ul className="list-disc pl-6 space-y-1 text-base text-foreground/90">
                          <li>Mislabelled floral source</li>
                          <li>False production claims</li>
                          <li>Expired product (if applicable)</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 4 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Non-Refundable Characteristics (Natural Honey Traits)</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      The following are not considered faults:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Crystallisation / granulation</li>
                      <li>Variations in colour or flavour</li>
                      <li>Pollen or wax residue</li>
                      <li>Natural air bubbles</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      These are normal characteristics of raw, natural honey.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 5 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Claim Timeframes</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Customers must submit refund or replacement requests within:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li><strong>48 hours</strong> of delivery for damage or leakage</li>
                      <li><strong>5 days</strong> of delivery for incorrect or missing items</li>
                      <li><strong>7 days</strong> of delivery for quality or authenticity concerns</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Claims outside these windows may not be eligible.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 6 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Evidence Requirements</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      To process claims, customers must provide:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Clear photos of the product</li>
                      <li>Photos of packaging and shipping box</li>
                      <li>Order number</li>
                      <li>Description of the issue</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Failure to provide evidence may result in claim denial.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 7 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Resolution Outcomes</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Depending on the case, Hive Joy may offer:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Replacement shipment</li>
                      <li>Partial refund</li>
                      <li>Full refund</li>
                      <li>Store credit</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Return of the product is not usually required for food safety reasons unless specifically requested.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 8 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Seller Responsibility</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      If a claim is validated, the seller may be responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Refund cost</li>
                      <li>Replacement cost</li>
                      <li>Return shipping (if applicable)</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Repeated verified complaints may trigger:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Product listing review</li>
                      <li>Compliance checks</li>
                      <li>Account warnings or suspension</li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 9 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Delivery & Courier Liability</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Where damage is caused by courier handling:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Hive Joy will coordinate investigation</li>
                      <li>Compensation may be sought from the carrier</li>
                      <li>Customer resolution will not be delayed</li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 10 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">10. Australian Consumer Law</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Nothing in this policy excludes rights under the Australian Consumer Law (ACL).
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Customers are entitled to remedies if products:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Are unsafe</li>
                      <li>Are significantly not as described</li>
                      <li>Fail to meet acceptable quality standards</li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 11 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">11. Refund Processing Time</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Approved refunds are processed within:
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      5–10 business days
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Timeframes depend on the original payment provider.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 12 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">12. Policy Updates</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Hive Joy may update this policy to reflect operational, legal, or food safety requirements.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Material changes will be communicated via the platform.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Summary */}
                  <section className="rounded-lg border border-amber-200/60 bg-amber-50/70 p-6 dark:border-amber-800/60 dark:bg-amber-950/30">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>No change-of-mind returns on food products</li>
                      <li>Refunds for damage, errors, or authenticity issues</li>
                      <li>Claims must be lodged within stated timeframes</li>
                      <li>Evidence required for all claims</li>
                    </ul>
                  </section>
                </div>

                <div className="mt-8 flex justify-center">
                  <Link href="/">
                    <Button size="lg" className="gap-2">
                      Return to Home <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
