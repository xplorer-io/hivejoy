"use client";

import { useEffect, useState } from "react";
import { getOrders, updateSubOrderStatus } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, SubOrder, SubOrderStatus } from "@/types";
import { DateTime } from "luxon";
import { Package, Truck, CheckCircle, Clock, ShoppingCart } from "lucide-react";

const statusConfig: Record<
  SubOrderStatus,
  { label: string; color: string; icon: typeof Package }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  packed: {
    label: "Packed",
    color: "bg-purple-100 text-purple-800",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: Clock,
  },
  return_requested: {
    label: "Return Requested",
    color: "bg-orange-100 text-orange-800",
    icon: Clock,
  },
  returned: {
    label: "Returned",
    color: "bg-gray-100 text-gray-800",
    icon: Package,
  },
  refunded: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
  },
};

const statusFlow: SubOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Use mock producer ID for demo
        const result = await getOrders(
          "00000000-0000-0000-0002-000000000001",
          "seller",
        );
        setOrders(result.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (
    orderId: string,
    subOrderId: string,
    newStatus: SubOrderStatus,
  ) => {
    try {
      const updated = await updateSubOrderStatus(
        orderId,
        subOrderId,
        newStatus,
      );
      if (updated) {
        setOrders(
          orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              subOrders: o.subOrders.map((so) =>
                so.id === subOrderId ? updated : so,
              ),
            };
          }),
        );
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getNextStatus = (
    currentStatus: SubOrderStatus,
  ): SubOrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  // Flatten to sub-orders for the seller view, then filter
  const allSubOrders: { order: Order; subOrder: SubOrder }[] = [];
  for (const order of orders) {
    for (const subOrder of order.subOrders) {
      allSubOrders.push({ order, subOrder });
    }
  }

  const filteredSubOrders =
    filter === "all"
      ? allSubOrders
      : allSubOrders.filter((item) => item.subOrder.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and fulfill customer orders
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSubOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground">
              {filter === "all"
                ? "You don't have any orders yet."
                : `No orders with status "${statusConfig[filter as SubOrderStatus]?.label}".`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubOrders.map(({ order, subOrder }) => {
            const config = statusConfig[subOrder.status];
            const StatusIcon = config.icon;
            const createdAt = DateTime.fromISO(subOrder.createdAt);
            const nextStatus = getNextStatus(subOrder.status);

            return (
              <Card key={subOrder.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold">
                          Order {order.orderNumber}
                        </p>
                        <Badge className={`gap-1 ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {createdAt.toFormat("d MMMM yyyy")} at{" "}
                        {createdAt.toFormat("h:mm a")}
                      </p>
                    </div>

                    {nextStatus && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(order.id, subOrder.id, nextStatus)
                        }
                      >
                        Mark as {statusConfig[nextStatus].label}
                      </Button>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4 p-4 rounded-lg bg-muted/50">
                    {subOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.productTitle} ({item.variantSize}) x{" "}
                          {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping & Total */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Ship to:</p>
                      <p>
                        {order.shippingAddress.street},{" "}
                        {order.shippingAddress.suburb}
                      </p>
                      <p>
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postcode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Sub-order Total
                      </p>
                      <p className="text-xl font-bold">
                        ${subOrder.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {subOrder.shipment?.trackingNumber && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <p className="text-sm">
                        <span className="font-medium">Tracking:</span>{" "}
                        {subOrder.shipment.trackingNumber}
                        {subOrder.shipment.carrier &&
                          ` (${subOrder.shipment.carrier.replace(/_/g, " ")})`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
