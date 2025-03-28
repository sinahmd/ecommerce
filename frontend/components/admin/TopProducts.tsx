'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TopProduct {
  id: number;
  name: string;
  totalSales: number;
  quantity: number;
  image: string;
}

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/top-products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    fetchTopProducts();
  }, []);

  return (
    <div className="flow-root">
      <ul role="list" className="-my-5 divide-y divide-gray-200">
        {products.map((product) => (
          <li key={product.id} className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Image
                  className="h-8 w-8 rounded-full object-cover"
                  src={product.image}
                  alt={product.name}
                  width={32}
                  height={32}
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