import { Suspense } from 'react';
import DashboardStats from '@components/admin/DashboardStats';
import SalesChart from '@components/admin/SalesChart';
import TopProducts from '@components/admin/TopProducts';
import RecentOrders from '@components/admin/RecentOrders';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        
        <Suspense fallback={<div>Loading stats...</div>}>
          <DashboardStats />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div>Loading chart...</div>}>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
              <SalesChart />
            </div>
          </Suspense>

          <Suspense fallback={<div>Loading top products...</div>}>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h2>
              <TopProducts />
            </div>
          </Suspense>
        </div>

        <Suspense fallback={<div>Loading recent orders...</div>}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
            <RecentOrders />
          </div>
        </Suspense>
      </div>
    </ProtectedRoute>
  );
} 