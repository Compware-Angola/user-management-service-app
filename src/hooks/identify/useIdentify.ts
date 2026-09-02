//==================================================================================
//                           UseIdentify
//==================================================================================
import {
  ActivateIdentityParams,
  ActivateIdentityResponse,
  activateIdentityService,
  GetIdentityResponse,
  getIdentityService,
  GetIdentityUserResponse,
  getIdentityUserService,
} from "@/services/identify.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useQueryIdentity() {
  return useQuery<GetIdentityResponse, Error>({
    queryKey: ["identity"],
    queryFn: getIdentityService,
    staleTime: 5 * 60 * 1000,
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
