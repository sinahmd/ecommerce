import { MetadataRoute } from "next";
import api from "@/lib/api";

interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

// Define basic interfaces for the API responses
interface Product {
  slug: string;
  updated_at?: string;
  created_at?: string;
}

interface Category {
  slug: string;
}

interface BlogPost {
  slug: string;
  updated_at?: string;
  created_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Static routes with their last modification date and change frequency
  const staticRoutes: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    }
  ];

  // Fetch dynamic product routes
  let products: SitemapEntry[] = [];
  try {
    const productResponse = await api.get("/api/store/products/");
    products = productResponse.data.map((product: Product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(
        product.updated_at || product.created_at || new Date()
      ),
      changeFrequency: "weekly",
      priority: 0.7
    }));
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  // Fetch dynamic category routes
  let categories: SitemapEntry[] = [];
  try {
    const categoryResponse = await api.get("/api/store/categories/");
    categories = categoryResponse.data.map((category: Category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    }));
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }

  // Fetch dynamic blog post routes
  let blogPosts: SitemapEntry[] = [];
  try {
    const blogResponse = await api.get("/api/blog/");
    blogPosts = blogResponse.data.map((post: BlogPost) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at || new Date()),
      changeFrequency: "monthly",
      priority: 0.6
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  // Combine all routes
  return [...staticRoutes, ...products, ...categories, ...blogPosts];
}
