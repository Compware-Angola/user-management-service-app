import { useQuery } from "@tanstack/react-query";
import { getLogStats, listLogs, type LogFilters } from "@/services/logs.service";

export const logKeys = {
  all: ["logs"] as const,
  list: (filters: LogFilters) => ["logs", "list", filters] as const,
  stats: (filters: LogFilters) => ["logs", "stats", filters] as const,
};

export function useLogs(filters: LogFilters) {
  return useQuery({
    queryKey: logKeys.list(filters),
    queryFn: () => listLogs(filters),
    placeholderData: (previous) => previous,
  });
}

export function useLogStats(filters: LogFilters) {
  return useQuery({
    queryKey: logKeys.stats(filters),
    queryFn: () => getLogStats(filters),
    placeholderData: (previous) => previous,
  });
}
