"use client";

import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { useProducts, useCategoryProducts } from '@/hooks/useProducts';
import { useCartContext } from '@/providers/CartProvider';
import { Product as ProductType } from '@/types/product';
import { getFullImageUrl } from '@/lib/utils';

interface ProductListProps {
  products?: ProductType[];
  limit?: number;
  categorySlug?: string;
}

export function ProductList({ products, limit, categorySlug }: ProductListProps) {
  const { products: categoryProducts, isLoading: categoryLoading, error: categoryError } = useCategoryProducts(categorySlug || '');
  const { products: allProducts, isLoading: productsLoading, error: productsError } = useProducts({ limit });
  const [displayProducts, setDisplayProducts] = useState<ProductType[]>([]);
  const { addItem } = useCartContext();

  useEffect(() => {
    if (products) {
      setDisplayProducts(products);
    } else if (categorySlug && categoryProducts?.length > 0) {
      setDisplayProducts(categoryProducts);
    } else if (!categorySlug && allProducts?.length > 0) {
      setDisplayProducts(allProducts);
    }
  }, [products, categorySlug, categoryProducts, allProducts]);

  const isLoading = categorySlug ? categoryLoading : productsLoading;
  const error = categorySlug ? categoryError : productsError;

  const handleAddToCart = async (productId: number) => {
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
        console.log('Product added to cart');
      }
    } catch (error) {
      console.error('Failed to add product to cart', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted h-64 rounded-lg mb-3"></div>
            <div className="bg-muted h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-muted h-4 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        Error loading products. Please try again later.
      </div>
    );
  }

  if (displayProducts?.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayProducts.map((product) => (
        <ProductCard 
          key={product.id} 
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: getFullImageUrl(product.image),
            category: product.category.name,
            categorySlug: product.category.slug,
            stock: product.stock
          }}
          onAddToCart={() => handleAddToCart(product.id)}
        />
      ))}
    </div>
  );
} 