import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SellerPayoutPolicyPage() {
  return (
    <main className="flex flex-col">
      <section className="border-b bg-gradient-to-b from-amber-50 via-background to-background dark:from-amber-950/40">
        <div className="fluid-container py-12 md:py-16">
          <Link
            href="/seller/dashboard"
            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-5 w-5" />
              <span>Seller Payout Policy</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl mb-8">
              Hive Joy — Seller Payout Policy
            </h1>

            <Card>
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-amber dark:prose-invert max-w-none">
                  {/* Section 1 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      This Seller Payout Policy outlines how and when sellers receive payments for completed sales made through the Hive Joy marketplace.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Hive Joy facilitates payments between customers and sellers and releases funds in accordance with platform verification, delivery, and compliance requirements.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 2 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Payment Processing</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      All customer payments are processed securely through Hive Joy&apos;s integrated payment provider.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Funds from each order are held temporarily by the platform until payout eligibility conditions are met.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 3 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Payout Schedule</h2>
                    <h3 className="text-xl font-semibold mb-3 mt-4">Standard Payout Timing</h3>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Payouts are released:
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      7–14 business days after confirmed order delivery
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      This holding period allows for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Delivery confirmation</li>
                      <li>Customer issue reporting</li>
                      <li>Fraud and payment verification</li>
                      <li>Refund or dispute review (if applicable)</li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 4 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Delivery Confirmation Requirements</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Payout eligibility requires one of the following:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Verified courier tracking showing delivery</li>
                      <li>Customer delivery confirmation</li>
                      <li>Signed proof of receipt (if applicable)</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      If delivery cannot be confirmed, payouts may be delayed until resolution.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 5 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Commission & Fee Deductions</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Before payout release, the following are automatically deducted:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Hive Joy marketplace commission</li>
                      <li>Payment processing fees (if applicable)</li>
                      <li>Approved refunds or partial refunds</li>
                      <li>Chargebacks or dispute reversals</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      A detailed payout statement is provided for each disbursement.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 6 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Minimum Payout Threshold</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Hive Joy may apply a minimum payout threshold to reduce transaction processing costs.
                    </p>
                    <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
                      <p className="text-base text-foreground/90">
                        <strong>Example:</strong>
                      </p>
                      <p className="text-base text-foreground/90 mt-1">
                        Minimum payout: $50 AUD
                      </p>
                      <p className="text-base text-foreground/90 mt-2">
                        Balances below this amount roll over to the next payout cycle.
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 7 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Payout Method</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Sellers receive funds via direct bank transfer to their nominated Australian bank account.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Required seller details:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90 mt-2">
                      <li>Account name</li>
                      <li>BSB</li>
                      <li>Account number</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Sellers are responsible for ensuring banking details are accurate and up to date.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 8 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Payout Frequency</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Payouts are processed on a rolling basis or scheduled cycle:
                    </p>
                    <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
                      <p className="text-base font-semibold text-foreground mb-2">
                        Recommended launch model:
                      </p>
                      <p className="text-base text-foreground/90">
                        • Weekly payouts
                      </p>
                      <p className="text-base font-semibold text-foreground mt-4 mb-2">
                        Future options may include:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-base text-foreground/90">
                        <li>Fortnightly payouts</li>
                        <li>On-demand payouts (subject to fees)</li>
                      </ul>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 9 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Refunds & Disputes Impact</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      If a refund or dispute is initiated:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>The disputed amount may be held or reversed</li>
                      <li>Payouts may be paused until resolution</li>
                      <li>Negative balances may be offset against future payouts</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Hive Joy reserves the right to investigate disputes before releasing funds.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 10 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">10. Compliance & Account Holds</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      Payouts may be delayed or suspended if:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Compliance documents are requested</li>
                      <li>Product authenticity is under review</li>
                      <li>Seller declarations are being investigated</li>
                      <li>Fraud risk is detected</li>
                    </ul>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Funds remain secured until the matter is resolved.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 11 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">11. Currency</h2>
                    <p className="text-base leading-relaxed text-foreground/90 mb-4">
                      All payouts are processed in:
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      Australian Dollars (AUD)
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-4">
                      Sellers are responsible for any bank or tax obligations associated with received income.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Section 12 */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">12. Policy Updates</h2>
                    <p className="text-base leading-relaxed text-foreground/90">
                      Hive Joy may update payout schedules, thresholds, or methods as the platform evolves.
                    </p>
                    <p className="text-base leading-relaxed text-foreground/90 mt-2">
                      Sellers will be notified in advance of any material changes affecting payment timing or structure.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  {/* Summary */}
                  <section className="rounded-lg border border-amber-200/60 bg-amber-50/70 p-6 dark:border-amber-800/60 dark:bg-amber-950/30">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <ul className="list-disc pl-6 space-y-2 text-base text-foreground/90">
                      <li>Payouts are released 7–14 business days after confirmed delivery</li>
                      <li>Commission and applicable fees are deducted automatically</li>
                      <li>Funds are transferred weekly to your nominated Australian bank account</li>
                    </ul>
                  </section>
                </div>

                <div className="mt-8 flex justify-center">
                  <Link href="/seller/dashboard">
                    <Button size="lg" className="gap-2">
                      Return to Dashboard <ArrowLeft className="h-4 w-4 rotate-180" />
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
