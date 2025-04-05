'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, Transaction } from '@/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import api, { endpoints } from '@/lib/api';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch order details
    const fetchOrderDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`${endpoints.user.orderDetail(Number(id))}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Could not fetch order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && id) {
      fetchOrderDetails();
    }
  }, [id, isAuthenticated, authLoading, router]);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Return to previous page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sorry, we couldn not find this order.</p>
            <Button className="mt-4" onClick={() => router.push('/profile')}>
              View all orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Order Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className={getStatusBadgeColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium mb-3">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-center">
                        <div className="font-medium">{item.quantity}x</div>
                        <div className="ml-2">{item.product?.name || 'Product'}</div>
                      </div>
                      <div className="text-right">
                        <div>${item.price.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between items-center font-medium">
                  <span>Subtotal</span>
                  <span>${(order.total_price - (order.shipping_cost || 0)).toFixed(2)}</span>
                </div>

                {order.shipping_cost > 0 && (
                  <div className="mt-2 flex justify-between items-center">
                    <span>Shipping</span>
                    <span>${order.shipping_cost.toFixed(2)}</span>
                  </div>
                )}

                <div className="mt-2 flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${order.total_price.toFixed(2)}</span>
                </div>
              </div>

              {/* Transaction Information */}
              {order.transactions && order.transactions.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                  {order.transactions.map((transaction: Transaction) => (
                    <Card key={transaction.id} className="mb-4 bg-slate-50">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Transaction ID</p>
                            <p className="font-medium">{transaction.ref_id || transaction.authority}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
                              {transaction.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p>{new Date(transaction.created_at).toLocaleString()}</p>
                          </div>
                          {transaction.card_pan && (
                            <div>
                              <p className="text-sm text-muted-foreground">Card</p>
                              <p>{transaction.card_pan}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Shipping Information */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-3">Shipping Information</h3>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Recipient</p>
                    <p className="font-medium">{order.first_name} {order.last_name}</p>
                    <p>{order.email}</p>
                    {order.phone && <p>{order.phone}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p>{order.address}</p>
                  </div>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 