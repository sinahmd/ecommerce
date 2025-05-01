"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartContext } from "@/providers/CartProvider";
import { toast } from "@/hooks/use-toast";
import { getFullImageUrl } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image?: string;
    category: string;
    categorySlug: string;
    stock: number;
  };
  onAddToCart?: () => void;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem, cart } = useCartContext();
  
  const cartItem = cart?.find(item => item.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentQuantity >= product.stock) {
      toast({
        title: "Out of Stock",
        description: "Sorry, this product is out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        slug: product.slug,
        images: product.image ? [getFullImageUrl(product.image)] : []
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
      setIsLoading(false);
    }
  };

  return (
    <div className="group">
      <Link 
        href={`/product/${product.slug}`}
        className="block overflow-hidden rounded-lg border bg-background"
      >
        <div className="aspect-square bg-muted relative">
          {product.image ? (
            <Image
              src={getFullImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-medium">{product.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" asChild>
              <Link href={`/product/${product.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                مشاهده
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                <Link href={`/category/${product.categorySlug}`} className="hover:underline">
                  {product.category}
                </Link>
              </p>
            </div>
            <p className="font-medium">${product.price}</p>
          </div>
          <div className="mt-4">
            <Button 
              className="w-full" 
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading || currentQuantity >= product.stock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isLoading ? "در حال اضافه کردن" : currentQuantity >= product.stock ? "موجود نیست" : "اضافه به سبد خرید"}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
} 