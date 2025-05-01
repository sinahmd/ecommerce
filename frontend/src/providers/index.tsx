"use client";

import { CartProvider } from "./CartProvider";
import { AuthProvider } from "./AuthProvider";
import { QueryProvider } from "./QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  );
} 