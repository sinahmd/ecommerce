"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: {
    id: number;
    product: {
      id: number;
      name: string;
      slug: string;
      price: number;
      image?: string;
    };
    quantity: number;
  };
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 99) return;
    
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const subtotal = item.product.price * quantity;

  return (
    <div className="flex flex-col sm:flex-row py-6 border-b">
      <div className="sm:w-24 sm:h-24 rounded bg-muted flex-shrink-0 mb-4 sm:mb-0 flex items-center justify-center">
        {/* Image would go here in production */}
        <span className="text-lg font-medium">{item.product.name[0]}</span>
      </div>
      
      <div className="flex-1 sm:ml-6 space-y-2">
        <div className="flex justify-between">
          <div>
            <h3 className="text-base font-medium">
              <Link href={`/product/${item.product.slug}`} className="hover:underline">
                {item.product.name}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              ${item.product.price.toFixed(2)} each
            </p>
          </div>
          <p className="font-medium">${subtotal.toFixed(2)}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-r-none"
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <input
              type="number"
              min="1"
              max="99"
              className="h-8 w-12 border border-x-0 bg-transparent text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-l-none"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 