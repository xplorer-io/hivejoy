'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type CardFrameProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

export function CardFrame({
  href,
  children,
  className,
  ...a11y
}: CardFrameProps) {
  return (
    <Link
      href={href}
      className={cn(
        // One interactive element only (the link). Everything inside must be non-interactive. [web:20]
        'group relative block h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition',
        'hover:-translate-y-[1px] hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      {...a11y}>
      {/* Subtle inset ring for “tactile” depth */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-border/40 transition group-hover:ring-border/70" />
      {children}
    </Link>
  );
}
