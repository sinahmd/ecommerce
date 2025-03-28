import { useApi } from "./useApi";
import { endpoints } from "@/lib/api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export function useCategories() {
  const {
    data: categories,
    isLoading,
    error
  } = useApi<Category[]>(endpoints.products.categories.url);

  return {
    categories: categories || [],
    isLoading,
    error
  };
}
