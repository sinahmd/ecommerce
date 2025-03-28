import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseApiOptions {
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

  const fetchData = useCallback(
    async (config?: AxiosRequestConfig) => {
      if (skip) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.get(url, config);
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
    [url, skip]
  );

  const postData = useCallback(
    async (data: unknown, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.post(url, data, config);
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
    [url]
  );

  const putData = useCallback(
    async (data: unknown, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.put(url, data, config);
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
    [url]
  );

  const deleteData = useCallback(
    async (config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await api.delete(url, config);
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
    [url]
  );

  useEffect(() => {
    if (immediate && !skip) {
      fetchData();
    }
  }, [fetchData, immediate, skip]);

  return {
    ...state,
    fetchData,
    postData,
    putData,
    deleteData
  };
}
