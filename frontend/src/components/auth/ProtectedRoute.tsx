"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // For admin routes, check if user is admin
      if (requireAdmin && user?.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, router, user, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For admin routes, don't render if not admin
  if (requireAdmin && (!isAuthenticated || user?.role !== 'admin')) {
    return null;
  }

  // For regular protected routes, don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 