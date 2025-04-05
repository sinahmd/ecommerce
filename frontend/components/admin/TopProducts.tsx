'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { fetchWithPolling, DEFAULT_POLLING_INTERVAL, resetFetchTime } from '@/utils/adminPolling';

interface TopProduct {
  id: number;
  name: string;
  totalSales: number;
  quantity: number;
  image: string;
}

// Default placeholder image - using a data URL as ultimate fallback
// This is a simple gray square with a product icon
const DATA_URL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M16 12s-1.5-2-4-2-4 2-4 2'%3E%3C/path%3E%3Cline x1='12' y1='10' x2='12' y2='17'%3E%3C/line%3E%3C/svg%3E";



// Mock data for when the API isn't available
const MOCK_PRODUCTS: TopProduct[] = [
  { id: 1, name: 'Product 1', totalSales: 5240, quantity: 12, image: '' },
  { id: 2, name: 'Product 2', totalSales: 4320, quantity: 10, image: '' },
  { id: 3, name: 'Product 3', totalSales: 3280, quantity: 8, image: '' },
  { id: 4, name: 'Product 4', totalSales: 2820, quantity: 6, image: '' },
];

// API endpoint key for this component
const ENDPOINT_KEY = 'admin-dashboard-top-products';

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTopProducts = async (forceFetch = false) => {
    try {
      const result = await fetchWithPolling<TopProduct[] | Record<string, unknown>>(
        ENDPOINT_KEY,
        async () => {
          try {
            const response = await fetch('/api/admin/dashboard/top-products');
            if (!response.ok) {
              throw new Error(`Failed to fetch products: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data)) {
              console.error('API returned non-array data:', data);
              return MOCK_PRODUCTS;
            }
            
            return data;
          } catch (error) {
            console.warn('Using mock product data due to API error', error);
            return MOCK_PRODUCTS;
          }
        },
        DEFAULT_POLLING_INTERVAL, // standard polling interval
        forceFetch // allow forcing a fetch on demand
      );
      
      if (result) {
        // Ensure products is an array
        if (Array.isArray(result)) {
          // Ensure each product has a valid image URL
          const validatedProducts = result.map(product => ({
            ...product,
            image: product.image || DATA_URL_PLACEHOLDER
          }));
          setProducts(validatedProducts);
          setError(null);
        } else {
          console.error('Result is not an array:', result);
          setProducts(MOCK_PRODUCTS);
          setError('API returned unexpected data format');
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setError('Failed to load product data');
      // Use mock data as fallback
      setProducts(MOCK_PRODUCTS);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset the fetch time to force a fresh fetch when the component mounts
    resetFetchTime(ENDPOINT_KEY);
    
    // Initial fetch with force option
    fetchTopProducts(true);
    
    // Set up polling interval for subsequent fetches
    pollingIntervalRef.current = setInterval(() => fetchTopProducts(), DEFAULT_POLLING_INTERVAL);
    
    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-gray-500 text-center py-4">No product data available</p>;
  }

  return (
    <div className="flow-root">
      {error && (
        <p className="text-sm text-amber-600 mb-4">
          Using sample data due to API error
        </p>
      )}
      <ul role="list" className="-my-5 divide-y divide-gray-200">
        {products.map((product) => (
          <li key={product.id} className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Image
                  className="h-8 w-8 rounded-full object-cover"
                  src={product.image || DATA_URL_PLACEHOLDER}
                  alt={product.name}
                  width={32}
                  height={32}
                  unoptimized={product.image.startsWith('data:') || !product.image.startsWith('http')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DATA_URL_PLACEHOLDER;
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                <p className="truncate text-sm text-gray-500">
                  {product.quantity} units sold
                </p>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  ${product.totalSales.toLocaleString()}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 