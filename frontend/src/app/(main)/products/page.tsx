"use client";

import { useState } from 'react';
import { ProductList } from '@/components/product/ProductList';
import { useCategories } from '@/hooks/useProducts';

export default function ProductsPage() {
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar/Filter */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent ${
                    selectedCategory === null ? 'bg-accent text-accent-foreground' : ''
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Products
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.slug}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent ${
                      selectedCategory === category.slug
                        ? 'bg-accent text-accent-foreground'
                        : ''
                    }`}
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {selectedCategory
                ? categories?.find((c) => c.slug === selectedCategory)?.name || 'Products'
                : 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              Browse our latest collection of high-quality products.
            </p>
          </div>

          <ProductList categorySlug={selectedCategory || undefined} />
        </div>
      </div>
    </div>
  );
} 