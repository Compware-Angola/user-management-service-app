import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccess,
  deleteAccess,
  listAccess,
  listAccessByPlatform,
  listAccessByUser,
  type AccessFilters,
  type CreateAccessInput,
} from "@/services/platform-access.service";

export const accessKeys = {
  all: ["platform-access"] as const,
  list: (filters: AccessFilters) => ["platform-access", "list", filters] as const,
  byUser: (userId: string) => ["platform-access", "user", userId] as const,
  byPlatform: (platformId: string, filters: AccessFilters) =>
    ["platform-access", "platform", platformId, filters] as const,
};

export function useAccessList(filters: AccessFilters) {
  return useQuery({
    queryKey: accessKeys.list(filters),
    queryFn: () => listAccess(filters),
    placeholderData: (previous) => previous,
  });
}

export function useAccessByUser(userId: string) {
  return useQuery({ queryKey: accessKeys.byUser(userId), queryFn: () => listAccessByUser(userId) });
}

export function useAccessByPlatform(platformId: string, filters: AccessFilters) {
  return useQuery({
    queryKey: accessKeys.byPlatform(platformId, filters),
    queryFn: () => listAccessByPlatform(platformId, filters),
    placeholderData: (previous) => previous,
  });
}

function useInvalidateAccess() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: accessKeys.all });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["platforms"] });
  };
}

export function useCreateAccess() {
  const invalidate = useInvalidateAccess();
  return useMutation({
    mutationFn: (input: CreateAccessInput) => createAccess(input),
    onSuccess: invalidate,
  });
}

export function useCreateAccessBulk() {
  const invalidate = useInvalidateAccess();
  return useMutation({
    mutationFn: async (inputs: CreateAccessInput[]) => {
      const errors: string[] = [];
      let created = 0;
      for (const input of inputs) {
        try {
          await createAccess(input);
          created += 1;
        } catch (error) {
          errors.push(error instanceof Error ? error.message : "Erro desconhecido");
        }
      }
      return { created, errors };
    },
    onSuccess: invalidate,
  });
}

export function useDeleteAccess() {
  const invalidate = useInvalidateAccess();
  return useMutation({
    mutationFn: (id: string) => deleteAccess(id),
    onSuccess: invalidate,
  });
}
