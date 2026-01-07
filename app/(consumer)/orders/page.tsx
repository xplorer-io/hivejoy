'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores';
import { getOrders } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/types';
import { DateTime } from 'luxon';
import { Package, CheckCircle, Truck, Clock, ShoppingBag, ArrowRight } from 'lucide-react';

const statusConfig: Record<
  Order['status'],
  { label: string; color: string; icon: typeof Package }
> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
  packed: { label: 'Packed', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Clock },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: Clock },
};

function SuccessMessage() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';

  if (!showSuccess) return null;

  return (
    <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="font-semibold text-green-800 dark:text-green-100">
            Order Placed Successfully!
          </h2>
          <p className="text-sm text-green-700 dark:text-green-200">
            Thank you for your order. You&apos;ll receive a confirmation email shortly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersContent() {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const result = await getOrders(user.id, 'buyer');
        setOrders(result.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2">Sign in to view orders</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your order history.
          </p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t placed any orders. Start shopping to see your orders here.
          </p>
          <Link href="/products">
            <Button className="gap-2">
              Browse Honey
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            const createdAt = DateTime.fromISO(order.createdAt);

            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Placed {createdAt.toFormat('d MMMM yyyy')} at{' '}
                        {createdAt.toFormat('h:mm a')}
                      </p>
                    </div>
                    <Badge className={`gap-1 ${config.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.productTitle} ({item.variantSize}) × {item.quantity}
                        </span>
                        <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-semibold">Total: ${order.total.toFixed(2)}</span>
                    {order.trackingNumber && (
                      <p className="text-sm text-muted-foreground">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="container px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
