/**
 * CashBridge API Client Wrapper
 * Supports both live FastAPI backend communication and seamless fallback to
 * realistic mock data based on VITE_USE_MOCK environment configuration.
 */

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function simulateApiCall<T>(data: T, delayMs = 280): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    }, delayMs);
  });
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<ApiResponse<T>> {
  if (USE_MOCK && fallbackData !== undefined) {
    return simulateApiCall(fallbackData);
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      if (fallbackData !== undefined) {
        console.warn(`[CashBridge API] ${endpoint} returned ${res.status}. Falling back to mock data.`);
        return simulateApiCall(fallbackData);
      }
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (err) {
    if (fallbackData !== undefined) {
      console.warn(`[CashBridge API] Network error accessing ${url}. Falling back to mock data.`, err);
      return simulateApiCall(fallbackData);
    }
    throw err;
  }
}
