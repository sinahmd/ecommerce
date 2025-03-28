import { useApi } from "./useApi";
import { endpoints } from "@/lib/api";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
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
  limit?: number;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
  currentPage: number;
}

export function useProducts(params: UseProductsParams = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append("search", params.search);
        if (params.sortBy) queryParams.append("sort_by", params.sortBy);
        if (params.minPrice)
          queryParams.append("min_price", params.minPrice.toString());
        if (params.maxPrice)
          queryParams.append("max_price", params.maxPrice.toString());
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const response = await api.get(endpoints.products.list().url, {
          params: queryParams
        });
        console.log("Raw API response:", response.data);

        const { products, total_pages, current_page } = response.data;

        setProducts(products);
        setTotalPages(total_pages);
        setCurrentPage(current_page);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch products")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    params.search,
    params.sortBy,
    params.minPrice,
    params.maxPrice,
    params.page,
    params.limit
  ]);

  return { products, isLoading, error, totalPages, currentPage };
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
  const { data, isLoading, error, fetchData } = useApi<{
    category: Category;
    products: Product[];
  }>(slug ? endpoints.products.category(slug).url : "", {
    ...options,
    skip: !slug
  });

  return {
    products: data?.products || [],
    isLoading,
    error,
    fetchCategoryProducts: fetchData
  };
}
