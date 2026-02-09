'use client';

import Link from 'next/link';
import { useAuthStore, useCartStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, Search, Menu, Store, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Log error for debugging, but don't show to user as logout should still clear local state
      console.error('Logout error:', error);
      // The logout function in the store will still clear local state even if Supabase signOut fails
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="fluid-container flex h-16 items-center justify-between gap-4 md:gap-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">
              🍯
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight">Hive Joy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-4 md:ml-0">
          <Link
            href="/products"
            className="text-sm font-medium hover:text-primary transition-colors">
            Browse Honey
          </Link>
          <Link
            href="/producers"
            className="text-sm font-medium hover:text-primary transition-colors">
            Our Producers
          </Link>
        </nav>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search honey..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <Link href="/products">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart" aria-label="Open cart">
              <ShoppingCart className="h-5 w-5" />
              {hasHydrated && itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders">My Orders</Link>
                </DropdownMenuItem>
                {user?.role === 'producer' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/seller/dashboard"
                      className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Portal
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sign In As</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/consumer" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Consumer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/producer" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Producer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/products"
                  className="text-lg font-medium hover:text-primary">
                  Browse Honey
                </Link>
                <Link
                  href="/producers"
                  className="text-lg font-medium hover:text-primary">
                  Our Producers
                </Link>
                {user?.role === 'producer' && (
                  <Link
                    href="/seller/dashboard"
                    className="text-lg font-medium hover:text-primary">
                    Seller Dashboard
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="text-lg font-medium hover:text-primary">
                    Admin Portal
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
