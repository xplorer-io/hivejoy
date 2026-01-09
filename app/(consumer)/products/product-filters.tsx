'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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
import { floralSourceOptions, australianRegions } from '@/lib/api';
import { Search, X } from 'lucide-react';

export function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            params.delete('page'); // Reset to page 1 on filter change
            router.push(`/products?${params.toString()}`);
        },
        [router, searchParams]
    );

    const clearFilters = useCallback(() => {
        router.push('/products');
    }, [router]);

    const hasFilters =
        searchParams.has('search') ||
        searchParams.has('region') ||
        searchParams.has('floralSource') ||
        searchParams.has('minPrice') ||
        searchParams.has('maxPrice');

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
                            <X className="h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search honey..."
                            className="pl-9"
                            defaultValue={searchParams.get('search') || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Debounce search
                                const timeout = setTimeout(() => {
                                    updateFilter('search', value || null);
                                }, 300);
                                return () => clearTimeout(timeout);
                            }}
                        />
                    </div>
                </div>

                <Separator />

                {/* Region */}
                <div className="space-y-2">
                    <Label>Region</Label>
                    <Select
                        value={searchParams.get('region') || ''}
                        onValueChange={(value) => updateFilter('region', value || null)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All regions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="https://images.pexels.com/photos/5634207/pexels-photo-5634207.jpeg?w=800">All regions</SelectItem>
                            {australianRegions.map((region) => (
                                <SelectItem key={region} value={region}>
                                    {region}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Floral Source */}
                <div className="space-y-2">
                    <Label>Floral Source</Label>
                    <Select
                        value={searchParams.get('floralSource') || ''}
                        onValueChange={(value) => updateFilter('floralSource', value || null)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="https://images.pexels.com/photos/33260/honey-sweet-syrup-organic.jpg?w=800">All types</SelectItem>
                            {floralSourceOptions.map((source) => (
                                <SelectItem key={source} value={source}>
                                    {source}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            type="number"
                            placeholder="Min"
                            className="w-full"
                            defaultValue={searchParams.get('minPrice') || ''}
                            onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            className="w-full"
                            defaultValue={searchParams.get('maxPrice') || ''}
                            onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

