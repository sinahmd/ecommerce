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
  total_amount?: number;
  total_price?: number;
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
      setError('شناسه سفارش یافت نشد');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/checkout/orders/${orderId}/`);
        setOrderDetails(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('خطا در دریافت اطلاعات سفارش');
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
    <div className="container mx-auto py-10" dir="rtl">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">پرداخت موفقیت‌آمیز!</CardTitle>
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
                  سفارش شما با موفقیت ثبت شد و به زودی ارسال خواهد شد!
                </p>
                
                <div className="bg-muted p-4 rounded-md mt-6">
                  <div className="flex justify-between py-1">
                    <span className="font-medium">شماره سفارش:</span>
                    <span>{orderDetails.order_number}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">تاریخ:</span>
                    <span>{new Date(orderDetails.created_at).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">مبلغ کل:</span>
                    <span>{orderDetails.total_amount ? orderDetails.total_amount.toLocaleString() : 
                           orderDetails.total_price ? orderDetails.total_price.toLocaleString() : '0'} تومان</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">وضعیت:</span>
                    <span>{orderDetails.status === 'pending' ? 'در انتظار پرداخت' : 
                           orderDetails.status === 'processing' ? 'در حال پردازش' :
                           orderDetails.status === 'shipped' ? 'ارسال شده' :
                           orderDetails.status === 'delivered' ? 'تحویل داده شده' :
                           orderDetails.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                با تشکر از خرید شما! سفارش شما دریافت شد.
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Link href="/account/orders" className="w-full">
              <Button className="w-full">مشاهده سفارش‌های من</Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button variant="outline" className="w-full">ادامه خرید</Button>
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
      <div className="container mx-auto py-20 flex flex-col items-center justify-center" dir="rtl">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4">در حال بارگیری اطلاعات سفارش...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
