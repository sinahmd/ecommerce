export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  // Legacy category field - kept for backward compatibility
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  // New fields for multiple categories
  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];
  category_names?: string[];
  category_slugs?: string[];
  primary_category?: {
    id: number;
    name: string;
    slug: string;
  };
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
