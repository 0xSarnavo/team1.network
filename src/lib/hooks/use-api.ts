'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiResponse } from '@/lib/api/client';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(url: string, options: UseApiOptions = { immediate: true }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ApiResponse['pagination']>();
  const mountedRef = useRef(true);

  const fetch = useCallback(async (queryUrl?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<T>(queryUrl || url);
      if (!mountedRef.current) return;
      if (res.success) {
        setData(res.data ?? null);
        setPagination(res.pagination);
      } else {
        setError(res.error?.message || 'An error occurred');
      }
    } catch {
      if (mountedRef.current) {
        setError('Network error');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    if (options.immediate) fetch();
    return () => { mountedRef.current = false; };
  }, [fetch, options.immediate]);

  return { data, loading, error, pagination, refetch: fetch, setData };
}

export function useMutation<T, B = unknown>(method: 'post' | 'put' | 'patch' | 'delete') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (url: string, body?: B): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);
    try {
      const res = method === 'delete'
        ? await api.delete<T>(url)
        : await api[method]<T>(url, body);
      if (!res.success) {
        setError(res.error?.message || 'An error occurred');
      }
      return res;
    } catch {
      setError('Network error');
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Network error' } };
    } finally {
      setLoading(false);
    }
  }, [method]);

  return { mutate, loading, error };
}
