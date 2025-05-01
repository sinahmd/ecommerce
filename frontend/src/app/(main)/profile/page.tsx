"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { UserCircle, Package, LogOut, Home, Lock, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import api, { endpoints } from '@/lib/api';
import { AxiosError } from 'axios';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { useOrders } from '@/hooks/useOrders';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { addresses, isLoading: addressesLoading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const { orders, isLoading: ordersLoading } = useOrders();
  const router = useRouter();

  // Profile state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone: '',
  });

  // Address dialog state
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    address_type: 'shipping' as 'shipping' | 'billing',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'USA',
    is_default: false
  });

  // Security state
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddressUpdating, setIsAddressUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_offers: true,
    order_updates: true,
    newsletter: false
  });

  // Set form values when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const resetAddressForm = () => {
    setAddressForm({
      address_type: 'shipping' as 'shipping' | 'billing',
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: 'USA',
      is_default: false
    });
    setCurrentAddress(null);
  };

  const openAddressDialog = (address?: Address) => {
    if (address) {
      setCurrentAddress(address);
      setAddressForm({
        address_type: address.address_type,
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        country: address.country,
        is_default: address.is_default
      });
    } else {
      resetAddressForm();
    }
    setAddressDialogOpen(true);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Make the API call to update the profile
      await api.put(endpoints.user.profile, {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone
      });

      // Update email if changed
      if (user?.email !== profileForm.email) {
        // This would typically require a separate API call and email verification
        console.log('Email change requested:', profileForm.email);
        // In a real app, you might implement this as:
        // await api.post(endpoints.user.emailChange, { email: profileForm.email });
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      let errorMessage = "Failed to update profile. Please try again.";

      if (axiosError.response?.data?.detail) {
        errorMessage = axiosError.response.data.detail;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddressSave = async () => {
    setIsAddressUpdating(true);

    try {
      if (currentAddress) {
        // Update existing address
        await updateAddress(currentAddress.id, addressForm);
        toast({
          title: "Success",
          description: "Address updated successfully.",
        });
      } else {
        // Create new address
        await addAddress(addressForm);
        toast({
          title: "Success",
          description: "New address added successfully.",
        });
      }
      setAddressDialogOpen(false);
      resetAddressForm();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddressUpdating(false);
    }
  };

  const handleAddressDelete = async (addressId: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(addressId);
        toast({
          title: "موفق",
          description: "آدرس با موفقیت حذف شد",
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast({
          title: "خطا",
          description: "متاسفانه خطایی رخ داده است",
          variant: "destructive",
        });
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      await setDefaultAddress(addressId);
      toast({
        title: "موفق",
        description: "آدرس پیش فرض با موفقیت تنظیم شد",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        title: "خطا",
        description: "متاسفانه خطایی رخ داده است",
        variant: "destructive",
      });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (securityForm.new_password !== securityForm.confirm_password) {
      toast({
        title: "خطا",
        description: "رمز عبور های جدید مطابقت ندارند",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordUpdating(true);

    try {
      await api.put(endpoints.user.password, {
        current_password: securityForm.current_password,
        new_password: securityForm.new_password
      });

      setSecurityForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      toast({
        title: "موفق",
        description: "رمز عبور با موفقیت تنظیم شد",
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      let errorMessage = "متاسفانه خطایی رخ داده است";

      if (axiosError.response?.data?.detail) {
        errorMessage = axiosError.response.data.detail;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    // In a real app, you would save these preferences to the API
    toast({
      title: "موفق",
      description: "تنظیمات اطلاع‌رسانی با موفقیت تنظیم شد",
    });
  };

  // If auth is loading, show a loading state
  if (authLoading) {
    return (
      <div className="container flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    <div className="container my-8">
      <h1 className="text-3xl font-bold mb-8">حساب کاربری من</h1>

      <Tabs defaultValue="personal" className="space-y-4" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center">
            اطلاعات شخصی
            <UserCircle className="mr-2 h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center">
            آدرس‌ها
            <Home className="mr-2 h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            امنیت
            <Lock className="mr-2 h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="flex items-center"
            onClick={() => router.push('/account/orders')}
          >
            سفارش‌ها
            <Package className="mr-2 h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات شخصی</CardTitle>
              <CardDescription>اطلاعات شخصی خود را به‌روز کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">نام</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">نام خانوادگی</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="email">آدرس ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">آدرس ایمیل به دلایل امنیتی قابل تغییر مستقیم نیست.</p>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="username">نام کاربری</Label>
                  <Input
                    id="username"
                    value={profileForm.username}
                    disabled
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="phone">شماره تلفن</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </form>
            </CardContent>

            <CardHeader>
              <CardTitle>تنظیمات اطلاع‌رسانی</CardTitle>
              <CardDescription>نحوه ارتباط ما با شما را مدیریت کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_offers" className="font-normal">ایمیل‌های بازاریابی</Label>
                  <p className="text-sm text-muted-foreground">دریافت ایمیل درباره محصولات جدید و حراج‌ها</p>
                </div>
                <Switch
                  id="email_offers"
                  checked={notifications.email_offers}
                  onCheckedChange={() => handleNotificationChange('email_offers')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="order_updates" className="font-normal">به‌روزرسانی سفارش</Label>
                  <p className="text-sm text-muted-foreground">دریافت اطلاعیه‌های ایمیل درباره سفارش‌های شما</p>
                </div>
                <Switch
                  id="order_updates"
                  checked={notifications.order_updates}
                  onCheckedChange={() => handleNotificationChange('order_updates')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newsletter" className="font-normal">خبرنامه</Label>
                  <p className="text-sm text-muted-foreground">دریافت خبرنامه هفتگی ما با اخبار صنعت</p>
                </div>
                <Switch
                  id="newsletter"
                  checked={notifications.newsletter}
                  onCheckedChange={() => handleNotificationChange('newsletter')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>آدرس‌های من</CardTitle>
                <CardDescription>آدرس‌های ارسال و صورتحساب خود را مدیریت کنید.</CardDescription>
              </div>
              <Button onClick={() => openAddressDialog()} className="flex items-center">
                <Plus className="ml-2 h-4 w-4" />
                افزودن آدرس جدید
              </Button>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  شما هنوز هیچ آدرسی اضافه نکرده‌اید.
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{address.address_type === 'shipping' ? 'آدرس ارسال' : 'آدرس صورتحساب'}</h3>
                            {address.is_default && <Badge variant="outline" className="bg-primary/10">پیش‌فرض</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.street}، {address.city}، {address.state} {address.zipcode}، {address.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAddressDialog(address)}>ویرایش</Button>
                          {!address.is_default && (
                            <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(address.id)}>تنظیم به عنوان پیش‌فرض</Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleAddressDelete(address.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentAddress ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}</DialogTitle>
                <DialogDescription>
                  {currentAddress ? 'جزئیات آدرس خود را در زیر به‌روز کنید.' : 'جزئیات آدرس خود را در زیر وارد کنید.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="address_type">نوع آدرس</Label>
                  <Select
                    value={addressForm.address_type}
                    onValueChange={(value: 'shipping' | 'billing') => setAddressForm({ ...addressForm, address_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="نوع آدرس را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipping">آدرس ارسال</SelectItem>
                      <SelectItem value="billing">آدرس صورتحساب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">آدرس خیابان</Label>
                  <Textarea
                    id="street"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">شهر</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">استان</Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">کد پستی</Label>
                    <Input
                      id="zipcode"
                      value={addressForm.zipcode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipcode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">کشور</Label>
                    <Input
                      id="country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is_default" className="font-normal mr-2">تنظیم به عنوان آدرس پیش‌فرض برای {addressForm.address_type === 'shipping' ? 'ارسال' : 'صورتحساب'}</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
                  انصراف
                </Button>
                <Button onClick={handleAddressSave} disabled={isAddressUpdating}>
                  {isAddressUpdating ? 'در حال ذخیره...' : 'ذخیره آدرس'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>تغییر رمز عبور</CardTitle>
              <CardDescription>رمز عبور خود را برای حفظ امنیت حساب به‌روز کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">رمز عبور فعلی</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={securityForm.current_password}
                    onChange={(e) => setSecurityForm({ ...securityForm, current_password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">رمز عبور جدید</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={securityForm.new_password}
                    onChange={(e) => setSecurityForm({ ...securityForm, new_password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">تایید رمز عبور جدید</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={securityForm.confirm_password}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirm_password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={isPasswordUpdating}>
                  {isPasswordUpdating ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی رمز عبور'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>تاریخچه سفارش‌ها</CardTitle>
              <CardDescription>سفارش‌های قبلی خود و وضعیت آن‌ها را مشاهده کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : orders?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  شما هنوز سفارشی ثبت نکرده‌اید.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders?.map((order) => (
                    <div key={order.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">سفارش #{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            ثبت شده در {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={getStatusBadgeColor(order.status)}
                        >
                          {getStatusDescription(order.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id || `item-${Math.random()}`} className="flex justify-between items-center py-2 border-b last:border-0">
                            <div className="flex items-center">
                              <span className="font-medium">{item.quantity || 1}x</span>
                              <span className="mr-2">
                                {item.product?.name || 'محصول'}
                              </span>
                            </div>
                            <span>{typeof item.price === 'number' ? item.price.toFixed(2) : item.price} تومان</span>
                          </div>
                        ))}
                      </div>

                      {/* Payment Transactions */}
                      {order.transactions && order.transactions.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">اطلاعات پرداخت</h4>
                          {order.transactions.map((transaction) => (
                            <div key={transaction.id || `trans-${Math.random()}`} className="text-sm">
                              <div className="flex justify-between">
                                <span>شناسه تراکنش:</span>
                                <span>{transaction.ref_id || (transaction.authority ? transaction.authority.slice(0, 10) + '...' : 'نامشخص')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>وضعیت:</span>
                                <span className={transaction.status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                                  {transaction.status === 'paid' ? 'پرداخت شده' : (transaction.status === 'pending' ? 'در انتظار پرداخت' : 'نامشخص')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>تاریخ:</span>
                                <span>{transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'نامشخص'}</span>
                              </div>
                              {transaction.card_pan && (
                                <div className="flex justify-between">
                                  <span>کارت:</span>
                                  <span>{transaction.card_pan}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t flex justify-between">
                        <span>جمع کل</span>
                        <span className="font-medium">{typeof order.total_price === 'number' ? order.total_price.toFixed(2) : order.total_price || '0.00'} تومان</span>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/account/orders/${order.id}`)}
                        >
                          مشاهده جزئیات کامل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={handleLogout} className="flex items-center mx-auto">
          <LogOut className="ml-2 h-4 w-4" />
          خروج از حساب
        </Button>
      </div>
    </div>
  );
} 