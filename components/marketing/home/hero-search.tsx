'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = React.useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/products?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="group relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search honey by floral type, region, or producer…"
        className="h-12 rounded-2xl pl-10 pr-3 shadow-sm transition
                   bg-background/80 backdrop-blur
                   border border-border/70
                   hover:border-border
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent transition group-hover:ring-border/60" />
    </form>
  );
}
