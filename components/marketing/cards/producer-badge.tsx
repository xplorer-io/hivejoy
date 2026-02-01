'use client';

import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export function ProducerBadge(props: {
  level?: 'none' | 'verified' | 'premium';
}) {
  const level = props.level ?? 'none';
  if (level === 'none') return null;

  const isPremium = level === 'premium';

  return (
    <Badge
      className={[
        'gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm',
        isPremium
          ? 'bg-amber-500/90 text-white hover:bg-amber-500'
          : 'bg-emerald-600/90 text-white hover:bg-emerald-600',
      ].join(' ')}>
      <Shield className="h-3 w-3" />
      {isPremium ? 'Premium' : 'Verified'}
    </Badge>
  );
}
