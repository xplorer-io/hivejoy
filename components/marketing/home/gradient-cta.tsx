import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GradientCta() {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-sm md:p-12">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Are you a honey producer?
        </h2>
        <p className="mt-3 text-amber-50/90">
          Join Hive Joy and connect directly with customers who value authentic,
          traceable Australian honey. No middlemen—just you and your bees.
        </p>
        <div className="mt-6">
          <Link href="/seller/apply">
            <Button
              variant="secondary"
              size="lg"
              className="h-11 gap-2 rounded-full px-6 shadow-sm transition
                         hover:-translate-y-[1px] hover:shadow-md active:translate-y-0">
              Apply to sell <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-1/4 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" />
    </div>
  );
}
