import { axiosNestAuth } from "@/lib/axios-nest-auth";

export interface Platform {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export type GetPlatformsResponse = Platform[];

export const getPlatformsService = async (): Promise<GetPlatformsResponse> => {
  const { data } = await axiosNestAuth.get<GetPlatformsResponse>("/platforms");

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
