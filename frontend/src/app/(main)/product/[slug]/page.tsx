"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useCartContext } from '@/providers/CartProvider';
import { toast } from '@/hooks/use-toast';
import { getFullImageUrl } from '@/lib/utils';
import api from '@/lib/api';
import { Product } from '@/types/product';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { addItem, cart } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch the specific product by slug
  useEffect(() => {
    const fetchProductBySlug = async () => {
      try {
        setIsLoading(true);
        // Directly get the specific product by slug with API prefix
        const response = await api.get(`/api/store/products/by-slug/${params.slug}/`);
        console.log('Product API response:', response.data);
        
        if (response.data) {
          setProduct(response.data);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch product'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductBySlug();
  }, [params.slug]);
  
  const cartItem = cart?.find(item => item.id === product?.id);
  const currentQuantity = cartItem?.quantity || 0;
  const maxQuantity = Math.min(product?.stock || 0, 10);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (currentQuantity >= (product.stock || 0)) {
      toast({
        title: "Out of Stock",
        description: "Sorry, this product is out of stock.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        slug: product.slug,
        images: [getFullImageUrl(product.image)]
      });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Extract category info with consistent fallback logic
  const getCategoryInfo = () => {
    if (!product) return { name: '', slug: '' };
    
    console.log('Product category data:', {
      primary_category: product.primary_category,
      category: product.category,
      category_names: product.category_names,
      category_slugs: product.category_slugs
    });
    
    const name = product.primary_category?.name || 
                (product.category_names && product.category_names[0]) || 
                (product.category?.name) || 
                '';
                
    const slug = product.primary_category?.slug || 
                (product.category_slugs && product.category_slugs[0]) || 
                (product.category?.slug) || 
                '';
                
    return { name, slug };
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-muted rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-12 bg-muted rounded w-1/2 mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          Error loading product. Please try again later.
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12">
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-6">
        <Link 
          href="/products" 
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to products
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {product.image ? (
            <Image
              src={getFullImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-medium">{product.name[0]}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              {getCategoryInfo().name ? (
                <Link 
                  href={`/category/${getCategoryInfo().slug}`}
                  className="text-muted-foreground hover:underline"
                >
                  {getCategoryInfo().name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Uncategorized</span>
              )}
            </div>
          </div>

          <div className="text-2xl font-bold">${product.price}</div>

          <div className="prose">
            <p>{product.description}</p>
          </div>

          <div className="pt-6 space-y-4">
            <div className="flex items-center">
              <span className="mr-4">Quantity:</span>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-r-none"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <div className="h-10 w-12 border border-x-0 flex items-center justify-center">
                  {quantity}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-l-none"
                  onClick={increaseQuantity}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>

            <Button 
              className="w-full sm:w-auto" 
              size="lg"
              onClick={handleAddToCart}
              disabled={isAddingToCart || currentQuantity >= (product.stock || 0)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAddingToCart ? "Adding to Cart..." : currentQuantity >= (product.stock || 0) ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 