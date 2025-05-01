"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/providers/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Use the auth hook's login function which now uses HTTP-only cookies
      const success = await login(formData.email, formData.password);
      
      if (success) {
        toast({
          title: "موفق",
          description: "شما با موفقیت وارد شدید",
        });

        // Redirect based on user role
        if (user && user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      // Handle specific error cases
      if (axiosError.response?.status === 429) {
        toast({
          title: "Too Many Attempts",
          description: "Please wait a few minutes before trying again.",
          variant: "destructive",
        });
      } else if (axiosError.response?.status === 401) {
        toast({
          title: "Invalid Credentials",
          description: "Please check your email and password.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred during login. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-sm mb-6">
          <Link 
            href="/" 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
        
        <div className="bg-background border rounded-lg shadow-sm p-6 md:p-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">خوش آمدید</h1>
              <p className="text-muted-foreground">
              برای ورود به حساب کاربری خود اطلاعات کاربری خود را وارد کنید
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  ایمیل
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    رمزعبور
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    فراموشی رمزعبور؟
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isSubmitting}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "درحال ورود..." : "ورود"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              حساب کاربری ندارید؟{" "}
              <Link href="/register" className="text-primary hover:underline">
                ثبت نام
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
