import { axiosNestAuth } from "@/lib/axios-nest-auth";

export interface Platform {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  usersCount: number;
}

export interface PlatformMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPlatformsResponse {
  data: Platform[];
  meta: PlatformMeta;
}

export interface GetPlatformsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
}

export const getPlatformsService = async (
  params?: GetPlatformsParams,
): Promise<GetPlatformsResponse> => {
  const { data } = await axiosNestAuth.get<GetPlatformsResponse>("/platforms", {
    params,
  });

  return data;
};

//===============================================================================
//                                    CREATE PLATFORM
//===============================================================================

export interface CreatePlatformPayload {
  code: string;
  name: string;
  description: string;
}

export interface CreatePlatformResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export const createPlatformService = async (
  payload: CreatePlatformPayload,
): Promise<CreatePlatformResponse> => {
  const { data } = await axiosNestAuth.post<CreatePlatformResponse>("/platforms", payload);

  return data;
};
