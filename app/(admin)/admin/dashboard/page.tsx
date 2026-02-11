'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Repeat,
} from 'lucide-react';

interface AdminStats {
  totalProducers: number;
  verifiedProducers: number;
  pendingVerifications: number;
  totalProducts: number;
  pendingListings: number;
  gmv: number;
  totalOrders: number;
  averageOrderValue: number;
  repeatBuyerRate: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and key metrics
        </p>
      </div>

      {/* Key Metrics */}
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
                  <p className="text-sm text-muted-foreground">GMV (30 days)</p>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  ${stats?.gmv.toLocaleString('en-AU', { minimumFractionDigits: 2 }) || '0.00'}
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
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  ${stats?.averageOrderValue.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Repeat Buyers</p>
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {((stats?.repeatBuyerRate || 0) * 100).toFixed(0)}%
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Producers & Products */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Producers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Producers</span>
                  <span className="font-semibold">{stats?.totalProducers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="font-semibold text-green-600">
                    {stats?.verifiedProducers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending Verification</span>
                  <span className="font-semibold text-yellow-600">
                    {stats?.pendingVerifications || 0}
                  </span>
                </div>
                {(stats?.pendingVerifications || 0) > 0 && (
                  <Link href="/admin/verifications">
                    <Button variant="outline" className="w-full gap-2">
                      Review Verifications
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Products</span>
                  <span className="font-semibold">{stats?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending Approval</span>
                  <span className="font-semibold text-yellow-600">
                    {stats?.pendingListings || 0}
                  </span>
                </div>
                {(stats?.pendingListings || 0) > 0 && (
                  <Link href="/admin/listings">
                    <Button variant="outline" className="w-full gap-2">
                      Review Listings
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/admin/verifications">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <ShieldCheck className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-1">Review Verifications</h3>
                <p className="text-sm text-muted-foreground">
                  Verify producer applications and documents.
                </p>
              </div>
            </Link>
            <Link href="/admin/listings">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <Package className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-1">Moderate Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Approve or reject product listings.
                </p>
              </div>
            </Link>
            <Link href="/admin/disputes">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <ShoppingCart className="h-8 w-8 text-orange-600 mb-3" />
                <h3 className="font-semibold mb-1">Handle Disputes</h3>
                <p className="text-sm text-muted-foreground">
                  Manage customer disputes and refunds.
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

