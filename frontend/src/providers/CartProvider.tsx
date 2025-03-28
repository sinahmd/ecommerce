"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  images?: string[];
};

export type CartContextType = {
  cart: CartItem[];
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = (newItem: CartItem) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setCart(prevCart => {
        // Check if item already exists in cart
        const existingItemIndex = prevCart.findIndex(item => item.id === newItem.id);
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex].quantity += newItem.quantity;
          return updatedCart;
        } else {
          // Add new item to cart
          return [...prevCart, newItem];
        }
      });
      setIsLoading(false);
    }, 500);
  };

  const removeItem = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        isLoading, 
        addItem, 
        removeItem, 
        updateQuantity,
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  
  return context;
}; 