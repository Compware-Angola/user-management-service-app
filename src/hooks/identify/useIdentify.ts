//==================================================================================
//                           UseIdentify
//==================================================================================
import {
  ActivateIdentityParams,
  ActivateIdentityResponse,
  activateIdentityService,
  CreateIdentityPayload,
  CreateIdentityResponse,
  createIdentityService,
  GetIdentityParams,
  GetIdentityResponse,
  getIdentityService,
  GetIdentityUserResponse,
  getIdentityUserService,
} from "@/services/identify.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useQueryIdentity(
  params: GetIdentityParams = {},
  options?: { enabled?: boolean },
) {
  const { page = 1, limit = 10, search, status, platformCode } = params;

  return useQuery<GetIdentityResponse, Error>({
    queryKey: ["identity", page, limit, search, status, platformCode],

    queryFn: () =>
      getIdentityService({
        page,
        limit,
        search,
        status,
        platformCode,
      }),

    staleTime: 5 * 60 * 1000,
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
  });
}
//=====================================================================================
//                                Activate/Desactivate identify
//=====================================================================================

export const useMutationActivateIdentity = () => {
  const queryClient = useQueryClient();

  return useMutation<ActivateIdentityResponse, Error, ActivateIdentityParams>({
    mutationFn: activateIdentityService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["identity"],
      });
    },
  });
};

//======================================================================================
//                                  Identify by id
//=====================================================================================

export function useQueryIdentityUser(id?: number) {
  return useQuery<GetIdentityUserResponse, Error>({
    queryKey: ["identity", id],
    queryFn: () => getIdentityUserService(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

//=====================================================================================
//                                  Create Identity
//=====================================================================================

export const useMutationCreateIdentity = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateIdentityResponse, Error, CreateIdentityPayload>({
    mutationFn: createIdentityService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["identity"],
      });
    },
  });
};
