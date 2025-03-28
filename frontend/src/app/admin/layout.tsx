"use client";

import AdminSidebar from '../../../components/admin/AdminSidebar';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      console.log("Checking auth in admin layout...");
      
      // Check if user is in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("User from localStorage:", user);
        
        if (user.role === "admin") {
          console.log("User is admin from localStorage");
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
      }
      
      // If not admin in localStorage, redirect
      console.log("User is not admin or not found in localStorage, redirecting...");
      window.location.href = "/login";
    }
    
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
} 