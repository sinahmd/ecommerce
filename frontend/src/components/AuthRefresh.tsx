"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/lib/api';

/**
 * Component for silently managing token refresh and CSRF token retrieval
 * This component doesn't render anything but handles auth tokens in the background
 */
export function AuthRefresh() {
  const { user } = useAuthContext();
  const [lastUserCheck, setLastUserCheck] = useState<number>(0);
  const lastRefreshAttempt = useRef<number>(0);
  const refreshCount = useRef<number>(0);

  // Fetch CSRF token from the server
  const fetchCsrfToken = async () => {
    try {
      await api.get('/api/csrf/');
      console.log('CSRF token refreshed successfully');
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  // Refresh the auth token with throttling
  const refreshToken = async () => {
    // Add throttling to prevent multiple refresh attempts in a short time
    const now = Date.now();
    if (now - lastRefreshAttempt.current < 60000) { // 1 minute between refresh attempts
      console.log('Token refresh attempted too recently, skipping');
      return;
    }
    
    lastRefreshAttempt.current = now;
    
    try {
      console.log('Attempting to refresh auth token');
      await api.post('/api/users/token/refresh/');
      console.log('Token refreshed successfully');
      refreshCount.current = 0; // Reset counter on success
    } catch (error) {
      console.error('Error refreshing token:', error);
      refreshCount.current += 1;
      
      // If we've failed too many times in a row, back off
      if (refreshCount.current > 3) {
        console.log('Too many failed refresh attempts, backing off');
        refreshCount.current = 0; // Reset counter
      }
    }
  };

  // Check user authentication status with throttling
  const checkUserAuth = async () => {
    // Throttle user checks to avoid excessive API calls
    const now = Date.now();
    if (now - lastUserCheck < 60000) { // 1 minute minimum between checks
      return;
    }
    
    try {
      console.log('Checking user authentication');
      await api.get('/api/users/user/');
      console.log('User auth check successful');
      setLastUserCheck(now);
    } catch (error) {
      // Only log the error for debugging
      console.error('Error checking user auth:', error);
      setLastUserCheck(now);
    }
  };

  useEffect(() => {
    // Initial fetch of CSRF token
    fetchCsrfToken();
    console.log('AuthRefresh component initialized');

    // Set up intervals for token refresh and CSRF token fetch
    // Refresh auth token every 20 minutes
    const tokenRefreshInterval = setInterval(refreshToken, 20 * 60 * 1000);
    
    // Refresh CSRF token every 2 hours
    const csrfRefreshInterval = setInterval(fetchCsrfToken, 2 * 60 * 60 * 1000);

    // Check user auth only if we have a user (and much less frequently)
    let userCheckInterval: NodeJS.Timeout | null = null;
    if (user) {
      userCheckInterval = setInterval(checkUserAuth, 5 * 60 * 1000); // Every 5 minutes
      console.log('Set up user check interval for authenticated user');
    }

    return () => {
      clearInterval(tokenRefreshInterval);
      clearInterval(csrfRefreshInterval);
      if (userCheckInterval) clearInterval(userCheckInterval);
      console.log('AuthRefresh component cleanup');
    };
  }, [user]);

  // This component doesn't render anything visible
  return null;
}
 