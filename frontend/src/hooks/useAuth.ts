import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import api, { endpoints, CSRFTokenManager } from "@/lib/api";
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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Create a singleton for auth state management across the application
const AuthStateManager = (() => {
  let currentUser: User | null = null;
  let isAuthenticated = false;
  let lastCheckTime = 0;
  let isCheckingAuth = false;
  let authChecked = false;
  
  // Auth State Listeners (for components that need to react to auth changes)
  const listeners: Array<(user: User | null, isAuth: boolean) => void> = [];
  
  const addListener = (callback: (user: User | null, isAuth: boolean) => void) => {
    listeners.push(callback);
    return () => {
      const index = listeners.indexOf(callback);
      if (index !== -1) listeners.splice(index, 1);
    };
  };
  
  const notifyListeners = () => {
    listeners.forEach(listener => listener(currentUser, isAuthenticated));
  };
  
  const setUser = (user: User | null) => {
    currentUser = user;
    isAuthenticated = !!user;
    notifyListeners();
  };
  
  // Check authentication status - returns true if check was performed
  const checkAuth = async (): Promise<boolean> => {
    const now = Date.now();
    
    // Don't check if already checking or checked recently (throttling)
    if (isCheckingAuth || (now - lastCheckTime < 30000 && lastCheckTime > 0)) {
      return false;
    }
    
    isCheckingAuth = true;
    lastCheckTime = now;
    
    try {
      // Ensure CSRF token is available for auth requests
      await CSRFTokenManager.initialize();
      
      // Check user authentication
      const response = await api.get(endpoints.auth.user);
      
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
      
      authChecked = true;
      return true;
    } catch (error: any) {
      // 401 is expected for guest users
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        console.error("Unexpected error checking auth:", error);
        setUser(null);
      }
      
      authChecked = true;
      return true;
    } finally {
      isCheckingAuth = false;
    }
  };
  
  return {
    getUser: () => currentUser,
    isAuthenticated: () => isAuthenticated,
    hasCheckedAuth: () => authChecked,
    setUser,
    checkAuth,
    addListener
  };
})();

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialState);
  
  // Update state based on the auth manager
  const updateStateFromManager = useCallback(() => {
    setState(prev => ({
      ...prev,
      user: AuthStateManager.getUser(),
      isAuthenticated: AuthStateManager.isAuthenticated(),
      isLoading: false
    }));
  }, []);
  
  // Set error message
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);
  
  // Set loading state
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  // Check if user is already authenticated on mount
  useEffect(() => {
    // If auth has been checked, just update from the manager
    if (AuthStateManager.hasCheckedAuth()) {
      updateStateFromManager();
      return;
    }
    
    // Otherwise perform authentication check
    const checkAuthentication = async () => {
      setLoading(true);
      await AuthStateManager.checkAuth();
      updateStateFromManager();
    };
    
    checkAuthentication();
    
    // Subscribe to auth state changes
    const unsubscribe = AuthStateManager.addListener(() => {
      updateStateFromManager();
    });
    
    return unsubscribe;
  }, [updateStateFromManager, setLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        // Ensure CSRF token is available for login
        await CSRFTokenManager.initialize();
        
        const response = await api.post(endpoints.auth.login, {
          email,
          password
        });

        if (response.data.user) {
          AuthStateManager.setUser(response.data.user);
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
    [setError, setLoading]
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
        // Ensure CSRF token is available for registration
        await CSRFTokenManager.initialize();
        
        const response = await api.post(endpoints.auth.register, userData);

        // If registration also logs the user in and returns user data
        if (response.data.user) {
          AuthStateManager.setUser(response.data.user);
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
    [setError, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Ensure CSRF token is available for logout
      await CSRFTokenManager.initialize();
      
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear user state
      AuthStateManager.setUser(null);
      setLoading(false);
      router.push("/");
    }
  }, [router, setLoading]);

  return {
    ...state,
    login,
    register,
    logout,
    refreshAuth: AuthStateManager.checkAuth
  };
}
