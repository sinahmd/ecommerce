import { useApi } from "./useApi";
import { endpoints } from "@/lib/api";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { UseApiOptions } from "./useApi";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface UseProductsParams {
  search?: string;
  sortBy?: "relevance" | "price_low_high" | "price_high_low" | "newest";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
  currentPage: number;
}

// Define interface for API responses
interface ProductListResponse {
  products?: Product[];
  total_pages?: number;
  current_page?: number;
}

interface CategoryProductsResponse {
  category?: Category;
  products?: Product[];
}

export function useProducts(
  params: UseProductsParams = {},
  options: UseApiOptions = {}
): UseProductsResult {
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  // Prepare query parameters
  const queryParams: Record<string, string> = {};
  if (params.search) queryParams.search = params.search;
  if (params.sortBy) queryParams.sort_by = params.sortBy;
  if (params.minPrice) queryParams.min_price = params.minPrice.toString();
  if (params.maxPrice) queryParams.max_price = params.maxPrice.toString();
  if (params.page) queryParams.page = params.page.toString();
  if (params.limit) queryParams.limit = params.limit.toString();

  // Use the useApi hook with proper type
  const { data, isLoading, error } = useApi<ProductListResponse | Product[]>(
    endpoints.products.list().url,
    {
      immediate: true,
      ...options
    }
  );

  // Add debug logging
  useEffect(() => {
    if (data) {
      console.log("useProducts API response:", data);
    }
  }, [data]);

  // Extract and normalize products from the response data
  const products = Array.isArray(data) ? data : data?.products || [];

  // Update pagination information when data changes
  useEffect(() => {
    if (data && !Array.isArray(data)) {
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.current_page || 1);
    }
  }, [data]);

  return {
    products,
    isLoading,
    error: error as Error | null,
    totalPages,
    currentPage
  };
}

export function useProduct(id: number, options = {}) {
  const { data, isLoading, error, fetchData } = useApi<Product>(
    endpoints.products.detail(id).url,
    options
  );

  return {
    product: data,
    isLoading,
    error,
    fetchProduct: fetchData
  };
}

export function useCategories(options = {}) {
  const { data, isLoading, error, fetchData } = useApi<Category[]>(
    endpoints.products.categories.url,
    options
  );

  return {
    categories: data || [],
    isLoading,
    error,
    fetchCategories: fetchData
  };
}

export function useCategoryProducts(slug: string, options = {}) {
  // Use a default list endpoint if no slug is provided
  const apiUrl = slug
    ? endpoints.products.category(slug).url
    : endpoints.products.list().url;

  const { data, isLoading, error, fetchData } = useApi<
    CategoryProductsResponse | Product[] | Product
  >(apiUrl, {
    ...options,
    // Don't skip the request even if slug is empty - it will fetch all products
    skip: false
  });

  // Add debug logging
  useEffect(() => {
    if (data) {
      console.log("useCategoryProducts API response for slug:", slug, data);
    }
  }, [data, slug]);

  // Extract and normalize products from the response data
  const products = Array.isArray(data)
    ? data
    : data && "products" in data && data.products
    ? data.products
    : data
    ? [data as Product]
    : [];

  return {
    products,
    isLoading,
    error,
    fetchCategoryProducts: fetchData
  };
}
