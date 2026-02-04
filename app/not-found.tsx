import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="fluid-container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
              🍯
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              404 - Page not found
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              We could not find that page
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              The link may be broken or the page may have been moved. Try heading
              back home or browse our honey catalog.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/">Back to home</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products">Browse honey</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
