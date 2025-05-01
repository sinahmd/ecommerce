"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders, Order } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Package, Truck, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getOrderDetails } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const orderId = parseInt(params.id, 10);
        if (isNaN(orderId)) {
          throw new Error('شناسه سفارش نامعتبر است');
        }
        
        const orderData = await getOrderDetails(orderId);
        if (!orderData) {
          throw new Error('اطلاعات سفارش یافت نشد');
        }
        
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'خطا در بارگیری اطلاعات سفارش');
        toast({
          title: "خطا",
          description: err instanceof Error ? err.message : 'خطا در بارگیری اطلاعات سفارش',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params.id, getOrderDetails]);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-600';
      case 'shipped': return 'bg-indigo-600';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusDescription = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'در انتظار پرداخت';
      case 'processing': return 'تایید پرداخت، در حال پردازش سفارش';
      case 'shipped': return 'ارسال شده';
      case 'delivered': return 'تحویل داده شده';
      case 'cancelled': return 'لغو شده';
      case 'failed': return 'پرداخت ناموفق';
      case 'refunded': return 'بازپرداخت شده';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const renderSkeletonLoader = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between py-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="container py-8" dir="rtl">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/account/orders')}
            className="ml-4"
          >
            <ChevronLeft className="h-4 w-4 ml-1" />
            بازگشت به سفارش‌ها
          </Button>
          <h1 className="text-2xl font-bold">جزئیات سفارش</h1>
        </div>

        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>جزئیات سفارش</CardTitle>
            </CardHeader>
            <CardContent>
              {renderSkeletonLoader()}
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">خطا در بارگیری اطلاعات</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={() => router.push('/account/orders')}>بازگشت به لیست سفارش‌ها</Button>
            </CardContent>
          </Card>
        ) : order ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gray-50 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="ml-2 h-5 w-5" />
                      سفارش #{order.id}
                    </CardTitle>
                    <p className="text-gray-500 text-sm mt-1">
                      ثبت شده در {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <Badge className={getStatusBadgeColor(order.status)}>
                    {getStatusDescription(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Calendar className="ml-1 h-4 w-4" />
                      خلاصه سفارش
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between py-1 border-b">
                        <span>تاریخ سفارش:</span>
                        <span>{new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                      </div>
                      {order.updated_at && (
                        <div className="flex justify-between py-1 border-b">
                          <span>آخرین بروزرسانی:</span>
                          <span>{new Date(order.updated_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b">
                        <span>وضعیت:</span>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {getStatusDescription(order.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>مجموع:</span>
                        <span className="font-bold">
                          {typeof order.total_price === 'number' 
                            ? order.total_price.toLocaleString() 
                            : order.total_price || '0'} تومان
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Truck className="ml-1 h-4 w-4" />
                      اطلاعات ارسال
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="py-1 border-b">
                        <span className="block font-medium">نام گیرنده:</span>
                        <span>{order.first_name} {order.last_name}</span>
                      </div>
                      {order.email && (
                        <div className="py-1 border-b">
                          <span className="block font-medium">ایمیل:</span>
                          <span>{order.email}</span>
                        </div>
                      )}
                      {order.phone && (
                        <div className="py-1 border-b">
                          <span className="block font-medium">تلفن:</span>
                          <span>{order.phone}</span>
                        </div>
                      )}
                      <div className="py-1">
                        <span className="block font-medium">آدرس:</span>
                        <span>{order.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">اقلام سفارش</h3>
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-100 py-2 px-4">
                      <div className="font-medium">محصول</div>
                      <div className="font-medium text-center">تعداد × قیمت واحد</div>
                      <div className="font-medium text-left">قیمت کل</div>
                    </div>
                    
                    {order.items?.map((item) => (
                      <div 
                        key={item.id || `item-${Math.random()}`} 
                        className="grid grid-cols-3 border-t py-3 px-4"
                      >
                        <div>
                          {item.product?.name || item.product_name || 'محصول'}
                        </div>
                        <div className="text-center">
                          {item.quantity || 1} × {typeof item.price === 'number' 
                            ? item.price.toLocaleString() 
                            : item.price} تومان
                        </div>
                        <div className="text-left font-medium">
                          {typeof item.total_price === 'number' 
                            ? item.total_price.toLocaleString() 
                            : (
                                typeof item.price === 'number' && item.quantity 
                                  ? (item.price * item.quantity).toLocaleString() 
                                  : item.price
                              )} تومان
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 border-t py-3 px-4 bg-gray-50">
                      <div className="col-span-2 text-left font-medium">هزینه ارسال:</div>
                      <div className="text-left font-medium">
                        {typeof order.shipping_cost === 'number' 
                          ? order.shipping_cost.toLocaleString() 
                          : order.shipping_cost || '0'} تومان
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 border-t py-3 px-4 bg-gray-50">
                      <div className="col-span-2 text-left font-medium">جمع کل:</div>
                      <div className="text-left font-bold">
                        {typeof order.total_price === 'number' 
                          ? order.total_price.toLocaleString() 
                          : order.total_price || '0'} تومان
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                {order.transactions && order.transactions.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CreditCard className="ml-1 h-4 w-4" />
                        اطلاعات پرداخت
                      </h3>
                      
                      <div className="space-y-4">
                        {order.transactions.map((transaction) => (
                          <div 
                            key={transaction.id || `trans-${Math.random()}`} 
                            className="border rounded-md p-4 bg-gray-50"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="block text-sm text-gray-500">شناسه تراکنش:</span>
                                <span className="font-medium font-mono">
                                  {transaction.ref_id || transaction.authority || 'نامشخص'}
                                </span>
                              </div>
                              
                              <div>
                                <span className="block text-sm text-gray-500">وضعیت:</span>
                                <span className={`font-medium ${
                                  transaction.status === 'paid' 
                                    ? 'text-green-600' 
                                    : 'text-amber-600'
                                }`}>
                                  {transaction.status === 'paid' 
                                    ? 'پرداخت شده' 
                                    : (transaction.status === 'pending' 
                                        ? 'در انتظار پرداخت' 
                                        : transaction.status)}
                                </span>
                              </div>
                              
                              <div>
                                <span className="block text-sm text-gray-500">مبلغ:</span>
                                <span className="font-medium">
                                  {typeof transaction.amount === 'number' 
                                    ? transaction.amount.toLocaleString() 
                                    : transaction.amount || '0'} تومان
                                </span>
                              </div>
                              
                              <div>
                                <span className="block text-sm text-gray-500">تاریخ:</span>
                                <span className="font-medium">
                                  {transaction.created_at 
                                    ? new Date(transaction.created_at).toLocaleString('fa-IR') 
                                    : 'نامشخص'}
                                </span>
                              </div>
                              
                              {transaction.card_pan && (
                                <div>
                                  <span className="block text-sm text-gray-500">شماره کارت:</span>
                                  <span className="font-medium font-mono">{transaction.card_pan}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="mt-8 text-center">
                  <Button onClick={() => router.push('/account/orders')}>
                    بازگشت به لیست سفارش‌ها
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">سفارش یافت نشد</h3>
              <p className="text-gray-500 mb-6">سفارش مورد نظر شما یافت نشد.</p>
              <Button onClick={() => router.push('/account/orders')}>بازگشت به لیست سفارش‌ها</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
} 