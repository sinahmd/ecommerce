"use client";

import { useRouter } from 'next/navigation';
import { useCartContext } from '@/providers/CartProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getFullImageUrl } from '@/lib/utils';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity } = useCartContext();
  const { user } = useAuthContext();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem?.(productId);
    } else {
      updateQuantity?.(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "نیاز به احراز هویت",
        description: "لطفا برای ادامه وارد حساب کاربری خود شوید.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  const subtotal = cart?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const shipping = 10; // Fixed shipping cost for demo
  const total = subtotal + shipping;

  if (!cart?.length) {
    return (
      <div className="container py-12" dir="rtl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">سبد خرید شما خالی است</h1>
          <p className="text-muted-foreground mb-8">
          برخی از محصولات را به سبد خرید خود اضافه کنید تا آنها را اینجا ببینید.
          </p>
          <Button onClick={() => router.push('/products')}>
          به خرید ادامه دهید
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">سبد خرید</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-4 border rounded-lg"
            >
              <div className="relative h-24 w-24 ml-4">
                {item.images && item.images[0] && (
                  <Image
                    src={getFullImageUrl(item.images[0])}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.price.toLocaleString()} تومان
                </p>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="ml-2"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="mr-2"
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem?.(item.id)}
                    className="text-red-500 hover:text-red-600 mr-2"
                  >
                    حذف
                  </Button>
                </div>
              </div>
              <div className="font-medium">
                {(item.price * item.quantity).toLocaleString()} تومان
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="text-xl font-semibold">خلاصه سفارش</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>جمع فرعی</span>
                <span>{subtotal.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between">
                <span>ارسال</span>
                <span>{shipping.toLocaleString()} تومان</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>مجموع</span>
                  <span>{total.toLocaleString()} تومان</span>
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleCheckout}
            >
              ادامه پرداخت
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}