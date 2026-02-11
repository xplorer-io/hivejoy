'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';

import { floralSourceOptions, australianRegions } from '@/lib/api/mock-data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Mode = 'sheet' | 'sidebar';

export function ProductFilters({ mode = 'sheet' }: { mode?: Mode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const ALL = 'all';

  const hasFilters =
    sp.has('search') ||
    sp.has('region') ||
    sp.has('floralSource') ||
    sp.has('minPrice') ||
    sp.has('maxPrice') ||
    sp.has('sort');

  const [search, setSearch] = React.useState(sp.get('search') ?? '');
  const debounceRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setSearch(sp.get('search') ?? '');
  }, [sp]);

  const setParam = React.useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value && value.length) params.set(key, value);
      else params.delete(key);

      // always reset page when filters change
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp],
  );

  const clearFilters = React.useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const content = (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Filters</CardTitle>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={clearFilters}>
            Clear <X className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearch(v);

                if (debounceRef.current)
                  window.clearTimeout(debounceRef.current);
                debounceRef.current = window.setTimeout(() => {
                  setParam('search', v.trim() || null);
                }, 250);
              }}
              placeholder="Floral type, region, producer…"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Region</Label>
          <Select
            value={sp.get('region') ?? ALL}
            onValueChange={(value) =>
              setParam('region', value === ALL ? null : value)
            }>
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All regions</SelectItem>
              {australianRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Floral source</Label>
          <Select
            value={sp.get('floralSource') ?? ALL}
            onValueChange={(value) =>
              setParam('floralSource', value === ALL ? null : value)
            }>
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {floralSourceOptions.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Price range</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              inputMode="decimal"
              placeholder="Min"
              defaultValue={sp.get('minPrice') ?? ''}
              onBlur={(e) => setParam('minPrice', e.target.value || null)}
              className="h-11 rounded-2xl"
            />
            <Input
              inputMode="decimal"
              placeholder="Max"
              defaultValue={sp.get('maxPrice') ?? ''}
              onBlur={(e) => setParam('maxPrice', e.target.value || null)}
              className="h-11 rounded-2xl"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: set one side and leave the other empty.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (mode === 'sidebar') return content;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-full px-4">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] p-0">
        <SheetHeader className="p-4">
          <SheetTitle>Filter products</SheetTitle>
        </SheetHeader>
        <div className="p-4 pt-0">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
