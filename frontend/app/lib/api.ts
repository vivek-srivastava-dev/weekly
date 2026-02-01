type ApiOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return (await response.json().catch(() => ({}))) as T;
}
