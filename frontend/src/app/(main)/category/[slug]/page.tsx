"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { ProductList } from '@/components/product/ProductList';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { categories, isLoading } = useCategories();
  const category = categories?.find(cat => cat.slug === params.slug);

  return (
    <div className="container py-12">
      <div className="mb-6">
        <Link 
          href="/products" 
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to all products
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{category?.name || 'Category'}</h1>
              <p className="text-muted-foreground">
                {category?.description || 'Browse products in this category'}
              </p>
            </>
          )}
        </div>

        <ProductList categorySlug={params.slug} />
      </div>
    </div>
  );
} 