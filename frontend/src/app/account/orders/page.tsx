"use client";


import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Package, Home } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();
  const router = useRouter();

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

  return (
    <ProtectedRoute>
      <div className="container py-8" dir="rtl">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="ml-4"
          >
            <ChevronLeft className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="ml-4"
          >
            <Home className="h-4 w-4 ml-1" />
            صفحه اصلی
          </Button>
          <h1 className="text-2xl font-bold">سفارش‌های من</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">هیچ سفارشی وجود ندارد</h3>
              <p className="text-gray-500 mb-6">شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
              <Button onClick={() => router.push('/products')}>مشاهده محصولات</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders?.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">سفارش #{order.id}</CardTitle>
                      <CardDescription>
                        تاریخ سفارش: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadgeColor(order.status)}>
                      {getStatusDescription(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <div className="mb-4">
                    <div className="mb-4 border-b pb-2">
                      <h3 className="font-medium mb-1">اطلاعات ارسال</h3>
                      <p className="text-gray-500 text-sm">
                        {order.first_name} {order.last_name} - {order.phone || 'بدون شماره تلفن'}
                      </p>
                      <p className="text-gray-500 text-sm">{order.address}</p>
                    </div>
                  </div>

                  <div className="border-b mb-4 pb-2">
                    <h3 className="font-medium mb-2">اقلام سفارش</h3>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div 
                          key={item.id || `item-${Math.random()}`} 
                          className="flex justify-between py-2"
                        >
                          <div>
                            <span className="font-medium">{item.quantity || 1}x </span>
                            <span>{item.product?.name || item.product_name || 'محصول'}</span>
                          </div>
                          <span className="text-gray-700">
                            {typeof item.price === 'number' ? item.price.toLocaleString() : item.price} تومان
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.transactions && order.transactions.length > 0 && (
                    <div className="mb-4 border-b pb-2">
                      <h3 className="font-medium mb-2">اطلاعات پرداخت</h3>
                      {order.transactions.map((transaction) => (
                        <div key={transaction.id || `trans-${Math.random()}`} className="text-sm">
                          <div className="flex justify-between py-1">
                            <span>شناسه تراکنش:</span>
                            <span className="font-mono">
                              {transaction.ref_id || 
                                (transaction.authority ? 
                                  transaction.authority.slice(0, 10) + '...' : 'نامشخص')}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>وضعیت:</span>
                            <span className={transaction.status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                              {transaction.status === 'paid' ? 'پرداخت شده' : 
                               (transaction.status === 'pending' ? 'در انتظار پرداخت' : 'نامشخص')}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>تاریخ:</span>
                            <span>{transaction.created_at ? 
                              new Date(transaction.created_at).toLocaleDateString('fa-IR') : 'نامشخص'}</span>
                          </div>
                          {transaction.card_pan && (
                            <div className="flex justify-between py-1">
                              <span>کارت:</span>
                              <span className="font-mono">{transaction.card_pan}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold mt-3">
                    <span>مجموع:</span>
                    <span>
                      {typeof order.total_price === 'number' ? 
                        order.total_price.toLocaleString() : order.total_price || '0'} تومان
                    </span>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                      variant="outline"
                    >
                      مشاهده جزئیات کامل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 