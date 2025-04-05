'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchWithPolling, DEFAULT_POLLING_INTERVAL } from '@/utils/adminPolling';

interface SalesData {
  date: string;
  revenue: number;
}

// Mock data for when the API isn't available
const MOCK_SALES_DATA: SalesData[] = [
  { date: '2023-01-01', revenue: 1200 },
  { date: '2023-01-02', revenue: 1500 },
  { date: '2023-01-03', revenue: 1100 },
  { date: '2023-01-04', revenue: 1800 },
  { date: '2023-01-05', revenue: 2000 },
  { date: '2023-01-06', revenue: 1700 },
  { date: '2023-01-07', revenue: 1900 },
];

export default function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSalesData = async () => {
    try {
      const result = await fetchWithPolling<SalesData[] | Record<string, unknown>>(
        'admin-dashboard-sales-chart',
        async () => {
          try {
            const response = await fetch('/api/admin/dashboard/sales');
            if (!response.ok) {
              throw new Error(`Failed to fetch sales data: ${response.status}`);
            }
            const data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data)) {
              console.error('API returned non-array data:', data);
              return MOCK_SALES_DATA;
            }
            
            return data;
          } catch (error) {
            console.warn('Using mock sales data due to API error', error);
            return MOCK_SALES_DATA;
          }
        }
      );
      
      if (result) {
        // Ensure salesData is an array
        if (Array.isArray(result)) {
          setSalesData(result);
          setError(null);
        } else {
          console.error('Result is not an array:', result);
          setSalesData(MOCK_SALES_DATA);
          setError('API returned unexpected data format');
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to load sales data');
      // Use mock data as fallback
      setSalesData(MOCK_SALES_DATA);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSalesData();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(fetchSalesData, DEFAULT_POLLING_INTERVAL);
    
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
      <div className="animate-pulse h-60 w-full bg-gray-200 rounded"></div>
    );
  }

  // Handle error state with mock data visualization
  if (error && salesData.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Showing mock data as fallback</p>
      </div>
    );
  }

  // Ensure salesData is an array before using array methods
  const validSalesData = Array.isArray(salesData) ? salesData : MOCK_SALES_DATA;

  // Calculate chart dimensions
  const maxRevenue = Math.max(...validSalesData.map(data => data.revenue || 0));
  const chartHeight = 200;

  return (
    <div className="h-60">
      {error && (
        <p className="text-sm text-amber-600 mb-2">Using mock data due to API error</p>
      )}
      <div className="flex h-full items-end space-x-2">
        {validSalesData.map((data) => {
          const height = (data.revenue / maxRevenue) * chartHeight;
          const date = new Date(data.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          
          return (
            <div key={data.date} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${height}px` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                {date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 