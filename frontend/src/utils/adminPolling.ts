export const DEFAULT_POLLING_INTERVAL = 30 * 1000; // 30 seconds

// Store the last fetch time for each endpoint to prevent excessive API calls
const lastFetchTimes: Record<string, number> = {};

// Store cached data for each endpoint with generic typing
const dataCache: Record<string, { data: unknown; timestamp: number }> = {};

/**
 * Reset the fetch time for an endpoint to force a new fetch
 * @param endpoint The API endpoint key to reset
 */
export function resetFetchTime(endpoint: string) {
  lastFetchTimes[endpoint] = 0;
}

/**
 * Reset all fetch times to force fresh fetches
 */
export function resetAllFetchTimes() {
  Object.keys(lastFetchTimes).forEach((key) => {
    lastFetchTimes[key] = 0;
  });
}

/**
 * Get cached data for an endpoint if available and not expired
 * @param endpoint The API endpoint key
 * @param maxAge Maximum age of the cache in milliseconds
 * @returns The cached data or null if expired or not available
 */
export function getCachedData<T>(
  endpoint: string,
  maxAge = DEFAULT_POLLING_INTERVAL
): T | null {
  const cachedItem = dataCache[endpoint];
  if (cachedItem) {
    const now = Date.now();
    if (now - cachedItem.timestamp < maxAge) {
      return cachedItem.data as T;
    }
  }
  return null;
}

/**
 * Set data in the cache
 * @param endpoint The API endpoint key
 * @param data The data to cache
 */
export function setCachedData<T>(endpoint: string, data: T) {
  dataCache[endpoint] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Check if enough time has passed since the last fetch for a specific endpoint
 * @param endpoint The API endpoint key
 * @param minInterval Minimum interval between fetches in milliseconds
 * @param forceCheck Force a check even if the interval hasn't passed
 * @returns Boolean indicating if enough time has passed
 */
export function shouldFetch(
  endpoint: string,
  minInterval = DEFAULT_POLLING_INTERVAL,
  forceCheck = false
): boolean {
  const now = Date.now();
  const lastFetch = lastFetchTimes[endpoint] || 0;

  if (forceCheck || now - lastFetch >= minInterval) {
    lastFetchTimes[endpoint] = now;
    return true;
  }

  return false;
}

/**
 * Fetch data with polling interval control
 * @param endpoint The API endpoint key
 * @param fetchFn Async function to fetch the data
 * @param interval Polling interval in milliseconds
 * @param forceFetch Force a fetch even if the interval hasn't passed
 */
export async function fetchWithPolling<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  interval = DEFAULT_POLLING_INTERVAL,
  forceFetch = false
): Promise<T | null> {
  try {
    // Check for cached data first if not forcing a fetch
    if (!forceFetch) {
      const cachedData = getCachedData<T>(endpoint, interval);
      if (cachedData) {
        return cachedData;
      }
    }

    // Only fetch if enough time has passed or forced
    if (shouldFetch(endpoint, interval, forceFetch)) {
      const data = await fetchFn();
      if (data) {
        setCachedData(endpoint, data);
      }
      return data;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}
