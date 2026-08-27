import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  findMatches,
  importLegacyUser,
  importLegacyUsersBulk,
  listHistory,
  listPending,
  listSync,
  syncPlatform,
  type ImportInput,
  type PendingFilters,
} from "@/services/migration.service";
import type { LegacyUser } from "@/lib/types";

export const migrationKeys = {
  all: ["migration"] as const,
  pending: (filters: PendingFilters) => ["migration", "pending", filters] as const,
  matches: (legacyId: string) => ["migration", "matches", legacyId] as const,
  history: (filters: unknown) => ["migration", "history", filters] as const,
  sync: ["migration", "sync"] as const,
};

export function usePendingUsers(filters: PendingFilters) {
  return useQuery({
    queryKey: migrationKeys.pending(filters),
    queryFn: () => listPending(filters),
    placeholderData: (previous) => previous,
  });
}

export function useMatches(legacy: LegacyUser | null) {
  return useQuery({
    queryKey: migrationKeys.matches(legacy?.id ?? "none"),
    queryFn: () => findMatches(legacy as LegacyUser),
    enabled: Boolean(legacy),
  });
}

export function useMigrationHistory(filters: Parameters<typeof listHistory>[0]) {
  return useQuery({
    queryKey: migrationKeys.history(filters),
    queryFn: () => listHistory(filters),
    placeholderData: (previous) => previous,
  });
}

export function useSyncOverview() {
  return useQuery({ queryKey: migrationKeys.sync, queryFn: listSync });
}

function useInvalidateMigration() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: migrationKeys.all });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["platform-access"] });
    queryClient.invalidateQueries({ queryKey: ["platforms"] });
  };
}

export function useImportLegacyUser() {
  const invalidate = useInvalidateMigration();
  return useMutation({
    mutationFn: (input: ImportInput) => importLegacyUser(input),
    onSuccess: invalidate,
  });
}

export function useBulkImport() {
  const invalidate = useInvalidateMigration();
  return useMutation({
    mutationFn: ({
      ids,
      onProgress,
    }: {
      ids: string[];
      onProgress?: (processed: number, total: number) => void;
    }) => importLegacyUsersBulk(ids, onProgress),
    onSuccess: invalidate,
  });
}

export function useSyncPlatform() {
  const invalidate = useInvalidateMigration();
  return useMutation({
    mutationFn: (platformId: string) => syncPlatform(platformId),
    onSuccess: invalidate,
  });
}
