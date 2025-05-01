'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

function FailedPageContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error') || 'پرداخت شما با خطا مواجه شد';

  return (
    <div className="container mx-auto py-10" dir="rtl">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl">خطا در پرداخت</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              متاسفیم، مشکلی در پردازش پرداخت شما رخ داده است.
            </p>
            
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mt-6">
              <p>{errorMessage}</p>
            </div>
            
            <p className="text-center text-sm mt-4">
              کارت شما شارژ نشده است. لطفاً دوباره تلاش کنید یا از روش پرداخت دیگری استفاده کنید.
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Link href="/checkout" className="w-full">
              <Button className="w-full">تلاش مجدد</Button>
            </Link>
            <Link href="/cart" className="w-full">
              <Button variant="outline" className="w-full">بازگشت به سبد خرید</Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button variant="ghost" className="w-full">ادامه خرید</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-20 flex flex-col items-center justify-center" dir="rtl">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4">در حال بارگیری...</p>
      </div>
    }>
      <FailedPageContent />
    </Suspense>
  );
}
