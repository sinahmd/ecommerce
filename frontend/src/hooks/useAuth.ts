import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import api, { endpoints } from "@/lib/api";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/api";
import axios from "axios";

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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialState);

  // Use refs instead of localStorage to track auth checking state
  const isCheckingAuthRef = useRef(false);
  const lastCheckTimeRef = useRef(0);
  const authCheckedRef = useRef(false);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const loadUser = async () => {
      // Don't check again if we've already completed a check
      if (authCheckedRef.current) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use refs instead of localStorage for tracking state
        const currentTime = Date.now();

        // If we've checked auth in the last 30 seconds, don't check again
        // This prevents rapid successive auth checks causing the redirect loop
        if (
          isCheckingAuthRef.current ||
          (currentTime - lastCheckTimeRef.current < 30000 &&
            lastCheckTimeRef.current > 0)
        ) {
          console.log(
            "Auth check already in progress or very recent, skipping..."
          );
          setLoading(false);
          return;
        }

        // Set checking flag and update timestamp
        isCheckingAuthRef.current = true;
        lastCheckTimeRef.current = currentTime;

        try {
          // Try to get user data from server
          const response = await api.get(endpoints.auth.user);

          if (response.data) {
            // Use user data from server
            console.log("User authenticated:", response.data);
            setUser(response.data);
          } else {
            console.log("No user data returned");
            setUser(null);
          }
        } catch (error: unknown) {
          // If it's a 401 unauthorized, just set user to null without redirecting
          // This is a normal case for guest users
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.log("User not authenticated (normal for guest users)");
            setUser(null);
          } else {
            // For other errors, also set user to null
            console.error("Unexpected error checking auth:", error);
            setUser(null);
          }
        } finally {
          // Clear checking flag
          isCheckingAuthRef.current = false;
          authCheckedRef.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
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
          setUser(response.data.user);
          authCheckedRef.current = true;
          // Reset the last check time to force a fresh auth check if needed
          lastCheckTimeRef.current = 0;
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

        // If registration also logs the user in and returns user data
        if (response.data.user) {
          setUser(response.data.user);
          authCheckedRef.current = true;
        }

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
      // Clear user state
      setUser(null);
      authCheckedRef.current = true;
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
