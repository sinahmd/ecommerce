"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCartContext } from '@/providers/CartProvider';
import { toast } from '@/hooks/use-toast';
import { getFullImageUrl } from '@/lib/utils';
import { Product } from '@/types/product';

interface ProductAddToCartProps {
  product: Product;
}

export default function ProductAddToCart({ product }: ProductAddToCartProps) {
  const { addItem, cart } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  return (
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
  );
} 