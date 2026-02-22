// ============================================================
// API Client — Frontend HTTP wrapper
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include', // for refresh token cookie
    });

    // Handle 401 — try to refresh
    if (res.status === 401 && !url.includes('/auth/refresh')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retry = await fetch(`${BASE_URL}${url}`, {
          ...options,
          headers,
          credentials: 'include',
        });
        return retry.json();
      }
    }

    return res.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        this.accessToken = data.data.accessToken;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('token-refreshed', {
              detail: { accessToken: data.data.accessToken },
            })
          );
        }
        return true;
      }
    } catch {
      // refresh failed
    }
    this.accessToken = null;
    return false;
  }

  get<T>(url: string) {
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export type { ApiResponse };
