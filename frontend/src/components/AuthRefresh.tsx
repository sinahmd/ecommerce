'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { endpoints } from '@/lib/api';

/**
 * Component for silently managing token refresh and CSRF token retrieval
 * This component doesn't render anything but handles auth tokens in the background
 */
const AuthRefresh: React.FC = () => {
  // Using refs to track state without causing re-renders
  const csrfTokenRef = useRef<string | null>(null);
  const refreshAttemptCount = useRef(0);
  const isRefreshing = useRef(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const csrfInterval = useRef<NodeJS.Timeout | null>(null);
  const checkUserInterval = useRef<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated by looking for cookies
  const checkUserAuthentication = () => {
    // Check for access and refresh tokens in cookies
    const hasAccessToken = document.cookie.includes('access_token');
    const hasRefreshToken = document.cookie.includes('refresh_token');
    
    // Update authentication status
    const authenticated = hasAccessToken || hasRefreshToken;
    
    // Only update state if changed (prevents unnecessary re-renders)
    if (authenticated !== isAuthenticated) {
      console.log(`Auth status changed: ${authenticated} (Access token: ${hasAccessToken}, Refresh token: ${hasRefreshToken})`);
      setIsAuthenticated(authenticated);
    }
    
    return authenticated;
  };

  // Function to get CSRF token and set it in cookies
  const fetchCsrfToken = async () => {
    try {
      // Make a GET request to the CSRF endpoint to set the CSRF cookie
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/csrf/`, {
        withCredentials: true,
      });
      
      // Get the CSRF token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      
      if (token) {
        csrfTokenRef.current = token;
        console.log('CSRF token refreshed');
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  // Function to refresh the auth token
  const refreshToken = async () => {
    // Skip refresh if user is not authenticated or if already refreshing
    if (!isAuthenticated || isRefreshing.current) return;
    
    // Check if user has refresh token in cookies
    if (!document.cookie.includes('refresh_token')) {
      console.log('No refresh token found, skipping refresh');
      return;
    }

    try {
      isRefreshing.current = true;
      refreshAttemptCount.current += 1;
      
      // Don't attempt more than 3 consecutive refreshes to prevent infinite loops
      if (refreshAttemptCount.current > 3) {
        console.error('Too many consecutive token refresh attempts, stopping');
        refreshAttemptCount.current = 0; // Reset counter but continue with intervals
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${endpoints.auth.refresh}`,
        {},
        { withCredentials: true }
      );
      
      // Reset the attempt counter on success
      refreshAttemptCount.current = 0;
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // If we get a 401/400 error, the refresh token is likely invalid
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 400)) {
        console.log('Token refresh failed with 401/400, reset counter');
        refreshAttemptCount.current = 0;
        
        // Update authentication state after failed refresh
        setTimeout(checkUserAuthentication, 100);
      }
    } finally {
      isRefreshing.current = false;
    }
  };

  // Set up the initial CSRF token and auth check
  useEffect(() => {
    fetchCsrfToken();
    checkUserAuthentication();
    
    // Set up interval for checking auth status (every minute)
    checkUserInterval.current = setInterval(checkUserAuthentication, 60 * 1000);
    
    return () => {
      if (checkUserInterval.current) {
        clearInterval(checkUserInterval.current);
      }
    };
  }, []);

  // Setup token refresh intervals based on authentication state
  useEffect(() => {
    // Clear existing token refresh intervals when auth state changes
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
    if (csrfInterval.current) {
      clearInterval(csrfInterval.current);
      csrfInterval.current = null;
    }
    
    // Only set up token refresh for authenticated users
    if (isAuthenticated) {
      console.log('Setting up token refresh intervals for authenticated user');
      
      // Set up interval for refreshing auth token (every 10 minutes)
      refreshInterval.current = setInterval(refreshToken, 10 * 60 * 1000);
      
      // Set up interval for refreshing CSRF token (every hour)
      csrfInterval.current = setInterval(fetchCsrfToken, 60 * 60 * 1000);
    }
    
    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
      if (csrfInterval.current) clearInterval(csrfInterval.current);
    };
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
};

export default AuthRefresh; 