'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Ban, ShieldOff, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Seller {
  id: string;
  business_name: string;
  user_id: string;
  verification_status: string;
  application_status: string;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    role: string;
    status: 'active' | 'suspended' | 'banned';
  };
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    sellerId: string;
    sellerName: string;
    action: 'suspend' | 'ban' | 'reactivate' | null;
  }>({
    open: false,
    sellerId: '',
    sellerName: '',
    action: null,
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  async function fetchSellers() {
    try {
      const response = await fetch('/api/admin/sellers');
      const data = await response.json();

      if (data.success && data.sellers) {
        setSellers(data.sellers);
      } else {
        setError(data.error || data.details || 'Failed to fetch sellers');
        console.error('Failed to fetch sellers:', data);
      }
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
      setError('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(sellerId: string, action: 'suspend' | 'ban' | 'reactivate') {
    setProcessing(sellerId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to update seller status');
        setProcessing(null);
        return;
      }

      // Refresh sellers list
      await fetchSellers();
      setActionDialog({ open: false, sellerId: '', sellerName: '', action: null });
    } catch (err) {
      console.error('Failed to update seller status:', err);
      setError('Failed to update seller status. Please try again.');
    } finally {
      setProcessing(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
      case 'banned':
        return <Badge className="bg-red-100 text-red-800">Banned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sellers</h1>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Sellers Management
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {sellers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No sellers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sellers.map((seller) => {
            const profileStatus = seller.profiles?.status || 'active';
            const isProcessing = processing === seller.id;

            return (
              <Card key={seller.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{seller.business_name}</h3>
                        {getStatusBadge(profileStatus)}
                      </div>
                      {seller.profiles?.email && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {seller.profiles.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(seller.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {profileStatus === 'active' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActionDialog({
                                open: true,
                                sellerId: seller.id,
                                sellerName: seller.business_name,
                                action: 'suspend',
                              })
                            }
                            disabled={isProcessing}
                            className="gap-2"
                          >
                            <ShieldOff className="h-4 w-4" />
                            Suspend
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setActionDialog({
                                open: true,
                                sellerId: seller.id,
                                sellerName: seller.business_name,
                                action: 'ban',
                              })
                            }
                            disabled={isProcessing}
                            className="gap-2"
                          >
                            <Ban className="h-4 w-4" />
                            Ban
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setActionDialog({
                              open: true,
                              sellerId: seller.id,
                              sellerName: seller.business_name,
                              action: 'reactivate',
                            })
                          }
                          disabled={isProcessing}
                          className="gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          Reactivate
                        </Button>
                      )}
                      <Link href={`/admin/seller-applications/${seller.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={actionDialog.open}
        onOpenChange={(open) =>
          setActionDialog({ ...actionDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'suspend'
                ? 'Suspend Seller'
                : actionDialog.action === 'ban'
                ? 'Ban Seller'
                : 'Reactivate Seller'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'suspend'
                ? `Are you sure you want to suspend ${actionDialog.sellerName}? They will not be able to access their seller account or create new listings.`
                : actionDialog.action === 'ban'
                ? `Are you sure you want to ban ${actionDialog.sellerName}? This action is permanent and they will not be able to access their account.`
                : `Are you sure you want to reactivate ${actionDialog.sellerName}? They will regain access to their seller account.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                actionDialog.action &&
                handleAction(actionDialog.sellerId, actionDialog.action)
              }
              className={
                actionDialog.action === 'ban'
                  ? 'bg-red-600 hover:bg-red-700'
                  : actionDialog.action === 'suspend'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : ''
              }
            >
              {actionDialog.action === 'suspend'
                ? 'Suspend'
                : actionDialog.action === 'ban'
                ? 'Ban'
                : 'Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
