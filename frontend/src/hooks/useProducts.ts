import { useApi } from "./useApi";
import { endpoints } from "@/lib/api";
import { useState, useEffect, useRef, useMemo } from "react";
import { Product } from "@/types/product";
import { UseApiOptions } from "./useApi";
import { AxiosRequestConfig, AxiosResponse } from "axios";

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
  page_size?: 4 | 8 | 16 | 32;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

// Extend the base result with category fetching capability
interface CategoryProductsResult extends UseProductsResult {
  fetchCategoryProducts: (
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<CategoryProductsResponse> | undefined>;
}

// Define interface for API responses
interface ProductListResponse {
  products: Product[];
  total_pages: number;
  current_page: number;
  total_items: number;
  page_size: number;
}

interface CategoryProductsResponse {
  category?: Category;
  products: Product[];
  total_pages: number;
  current_page: number;
  total_items: number;
  page_size: number;
}

export function useProducts(
  params: UseProductsParams = {},
  options: UseApiOptions = {}
): UseProductsResult {
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const [pageSize, setPageSize] = useState<number>(params.page_size || 8);
  const [totalItems, setTotalItems] = useState(0);

  // Convert params to API query parameters
  const queryParams: Record<string, string | number | undefined> = {
    search: params.search,
    sort_by: params.sortBy,
    min_price: params.minPrice,
    max_price: params.maxPrice,
    page: params.page,
    page_size: params.page_size
  };

  // Filter out undefined values
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(([, v]) => v !== undefined)
  );

  // Use the useApi hook with proper type
  const { data, isLoading, error, fetchData } = useApi<ProductListResponse>(
    endpoints.products.list().url,
    {
      immediate: false,
      ...options
    }
  );

  // Fetch data when component mounts or params change
  useEffect(() => {
    if (!options.skip) {
      fetchData({ params: filteredParams });
    }
  }, [
    fetchData,
    params.search,
    params.sortBy,
    params.minPrice,
    params.maxPrice,
    params.page,
    params.page_size,
    options.skip
  ]);

  // Add debug logging
  useEffect(() => {
    if (data) {
      console.log("useProducts API response:", data);
    }
  }, [data]);

  // Extract and normalize products from the response data
  const products = data?.products || [];

  // Update pagination information when data changes
  useEffect(() => {
    if (data) {
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.current_page || 1);
      setPageSize(data.page_size || 8);
      setTotalItems(data.total_items || 0);
    }
  }, [data]);

  return {
    products,
    isLoading,
    error: error as Error | null,
    totalPages,
    currentPage,
    pageSize,
    totalItems
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

export function useCategoryProducts(
  slug: string,
  options: { params?: UseProductsParams; skip?: boolean } = {}
): CategoryProductsResult {
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(options.params?.page || 1);
  const [pageSize, setPageSize] = useState<number>(
    options.params?.page_size || 8
  );
  const [totalItems, setTotalItems] = useState(0);

  // Stabilize params by using a ref
  const optionsRef = useRef(options);
  const slugRef = useRef(slug);
  const prevFetchRef = useRef<string>(''); // Track previous fetch params

  // Update refs when props change
  useEffect(() => {
    optionsRef.current = options;
    slugRef.current = slug;
  }, [options, slug]);

  // Convert params to API query parameters - do this only once
  const queryParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      search: options.params?.search,
      sort_by: options.params?.sortBy,
      min_price: options.params?.minPrice,
      max_price: options.params?.maxPrice,
      page: options.params?.page,
      page_size: options.params?.page_size
    };

    // Filter out undefined values
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
  }, [
    options.params?.search,
    options.params?.sortBy,
    options.params?.minPrice,
    options.params?.maxPrice,
    options.params?.page,
    options.params?.page_size
  ]);

  // Use a default list endpoint if no slug is provided
  const apiUrl = slug
    ? endpoints.products.category(slug).url
    : endpoints.products.list().url;

  const { data, isLoading, error, fetchData } =
    useApi<CategoryProductsResponse>(apiUrl, {
      immediate: false,
      skip: options.skip || false
    });

  // Fetch data when component mounts or params change
  useEffect(() => {
    if (!options.skip && slug) {
      // Create a unique string to represent this fetch request
      const fetchKey = `${slug}-${JSON.stringify(queryParams)}`;
      
      // Only fetch if params have changed to prevent redundant calls
      if (prevFetchRef.current !== fetchKey) {
        console.log("Fetching category products for slug:", slug, "with params:", queryParams);
        fetchData({ params: queryParams });
        prevFetchRef.current = fetchKey;
      }
    }
  }, [fetchData, options.skip, slug, queryParams]);

  // Extract and normalize products from the response data
  const products = data?.products || [];

  // Update pagination information when data changes
  useEffect(() => {
    if (data) {
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.current_page || 1);
      setPageSize(data.page_size || 8);
      setTotalItems(data.total_items || 0);
    }
  }, [data]);

  return {
    products,
    isLoading,
    error: error as Error | null,
    fetchCategoryProducts: fetchData,
    totalPages,
    currentPage,
    pageSize,
    totalItems
  };
}
