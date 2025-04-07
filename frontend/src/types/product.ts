export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  schema_type?: string;
  canonical_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  // Legacy category field - kept for backward compatibility
  category?: Category;
  // New fields for multiple categories
  categories?: Category[];
  category_names?: string[];
  category_slugs?: string[];
  primary_category?: Category;
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  schema_type?: string;
  canonical_url?: string;
  brand?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  mpn?: string;
  gtin?: string;
  // Additional fields that might be used
  quantity?: number;
  images?: string[];
}
