'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  // Client-side redirect
  const router = useRouter();
  
  useEffect(() => {
    // Using replace to prevent browser history stacking
    router.replace('/home');
  }, [router]);
  
  // Loading state while redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Redirecting to home page...</p>
    </div>
  );
}
