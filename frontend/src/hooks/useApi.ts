import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  skip?: boolean;
}

export function useApi<T = unknown>(url: string, options: UseApiOptions = {}) {
  const { immediate = true, skip = false } = options;
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null
  });
  
  // Use refs to prevent unnecessary rerenders
  const urlRef = useRef(url);
  const skipRef = useRef(skip);
  
  // Update refs when props change
  useEffect(() => {
    urlRef.current = url;
    skipRef.current = skip;
  }, [url, skip]);

  const fetchData = useCallback(
    async (config?: AxiosRequestConfig) => {
      if (skipRef.current) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.get(urlRef.current, config);
        setState({
          data: response.data,
          isLoading: false,
          error: null
        });
        return response;
      } catch (err) {
        const error = err as AxiosError;
        setState({
          data: null,
          isLoading: false,
          error: error as Error
        });
        throw error;
      }
    },
    [] // No dependencies since we're using refs
  );

  const postData = useCallback(
    async (data: unknown, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.post(urlRef.current, data, config);
        setState({
          data: response.data,
          isLoading: false,
          error: null
        });
        return response;
      } catch (err) {
        const error = err as AxiosError;
        setState({
          data: null,
          isLoading: false,
          error: error as Error
        });
        throw error;
      }
    },
    [] // No dependencies since we're using refs
  );

  const putData = useCallback(
    async (data: unknown, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.put(urlRef.current, data, config);
        setState({
          data: response.data,
          isLoading: false,
          error: null
        });
        return response;
      } catch (err) {
        const error = err as AxiosError;
        setState({
          data: null,
          isLoading: false,
          error: error as Error
        });
        throw error;
      }
    },
    [] // No dependencies since we're using refs
  );

  const deleteData = useCallback(
    async (config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.delete(urlRef.current, config);
        setState({
          data: response.data,
          isLoading: false,
          error: null
        });
        return response;
      } catch (err) {
        const error = err as AxiosError;
        setState({
          data: null,
          isLoading: false,
          error: error as Error
        });
        throw error;
      }
    },
    [] // No dependencies since we're using refs
  );

  useEffect(() => {
    if (immediate && !skipRef.current) {
      fetchData();
    }
  }, []); // Only run on mount since we're using refs

  return {
    ...state,
    fetchData,
    postData,
    putData,
    deleteData
  };
}
