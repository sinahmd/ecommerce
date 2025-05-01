'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag } from 'lucide-react';
import api, { endpoints } from '@/lib/api';
import { useCartContext } from '@/providers/CartProvider';

interface CartItem {
  id: number;
  quantity: number;
  total_price: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  }
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart } = useCartContext();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const cartItems: CartItem[] = cart.map(item => ({
    id: item.id,
    quantity: item.quantity,
    total_price: item.price * item.quantity,
    product: {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.images?.[0],
    }
  }));

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: 'سبد خرید خالی',
        description: 'سبد خرید شما خالی است. لطفا محصولاتی را به سبد خرید خود اضافه کنید.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format order items for the API
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));
      
      // Create the order using the endpoint from our API client
      const response = await api.post(endpoints.checkout.createOrder, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        items: orderItems
      });

      // Initiate ZarinPal payment using the endpoint from our API client
      const paymentResponse = await api.post(
        endpoints.checkout.payment(response.data.order_id)
      );
      
      if (paymentResponse.data.payment_url) {
        // Redirect to ZarinPal payment page
        window.location.href = paymentResponse.data.payment_url;
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      toast({
        title: 'خطا در تکمیل خرید',
        description: 'خطایی در فرآیند تکمیل خرید رخ داده است',
        variant: 'destructive',
      });
      
      router.push('/checkout/failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">تکمیل خرید</h1>
      
      {cartItems.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">سبد خرید شما خالی است</p>
            <Button onClick={() => router.push('/products')}>
              مشاهده محصولات
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>اطلاعات ارسال</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">نام</Label>
                      <Input 
                        id="firstName" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">نام خانوادگی</Label>
                      <Input 
                        id="lastName" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره تماس</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">آدرس</Label>
                    <Input 
                      id="address" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'در حال پردازش...' : `پرداخت ${getTotalPrice().toLocaleString()} تومان`}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>خلاصه سفارش</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">تعداد: {item.quantity}</p>
                    </div>
                    <p>{item.total_price.toLocaleString()} تومان</p>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>جمع فرعی</span>
                    <span>{getTotalPrice().toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>هزینه ارسال</span>
                    <span>رایگان</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4">
                    <span>مجموع</span>
                    <span>{getTotalPrice().toLocaleString()} تومان</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
