'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">The page you're looking for doesn't exist.</p>
      
      {/* Debug information */}
      <div className="mb-8 p-4 bg-muted rounded-lg w-full max-w-md text-left">
        <h2 className="font-semibold mb-2">Debug Information:</h2>
        <p className="mb-2"><strong>Current Path:</strong> {pathname}</p>
        <p className="mb-2"><strong>Running on Client:</strong> {isClient ? 'Yes' : 'No'}</p>
        <p className="mb-2"><strong>Next.js Version:</strong> 14.x</p>
      </div>
      
      <div className="space-x-4">
        <Button asChild>
          <Link href="/home">Go to Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Try Root Page</Link>
        </Button>
      </div>
    </div>
  );
} 