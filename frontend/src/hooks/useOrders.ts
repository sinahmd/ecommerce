import { useState, useEffect, useCallback } from "react";
import api, { endpoints } from "@/lib/api";
import { useAuth } from "./useAuth";

export interface OrderItem {
  id: number;
  product?: {
    id: number;
    name: string;
    image: string;
  };
  product_name?: string;
  price: number;
  quantity: number;
  total_price: number;
}

export interface Transaction {
  id: number;
  amount: number;
  authority: string;
  ref_id: string | null;
  card_pan: string | null;
  card_hash: string | null;
  fee_type: string | null;
  fee: number | null;
  status_code: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_price: number;
  shipping_cost: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  transactions: Transaction[];
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address: string;
}

export function useOrders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(endpoints.user.orders);
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrderDetails = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`${endpoints.user.orders}${orderId}/`);
      return response.data;
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrderDetails
  };
}
