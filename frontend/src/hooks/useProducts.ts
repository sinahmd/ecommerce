import { useApi } from "./useApi";
import { endpoints } from "@/lib/api";
import { useState, useEffect, useRef, useMemo } from "react";
import { Product } from "@/types/product";
import { UseApiOptions } from "./useApi";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api";

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

  // Use React Query instead of useApi
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filteredParams],
    queryFn: async () => {
      const response = await api.get<ProductListResponse>(
        endpoints.products.list().url,
        { params: filteredParams }
      );
      return response.data;
    },
    enabled: !options.skip // Only run if not skipped
  });

  // Extract values from the query result
  const products = data?.products || [];
  const totalPages = data?.total_pages || 1;
  const currentPage = data?.current_page || (params.page || 1);
  const pageSize = data?.page_size || (params.page_size || 8);
  const totalItems = data?.total_items || 0;

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

export function useProduct(id: number, options: UseApiOptions = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get<Product>(endpoints.products.detail(id).url);
      return response.data;
    },
    enabled: !!id && !options.skip // Only run if id exists and not skipped
  });

  return {
    product: data,
    isLoading,
    error,
    fetchProduct: async () => {
      // This is to maintain API compatibility with the old hook
      return api.get<Product>(endpoints.products.detail(id).url);
    }
  };
}

export function useCategories(options: UseApiOptions = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>(endpoints.products.categories.url);
      return response.data;
    },
    enabled: !options.skip // Only run if not skipped
  });

  return {
    categories: data || [],
    isLoading,
    error,
    fetchCategories: async () => {
      // This is to maintain API compatibility with the old hook
      return api.get<Category[]>(endpoints.products.categories.url);
    }
  };
}

export function useCategoryProducts(
  slug: string,
  options: { params?: UseProductsParams; skip?: boolean } = {}
): CategoryProductsResult {
  // Convert params to API query parameters
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

  // Add debugging for the request parameters
  useEffect(() => {
    if (slug && !options.skip) {
      console.log("Category request parameters:", {
        slug,
        queryParams,
        url: apiUrl
      });
    }
  }, [slug, queryParams, apiUrl, options.skip]);

  // Use React Query instead of useApi
  const { data, isLoading, error } = useQuery({
    queryKey: ['categoryProducts', slug, queryParams],
    queryFn: async () => {
      console.log(`Making request to ${apiUrl} with params:`, queryParams);
      const response = await api.get<CategoryProductsResponse>(
        apiUrl,
        { params: queryParams }
      );
      // Log the response for debugging
      console.log("Category API response:", response.data);
      return response.data;
    },
    enabled: !!slug && !options.skip // Only run if slug exists and not skipped
  });

  // Extract values from the query result
  const products = data?.products || [];
  const totalPages = data?.total_pages || 1;
  const currentPage = data?.current_page || (options.params?.page || 1);
  const pageSize = data?.page_size || (options.params?.page_size || 8);
  const totalItems = data?.total_items || 0;

  return {
    products,
    isLoading,
    error: error as Error | null,
    fetchCategoryProducts: async (config) => {
      // This is to maintain API compatibility with the old hook
      return api.get<CategoryProductsResponse>(apiUrl, {
        ...config,
        params: {
          ...config?.params,
          ...queryParams
        }
      });
    },
    totalPages,
    currentPage,
    pageSize,
    totalItems
  };
}
