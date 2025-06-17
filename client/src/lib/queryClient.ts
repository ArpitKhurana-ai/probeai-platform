import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

const getApiUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const fullUrl = baseUrl + path;
  
  // Enhanced logging for production debugging
  console.log('API Request Details:', {
    path,
    baseUrl,
    fullUrl,
    mode: import.meta.env.MODE,
    hasBaseUrl: !!import.meta.env.VITE_API_BASE_URL
  });
  
  return fullUrl;
};

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<Response> {
  const fullUrl = getApiUrl(url);
  
  try {
    const res = await fetch(fullUrl, {
      method: options?.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: options?.body,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API Request failed:', fullUrl, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = getApiUrl(queryKey[0] as string);
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error('Query failed:', fullUrl, error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        apiUrl: fullUrl,
        timestamp: new Date().toISOString()
      });
      
      // Return empty structure to prevent UI breaks
      if (fullUrl.includes('/api/tools')) {
        console.warn('Returning empty tools array due to API failure');
        return { items: [], total: 0 };
      }
      if (fullUrl.includes('/api/news')) {
        console.warn('Returning empty news array due to API failure');
        return { items: [], total: 0 };
      }
      if (fullUrl.includes('/api/videos')) {
        console.warn('Returning empty videos array due to API failure');
        return { items: [], total: 0 };
      }
      if (fullUrl.includes('/api/blogs')) {
        console.warn('Returning empty blogs array due to API failure');
        return { items: [], total: 0 };
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
