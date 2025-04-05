'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface OrderDetails {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/checkout/orders/${orderId}/`);
        setOrderDetails(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Could not fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    // Clear cart if we successfully landed on the success page
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="text-center text-destructive">
                {error}
              </div>
            ) : orderDetails ? (
              <div className="space-y-3">
                <p className="text-center text-muted-foreground">
                  Your order has been successfully placed and will be on its way soon!
                </p>
                
                <div className="bg-muted p-4 rounded-md mt-6">
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Order Number:</span>
                    <span>{orderDetails.order_number}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(orderDetails.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Total Amount:</span>
                    <span>{orderDetails.total_amount} IRR</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Status:</span>
                    <span className="capitalize">{orderDetails.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Thank you for your purchase! Your order has been received.
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Link href="/account/orders" className="w-full">
              <Button className="w-full">View My Orders</Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-20 flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4">Loading order details...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
