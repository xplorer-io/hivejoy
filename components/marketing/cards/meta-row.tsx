'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function MetaRow(props: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = props.icon;
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        props.className,
      )}>
      <Icon className="h-3.5 w-3.5" />
      <span className="min-w-0 truncate">{props.children}</span>
    </div>
  );
}
