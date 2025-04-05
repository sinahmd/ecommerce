'use client';

import { useEffect, useState, useRef } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { fetchWithPolling, DEFAULT_POLLING_INTERVAL } from '@/utils/adminPolling';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  averageOrderValue: number;
}

// Mock data for when the API isn't available
const MOCK_STATS: DashboardStats = {
  totalRevenue: 12560,
  totalOrders: 158,
  totalUsers: 245,
  averageOrderValue: 79.5
};

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = async () => {
    try {
      const result = await fetchWithPolling<DashboardStats | Record<string, unknown>>(
        'admin-dashboard-stats',
        async () => {
          try {
            const response = await fetch('/api/admin/dashboard/stats');
            if (!response.ok) {
              throw new Error(`Failed to fetch stats: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!data || typeof data !== 'object' || 
                !('totalRevenue' in data) || !('totalOrders' in data) ||
                !('totalUsers' in data) || !('averageOrderValue' in data)) {
              console.error('API returned invalid stats data:', data);
              return MOCK_STATS;
            }
            
            return data as DashboardStats;
          } catch (error) {
            console.warn('Using mock stats data due to API error', error);
            return MOCK_STATS;
          }
        }
      );
      
      if (result) {
        // Validate stats object
        if (typeof result === 'object' && 
            'totalRevenue' in result && 
            'totalOrders' in result && 
            'totalUsers' in result && 
            'averageOrderValue' in result) {
          setStats(result as DashboardStats);
          setError(null);
        } else {
          console.error('Result does not have required stats properties:', result);
          setStats(MOCK_STATS);
          setError('API returned unexpected data format');
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard stats');
      // Use mock data as fallback
      setStats(MOCK_STATS);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(fetchStats, DEFAULT_POLLING_INTERVAL);
    
    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Generate stats list for rendering
  const statsList = [
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
    },
    {
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
    },
    {
      name: 'Average Order Value',
      value: `$${stats.averageOrderValue.toLocaleString()}`,
      icon: ChartBarIcon,
    },
  ];

  // Show loading UI
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {error && (
        <div className="col-span-full mb-2">
          <p className="text-sm text-amber-600">
            Using sample data due to API error
          </p>
        </div>
      )}
      
      {statsList.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
        >
          <dt>
            <div className="absolute rounded-md bg-indigo-500 p-3">
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
}
