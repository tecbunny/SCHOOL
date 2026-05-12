export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

type FetchOptions = RequestInit;

export async function apiClient<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
  // Enforce Client-Server architecture for Student Hub
  // If NEXT_PUBLIC_CLASS_STATION_IP is defined, route requests there.
  let targetUrl = url;
  if (process.env.NEXT_PUBLIC_CLASS_STATION_IP && url.startsWith('/api/')) {
    targetUrl = `http://${process.env.NEXT_PUBLIC_CLASS_STATION_IP}:4102${url}`;
  }

  const response = await fetch(targetUrl, options).catch((error) => {
    // Handle offline/no internet gracefully
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('No connection to Class Station. Please check network.', 'OFFLINE', 0);
    }
    throw error;
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // Not JSON
      throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', response.status);
    }

    const message = errorData.error || errorData.message || 'An API error occurred';
    const code = errorData.code || 'API_ERROR';
    throw new ApiError(message, code, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
