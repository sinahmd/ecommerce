import { useApi } from "./useApi";
import { endpoints } from "@/lib/api";
import { useCallback } from "react";

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string;
  };
  quantity: number;
  total_price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  total: number;
}

export function useCart() {
  const {
    data: cart,
    isLoading,
    error,
    fetchData: refreshCart,
    postData,
    putData
  } = useApi<Cart>(endpoints.cart.get);

  const addToCart = useCallback(
    async (productId: number, quantity: number = 1) => {
      try {
        await postData({
          product_id: productId,
          quantity
        });
        await refreshCart();
        return true;
      } catch (error) {
        console.error("Error adding to cart:", error);
        return false;
      }
    },
    [postData, refreshCart]
  );

  const updateCartItem = useCallback(
    async (itemId: number, quantity: number) => {
      try {
        await putData(
          {
            item_id: itemId,
            quantity
          },
          {
            url: endpoints.cart.update
          }
        );
        await refreshCart();
        return true;
      } catch (error) {
        console.error("Error updating cart item:", error);
        return false;
      }
    },
    [putData, refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      try {
        await postData(
          {
            item_id: itemId
          },
          {
            url: endpoints.cart.remove
          }
        );
        await refreshCart();
        return true;
      } catch (error) {
        console.error("Error removing from cart:", error);
        return false;
      }
    },
    [postData, refreshCart]
  );

  return {
    cart,
    isLoading,
    error,
    refreshCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    totalItems: cart?.total_items || 0,
    subtotal: cart?.subtotal || 0,
    total: cart?.total || 0,
    items: cart?.items || []
  };
}
