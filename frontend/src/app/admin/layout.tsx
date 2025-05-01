"use client";

import AdminSidebar from '../../../components/admin/AdminSidebar';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if we have finished loading and user is not admin
    if (!isLoading) {
      if (user?.role === 'admin') {
        setAuthorized(true);
      } else if (!redirected) {
        // Only redirect once to prevent loops
        setRedirected(true);
        console.log("User not authorized for admin, redirecting to login");
        
        // Short delay to ensure redirect happens after state update
        setTimeout(() => {
          router.push('/login');
        }, 100);
      }
    }
  }, [user, isLoading, router, redirected]);

  // Show loading state while authentication is being checked
  if (isLoading || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
} 