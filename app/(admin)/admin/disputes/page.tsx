'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';

// Mock disputes for demo
type DisputeStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
  buyerEmail: string;
}

const mockDisputes: Dispute[] = [
  {
    id: 'dispute-1',
    orderId: 'order-123',
    reason: 'Product not as described',
    status: 'open',
    createdAt: '2025-01-05T10:00:00Z',
    buyerEmail: 'buyer@example.com',
  },
  {
    id: 'dispute-2',
    orderId: 'order-456',
    reason: 'Delivery issue - package damaged',
    status: 'in_progress',
    createdAt: '2025-01-04T15:00:00Z',
    buyerEmail: 'another@example.com',
  },
];

const statusConfig = {
  open: { label: 'Open', color: 'bg-red-100 text-red-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Disputes & Refunds</h1>
        <p className="text-muted-foreground">
          Handle customer disputes and process refunds
        </p>
      </div>

      {mockDisputes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No open disputes</h2>
            <p className="text-muted-foreground">
              All customer issues have been resolved.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockDisputes.map((dispute) => {
            const config = statusConfig[dispute.status];
            const StatusIcon = config.icon;

            return (
              <Card key={dispute.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">Dispute #{dispute.id}</p>
                        <Badge className={`gap-1 ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Order: {dispute.orderId} • {dispute.buyerEmail}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {dispute.reason}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                        <Button size="sm">Process Refund</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Dispute Workflow</h3>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the disputes feature. In production, this would include:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Order-linked messaging between buyer, seller, and admin</li>
            <li>Refund processing through Stripe</li>
            <li>Resolution status tracking</li>
            <li>Strike system for repeat offenders</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

