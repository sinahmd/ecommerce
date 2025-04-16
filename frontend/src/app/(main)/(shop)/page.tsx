"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main home page
    router.replace('/home');
  }, [router]);
  
  // This content will briefly show before redirect
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to home page</h1>
        <p className="text-muted-foreground">Please wait while we redirect you...</p>
      </div>
    </div>
  );
} 