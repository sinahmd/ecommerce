"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ProductCard } from './ProductCard';
import { useProducts, useCategoryProducts } from '@/hooks/useProducts';
import { useCartContext } from '@/providers/CartProvider';
import { Product as ProductType } from '@/types/product';
import { getFullImageUrl } from '@/lib/utils';
import { SearchBox } from '@/components/ui/search-box';
import { Pagination } from '@/components/ui/pagination';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ProductListProps {
  products?: ProductType[];
  limit?: number;
  categorySlug?: string;
}

export function ProductList({ products, limit, categorySlug }: ProductListProps) {
  // Get search params for filtering and pagination
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract search parameters
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || '8', 10);
  const sortBy = searchParams.get('sort_by') || 'relevance';
  
  // Prevent hydration issues
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side hydration issues
  useEffect(() => {
    setMounted(true);
    return () => {
      // This cleanup helps prevent memory leaks
      setMounted(false);
    };
  }, []);
  
  // Memoize query params to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    search,
    page,
    page_size: pageSize as 4 | 8 | 16 | 32,
    sortBy: sortBy as any
  }), [search, page, pageSize, sortBy]);
  
  // For specific category - only used when categorySlug is provided
  const {
    products: categoryProducts,
    isLoading: categoryLoading,
    error: categoryError,
    totalPages: categoryTotalPages,
    currentPage: categoryCurrPage,
    pageSize: categoryPageSize,
    totalItems: categoryTotalItems
  } = useCategoryProducts(categorySlug || '', {
    params: queryParams,
    skip: !mounted || !categorySlug || !!products
  });

  // For all products - only used when no category is specified
  const {
    products: allProducts,
    isLoading: productsLoading,
    error: productsError,
    totalPages,
    currentPage,
    pageSize: allPageSize,
    totalItems
  } = useProducts(queryParams, {
    skip: !mounted || !!categorySlug || !!products
  });

  // Calculate displayed products - memoize to prevent unnecessary re-renders
  const displayProducts = useMemo(() => {
    if (products) return products;
    if (categorySlug && categoryProducts) return categoryProducts;
    if (!categorySlug && allProducts) return allProducts;
    return [];
  }, [products, categorySlug, categoryProducts, allProducts]);

  const { addItem } = useCartContext();
  
  // Update search params - memoized to prevent recreation on every render
  const updateSearchParams = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    router.push(`${pathname}?${newParams.toString()}`);
  }, [searchParams, router, pathname]);

  const handleSearch = useCallback((query: string) => {
    updateSearchParams({ search: query, page: '1' });
  }, [updateSearchParams]);

  const handleSortChange = useCallback((value: string) => {
    updateSearchParams({ sort_by: value, page: '1' });
  }, [updateSearchParams]);

  // Determine loading and error state
  const isLoading = !mounted || (products ? false : categorySlug ? categoryLoading : productsLoading);
  const error = products ? null : categorySlug ? categoryError : productsError;

  // Determine pagination properties
  const paginationProps = useMemo(() => categorySlug ? {
    totalPages: categoryTotalPages || 1,
    currentPage: categoryCurrPage || 1,
    pageSize: categoryPageSize || 8,
    totalItems: categoryTotalItems || 0
  } : {
    totalPages: totalPages || 1,
    currentPage: currentPage || 1,
    pageSize: allPageSize || 8,
    totalItems: totalItems || 0
  }, [
    categorySlug, 
    categoryTotalPages, categoryCurrPage, categoryPageSize, categoryTotalItems,
    totalPages, currentPage, allPageSize, totalItems
  ]);

  const handleAddToCart = useCallback((productId: number) => {
    try {
      const product = displayProducts.find(p => p.id === productId);
      if (product) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          slug: product.slug,
          images: [getFullImageUrl(product.image)]
        });
      }
    } catch (error) {
      console.error('Failed to add product to cart', error);
    }
  }, [displayProducts, addItem]);

  if (!mounted) {
    // Server render or initial client render
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="border rounded-lg p-4 h-[300px] animate-pulse">
              <div className="h-36 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  console.log("Pagination data:", {
    totalPages: paginationProps.totalPages,
    currentPage: paginationProps.currentPage,
    products: displayProducts.length
  });

  return (
    <div className="space-y-8">
      {/* Search and sort controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <SearchBox
          key={`search-${search}-${categorySlug || "all"}`}
          placeholder="Search products..."
          className="w-full sm:w-80"
          defaultValue={search}
          onSearch={handleSearch}
        />
        
        {mounted && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              key={`sort-${sortBy}-${categorySlug || "all"}`}
              value={sortBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="border rounded-lg p-4 h-[300px] animate-pulse">
              <div className="h-36 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error loading products. Please try again later.</p>
          <pre className="text-xs text-left bg-gray-100 p-4 rounded max-w-2xl mx-auto overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-4">No products found matching your criteria.</p>
          <button 
            className="text-blue-600 hover:underline"
            onClick={() => {
              // Clear search and filters
              const params = new URLSearchParams(searchParams.toString());
              params.delete('search');
              params.set('page', '1');
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              // Get category info with fallbacks for different data structures
              const categoryName = product.primary_category?.name || 
                                  (product.category_names && product.category_names[0]) || 
                                  (product.category?.name) || 
                                  '';
              
              const categorySlug = product.primary_category?.slug || 
                                  (product.category_slugs && product.category_slugs[0]) || 
                                  (product.category?.slug) || 
                                  '';
              
              return (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: getFullImageUrl(product.image),
                    category: categoryName,
                    categorySlug: categorySlug,
                    stock: product.stock
                  }}
                  onAddToCart={() => handleAddToCart(product.id)}
                />
              );
            })}
          </div>
          
          {/* Pagination */}
          {displayProducts.length > 0 && (
            <div className="mt-12">
              <Pagination 
                totalPages={paginationProps.totalPages}
                currentPage={paginationProps.currentPage}
                pageSize={paginationProps.pageSize}
                totalItems={paginationProps.totalItems}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 