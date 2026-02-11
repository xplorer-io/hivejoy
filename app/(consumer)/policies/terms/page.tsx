import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CustomerTermsPage() {
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
              <span>Customer Terms of Purchase</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl mb-8">
              Hive Joy — Customer Terms of Purchase
            </h1>

            <Card>
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-amber dark:prose-invert max-w-none">
                  {/* Section 1 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      These Customer Terms of Purchase govern all orders placed through the Hive Joy marketplace.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      By placing an order, you agree to be bound by these Terms, along with Hive Joy&apos;s Refund & Returns Policy, Privacy Policy, and any additional platform policies referenced herein.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Hive Joy operates as a marketplace connecting customers directly with independent beekeepers and honey producers (&quot;Sellers&quot;).
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 2 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Marketplace Role</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Hive Joy facilitates product listings, payments, and order coordination but does not produce the honey listed on the platform.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Responsibility for product production, description, labelling, and compliance rests with the individual Seller.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Hive Joy conducts seller verification and quality controls but does not guarantee every product&apos;s suitability for individual preferences or dietary needs.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 3 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Product Nature</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Customers acknowledge that honey and hive products are natural food items and may vary in:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Colour</li>
                      <li>Flavour</li>
                      <li>Aroma</li>
                      <li>Texture</li>
                      <li>Crystallisation state</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      These variations are normal and not considered defects.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 4 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Pricing & Payments</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      All prices are listed in Australian Dollars (AUD) unless otherwise stated.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      By placing an order, you authorise Hive Joy&apos;s payment provider to charge the full purchase amount, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Product price</li>
                      <li>Shipping costs</li>
                      <li>Applicable taxes</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Orders are confirmed only once payment has been successfully processed.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 5 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Order Acceptance & Cancellation</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Sellers reserve the right to cancel orders where:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Stock becomes unavailable</li>
                      <li>Shipping limitations apply</li>
                      <li>Product integrity may be compromised</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      If an order is cancelled, customers will receive a full refund.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Customers may request cancellation before dispatch. Once shipped, cancellation is not guaranteed.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 6 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Shipping & Delivery</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Delivery timeframes vary by seller location and courier service.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Customers are responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Providing accurate shipping details</li>
                      <li>Ensuring safe delivery access</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Hive Joy is not liable for delays caused by couriers, weather events, or incorrect address information.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 7 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Risk & Title</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Risk in the goods passes to the customer upon confirmed delivery.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Title (ownership) transfers once payment is completed and goods are dispatched.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 8 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Refunds & Returns</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Refunds and replacements are governed by the{' '}
                      <Link href="/policies/refund-returns" className="text-primary underline hover:no-underline">
                        Hive Joy Refund & Returns Policy
                      </Link>.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      As honey is a food product:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Change-of-mind returns are not accepted</li>
                      <li>Claims must meet eligibility and evidence requirements</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Customers should review the Refund Policy before purchase.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 9 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Product Authenticity & Traceability</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Hive Joy verifies sellers through documentation and declarations to support authenticity and traceability.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      However, customers acknowledge that Hive Joy relies on information supplied by sellers and cannot independently test every batch unless required.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 10 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">10. Allergies, Infant Safety & Dietary Responsibility</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Honey and hive products may contain naturally occurring pollen or bee-related compounds.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Customers with allergies or sensitivities purchase at their own discretion and should seek medical advice where necessary.
                    </p>
                    
                    <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
                      <h3 className="font-semibold text-lg mb-2">Infant Warning</h3>
                      <p className="text-base leading-relaxed text-foreground/90">
                        Honey is not suitable for infants under 12 months of age due to the risk of infant botulism.
                      </p>
                      <p className="text-base leading-relaxed text-foreground/90 mt-2">
                        By purchasing honey products through Hive Joy, customers acknowledge responsibility for ensuring products are not consumed by infants below this age threshold.
                      </p>
                      <p className="text-base leading-relaxed text-foreground/90 mt-2">
                        Hive Joy and its Sellers are not liable for misuse contrary to this safety guidance.
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 11 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      To the extent permitted by law, Hive Joy is not liable for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Individual taste preferences</li>
                      <li>Natural product variations</li>
                      <li>Misuse or improper storage of honey</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Nothing in these Terms excludes rights under Australian Consumer Law.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 12 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">12. Australian Consumer Law</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Customers retain statutory rights where goods:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Are unsafe</li>
                      <li>Are significantly not as described</li>
                      <li>Fail acceptable quality standards</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Remedies will be provided in accordance with the law.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 13 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">13. Disputes</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Customers should contact Hive Joy support to resolve order issues.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Hive Joy may mediate disputes between customers and sellers to reach a fair resolution.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 14 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">14. Privacy & Data</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Customer information is handled in accordance with the Hive Joy Privacy Policy and used solely for order processing, delivery, and support.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 15 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      These Terms are governed by the laws of New South Wales, Australia.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Any disputes are subject to the jurisdiction of NSW courts.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 16 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">16. Policy Updates</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Hive Joy may update these Terms periodically.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Continued use of the platform constitutes acceptance of revised Terms.
                    </p>
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
