import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPlatformAccessNest,
  type CreatePlatformAccessPayload,
} from "@/services/platform-access-nest.service";

export function useCreatePlatformAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlatformAccessPayload) =>
      createPlatformAccessNest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identity"] });
    },
  });
}
