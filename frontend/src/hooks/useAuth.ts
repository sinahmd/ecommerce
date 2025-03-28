import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api, { endpoints } from "@/lib/api";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/api";

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role?: string;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user, isAuthenticated: !!user }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Load user from local storage on initial render
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Check if we have a user in localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUser(user);
          setLoading(false);
          return;
        }

        setUser(null);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setLoading, setUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        console.log("Making login API request...");
        const response = await api.post(endpoints.auth.login, {
          email,
          password
        });

        console.log("Login API response:", response.data);

        if (response.data.user) {
          // Store user data in localStorage
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);
          return true;
        } else {
          setError("Invalid response from server");
          return false;
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.detail ||
          "Login failed. Please try again.";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser]
  );

  const register = useCallback(
    async (userData: {
      email: string;
      password: string;
      username: string;
      first_name: string;
      last_name: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post(endpoints.auth.register, userData);
        const { access, refresh, user } = response.data;
        localStorage.setItem("token", access);
        localStorage.setItem("refresh_token", refresh);
        setUser(user);
        return true;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage =
          axiosError.response?.data?.detail ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser]
  );

  const logout = useCallback(async () => {
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("user");
      setUser(null);
      router.push("/");
    }
  }, [router, setUser]);

  return {
    ...state,
    login,
    register,
    logout,
    setUser,
    setLoading,
    setError
  };
}
