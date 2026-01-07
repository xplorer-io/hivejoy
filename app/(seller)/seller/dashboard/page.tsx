'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores';
import { getSellerOrderStats, getBatchesByProducer } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [batchCount, setBatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Use mock producer ID for demo
        const producerId = 'producer-1';
        const [orderStats, batches] = await Promise.all([
          getSellerOrderStats(producerId),
          getBatchesByProducer(producerId),
        ]);
        setStats(orderStats);
        setBatchCount(batches.length);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your store overview.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/seller/batches/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Batch
            </Button>
          </Link>
          <Link href="/seller/listings/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  ${stats?.totalRevenue.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">{stats?.totalOrders || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {(stats?.pendingOrders || 0) + (stats?.processingOrders || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Active Batches</p>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">{batchCount}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stats?.pendingOrders ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  You have{' '}
                  <span className="font-medium text-foreground">
                    {stats.pendingOrders} orders
                  </span>{' '}
                  waiting to be processed.
                </p>
                <Link href="/seller/orders">
                  <Button variant="outline" className="gap-2">
                    View Orders
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground">No pending orders. Great job!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Verified Producer
              </Badge>
              <span className="text-sm text-muted-foreground">
                Your account is in good standing
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-1">Create a Batch</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Record your honey harvest with region, dates, and floral sources.
              </p>
              <Link href="/seller/batches/new">
                <Button variant="outline" size="sm">
                  Create Batch
                </Button>
              </Link>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-1">Add a Listing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create product listings linked to your batches with photos and pricing.
              </p>
              <Link href="/seller/listings/new">
                <Button variant="outline" size="sm">
                  Add Listing
                </Button>
              </Link>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-1">Fulfill Orders</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Process incoming orders, pack products, and add tracking info.
              </p>
              <Link href="/seller/orders">
                <Button variant="outline" size="sm">
                  View Orders
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

