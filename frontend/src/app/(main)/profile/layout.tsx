"use client";

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if we have finished loading and user is not authenticated
    if (!isLoading) {
      if (user) {
        setAuthorized(true);
      } else if (!redirected) {
        // Only redirect once to prevent loops
        setRedirected(true);
        console.log("User not authenticated for profile, redirecting to login");
        
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
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  );
}
 