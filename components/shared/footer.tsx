import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="fluid-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg">🍯</span>
              </div>
              <span className="text-xl font-bold">Hive Joy</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Connecting Australian honey producers directly with consumers.
              Every jar tells a story.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors">
                  Browse Honey
                </Link>
              </li>
              <li>
                <Link
                  href="/producers"
                  className="hover:text-foreground transition-colors">
                  Our Producers
                </Link>
              </li>
              <li>
                <Link
                  href="/products?filter=featured"
                  className="hover:text-foreground transition-colors">
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Producers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/seller/apply"
                  className="hover:text-foreground transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/dashboard"
                  className="hover:text-foreground transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/help"
                  className="hover:text-foreground transition-colors">
                  Seller Help
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/policies/payout"
                  className="hover:text-foreground transition-colors">
                  Payout Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-foreground transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Hive Joy. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/policies/terms"
              className="hover:text-foreground transition-colors">
              Terms of Purchase
            </Link>
            <Link
              href="/policies/refund-returns"
              className="hover:text-foreground transition-colors">
              Refund & Returns
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
