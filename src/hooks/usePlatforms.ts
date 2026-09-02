import {
  CreatePlatformPayload,
  CreatePlatformResponse,
  createPlatformService,
  GetPlatformsParams,
  GetPlatformsResponse,
  getPlatformsService,
} from "@/services/platforms.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useQueryPlatforms(params: GetPlatformsParams = {}) {
  return useQuery<GetPlatformsResponse, Error>({
    queryKey: ["platforms", params],
    queryFn: () => getPlatformsService(params),
    staleTime: 5 * 60 * 1000,
  });
}
//==================================================================================
//                                MUTATE
//==================================================================================

export const useMutationCreatePlatform = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePlatformResponse, Error, CreatePlatformPayload>({
    mutationFn: createPlatformService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platforms"],
      });
    },
  });
};
