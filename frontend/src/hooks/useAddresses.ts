import { useState, useEffect, useCallback } from "react";
import api, { endpoints } from "@/lib/api";
import { useAuth } from "./useAuth";

export interface Address {
  id: number;
  address_type: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useAddresses() {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(endpoints.user.addresses.list);
      setAddresses(response.data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = useCallback(
    async (addressData: Omit<Address, "id" | "created_at" | "updated_at">) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post(
          endpoints.user.addresses.list,
          addressData
        );
        setAddresses((prevAddresses) => [...prevAddresses, response.data]);
        return response.data;
      } catch (err) {
        console.error("Error adding address:", err);
        setError("Failed to add address");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateAddress = useCallback(
    async (id: number, addressData: Partial<Address>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.put(
          endpoints.user.addresses.detail(id),
          addressData
        );
        setAddresses((prevAddresses) =>
          prevAddresses.map((addr) => (addr.id === id ? response.data : addr))
        );
        return response.data;
      } catch (err) {
        console.error("Error updating address:", err);
        setError("Failed to update address");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteAddress = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(endpoints.user.addresses.detail(id));
      setAddresses((prevAddresses) =>
        prevAddresses.filter((addr) => addr.id !== id)
      );
      return true;
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefaultAddress = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.put(endpoints.user.addresses.setDefault(id));
      setAddresses((prevAddresses) =>
        prevAddresses.map((addr) => {
          // Find the address type of the one being set as default
          const targetType = prevAddresses.find(
            (a) => a.id === id
          )?.address_type;

          // If this address has the same type, update is_default based on id
          if (addr.address_type === targetType) {
            return { ...addr, is_default: addr.id === id };
          }
          return addr;
        })
      );
      return true;
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set default address");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDefaultAddress = useCallback(
    (type: "shipping" | "billing") => {
      return addresses.find(
        (addr) => addr.address_type === type && addr.is_default
      );
    },
    [addresses]
  );

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
  };
}
