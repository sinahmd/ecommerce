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
  // For specific category - only used when categorySlug is provided
  const { 
    products: categoryProducts, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useCategoryProducts(
    categorySlug || '', 
    { skip: !categorySlug }
  );
  
  // For all products - only used when no categorySlug is provided
  const { 
    products: allProducts, 
    isLoading: productsLoading, 
    error: productsError 
  } = useProducts(
    { limit },
    { skip: !!categorySlug || !!products }
  );
  
  const [displayProducts, setDisplayProducts] = useState<ProductType[]>([]);
  const { addItem } = useCartContext();

  useEffect(() => {
    console.log('ProductList effect running with:', { 
      categorySlug, 
      'products prop length': products?.length,
      'categoryProducts length': categoryProducts?.length,
      'allProducts length': allProducts?.length
    });

    // Also log a sample product from each source to understand the structure
    if (products?.length) console.log('Sample product from props:', products[0]);
    if (categoryProducts?.length) console.log('Sample category product:', categoryProducts[0]);
    if (allProducts?.length) console.log('Sample all product:', allProducts[0]);

    if (products) {
      // If products are directly provided as props, use them
      console.log('Using products from props');
      setDisplayProducts(products);
    } else if (categorySlug && categoryProducts?.length > 0) {
      // If a category is selected and we have products for that category
      console.log('Using category products for slug:', categorySlug);
      setDisplayProducts(categoryProducts);
    } else if (!categorySlug && allProducts?.length > 0) {
      // If no category is selected (All Products) and we have products
      console.log('Using all products (no category selected)');
      setDisplayProducts(allProducts);
    } else {
      // Reset in case of no products
      console.log('No products available to display');
      setDisplayProducts([]);
    }
  }, [products, categorySlug, categoryProducts, allProducts]);

  // Determine loading and error state
  const isLoading = products ? false : categorySlug ? categoryLoading : productsLoading;
  const error = products ? null : categorySlug ? categoryError : productsError;

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
      {displayProducts.map((product) => {
        // Get category info with fallbacks for different data structures
        const categoryName = product.primary_category?.name || 
                            (product.category_names && product.category_names[0]) || 
                            (product.category?.name) || 
                            '';
        
        const categorySlug = product.primary_category?.slug || 
                            (product.category_slugs && product.category_slugs[0]) || 
                            (product.category?.slug) || 
                            '';
        
        return (
          <ProductCard 
            key={product.id} 
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: getFullImageUrl(product.image),
              category: categoryName,
              categorySlug: categorySlug,
              stock: product.stock
            }}
            onAddToCart={() => handleAddToCart(product.id)}
          />
        );
      })}
    </div>
  );
} 
      // {displayProducts.map((product) => (
      //   <ProductCard 
      //     key={product.id} 
      //     product={{
      //       id: product.id,
      //       name: product.name,
      //       slug: product.slug,
      //       price: product.price,
      //       image: getFullImageUrl(product.image),
      //       category: product.primary_category ? product.primary_category.name : '',
      //       categorySlug: product.primary_category ? product.primary_category.slug : '',
      //       stock: product.stock
      //     }}
      //     onAddToCart={() => handleAddToCart(product.id)}
      //   />
      // ))}
//     </div>
//   );
// } 