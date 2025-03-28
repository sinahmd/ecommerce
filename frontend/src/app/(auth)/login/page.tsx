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
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login...");
      const success = await login(formData.email, formData.password);
      console.log("Login success:", success);

      if (success) {
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        });

        // Get user from localStorage to check their role
        const userStr = localStorage.getItem("user");
        console.log("User from localStorage:", userStr);

        if (userStr) {
          const user = JSON.parse(userStr);
          console.log("Parsed user:", user);
          console.log("User role:", user.role);

          // Redirect admin users to admin dashboard, others to home
          if (user.role === "admin") {
            console.log("Redirecting to /admin...");
            router.push("/admin");
            // Force a hard navigation if router.push doesn't work
            window.location.href = "/admin";
          } else {
            console.log("Redirecting to /...");
            router.push("/");
            // Force a hard navigation if router.push doesn't work
            window.location.href = "/";
          }
        } else {
          console.log("No user in localStorage, redirecting to /...");
          router.push("/");
          window.location.href = "/";
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
      setIsLoading(false);
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
            Back to store
          </Link>
        </div>
        
        <div className="bg-background border rounded-lg shadow-sm p-6 md:p-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">
                Enter your credentials to sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 