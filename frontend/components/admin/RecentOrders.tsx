'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchWithPolling, DEFAULT_POLLING_INTERVAL } from '@/utils/adminPolling';

interface Order {
  id: number;
  customerName: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Mock data for when the API isn't available
const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    customerName: 'John Doe',
    date: '2023-06-15T12:00:00Z',
    total: 125.99,
    status: 'completed'
  },
  {
    id: 1002,
    customerName: 'Jane Smith',
    date: '2023-06-16T10:30:00Z',
    total: 85.50,
    status: 'processing'
  },
  {
    id: 1003,
    customerName: 'Robert Johnson',
    date: '2023-06-16T15:45:00Z',
    total: 220.75,
    status: 'pending'
  },
  {
    id: 1004,
    customerName: 'Sarah Williams',
    date: '2023-06-14T09:15:00Z',
    total: 65.25,
    status: 'cancelled'
  }
];

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecentOrders = async () => {
    try {
      const result = await fetchWithPolling<Order[]>(
        'admin-dashboard-recent-orders',
        async () => {
          try {
            const response = await fetch('/api/admin/dashboard/recent-orders');
            if (!response.ok) {
              throw new Error(`Failed to fetch orders: ${response.status}`);
            }
            return await response.json();
          } catch (error) {
            console.warn('Using mock order data due to API error:', error);
            return MOCK_ORDERS;
          }
        }
      );
      
      if (result) {
        setOrders(result);
        setError(null);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setError('Failed to load order data');
      // Use mock data as fallback
      setOrders(MOCK_ORDERS);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchRecentOrders();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(fetchRecentOrders, DEFAULT_POLLING_INTERVAL);
    
    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <p className="text-sm text-amber-600 mb-4">
          Using sample data due to API error
        </p>
      )}
      
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent orders found</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${order.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} // End of RecentOrders component
