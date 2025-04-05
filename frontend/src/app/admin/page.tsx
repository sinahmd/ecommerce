"use client";


import dynamic from 'next/dynamic';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Load components dynamically to prevent excessive calls during development hot reload
const DashboardStats = dynamic(() => import('@components/admin/DashboardStats'), {
  ssr: false,
  loading: () => <div className="bg-white p-6 rounded-lg shadow h-48 animate-pulse" />
});

const SalesChart = dynamic(() => import('@components/admin/SalesChart'), {
  ssr: false,
  loading: () => <div className="bg-white p-6 rounded-lg shadow h-80 animate-pulse" />
});

const TopProducts = dynamic(() => import('@components/admin/TopProducts'), {
  ssr: false,
  loading: () => <div className="bg-white p-6 rounded-lg shadow h-80 animate-pulse" />
});

const RecentOrders = dynamic(() => import('@components/admin/RecentOrders'), {
  ssr: false,
  loading: () => <div className="bg-white p-6 rounded-lg shadow h-96 animate-pulse" />
});

export default function AdminDashboard() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (user?.role === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
  //   <div className="space-y-6">
  //     <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      
  //     <DashboardStats />

  //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //       <div className="bg-white p-6 rounded-lg shadow">
  //         <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
  //         <SalesChart />
  //       </div>

  //       <div className="bg-white p-6 rounded-lg shadow">
  //         <h2 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h2>
  //         <TopProducts />
  //       </div>
  //     </div>

  //     <div className="bg-white p-6 rounded-lg shadow">
  //       <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
  //       <RecentOrders />
  //     </div>
  //   </div>
  // );

    <ProtectedRoute requireAdmin>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
            <SalesChart />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h2>
            <TopProducts />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
          <RecentOrders />
        </div>
      </div>
    </ProtectedRoute>
  );
} 
