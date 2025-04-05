"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasAttemptedRedirect) {
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        setHasAttemptedRedirect(true);
        router.push('/login');
        return;
      }

      // For admin routes, check if user is admin
      if (requireAdmin && user?.role !== 'admin') {
        console.log("User not admin, redirecting to home");
        setHasAttemptedRedirect(true);
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, router, user, requireAdmin, hasAttemptedRedirect]);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if authentication requirements not met
  if ((requireAdmin && (!isAuthenticated || user?.role !== 'admin')) || !isAuthenticated) {
    // Return a simple loading state instead of null
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User is authenticated and meets all requirements
  return <>{children}</>;

  // For regular protected routes, don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 