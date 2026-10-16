const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function httpClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, credentials: 'same-origin' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
