"use client";

import { useEffect, useRef } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import api, { CSRFTokenManager } from '@/lib/api';

/**
 * Component for silently managing token refresh
 * This component doesn't render anything but handles auth tokens in the background
 */
export function AuthRefresh() {
  const { user, refreshAuth } = useAuthContext();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Initialize CSRF token manager on first mount
    if (!isInitialized.current) {
      console.log('Initializing CSRF token manager');
      CSRFTokenManager.initialize();
      isInitialized.current = true;
    }

    // Set up interval for token refresh - every 20 minutes
    const refreshTokenPeriodically = () => {
      console.log('Setting up token refresh interval');
      
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      // Set up a new interval
      refreshIntervalRef.current = setInterval(async () => {
        try {
          // Only attempt token refresh if user is logged in
          if (user) {
            console.log('Attempting to refresh auth token');
            await api.post('/api/users/token/refresh/');
            console.log('Token refreshed successfully');
            
            // Update auth state after successful refresh
            await refreshAuth();
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }, 20 * 60 * 1000); // 20 minutes
    };
    
    refreshTokenPeriodically();

    // Clean up interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      console.log('AuthRefresh component cleanup');
    };
  }, [user, refreshAuth]);

  // This component doesn't render anything visible
  return null;
}
 