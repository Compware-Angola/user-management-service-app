export function normalizeQueryResponse<T>(response?: {
  data?: T[];
  meta?: {
    totalPages?: number;
    total?: number;
  };
}) {
  return {
    data: response?.data ?? [],
    totalPage: response?.meta?.totalPages ?? 0,
    total: response?.meta?.total ?? 0,
  };
}
