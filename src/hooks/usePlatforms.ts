import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlatform,
  getPlatform,
  listAllPlatforms,
  listPlatforms,
  type PlatformFilters,
  type PlatformInput,
} from "@/services/platforms.service";

export const platformKeys = {
  all: ["platforms"] as const,
  list: (filters: PlatformFilters) => ["platforms", "list", filters] as const,
  options: ["platforms", "options"] as const,
  detail: (id: string) => ["platforms", "detail", id] as const,
};

export function usePlatforms(filters: PlatformFilters) {
  return useQuery({
    queryKey: platformKeys.list(filters),
    queryFn: () => listPlatforms(filters),
    placeholderData: (previous) => previous,
  });
}

export function usePlatformOptions() {
  return useQuery({ queryKey: platformKeys.options, queryFn: listAllPlatforms });
}

export function usePlatform(id: string) {
  return useQuery({ queryKey: platformKeys.detail(id), queryFn: () => getPlatform(id) });
}

export function useCreatePlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlatformInput) => createPlatform(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: platformKeys.all }),
  });
}
