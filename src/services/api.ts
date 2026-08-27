/**
 * Camada de API.
 *
 * Enquanto `VITE_API_URL` não estiver definido, os serviços usam os dados
 * mocados em `src/lib/mock-db.ts`. Assim que a API NestJS estiver disponível,
 * basta definir a variável de ambiente e usar `apiFetch` nos serviços.
 */
export const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";

export const USE_MOCK = API_URL.length === 0;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export function paginate<T>(rows: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
}
