"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  detail?: string;
  password?: string[];
  email?: string[];
  username?: string[];
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(formData);
      if (success) {
        toast({
          title: "موفقیت",
          description: "حساب کاربری شما با موفقیت ایجاد شد.",
        });
        router.push('/');
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorMessage = err.response?.data?.password?.[0] || 
                          err.response?.data?.email?.[0] || 
                          err.response?.data?.username?.[0] || 
                          err.response?.data?.detail || 
                          "ایجاد حساب کاربری ناموفق بود. لطفا دوباره تلاش کنید.";
      
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center" dir="rtl">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            ایجاد حساب کاربری
          </h1>
          <p className="text-sm text-muted-foreground">
            برای ایجاد حساب کاربری، اطلاعات خود را وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">نام کاربری</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_name">نام</Label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">نام خانوادگی</Label>
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password2">تایید رمز عبور</Label>
            <Input
              id="password2"
              type="password"
              value={formData.password2}
              onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "در حال ایجاد حساب..." : "ایجاد حساب کاربری"}
          </Button>
        </form>

        <p className="px-8 text-center text-sm text-muted-foreground">
          قبلاً حساب کاربری داشته‌اید؟{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
} 