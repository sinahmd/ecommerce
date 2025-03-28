export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
